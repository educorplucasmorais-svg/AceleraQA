require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize SQLite database (creates tables + seeds if needed)
require('./database/init');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./middleware/auth'), require('./routes/dashboard'));
app.use('/api/notifications', require('./middleware/auth'), require('./routes/notifications'));
app.use('/api/feedbacks', require('./middleware/auth'), require('./routes/feedbacks'));
app.use('/api/oneonones', require('./middleware/auth'), require('./routes/oneonones'));
app.use('/api/users', require('./middleware/auth'), require('./routes/users'));
app.use('/api/reports', require('./middleware/auth'), require('./routes/reports'));
app.use('/api/hotspots', require('./middleware/auth'), require('./routes/hotspots'));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '..', 'index.html')));

// Vercel serverless: export app
module.exports = app;

// Local dev: start server only when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n  🚀 ACELERA Backend rodando em http://localhost:${PORT}`);
    console.log(`  ➜  Login: http://localhost:${PORT}/login.html`);
    console.log(`  ➜  DB:    SQLite (server/database/acelera.db)\n`);
  });
}
