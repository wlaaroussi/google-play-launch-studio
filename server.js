/**
 * Google Play Launch Studio - Backend Server
 * Express Server with SQLite Database Integration & REST API.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { db, initDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// =========================================================================
// 1. AUTHENTICATION API ROUTES
// =========================================================================

/**
 * Register New User
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, plan } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Un compte avec cet email existe déjà.' });
    }

    const userId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userRole = (normalizedEmail === 'admin@launchstudio.com') ? 'admin' : 'user';
    const userPlan = plan || 'Gratuit';
    const userName = name || normalizedEmail.split('@')[0];

    await db.runAsync(`
      INSERT INTO users (id, name, email, password_hash, role, plan, status, projects_count)
      VALUES (?, ?, ?, ?, ?, ?, 'active', 0)
    `, [userId, userName, normalizedEmail, passwordHash, userRole, userPlan]);

    // If registered with paid plan, create pending upgrade request
    if (userPlan !== 'Gratuit' && userRole !== 'admin') {
      const upgId = 'upg_' + Date.now().toString(36);
      const price = userPlan === 'PRO' ? 5.0 : 8.0;
      await db.runAsync(`
        INSERT INTO upgrade_requests (id, user_id, user_name, user_email, requested_plan, price, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `, [upgId, userId, userName, normalizedEmail, userPlan, price]);
    }

    // Log Activity
    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('user_register', ?, ?)
    `, [userName, `Nouvelle inscription (Plan ${userPlan})`]);

    const user = {
      id: userId,
      name: userName,
      email: normalizedEmail,
      role: userRole,
      plan: userPlan,
      status: 'active',
      projectsCount: 0
    };

    res.json({ success: true, user, message: 'Compte créé avec succès.' });
  } catch (err) {
    console.error('Erreur inscription:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'inscription.' });
  }
});

/**
 * Login User
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const row = await db.getAsync('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!row) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    if (row.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Ce compte a été suspendu par l\'administrateur.' });
    }

    const match = bcrypt.compareSync(password, row.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
    }

    // Update last_login
    await db.runAsync(`UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`, [row.id]);

    // Log login
    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('user_login', ?, 'Connexion réussie')
    `, [row.name]);

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      plan: row.plan,
      status: row.status,
      projectsCount: row.projects_count
    };

    res.json({ success: true, user, message: 'Connexion réussie.' });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion.' });
  }
});

// =========================================================================
// 2. UPGRADE REQUESTS API
// =========================================================================

/**
 * Submit Upgrade Request
 */
app.post('/api/upgrades/request', async (req, res) => {
  try {
    const { userId, requestedPlan } = req.body;
    if (!userId || !requestedPlan) {
      return res.status(400).json({ success: false, message: 'Paramètres manquants.' });
    }

    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });
    }

    const price = requestedPlan === 'VIP' ? 8.0 : 5.0;
    const upgId = 'upg_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 3);

    await db.runAsync(`
      INSERT INTO upgrade_requests (id, user_id, user_name, user_email, requested_plan, price, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [upgId, user.id, user.name, user.email, requestedPlan, price]);

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('upgrade_request', ?, ?)
    `, [user.name, `Demande d'activation Plan ${requestedPlan} (${price}$)`]);

    res.json({ success: true, message: 'Demande envoyée à l\'administrateur.' });
  } catch (err) {
    console.error('Erreur upgrade:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la demande d\'upgrade.' });
  }
});

// =========================================================================
// 3. PUBLIC PRICING & SETTINGS API
// =========================================================================

app.get('/api/pricing', async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT * FROM pricing_plans');
    const plans = rows.map(r => ({
      id: r.id,
      name: r.name,
      price: r.price,
      period: r.period,
      description: r.description,
      badge: r.badge,
      buttonText: r.button_text,
      isPopular: !!r.is_popular,
      features: JSON.parse(r.features || '[]')
    }));
    res.json({ success: true, plans });
  } catch (err) {
    console.error('Erreur pricing:', err);
    res.status(500).json({ success: false, plans: [] });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    const settingsRows = await db.allAsync('SELECT * FROM site_settings');
    const flagsRows = await db.allAsync('SELECT * FROM feature_flags');

    const settings = {};
    settingsRows.forEach(r => {
      settings[r.key] = r.value === 'true' ? true : (r.value === 'false' ? false : r.value);
    });

    const flags = {};
    flagsRows.forEach(r => {
      flags[r.key] = !!r.enabled;
    });

    res.json({ success: true, settings, flags });
  } catch (err) {
    console.error('Erreur settings:', err);
    res.status(500).json({ success: false });
  }
});

// =========================================================================
// 4. ADMIN DASHBOARD & MANAGEMENT API
// =========================================================================

/**
 * Get Admin Metrics
 */
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const users = await db.allAsync('SELECT id, role, plan, status FROM users');
    const logs = await db.allAsync('SELECT id, type FROM activity_logs');
    const upgrades = await db.allAsync('SELECT id FROM upgrade_requests WHERE status = "pending"');

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const proUsers = users.filter(u => u.plan === 'PRO' || u.plan === 'VIP' || u.plan === 'Enterprise').length;
    const totalExports = logs.filter(l => l.type === 'export_zip' || l.type === 'video_render').length + 42;
    const pendingUpgradesCount = upgrades.length;

    res.json({
      success: true,
      metrics: {
        totalUsers,
        activeUsers,
        proUsers,
        totalExports,
        pendingUpgradesCount
      }
    });
  } catch (err) {
    console.error('Erreur metrics:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Get All Users
 */
app.get('/api/admin/users', async (req, res) => {
  try {
    const rows = await db.allAsync(`
      SELECT id, name, email, role, plan, status, projects_count AS projectsCount, created_at AS createdAt, last_login AS lastLogin 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, users: rows });
  } catch (err) {
    console.error('Erreur users:', err);
    res.status(500).json({ success: false, users: [] });
  }
});

/**
 * Toggle User Status
 */
app.post('/api/admin/users/:id/status', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await db.runAsync('UPDATE users SET status = ? WHERE id = ?', [newStatus, userId]);

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('user_status', 'Admin', ?)
    `, [`Changement de statut pour ${user.email} (${newStatus})`]);

    res.json({ success: true, status: newStatus });
  } catch (err) {
    console.error('Erreur user status:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Delete User
 */
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

    if (user.role === 'admin' || user.email === 'admin@launchstudio.com') {
      return res.status(400).json({ success: false, message: 'Impossible de supprimer le compte administrateur principal.' });
    }

    await db.runAsync('DELETE FROM users WHERE id = ?', [userId]);
    await db.runAsync('DELETE FROM upgrade_requests WHERE user_id = ?', [userId]);

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('user_delete', 'Admin', ?)
    `, [`Suppression de l'utilisateur ${user.email}`]);

    res.json({ success: true, message: 'Utilisateur supprimé.' });
  } catch (err) {
    console.error('Erreur delete user:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Get Upgrade Requests
 */
app.get('/api/admin/upgrades', async (req, res) => {
  try {
    const rows = await db.allAsync(`
      SELECT id, user_id AS userId, user_name AS userName, user_email AS userEmail, 
             requested_plan AS requestedPlan, price, status, created_at AS timestamp 
      FROM upgrade_requests 
      ORDER BY created_at DESC
    `);
    res.json({ success: true, upgrades: rows });
  } catch (err) {
    console.error('Erreur upgrades:', err);
    res.status(500).json({ success: false, upgrades: [] });
  }
});

/**
 * Approve Upgrade Request
 */
app.post('/api/admin/upgrades/:id/approve', async (req, res) => {
  try {
    const upgId = req.params.id;
    const upgrade = await db.getAsync('SELECT * FROM upgrade_requests WHERE id = ?', [upgId]);
    if (!upgrade) return res.status(404).json({ success: false, message: 'Demande non trouvée.' });

    await db.runAsync('UPDATE upgrade_requests SET status = "approved" WHERE id = ?', [upgId]);
    await db.runAsync('UPDATE users SET plan = ? WHERE id = ?', [upgrade.requested_plan, upgrade.user_id]);

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('upgrade_approved', 'Admin', ?)
    `, [`Validation du Plan ${upgrade.requested_plan} pour ${upgrade.user_email}`]);

    res.json({ success: true, message: `Plan ${upgrade.requested_plan} activé avec succès.` });
  } catch (err) {
    console.error('Erreur approve upgrade:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Reject Upgrade Request
 */
app.post('/api/admin/upgrades/:id/reject', async (req, res) => {
  try {
    const upgId = req.params.id;
    const upgrade = await db.getAsync('SELECT * FROM upgrade_requests WHERE id = ?', [upgId]);
    if (!upgrade) return res.status(404).json({ success: false, message: 'Demande non trouvée.' });

    await db.runAsync('UPDATE upgrade_requests SET status = "rejected" WHERE id = ?', [upgId]);

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('upgrade_rejected', 'Admin', ?)
    `, [`Refus de la demande de ${upgrade.user_email}`]);

    res.json({ success: true, message: 'Demande refusée.' });
  } catch (err) {
    console.error('Erreur reject upgrade:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Get Activity Logs
 */
app.get('/api/admin/logs', async (req, res) => {
  try {
    const rows = await db.allAsync(`
      SELECT id, type, user_name AS user, description AS text, created_at AS timestamp 
      FROM activity_logs 
      ORDER BY created_at DESC 
      LIMIT 100
    `);
    res.json({ success: true, logs: rows });
  } catch (err) {
    console.error('Erreur logs:', err);
    res.status(500).json({ success: false, logs: [] });
  }
});

/**
 * Save Pricing Plans
 */
app.post('/api/admin/pricing', async (req, res) => {
  try {
    const { plans } = req.body;
    if (Array.isArray(plans)) {
      for (const p of plans) {
        await db.runAsync(`
          UPDATE pricing_plans 
          SET name = ?, price = ?, period = ?, description = ?, badge = ?, button_text = ?, features = ?, is_popular = ?
          WHERE id = ?
        `, [p.name, p.price, p.period, p.description, p.badge, p.buttonText, JSON.stringify(p.features || []), p.isPopular ? 1 : 0, p.id]);
      }
    }
    res.json({ success: true, message: 'Tarifs mis à jour dans SQLite.' });
  } catch (err) {
    console.error('Erreur save pricing:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Save Feature Flags
 */
app.post('/api/admin/features', async (req, res) => {
  try {
    const { flags } = req.body;
    if (flags && typeof flags === 'object') {
      for (const [key, val] of Object.entries(flags)) {
        await db.runAsync(`
          INSERT INTO feature_flags (key, enabled) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET enabled = excluded.enabled
        `, [key, val ? 1 : 0]);
      }
    }
    res.json({ success: true, message: 'Feature flags enregistrés.' });
  } catch (err) {
    console.error('Erreur save flags:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Save Site Settings
 */
app.post('/api/admin/settings', async (req, res) => {
  try {
    const { settings } = req.body;
    if (settings && typeof settings === 'object') {
      for (const [key, val] of Object.entries(settings)) {
        await db.runAsync(`
          INSERT INTO site_settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `, [key, String(val)]);
      }
    }
    res.json({ success: true, message: 'Paramètres du site enregistrés.' });
  } catch (err) {
    console.error('Erreur save settings:', err);
    res.status(500).json({ success: false });
  }
});

// =========================================================================
// 5. SPA ROUTING FALLBACK
// =========================================================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialize database and start listening
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur Google Play Launch Studio démarré sur http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Échec du démarrage:', err);
});
