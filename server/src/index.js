const app = require('./app');
const db = require('./db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await db.initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 PERN Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
