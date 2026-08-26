/**
 * Google Play Launch Studio - Admin Dashboard & Feature Roadmap Controller
 * Provides KPIs, User Management, Premium Upgrades Approvals, Pricing Editor, and System Settings via SQLite API
 */

class AdminDashboard {
  /**
   * Get Feature Flags from SQLite API
   */
  static async getFeatureFlags() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      return data.flags || {
        aiAsoGenerator: true,
        iosAppStoreSupport: false,
        ultraHd4kVideo: true,
        googlePlayApiSync: false,
        stripePayments: true,
        maintenanceMode: false
      };
    } catch (e) {
      return {
        aiAsoGenerator: true,
        iosAppStoreSupport: false,
        ultraHd4kVideo: true,
        googlePlayApiSync: false,
        stripePayments: true,
        maintenanceMode: false
      };
    }
  }

  /**
   * Save Feature Flags to SQLite API
   */
  static async saveFeatureFlags(flags) {
    try {
      const res = await fetch('/api/admin/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flags })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }

  /**
   * Get Site Settings from SQLite API
   */
  static async getSiteSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      return data.settings || {
        siteName: "Google Play Launch Studio",
        announcementMessage: "✨ Bienvenue sur Launch Studio ! Accès Démo actif. Contactez l'admin pour activer vos téléchargements illimités.",
        showAnnouncement: true,
        supportEmail: "support@launchstudio.com"
      };
    } catch (e) {
      return {
        siteName: "Google Play Launch Studio",
        announcementMessage: "✨ Bienvenue sur Launch Studio ! Accès Démo actif. Contactez l'admin pour activer vos téléchargements illimités.",
        showAnnouncement: true,
        supportEmail: "support@launchstudio.com"
      };
    }
  }

  /**
   * Save Site Settings to SQLite API
   */
  static async saveSiteSettings(settings) {
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }

  /**
   * Get summary metrics from SQLite API
   */
  static async getMetrics() {
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      return data.metrics || {
        totalUsers: 0,
        activeUsers: 0,
        proUsers: 0,
        totalExports: 42,
        pendingUpgradesCount: 0
      };
    } catch (e) {
      return {
        totalUsers: 0,
        activeUsers: 0,
        proUsers: 0,
        totalExports: 42,
        pendingUpgradesCount: 0
      };
    }
  }

  /**
   * Delete user by ID
   */
  static async deleteUser(userId) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Erreur serveur" };
    }
  }

  /**
   * Toggle user status (active <-> suspended)
   */
  static async toggleUserStatus(userId) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Erreur serveur" };
    }
  }

  /**
   * Add a new user from Admin Panel
   */
  static async addUser(name, email, password, role = 'user', plan = 'Gratuit') {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan })
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Erreur serveur" };
    }
  }

  /**
   * Export Entire SQLite Database as JSON Backup File
   */
  static async exportDatabaseJson() {
    try {
      const [users, upgrades, pricing, logs, settingsRes] = await Promise.all([
        AuthManager.getUsers(),
        AuthManager.getPendingUpgrades(),
        PricingManager.getPlans(),
        AuthManager.getActivityLogs(),
        fetch('/api/settings').then(r => r.json()).catch(() => ({}))
      ]);

      const dbDump = {
        exportDate: new Date().toISOString(),
        engine: 'SQLite3',
        users,
        upgradeRequests: upgrades,
        pricingPlans: pricing,
        activities: logs,
        featureFlags: settingsRes.flags || {},
        siteSettings: settingsRes.settings || {}
      };

      const blob = new Blob([JSON.stringify(dbDump, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `launch_studio_sqlite_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } catch (err) {
      console.error("Export error", err);
    }
  }
}

window.AdminDashboard = AdminDashboard;
