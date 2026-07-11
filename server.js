require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.SESSION_SECRET) {
  console.error('SESSION_SECRET environment variable is required in production');
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
    } catch (err) {
      initPromise = null;
      console.error('Schema initialization failed:', err.message);
      throw err;
    }
  })();
  return initPromise;
}

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
  secret: process.env.SESSION_SECRET || 'bioverse_dev_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
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

app.post('/api/auth/signup', requireJsonContentType, validateBodyShape, validateSignupBody, requireDB, async (req, res) => {
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

app.post('/api/auth/signin', requireJsonContentType, validateBodyShape, validateSigninBody, requireDB, async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    req.session.regenerate((err) => {
      if (err) {
        console.error('AUTH_SESSION_ERROR:', err.message);
        return res.status(500).json({ error: 'Sign in failed. Please try again.' });
      }
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('AUTH_SESSION_ERROR:', err.message);
          return res.status(500).json({ error: 'Sign in failed. Please try again.' });
        }
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
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
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
