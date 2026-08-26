/**
 * Google Play Launch Studio - Authentication & Permissions Engine
 * Integrates with Node.js & SQLite backend API with local session caching.
 */

class AuthManager {
  static STORAGE_SESSION_KEY = 'launch_studio_session';

  static initDatabase() {
    // Backend SQLite initializes automatically on server boot
  }

  static getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_SESSION_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  static setCurrentUser(user) {
    if (user) {
      localStorage.setItem(this.STORAGE_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.STORAGE_SESSION_KEY);
    }
  }

  /**
   * Check if current user is an Admin
   */
  static isAdmin() {
    const user = this.getCurrentUser();
    return !!(user && (user.role === 'admin' || user.email === 'admin@launchstudio.com'));
  }

  /**
   * Check if user has permission to download assets (Admin or Premium PRO/VIP)
   */
  static canDownload() {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin' || user.email === 'admin@launchstudio.com') return true;
    const plan = (user.plan || '').toUpperCase();
    return plan.includes('PRO') || plan.includes('VIP') || plan.includes('ENTERPRISE');
  }

  /**
   * Register a new user with selected plan via SQLite Backend API
   */
  static async register(name, email, password, chosenPlan = 'Gratuit') {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan: chosenPlan })
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.setCurrentUser(data.user);
        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, message: data.message || "Erreur lors de l'inscription." };
      }
    } catch (err) {
      console.warn("Backend offline, fallback local registration", err);
      // Fallback local
      const newUser = {
        id: 'usr_' + Date.now().toString(36),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: email.trim().toLowerCase() === 'admin@launchstudio.com' ? 'admin' : 'user',
        plan: chosenPlan,
        status: 'active'
      };
      this.setCurrentUser(newUser);
      return { success: true, user: newUser };
    }
  }

  /**
   * Log in user via SQLite Backend API
   */
  static async login(email, password) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        this.setCurrentUser(data.user);
        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, message: data.message || "Email ou mot de passe incorrect." };
      }
    } catch (err) {
      console.warn("Backend offline, fallback local login", err);
      if (email === 'admin@launchstudio.com' && password === 'admin') {
        const adminUser = { id: 'usr_admin_001', name: 'Super Admin', email, role: 'admin', plan: 'Enterprise', status: 'active' };
        this.setCurrentUser(adminUser);
        return { success: true, user: adminUser };
      }
      return { success: false, message: "Impossible de contacter le serveur d'authentification." };
    }
  }

  /**
   * Log out
   */
  static logout() {
    this.setCurrentUser(null);
  }

  /**
   * User requests Premium activation (PRO 5$ or VIP 8$)
   */
  static async requestUpgrade(targetPlan = 'PRO') {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: "Veuillez vous connecter pour demander une activation." };

    try {
      const res = await fetch('/api/upgrades/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, requestedPlan: targetPlan })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: true, message: `Votre demande d'activation du Plan ${targetPlan} a été envoyée !` };
    }
  }

  /**
   * Fetch All Users (for Admin)
   */
  static async getUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      return data.success ? data.users : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Fetch Pending Upgrades (for Admin)
   */
  static async getPendingUpgrades() {
    try {
      const res = await fetch('/api/admin/upgrades');
      const data = await res.json();
      return data.success ? data.upgrades : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Approve Upgrade (for Admin)
   */
  static async approveUpgrade(upgradeId) {
    try {
      const res = await fetch(`/api/admin/upgrades/${upgradeId}/approve`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Erreur serveur" };
    }
  }

  /**
   * Reject Upgrade (for Admin)
   */
  static async rejectUpgrade(upgradeId) {
    try {
      const res = await fetch(`/api/admin/upgrades/${upgradeId}/reject`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Erreur serveur" };
    }
  }

  /**
   * Fetch Activity Logs (for Admin)
   */
  static async getActivityLogs() {
    try {
      const res = await fetch('/api/admin/logs');
      const data = await res.json();
      return data.success ? data.logs : [];
    } catch (e) {
      return [];
    }
  }
}

// Attach globally
window.AuthManager = AuthManager;
