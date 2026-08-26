/**
 * Google Play Launch Studio - SQLite Database Engine
 * Handles schema migrations, default admin seeding, and async query helpers.
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'launch_studio.db');
const db = new sqlite3.Database(DB_PATH);

// Promise helpers for clean async/await
db.runAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

db.getAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

db.allAsync = function (sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/**
 * Initialize Tables & Seed Default Data
 */
async function initDatabase() {
  // 1. Users Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      plan TEXT NOT NULL DEFAULT 'Gratuit',
      status TEXT NOT NULL DEFAULT 'pending',
      projects_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Upgrade Requests Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS upgrade_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      requested_plan TEXT NOT NULL,
      price REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 3. Activity Logs Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      user_name TEXT,
      description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3b. User Service Access Table (per-user, per-service toggles)
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS user_service_access (
      user_id TEXT NOT NULL,
      service_key TEXT NOT NULL,
      is_enabled INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, service_key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 4. Site Settings Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // 5. Feature Flags Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS feature_flags (
      key TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 1
    )
  `);

  // 6. Pricing Plans Table
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      period TEXT NOT NULL DEFAULT 'mois',
      description TEXT,
      badge TEXT,
      button_text TEXT,
      features TEXT NOT NULL,
      is_popular INTEGER DEFAULT 0
    )
  `);

  // Seed Default Admin if not exists
  const existingAdmin = await db.getAsync(`SELECT id FROM users WHERE email = ?`, ['admin@launchstudio.com']);
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hashAdmin = bcrypt.hashSync('admin', salt);
    const hashUser = bcrypt.hashSync('user123', salt);

    await db.runAsync(`
      INSERT INTO users (id, name, email, password_hash, role, plan, status, projects_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-30 days'))
    `, ['usr_admin_001', 'Super Admin', 'admin@launchstudio.com', hashAdmin, 'admin', 'Enterprise', 'active', 18]);

    // Seed full service access for admin
    const allServices = ['graphics', 'video', 'aso', 'privacy', 'checklist', 'resizer', 'export'];
    for (const svc of allServices) {
      await db.runAsync(`INSERT OR IGNORE INTO user_service_access (user_id, service_key, is_enabled) VALUES (?, ?, 1)`, ['usr_admin_001', svc]);
    }

    await db.runAsync(`
      INSERT INTO users (id, name, email, password_hash, role, plan, status, projects_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-12 days'))
    `, ['usr_demo_002', 'Youssef Dev', 'youssef@example.com', hashUser, 'user', 'PRO', 'active', 6]);

    // Seed PRO service access for Youssef
    for (const svc of ['graphics', 'video', 'aso', 'privacy', 'checklist', 'resizer', 'export']) {
      await db.runAsync(`INSERT OR IGNORE INTO user_service_access (user_id, service_key, is_enabled) VALUES (?, ?, 1)`, ['usr_demo_002', svc]);
    }

    await db.runAsync(`
      INSERT INTO users (id, name, email, password_hash, role, plan, status, projects_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-3 days'))
    `, ['usr_demo_003', 'Sarah Apps', 'sarah@example.com', hashUser, 'user', 'Gratuit', 'pending', 2]);

    // Sarah is pending - no service access yet

    // Seed Sample Upgrade Request
    await db.runAsync(`
      INSERT INTO upgrade_requests (id, user_id, user_name, user_email, requested_plan, price, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))
    `, ['upg_001', 'usr_demo_003', 'Sarah Apps', 'sarah@example.com', 'PRO', 5.0, 'pending']);

    // Seed Sample Logs
    await db.runAsync(`INSERT INTO activity_logs (type, user_name, description, created_at) VALUES (?, ?, ?, datetime('now', '-3 days'))`, ['user_register', 'Sarah Apps', 'Nouvelle inscription (Plan Test Découverte)']);
    await db.runAsync(`INSERT INTO activity_logs (type, user_name, description, created_at) VALUES (?, ?, ?, datetime('now', '-2 hours'))`, ['upgrade_request', 'Sarah Apps', 'Demande d\'activation du Plan PRO (5$/mois) en attente d\'approbation']);
    await db.runAsync(`INSERT INTO activity_logs (type, user_name, description, created_at) VALUES (?, ?, ?, datetime('now', '-1 day'))`, ['export_zip', 'Youssef Dev', 'Téléchargement du pack complet .ZIP (App Prière & Coran)']);
    await db.runAsync(`INSERT INTO activity_logs (type, user_name, description) VALUES (?, ?, ?)`, ['user_login', 'Super Admin', 'Connexion sécurisée à l\'espace Administrateur']);

    // Seed Default Settings
    await db.runAsync(`INSERT OR IGNORE INTO site_settings (key, value) VALUES ('siteName', 'Google Play Launch Studio')`);
    await db.runAsync(`INSERT OR IGNORE INTO site_settings (key, value) VALUES ('announcementMessage', '✨ Bienvenue sur Launch Studio ! Accès Démo actif. Contactez l''admin pour activer vos téléchargements illimités.')`);
    await db.runAsync(`INSERT OR IGNORE INTO site_settings (key, value) VALUES ('showAnnouncement', 'true')`);
    await db.runAsync(`INSERT OR IGNORE INTO site_settings (key, value) VALUES ('supportEmail', 'support@launchstudio.com')`);

    // Seed Default Feature Flags
    await db.runAsync(`INSERT OR IGNORE INTO feature_flags (key, enabled) VALUES ('aiAsoGenerator', 1)`);
    await db.runAsync(`INSERT OR IGNORE INTO feature_flags (key, enabled) VALUES ('iosAppStoreSupport', 0)`);
    await db.runAsync(`INSERT OR IGNORE INTO feature_flags (key, enabled) VALUES ('ultraHd4kVideo', 1)`);
    await db.runAsync(`INSERT OR IGNORE INTO feature_flags (key, enabled) VALUES ('googlePlayApiSync', 0)`);
    await db.runAsync(`INSERT OR IGNORE INTO feature_flags (key, enabled) VALUES ('stripePayments', 1)`);
    await db.runAsync(`INSERT OR IGNORE INTO feature_flags (key, enabled) VALUES ('maintenanceMode', 0)`);

    // Seed Default Pricing Plans
    const plans = [
      {
        id: 'free',
        name: 'Découverte / Démo',
        price: 0,
        period: 'gratuit',
        description: 'Testez l\'ensemble des éditeurs et prévisualisez vos créations en direct sans engagement.',
        badge: 'ACCÈS LIBRE',
        button_text: 'Commencer Gratuitement',
        is_popular: 0,
        features: JSON.stringify([
          'Éditeur d\'icône 512x512 en direct',
          'Générateur Feature Graphic 1024x500',
          'Screenshots 3D avec preview HD',
          'Générateur ASO & Politique RGPD',
          'Filigrane démo sur exports directs'
        ])
      },
      {
        id: 'pro',
        name: 'Développeur PRO',
        price: 5,
        period: 'mois',
        description: 'Idéal pour les développeurs indépendants publiant régulièrement des applications sur Google Play.',
        badge: 'LE PLUS POPULAIRE (5$)',
        button_text: 'Passer au Plan PRO (5$)',
        is_popular: 1,
        features: JSON.stringify([
          'Téléchargements HD Illimités & Sans filigrane',
          'Exportation Pack Global .ZIP complet',
          'Vidéos promotionnelles 1080p HD sans latence',
          'Support trilingue complet (FR, AR RTL, EN)',
          'Redimensionneur Multi-Assets Expo & Android',
          'Activation instantanée après validation Admin'
        ])
      },
      {
        id: 'vip',
        name: 'Studio & Agence VIP',
        price: 8,
        period: 'mois',
        description: 'Pour les studios mobiles, agences et créateurs gérant plusieurs comptes Google Play Console.',
        badge: 'PREMIUM ILLIMITÉ (8$)',
        button_text: 'Choisir le Plan VIP (8$)',
        is_popular: 0,
        features: JSON.stringify([
          'Toutes les fonctionnalités du Plan PRO',
          'Exports Vidéo 4K Ultra-HD & YouTube Shorts',
          'Modèles de métadonnées ASO illimités',
          'Checklist 20 testeurs avec suivi multi-projets',
          'Générateur Expo + Android + iOS App Store',
          'Support technique prioritaire 24/7'
        ])
      }
    ];

    for (const p of plans) {
      await db.runAsync(`
        INSERT INTO pricing_plans (id, name, price, period, description, badge, button_text, features, is_popular)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.id, p.name, p.price, p.period, p.description, p.badge, p.button_text, p.features, p.is_popular]);
    }
  }

  console.log('✅ Base de données SQLite initialisée avec succès (data/launch_studio.db)');
}

module.exports = {
  db,
  initDatabase
};
