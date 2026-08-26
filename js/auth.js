/**
 * Google Play Launch Studio - Authentication & Permissions Engine
 * Handles User Registration, Login, Session Management, Roles (Admin/User),
 * Premium Access Permissions, and Admin Approval Workflow.
 */

class AuthManager {
  static STORAGE_USERS_KEY = 'launch_studio_users';
  static STORAGE_SESSION_KEY = 'launch_studio_session';
  static STORAGE_ACTIVITY_KEY = 'launch_studio_activity_logs';
  static STORAGE_UPGRADES_KEY = 'launch_studio_upgrade_requests';

  /**
   * Initialize default database with Admin and Demo users if empty
   */
  static initDatabase() {
    if (!localStorage.getItem(this.STORAGE_USERS_KEY)) {
      const defaultUsers = [
        {
          id: 'usr_admin_001',
          name: 'Super Admin',
          email: 'admin@launchstudio.com',
          password: 'admin',
          role: 'admin', // Strict admin
          plan: 'Enterprise',
          status: 'active',
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          projectsCount: 18,
          lastLogin: new Date().toISOString()
        },
        {
          id: 'usr_demo_002',
          name: 'Youssef Dev (Compte Premium 5$)',
          email: 'youssef@example.com',
          password: 'user123',
          role: 'user', // Standard user with PRO plan
          plan: 'PRO',
          status: 'active',
          createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
          projectsCount: 6,
          lastLogin: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'usr_demo_003',
          name: 'Sarah Apps (Compte Gratuit Test)',
          email: 'sarah@example.com',
          password: 'user123',
          role: 'user', // Free test account (requires admin activation for downloads)
          plan: 'Gratuit',
          status: 'active',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          projectsCount: 2,
          lastLogin: new Date(Date.now() - 86400000).toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(this.STORAGE_UPGRADES_KEY)) {
      const defaultUpgrades = [
        {
          id: 'upg_001',
          userId: 'usr_demo_003',
          userName: 'Sarah Apps',
          userEmail: 'sarah@example.com',
          requestedPlan: 'PRO',
          price: 5,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'pending'
        }
      ];
      localStorage.setItem(this.STORAGE_UPGRADES_KEY, JSON.stringify(defaultUpgrades));
    }

    if (!localStorage.getItem(this.STORAGE_ACTIVITY_KEY)) {
      const defaultLogs = [
        { id: 1, type: 'user_register', user: 'Sarah Apps', text: 'Nouvelle inscription (Plan Test Découverte)', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
        { id: 2, type: 'upgrade_request', user: 'Sarah Apps', text: 'Demande d\'activation du Plan PRO (5$/mois) en attente d\'approbation', timestamp: new Date(Date.now() - 7200000).toISOString() },
        { id: 3, type: 'export_zip', user: 'Youssef Dev', text: 'Téléchargement du pack complet .ZIP (App Prière & Coran)', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
        { id: 4, type: 'user_login', user: 'Super Admin', text: 'Connexion sécurisée à l\'espace Administrateur', timestamp: new Date().toISOString() }
      ];
      localStorage.setItem(this.STORAGE_ACTIVITY_KEY, JSON.stringify(defaultLogs));
    }
  }

  static getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_USERS_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  static saveUsers(users) {
    localStorage.setItem(this.STORAGE_USERS_KEY, JSON.stringify(users));
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
    return user && user.role === 'admin';
  }

  /**
   * Check if user has permission to download assets (Admin or Premium PRO/VIP)
   */
  static canDownload() {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;
    const plan = (user.plan || '').toUpperCase();
    return plan.includes('PRO') || plan.includes('VIP') || plan.includes('ENTERPRISE');
  }

  /**
   * Register a new user with selected plan
   */
  static register(name, email, password, chosenPlan = 'Gratuit') {
    this.initDatabase();
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    
    if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: "Cette adresse email est déjà enregistrée. Veuillez vous connecter." };
    }

    const isFirstAdmin = cleanEmail === 'admin@launchstudio.com';
    const newUser = {
      id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      email: cleanEmail,
      password: password,
      role: isFirstAdmin ? 'admin' : 'user',
      plan: isFirstAdmin ? 'Enterprise' : chosenPlan,
      status: 'active',
      createdAt: new Date().toISOString(),
      projectsCount: 0,
      lastLogin: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser);

    // If user chose a paid plan upon registration, create an activation request for admin
    if (chosenPlan !== 'Gratuit' && !isFirstAdmin) {
      this.requestUpgrade(chosenPlan, newUser);
    }

    this.logActivity('user_register', newUser.name, `Nouvelle inscription (${cleanEmail} - Plan: ${newUser.plan})`);

    return { success: true, user: newUser };
  }

  /**
   * Log in user
   */
  static login(email, password) {
    this.initDatabase();
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();

    const user = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === password);
    
    if (!user) {
      return { success: false, message: "Email ou mot de passe incorrect." };
    }

    if (user.status === 'suspended') {
      return { success: false, message: "Ce compte a été suspendu par un administrateur." };
    }

    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);
    this.setCurrentUser(user);
    this.logActivity('user_login', user.name, `Connexion réussie`);

    return { success: true, user };
  }

  /**
   * Log out
   */
  static logout() {
    const cur = this.getCurrentUser();
    if (cur) {
      this.logActivity('user_logout', cur.name, `Déconnexion`);
    }
    this.setCurrentUser(null);
  }

  /**
   * User requests Premium activation (PRO 5$ or VIP 8$)
   */
  static requestUpgrade(targetPlan = 'PRO', customUser = null) {
    const user = customUser || this.getCurrentUser();
    if (!user) return { success: false, message: "Veuillez vous connecter pour demander une activation." };

    const upgrades = this.getPendingUpgrades();
    // Check if pending request exists
    const existing = upgrades.find(u => u.userId === user.id && u.status === 'pending');
    if (existing) {
      existing.requestedPlan = targetPlan;
      existing.timestamp = new Date().toISOString();
    } else {
      upgrades.unshift({
        id: 'upg_' + Date.now().toString(36),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        requestedPlan: targetPlan,
        price: targetPlan === 'VIP' ? 8 : 5,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
    }

    localStorage.setItem(this.STORAGE_UPGRADES_KEY, JSON.stringify(upgrades));
    this.logActivity('upgrade_request', user.name, `Demande d'activation du Plan ${targetPlan}`);

    return { success: true, message: `Votre demande d'activation du Plan ${targetPlan} a été transmise à l'administrateur !` };
  }

  static getPendingUpgrades() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_UPGRADES_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  /**
   * Admin approves Premium activation for a user
   */
  static approveUpgrade(upgradeId) {
    const upgrades = this.getPendingUpgrades();
    const upg = upgrades.find(u => u.id === upgradeId);
    if (!upg) return { success: false, message: "Demande introuvable." };

    const users = this.getUsers();
    const user = users.find(u => u.id === upg.userId);
    if (user) {
      user.plan = upg.requestedPlan;
      this.saveUsers(users);

      // If the upgraded user is currently logged in, refresh session
      const current = this.getCurrentUser();
      if (current && current.id === user.id) {
        current.plan = user.plan;
        this.setCurrentUser(current);
      }
    }

    upg.status = 'approved';
    localStorage.setItem(this.STORAGE_UPGRADES_KEY, JSON.stringify(upgrades));
    this.logActivity('upgrade_approved', AuthManager.getCurrentUser()?.name, `Activation du Plan ${upg.requestedPlan} approuvée pour ${upg.userEmail}`);

    return { success: true, user };
  }

  /**
   * Admin directly sets a user's plan
   */
  static setUserPlan(userId, plan) {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "Utilisateur introuvable." };

    user.plan = plan;
    this.saveUsers(users);

    const current = this.getCurrentUser();
    if (current && current.id === user.id) {
      current.plan = plan;
      this.setCurrentUser(current);
    }

    this.logActivity('plan_change', AuthManager.getCurrentUser()?.name, `Plan modifié en ${plan} pour ${user.email}`);
    return { success: true, user };
  }

  /**
   * Log action into system activities
   */
  static logActivity(type, user, text) {
    try {
      const logs = JSON.parse(localStorage.getItem(this.STORAGE_ACTIVITY_KEY) || '[]');
      logs.unshift({
        id: Date.now(),
        type,
        user: user || 'Anonyme',
        text,
        timestamp: new Date().toISOString()
      });
      if (logs.length > 100) logs.pop();
      localStorage.setItem(this.STORAGE_ACTIVITY_KEY, JSON.stringify(logs));
    } catch (e) {
      console.warn("Failed to log activity", e);
    }
  }

  static getActivityLogs() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_ACTIVITY_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }
}

// Initialize on script load
AuthManager.initDatabase();
window.AuthManager = AuthManager;
