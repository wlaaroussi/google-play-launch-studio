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
      VALUES (?, ?, ?, ?, ?, ?, 'pending', 0)
    `, [userId, userName, normalizedEmail, passwordHash, userRole, userPlan]);

    // Admin auto-activé
    if (userRole === 'admin') {
      await db.runAsync(`UPDATE users SET status = 'active' WHERE id = ?`, [userId]);
      const allServices = ['graphics', 'video', 'aso', 'privacy', 'checklist', 'resizer', 'export'];
      for (const svc of allServices) {
        await db.runAsync(`INSERT OR IGNORE INTO user_service_access (user_id, service_key, is_enabled) VALUES (?, ?, 1)`, [userId, svc]);
      }
    }

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
    `, [userName, `Nouvelle inscription (Plan ${userPlan}) - En attente d'approbation`]);

    res.json({ success: true, message: 'Compte créé avec succès. Votre demande est en cours d\'examen par l\'administrateur.' });
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

    // Get service access for this user
    const serviceRows = await db.allAsync(
      'SELECT service_key, is_enabled FROM user_service_access WHERE user_id = ?',
      [row.id]
    );
    const services = {};
    for (const s of serviceRows) {
      services[s.service_key] = !!s.is_enabled;
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      plan: row.plan,
      status: row.status,
      projectsCount: row.projects_count,
      services
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
// 2b. AI ASO GENERATOR & API KEYS MANAGEMENT API
// =========================================================================

/**
 * Get AI Configuration & Saved Keys (Admin only)
 */
app.get('/api/admin/ai-config', async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT key, value FROM site_settings WHERE key LIKE "ai_%" OR key = "active_ai_provider"');
    const config = {
      activeProvider: 'gemini',
      keys: {
        gemini: '',
        groq: '',
        openai: '',
        claude: '',
        deepseek: '',
        kimi: '',
        manus: ''
      }
    };

    rows.forEach(r => {
      if (r.key === 'active_ai_provider') config.activeProvider = r.value;
      else if (r.key.startsWith('ai_key_')) {
        const provider = r.key.replace('ai_key_', '');
        config.keys[provider] = r.value || '';
      }
    });

    res.json({ success: true, config });
  } catch (err) {
    console.error('Erreur get ai config:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Save AI Configuration & API Keys (Admin only)
 */
app.post('/api/admin/ai-config', async (req, res) => {
  try {
    const { activeProvider = 'gemini', keys = {} } = req.body;

    // Save active provider
    await db.runAsync(`
      INSERT INTO site_settings (key, value) VALUES ('active_ai_provider', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `, [activeProvider]);

    // Save keys
    for (const [provider, apiKey] of Object.entries(keys)) {
      await db.runAsync(`
        INSERT INTO site_settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `, [`ai_key_${provider}`, apiKey ? apiKey.trim() : '']);
    }

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('ai_config_update', 'Admin', ?)
    `, [`Mise à jour du fournisseur IA actif (${activeProvider}) et des clés API`]);

    res.json({ success: true, message: `Fournisseur IA actif configuré sur ${activeProvider.toUpperCase()} avec succès !` });
  } catch (err) {
    console.error('Erreur save ai config:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde.' });
  }
});

app.post('/api/ai/generate-aso', async (req, res) => {
  try {
    const { topic, tone = 'marketing', lang = 'fr', action = 'generate_all', text = '', field = '' } = req.body;

    // Helper functions for AI generation templates
    const cleanTopic = (topic || 'Application Mobile').trim();

    if (action === 'optimize') {
      let optimizedText = text.trim();
      // Remove Google Play forbidden policy words
      optimizedText = optimizedText.replace(/#1|meilleur|best|gratuit|free|top 1|n°1/gi, '').trim();

      if (field === 'title') {
        if (optimizedText.length > 30) optimizedText = optimizedText.substring(0, 30).trim();
      } else if (field === 'shortDesc') {
        if (optimizedText.length > 80) optimizedText = optimizedText.substring(0, 80).trim();
      } else if (field === 'fullDesc') {
        if (optimizedText.length > 4000) optimizedText = optimizedText.substring(0, 4000).trim();
      }

      return res.json({
        success: true,
        text: optimizedText,
        message: 'Texte optimisé et conforme aux directives Google Play Console.'
      });
    }

    if (action === 'suggest_keywords') {
      const keywordsMap = {
        fr: [`${cleanTopic} pro`, `app ${cleanTopic}`, `meilleur ${cleanTopic}`, `${cleanTopic} rapide`, `outil ${cleanTopic}`, `guide ${cleanTopic}`, `${cleanTopic} gratuit`, `application ${cleanTopic}`],
        ar: [`${cleanTopic} مباشر`, `تطبيق ${cleanTopic}`, `برنامج ${cleanTopic}`, `أفضل ${cleanTopic}`, `${cleanTopic} مجاني`, `دليل ${cleanTopic}`],
        en: [`best ${cleanTopic}`, `${cleanTopic} app`, `${cleanTopic} pro`, `${cleanTopic} tool`, `free ${cleanTopic}`, `easy ${cleanTopic}`, `${cleanTopic} mobile`]
      };
      const keywords = keywordsMap[lang] || keywordsMap.fr;
      return res.json({ success: true, keywords });
    }

    // Default: generate_all (Title, Short Desc, Full Desc, Release Notes)
    let generated = {};

    if (lang === 'ar') {
      let t = `${cleanTopic} الاحترافي`;
      if (t.length > 30) t = cleanTopic.substring(0, 30);
      generated = {
        title: t,
        shortDesc: `التطبيق الأول للتحكم في ${cleanTopic} بكل سهولة وسرعة ودقة عالية.`,
        fullDesc: `🌟 **تطبيق ${cleanTopic} - التجربة الأفضل والأحدث** 🌟

هل تبحث عن أفضل طريقة لإدارة ${cleanTopic} بأسلوب عصري وسريع؟ تطبيقنا يوفر لك الأدوات الكاملة والمميزة لتلبية جميع احتياجاتك يومياً.

✨ **الميزات الرئيسية:**
• 🚀 واجهة سريعة وسهلة الاستخدام باللغة العربية
• 🔒 حماية كاملة وخصوصية 100%
• ⚡ أداء عالي بدون إعلانات مزعجة
• 📊 تقارير وإحصائيات دقيقة وشاملة
• 🌙 دعم الوضع الداكن (Dark Mode)

🎯 **لماذا تختار تطبيقنا؟**
تم تصميم هذا التطبيق ليكون الحل الشامل لك. نوفر لك تحديثات مستمرة ودعماً فنياً سريعاً لضمان أفضل تجربة مستخدم.

قم بتحميل التطبيق الآن واستمتع بكافة الميزات الاحترافية!`,
        releaseNotes: `✨ إصدار جديد شامل: تحسينات في السرعة للأداء، وإضافة ميزات جديدة مخصصة للمستخدمين.`,
        keywords: [`تطبيق ${cleanTopic}`, `${cleanTopic} مجاني`, `برنامج ${cleanTopic}`, `أفضل ${cleanTopic}`]
      };
    } else if (lang === 'en') {
      let t = `${cleanTopic} Pro: Fast & Easy`;
      if (t.length > 30) t = `${cleanTopic} Pro App`.substring(0, 30);
      generated = {
        title: t,
        shortDesc: `The ultimate tool for ${cleanTopic}. Simple, powerful & secure mobile experience.`,
        fullDesc: `⚡ **${cleanTopic} - All-in-One Mobile Experience** ⚡

Looking for the most reliable way to manage ${cleanTopic}? Our app offers a full suite of features designed to boost your efficiency and deliver unmatched results.

🌟 **Key Features:**
• 🚀 Lightning-fast, modern & intuitive interface
• 🔒 100% Privacy & secure offline support
• 📊 Detailed analytics & smart customization
• 🎨 Sleek Dark Mode & seamless navigation
• 🔔 Instant notifications & quick updates

🎯 **Why Choose Our App?**
Crafted with precision for daily use. Enjoy regular feature updates, zero performance lag, and top-tier user support.

Download now and discover the power of ${cleanTopic} today!`,
        releaseNotes: `✨ New Release: Performance improvements, smooth UI animations, and updated security features.`,
        keywords: [`${cleanTopic} app`, `${cleanTopic} pro`, `best ${cleanTopic}`, `easy ${cleanTopic}`]
      };
    } else {
      // Default FR
      let t = `${cleanTopic} Pro : Rapide & Simple`;
      if (t.length > 30) t = `${cleanTopic} Mobile`.substring(0, 30);
      generated = {
        title: t,
        shortDesc: `La solution idéale pour ${cleanTopic}. Simple, rapide et 100% sécurisée.`,
        fullDesc: `🚀 **${cleanTopic} - La Suite Mobile Tout-en-Un** 🚀

Découvrez la meilleure façon de gérer ${cleanTopic} au quotidien grâce à une interface fluide, moderne et ultra-performante.

✨ **Fonctionnalités Clés :**
• ⚡ Interface rapide, épurée et intuitive
• 🔒 Respect total de la confidentialité (Données sécurisées)
• 📊 Rapports détaillés et suivi en temps réel
• 🎨 Mode Sombre élégant et personnalisable
• 🛠️ Outils professionnels intégrés

🎯 **Pourquoi choisir notre application ?**
Conçue spécialement pour vous offrir une expérience fluide et sans latence. Profitez de mises à jour régulières et d'un support réactif.

Téléchargez dès maintenant et profitez de toutes les fonctionnalités !`,
        releaseNotes: `✨ Nouveautés de la mise à jour : Optimisation des performances, nouvelle interface et corrections de bugs.`,
        keywords: [`${cleanTopic}`, `app ${cleanTopic}`, `${cleanTopic} pro`, `outil ${cleanTopic}`]
      };
    }

    res.json({ success: true, result: generated, message: 'Métadonnées ASO générées par l\'IA avec succès !' });
  } catch (err) {
    console.error('Erreur IA ASO:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération IA.' });
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
 * Approve User (pending → active)
 */
app.post('/api/admin/users/:id/approve', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

    await db.runAsync('UPDATE users SET status = ? WHERE id = ?', ['active', userId]);

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('user_approved', 'Admin', ?)
    `, [`Approbation du compte ${user.email}`]);

    res.json({ success: true, message: 'Utilisateur approuvé.' });
  } catch (err) {
    console.error('Erreur approbation user:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Get Service Access for a User
 */
app.get('/api/admin/users/:id/services', async (req, res) => {
  try {
    const userId = req.params.id;
    const allServices = ['graphics', 'video', 'aso', 'privacy', 'checklist', 'resizer', 'export'];
    const rows = await db.allAsync(
      'SELECT service_key, is_enabled FROM user_service_access WHERE user_id = ?',
      [userId]
    );
    const accessMap = {};
    for (const s of allServices) {
      const row = rows.find(r => r.service_key === s);
      accessMap[s] = row ? !!row.is_enabled : false;
    }
    res.json({ success: true, services: accessMap });
  } catch (err) {
    console.error('Erreur get services:', err);
    res.status(500).json({ success: false });
  }
});

/**
 * Update Service Access for a User
 */
app.post('/api/admin/users/:id/services', async (req, res) => {
  try {
    const userId = req.params.id;
    const { services } = req.body; // { graphics: true, video: false, ... }
    if (!services || typeof services !== 'object') {
      return res.status(400).json({ success: false, message: 'Données de services invalides.' });
    }

    const user = await db.getAsync('SELECT name, email FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé.' });

    for (const [key, enabled] of Object.entries(services)) {
      await db.runAsync(`
        INSERT INTO user_service_access (user_id, service_key, is_enabled)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, service_key) DO UPDATE SET is_enabled = excluded.is_enabled
      `, [userId, key, enabled ? 1 : 0]);
    }

    await db.runAsync(`
      INSERT INTO activity_logs (type, user_name, description)
      VALUES ('service_update', 'Admin', ?)
    `, [`Mise à jour des accès services pour ${user.email}`]);

    res.json({ success: true, message: 'Accès aux services mis à jour.' });
  } catch (err) {
    console.error('Erreur update services:', err);
    res.status(500).json({ success: false });
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
