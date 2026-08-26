/**
 * Google Play Launch Studio - Admin Dashboard & Feature Roadmap Controller
 * Provides KPIs, User Management, Premium Upgrades Approvals, Pricing Editor, and System Settings
 */

class AdminDashboard {
  static STORAGE_SETTINGS_KEY = 'launch_studio_site_settings';
  static STORAGE_FEATURE_FLAGS_KEY = 'launch_studio_feature_flags';

  static getFeatureFlags() {
    const defaults = {
      aiAsoGenerator: true,
      iosAppStoreSupport: false,
      ultraHd4kVideo: true,
      googlePlayApiSync: false,
      stripePayments: true,
      maintenanceMode: false
    };
    try {
      return Object.assign(defaults, JSON.parse(localStorage.getItem(this.STORAGE_FEATURE_FLAGS_KEY) || '{}'));
    } catch (e) {
      return defaults;
    }
  }

  static saveFeatureFlags(flags) {
    localStorage.setItem(this.STORAGE_FEATURE_FLAGS_KEY, JSON.stringify(flags));
  }

  static getSiteSettings() {
    const defaults = {
      siteName: "Google Play Launch Studio",
      announcementMessage: "✨ Bienvenue sur Launch Studio ! Accès Démo actif. Contactez l'admin pour activer vos téléchargements illimités.",
      showAnnouncement: true,
      supportEmail: "support@launchstudio.com"
    };
    try {
      return Object.assign(defaults, JSON.parse(localStorage.getItem(this.STORAGE_SETTINGS_KEY) || '{}'));
    } catch (e) {
      return defaults;
    }
  }

  static saveSiteSettings(settings) {
    localStorage.setItem(this.STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * Calculate summary metrics from users, upgrades & activities
   */
  static getMetrics() {
    const users = AuthManager.getUsers();
    const logs = AuthManager.getActivityLogs();
    const upgrades = AuthManager.getPendingUpgrades().filter(u => u.status === 'pending');

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const proUsers = users.filter(u => u.plan === 'PRO' || u.plan === 'VIP' || u.plan === 'Enterprise').length;
    const totalExports = logs.filter(l => l.type === 'export_zip' || l.type === 'video_render').length + 42;
    const pendingUpgradesCount = upgrades.length;

    return {
      totalUsers,
      activeUsers,
      proUsers,
      totalExports,
      pendingUpgradesCount
    };
  }

  /**
   * Delete user by ID
   */
  static deleteUser(userId) {
    const current = AuthManager.getCurrentUser();
    if (current && current.id === userId) {
      return { success: false, message: "Vous ne pouvez pas supprimer votre propre compte administrateur." };
    }

    let users = AuthManager.getUsers();
    users = users.filter(u => u.id !== userId);
    AuthManager.saveUsers(users);
    AuthManager.logActivity('user_delete', current?.name, `Suppression de l'utilisateur (${userId})`);
    return { success: true };
  }

  /**
   * Toggle user status (active <-> suspended)
   */
  static toggleUserStatus(userId) {
    const users = AuthManager.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "Utilisateur non trouvé." };

    user.status = user.status === 'active' ? 'suspended' : 'active';
    AuthManager.saveUsers(users);
    AuthManager.logActivity('user_status', AuthManager.getCurrentUser()?.name, `Changement de statut pour ${user.email} (${user.status})`);
    return { success: true, status: user.status };
  }

  /**
   * Update user role (user <-> admin)
   */
  static toggleUserRole(userId) {
    const users = AuthManager.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "Utilisateur non trouvé." };

    user.role = user.role === 'admin' ? 'user' : 'admin';
    AuthManager.saveUsers(users);
    AuthManager.logActivity('user_role', AuthManager.getCurrentUser()?.name, `Changement de rôle pour ${user.email} -> ${user.role}`);
    return { success: true, role: user.role };
  }

  /**
   * Add a new user from Admin Panel
   */
  static addUser(name, email, password, role = 'user', plan = 'Gratuit') {
    const users = AuthManager.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Cet email est déjà utilisé." };
    }

    const newUser = {
      id: 'usr_' + Date.now().toString(36),
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: role,
      plan: plan,
      status: 'active',
      createdAt: new Date().toISOString(),
      projectsCount: 0,
      lastLogin: '-'
    };

    users.push(newUser);
    AuthManager.saveUsers(users);
    AuthManager.logActivity('admin_add_user', AuthManager.getCurrentUser()?.name, `Création manuelle de l'utilisateur ${cleanEmail} (Plan: ${plan})`);
    return { success: true, user: newUser };
  }

  /**
   * Export Entire Database as JSON File
   */
  static exportDatabaseJson() {
    const dbDump = {
      exportDate: new Date().toISOString(),
      users: AuthManager.getUsers(),
      upgradeRequests: AuthManager.getPendingUpgrades(),
      pricingPlans: PricingManager.getPlans(),
      activities: AuthManager.getActivityLogs(),
      featureFlags: this.getFeatureFlags(),
      siteSettings: this.getSiteSettings()
    };

    const blob = new Blob([JSON.stringify(dbDump, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `launch_studio_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }
}

window.AdminDashboard = AdminDashboard;
