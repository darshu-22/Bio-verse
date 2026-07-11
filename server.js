require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET environment variable is required in production');
  process.exit(1);
}

if (isProd && !process.env.RATE_LIMIT_SECRET) {
  console.error('RATE_LIMIT_SECRET environment variable is required in production');
  process.exit(1);
}

const app = express();

app.set('trust proxy', 1);

app.use(express.json({
  limit: '10kb',
  strict: true
}));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed request body' });
  }
  if (err.status === 413) {
    return res.status(413).json({ error: 'Payload too large' });
  }
  next(err);
});

const useSSL = process.env.DB_SSL === 'true';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bioverse_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ...(useSSL ? { ssl: { rejectUnauthorized: true } } : {})
};

const pool = mysql.createPool(dbConfig);
let initPromise = null;

async function initSchema() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB;
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          session_id VARCHAR(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
          expires INT(11) UNSIGNED NOT NULL,
          data TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
          PRIMARY KEY (session_id)
        ) ENGINE=InnoDB;
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS rate_limits (
          scope          VARCHAR(32)  NOT NULL,
          identifier_hash CHAR(64)   NOT NULL,
          window_start   DATETIME    NOT NULL,
          attempt_count  INT UNSIGNED NOT NULL DEFAULT 1,
          blocked_until  DATETIME    NULL DEFAULT NULL,
          updated_at     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (scope, identifier_hash)
        ) ENGINE=InnoDB;
      `);
    } catch (err) {
      initPromise = null;
      console.error('Schema initialization failed:', err.message);
      throw err;
    }
  })();
  return initPromise;
}

// ─── Rate Limiting Helpers ────────────────────────────────────────────────────

// Policy constants
const RL = {
  SIGNIN_IP:      { scope: 'signin-ip',      windowSec: 15 * 60, max: 20 },
  SIGNIN_ACCOUNT: { scope: 'signin-acct',    windowSec: 15 * 60, max: 8  },
  SIGNUP_IP:      { scope: 'signup-ip',      windowSec: 60 * 60, max: 10 },
};

function getRateLimitSecret() {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (isProd && !secret) throw new Error('RATE_LIMIT_SECRET missing in production');
  // Development-only documented fallback — never used in production
  return secret || 'bioverse_dev_rate_limit_secret';
}

function canonicalizeIp(rawIp) {
  if (!rawIp) return 'unknown';
  // Convert IPv4-mapped IPv6 (::ffff:1.2.3.4) to plain IPv4
  const ipv4mapped = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i;
  const m = rawIp.match(ipv4mapped);
  return m ? m[1] : rawIp;
}

function hashRateLimitId(input) {
  const secret = getRateLimitSecret();
  return crypto.createHmac('sha256', secret).update(input).digest('hex');
}

// Probabilistic cleanup: ~1 in 100 calls deletes expired rows (non-blocking)
function maybeCleanup(pool) {
  if (Math.random() > 0.01) return;
  setImmediate(() => {
    // Delete rows whose block period has expired
    pool.query(
      'DELETE FROM rate_limits WHERE blocked_until IS NOT NULL AND blocked_until < NOW() LIMIT 200'
    ).catch(() => {}); // silent — cleanup failure must not affect auth
    // Delete unblocked rows whose window expired more than 3 hours ago
    pool.query(
      'DELETE FROM rate_limits WHERE blocked_until IS NULL AND DATE_ADD(window_start, INTERVAL 10800 SECOND) < NOW() LIMIT 200'
    ).catch(() => {});
  });
}

/**
 * consumeRateLimit: atomically upsert a rate-limit counter.
 *
 * Uses INSERT ... ON DUPLICATE KEY UPDATE for atomicity across serverless
 * instances.  A single round-trip either creates the row (count=1) or
 * increments it.  The window is reset when window_start is older than
 * windowSec seconds — we pass NOW() - INTERVAL windowSec SECOND as the
 * comparison boundary and update window_start conditionally.
 *
 * Returns: { allowed: bool, retryAfterSec: number }
 */
async function consumeRateLimit(pool, policy, identifierHash) {
  const { scope, windowSec, max } = policy;
  const now = new Date();

  // Atomic upsert: if row exists and window is still active, increment.
  // If window has expired, reset the counter to 1 and start a new window.
  // blocked_until is preserved within the current window; it is only cleared
  // when the window expires and window_start is reset.
  await pool.execute(`
    INSERT INTO rate_limits (scope, identifier_hash, window_start, attempt_count, blocked_until)
    VALUES (?, ?, NOW(), 1, NULL)
    ON DUPLICATE KEY UPDATE
      attempt_count = IF(
        window_start < DATE_SUB(NOW(), INTERVAL ? SECOND),
        1,
        attempt_count + 1
      ),
      window_start = IF(
        window_start < DATE_SUB(NOW(), INTERVAL ? SECOND),
        NOW(),
        window_start
      ),
      blocked_until = IF(
        window_start < DATE_SUB(NOW(), INTERVAL ? SECOND),
        NULL,
        blocked_until
      )
  `, [scope, identifierHash, windowSec, windowSec, windowSec]);

  // Read back current state — one read after atomic write is safe and
  // avoids needing transactions.
  const [rows] = await pool.execute(
    'SELECT attempt_count, window_start, blocked_until FROM rate_limits WHERE scope = ? AND identifier_hash = ?',
    [scope, identifierHash]
  );

  if (rows.length === 0) {
    // Row disappeared between write and read — treat as allowed (edge case).
    return { allowed: true, retryAfterSec: 0 };
  }

  const row = rows[0];

  // If already hard-blocked from a previous overflow, check expiry.
  if (row.blocked_until && new Date(row.blocked_until) > now) {
    const retryAfterSec = Math.ceil((new Date(row.blocked_until) - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  if (row.attempt_count > max) {
    // First time exceeding threshold — set a block expiry = window end.
    const windowStartMs = new Date(row.window_start).getTime();
    const windowEndMs   = windowStartMs + windowSec * 1000;
    const blockEndMs    = Math.max(windowEndMs, now.getTime() + 60_000); // at least 1 min
    await pool.execute(
      'UPDATE rate_limits SET blocked_until = ? WHERE scope = ? AND identifier_hash = ?',
      [new Date(blockEndMs), scope, identifierHash]
    );
    const retryAfterSec = Math.ceil((blockEndMs - now.getTime()) / 1000);
    return { allowed: false, retryAfterSec };
  }

  return { allowed: true, retryAfterSec: 0 };
}

/**
 * resetAccountFailures: called on successful signin.
 * Resets only the account-scoped limiter for the given email hash.
 * IP limiter is intentionally NOT reset.
 */
async function resetAccountFailures(pool, emailHash) {
  await pool.execute(
    'DELETE FROM rate_limits WHERE scope = ? AND identifier_hash = ?',
    [RL.SIGNIN_ACCOUNT.scope, emailHash]
  );
}

/**
 * rateLimitSignin middleware.
 * Checks and consumes IP limiter first, then account limiter.
 * Fails closed: if DB unavailable, returns 503.
 */
async function rateLimitSignin(req, res, next) {
  try {
    const secret = getRateLimitSecret();
    const ip    = canonicalizeIp(req.ip);
    const email = req.body.email; // already normalized by validateSigninBody

    const ipHash      = hashRateLimitId(`signin-ip:${ip}`);
    const accountHash = hashRateLimitId(`signin-account:${email}`);

    // Attach hashes to req for use in route handler (avoid recomputing)
    req._rlIpHash      = ipHash;
    req._rlAccountHash = accountHash;

    const ipResult = await consumeRateLimit(pool, RL.SIGNIN_IP, ipHash);
    if (!ipResult.allowed) {
      res.set('Retry-After', String(ipResult.retryAfterSec));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const acctResult = await consumeRateLimit(pool, RL.SIGNIN_ACCOUNT, accountHash);
    if (!acctResult.allowed) {
      res.set('Retry-After', String(acctResult.retryAfterSec));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    maybeCleanup(pool);
    next();
  } catch (err) {
    console.error('Rate limit error (signin):', err.message);
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}

/**
 * rateLimitSignup middleware.
 * Consumes IP limiter for signup.
 * Fails closed: if DB unavailable, returns 503.
 */
async function rateLimitSignup(req, res, next) {
  try {
    const ip     = canonicalizeIp(req.ip);
    const ipHash = hashRateLimitId(`signup-ip:${ip}`);

    const result = await consumeRateLimit(pool, RL.SIGNUP_IP, ipHash);
    if (!result.allowed) {
      res.set('Retry-After', String(result.retryAfterSec));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    maybeCleanup(pool);
    next();
  } catch (err) {
    console.error('Rate limit error (signup):', err.message);
    return res.status(503).json({ error: 'Service temporarily unavailable' });
  }
}

// ─── End Rate Limiting Helpers ────────────────────────────────────────────────

function isPlainObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function hasOnlyAllowedFields(body, allowedList) {
  return Object.keys(body).every(key => allowedList.includes(key));
}

function requireJsonContentType(req, res, next) {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.toLowerCase().startsWith('application/json')) {
    return res.status(415).json({ error: 'Content-Type must be application/json' });
  }
  next();
}

function validateBodyShape(req, res, next) {
  if (!isPlainObject(req.body)) {
    return res.status(400).json({ error: 'Request body must be a plain JSON object' });
  }
  next();
}

function validateSignupBody(req, res, next) {
  const allowed = ['full_name', 'email', 'password', 'confirmPassword'];
  if (!hasOnlyAllowedFields(req.body, allowed)) {
    return res.status(400).json({ error: 'Unexpected fields in request' });
  }

  const { full_name, email, password, confirmPassword } = req.body;

  if (typeof full_name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
    return res.status(400).json({ error: 'All fields must be strings' });
  }

  const trimmedName = full_name.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return res.status(400).json({ error: 'Full name must be between 2 and 100 characters' });
  }

  if (/[\u0000-\u001F\u007F-\u009F<>]/.test(trimmedName)) {
    return res.status(400).json({ error: 'Full name contains invalid characters' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (trimmedEmail.length < 3 || trimmedEmail.length > 254) {
    return res.status(400).json({ error: 'Email must be between 3 and 254 characters' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || /[\u0000-\u001F\u007F-\u009F]/.test(trimmedEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (password.length < 6 || password.length > 128) {
    return res.status(400).json({ error: 'Password must be between 6 and 128 characters' });
  }

  if (/[\u0000-\u001F\u007F-\u009F]/.test(password)) {
    return res.status(400).json({ error: 'Password contains control characters' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  req.body.full_name = trimmedName;
  req.body.email = trimmedEmail;
  next();
}

function validateSigninBody(req, res, next) {
  const allowed = ['email', 'password'];
  if (!hasOnlyAllowedFields(req.body, allowed)) {
    return res.status(400).json({ error: 'Unexpected fields in request' });
  }

  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'All fields must be strings' });
  }

  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (trimmedEmail.length > 254 || password.length > 128) {
    return res.status(400).json({ error: 'Invalid email or password length' });
  }

  req.body.email = trimmedEmail;
  next();
}

app.use(async (req, res, next) => {
  try {
    await initSchema();
    next();
  } catch (err) {
    console.error('Database schema init failed:', err.message);
    res.status(503).json({ error: 'Database temporarily unavailable' });
  }
});

const sessionStore = new MySQLStore({
  createDatabaseTable: false,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, pool);

app.use(session({
  name: 'bvx.sid',
  secret: process.env.SESSION_SECRET || 'bioverse_dev_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/'
  }
}));

async function requireDB(req, res, next) {
  try {
    await initSchema();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database temporarily unavailable' });
  }
}

app.post('/api/auth/signup', requireJsonContentType, validateBodyShape, validateSignupBody, requireDB, rateLimitSignup, async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)',
      [full_name, email, password_hash]
    );

    const userId = result.insertId;
    res.status(201).json({ id: userId, full_name, email });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

app.post('/api/auth/signin', requireJsonContentType, validateBodyShape, validateSigninBody, requireDB, rateLimitSignin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const accountHash = req._rlAccountHash;

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      // Account not found counts as a failed attempt — limiter already consumed above
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      // Wrong password — do not reset account limiter
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error('AUTH_SESSION_REGENERATE_ERROR:', err.message);
        return res.status(503).json({ error: 'Service temporarily unavailable' });
      }
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('AUTH_SESSION_SAVE_ERROR:', err.message);
          return res.status(503).json({ error: 'Service temporarily unavailable' });
        }
        // Successful authentication & session persist — reset account failure state only
        resetAccountFailures(pool, accountHash).catch((dbErr) => {
          console.error('Failed to reset account failures:', dbErr.message);
        });
        res.status(200).json({ id: user.id, full_name: user.full_name, email: user.email });
      });
    });
  } catch (err) {
    console.error('AUTH_LOGIN_ERROR:', err.message);
    res.status(500).json({ error: 'Sign in failed. Please try again.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(200).json(null);
    }

    try {
      await initSchema();
    } catch (err) {
      return res.status(503).json({ error: 'Database temporarily unavailable' });
    }

    const [users] = await pool.execute(
      'SELECT id, full_name, email FROM users WHERE id = ?',
      [req.session.userId]
    );

    if (users.length === 0) {
      req.session.destroy(() => {});
      return res.status(200).json(null);
    }

    res.status(200).json(users[0]);
  } catch (err) {
    console.error('Session check error:', err.message);
    res.status(200).json(null);
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('AUTH_SESSION_DESTROY_ERROR:', err.message);
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    res.clearCookie('bvx.sid', {
      path: '/',
      secure: isProd,
      httpOnly: true,
      sameSite: 'lax'
    });
    res.status(200).json({ success: true });
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));
app.use('/models', express.static(path.join(__dirname, 'models')));

app.get('*', (req, res) => {
  const publicIndex = path.join(__dirname, 'public', 'index.html');
  const fs = require('fs');
  if (fs.existsSync(publicIndex)) {
    res.sendFile(publicIndex);
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});

if (require.main === module) {
  const port = process.env.PORT || 8000;
  initSchema()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    })
    .catch((err) => {
      console.error('Failed to initialize schema on startup:', err.message);
      console.log('Starting server without confirmed schema — DB may be unavailable');
      app.listen(port, () => {
        console.log(`Server running on port ${port} (DB unavailable)`);
      });
    });
}

module.exports = app;
