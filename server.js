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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post('/api/auth/signup', requireDB, async (req, res) => {
  try {
    const { full_name, email, password, confirmPassword } = req.body;

    if (!full_name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

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

app.post('/api/auth/signin', requireDB, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

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
