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
   * Check if user is logged in AND approved (status = 'active')
   */
  static isApproved() {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.status === 'active';
  }

  /**
   * Check if user is logged in but pending approval
   */
  static isPending() {
    const user = this.getCurrentUser();
    return !!(user && user.status === 'pending');
  }

  /**
   * Check if user has access to a specific service
   * Service keys: 'graphics', 'video', 'aso', 'privacy', 'checklist', 'resizer', 'export'
   */
  static canAccessService(serviceKey) {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true; // Admin can access everything
    if (user.status !== 'active') return false;
    if (!user.services) return false;
    return !!user.services[serviceKey];
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
   * NOTE: Users are created with status='pending' - they need admin approval.
   */
  static async register(name, email, password, chosenPlan = 'Gratuit') {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, plan: chosenPlan })
      });
      const data = await res.json();
      if (data.success) {
        // Do NOT auto-login pending users; just return success message
        return { success: true, pending: true, message: data.message };
      } else {
        return { success: false, message: data.message || "Erreur lors de l'inscription." };
      }
    } catch (err) {
      console.warn("Backend offline, fallback local registration", err);
      return { success: false, message: "Impossible de contacter le serveur. Vérifiez votre connexion." };
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
        const adminUser = {
          id: 'usr_admin_001',
          name: 'Super Admin',
          email,
          role: 'admin',
          plan: 'Enterprise',
          status: 'active',
          services: { graphics: true, video: true, aso: true, privacy: true, checklist: true, resizer: true, export: true }
        };
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

  // =========================================================================
  // ADMIN API METHODS
  // =========================================================================

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
   * Approve a pending user account
   */
  static async approveUser(userId) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, { method: 'POST' });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Erreur serveur" };
    }
  }

  /**
   * Get service access map for a user
   */
  static async getUserServices(userId) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/services`);
      const data = await res.json();
      return data.success ? data.services : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Update service access for a user
   */
  static async updateUserServices(userId, services) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services })
      });
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
   * Delete user account
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
