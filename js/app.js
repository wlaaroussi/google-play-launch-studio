/**
 * Google Play Launch Studio - Main Application Controller
 * Handles UI interactions, live canvas bindings, tabs, ASO counters, and state.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App State
  const AppState = {
    activeTab: 'graphics',
    graphicsSubTab: 'icon', // 'icon', 'feature', 'screenshots'
    
    // Icon Configuration
    iconConfig: {
      bg: { type: 'gradient', color1: '#00F0FF', color2: '#3B82F6', angle: 135 },
      fgType: 'icon',
      emoji: '⚡',
      text: 'G',
      iconKey: 'bolt',
      imageElement: null,
      iconColor: '#FFFFFF',
      iconScale: 1.0,
      fontFamily: 'Outfit',
      borderRadius: 115,
      borderWidth: 0,
      borderColor: '#FFFFFF',
      shadow: true,
      glow: false
    },

    // Feature Graphic Configuration
    featureConfig: {
      bg: { preset: 'dark_navy', color1: '#0F172A', color2: '#1E1B4B', type: 'gradient' },
      title: "Votre Application Révolutionnaire",
      subtitle: "Gagnez du temps et boostez vos résultats dès aujourd'hui",
      badgeText: "⭐ NOUVELLE VERSION",
      fontFamily: "Outfit",
      textColor: "#FFFFFF",
      badgeColor: "#00F0FF",
      isRTL: false,
      mockupMode: 'single_tilted',
      screenshotImg: null
    },

    // Screenshots Studio (Multi-slides)
    activeScreenIndex: 0,
    screenshotsList: [
      {
        headline: "Tableau de Bord Intelligent",
        subtitle: "Visualisez toutes vos données en un coup d'œil",
        badgeText: "NOUVEAU",
        layoutStyle: "tilt_left",
        bg: { preset: 'dark_navy' },
        fontFamily: "Outfit",
        textColor: "#FFFFFF",
        subColor: "rgba(255, 255, 255, 0.75)",
        isRTL: false,
        screenshotImg: null
      },
      {
        headline: "Performances Ultra-Rapides",
        subtitle: "Optimisé pour une expérience utilisateur fluide et sans accroc",
        badgeText: "⚡ VITESSE",
        layoutStyle: "front_classic",
        bg: { preset: 'cyberpunk' },
        fontFamily: "Outfit",
        textColor: "#FFFFFF",
        subColor: "rgba(255, 255, 255, 0.75)",
        isRTL: false,
        screenshotImg: null
      },
      {
        headline: "Sécurité & Confidentialité 100%",
        subtitle: "Vos données personnelles sont chiffrées et protégées",
        badgeText: "🔒 PROTÉGÉ",
        layoutStyle: "tilt_right",
        bg: { preset: 'emerald' },
        fontFamily: "Outfit",
        textColor: "#FFFFFF",
        subColor: "rgba(255, 255, 255, 0.75)",
        isRTL: false,
        screenshotImg: null
      },
      {
        headline: "Mode Sombre & Personnalisation",
        subtitle: "Adaptez l'interface selon votre style et vos préférences",
        badgeText: "🎨 DESIGN",
        layoutStyle: "dual_phone",
        bg: { preset: 'sunset' },
        fontFamily: "Outfit",
        textColor: "#FFFFFF",
        subColor: "rgba(255, 255, 255, 0.75)",
        isRTL: false,
        screenshotImg: null
      }
    ],

    // Video Promo Studio Configuration
    videoConfig: {
      format: '16_9', // '16_9' or '9_16'
      slideDuration: 3,
      transitionEffect: 'flash_glow',
      fontFamily: 'Outfit',
      audioChime: true
    },

    // ASO Metadata
    selectedAsoCategory: 'islamic',
    activeAsoLang: 'fr',
    asoData: {
      fr: { title: "", shortDesc: "", fullDesc: "", releaseNotes: "" },
      ar: { title: "", shortDesc: "", fullDesc: "", releaseNotes: "" },
      en: { title: "", shortDesc: "", fullDesc: "", releaseNotes: "" }
    },

    // Privacy Policy Form
    privacyConfig: {
      appName: "Mon Application",
      devName: "Mon Studio Dev",
      contactEmail: "contact@monapp.com",
      effectiveDate: new Date().toISOString().split('T')[0],
      appType: "Free",
      permissions: { location: true, notifications: true, camera: false, storage: false, microphone: false, contacts: false },
      sdks: { playServices: true, admob: true, firebase: true, facebook: false, onesignal: false, unity: false, weather: false },
      coppa: "no"
    },
    privacyResult: { markdown: "", html: "" },

    // App Asset & Resizer Configuration
    assetConfig: {
      sourceImage: null,
      sourceFileName: "app-logo.png",
      customBgImage: null,
      customFgImage: null,
      customMonochromeImage: null,
      bg: { type: 'gradient', color1: '#00F0FF', color2: '#3B82F6', angle: 135 },
      fg: { scale: 0.65, offsetX: 0, offsetY: 0 },
      showSafeZoneGuide: true,
      monochrome: { mode: 'auto_white', threshold: 128, invert: false },
      splash: { bgColor: '#0B0F19', logoScale: 0.35, fitMode: 'contain', showSafeZone: false },
      favicon: { includeBackground: true, borderRadius: 8 },
      icon: { borderRadius: 0, previewMask: 'squircle' },
      customResizer: { image: null, width: 1024, height: 1024, lockAspect: true, aspectRatio: 1, mode: 'contain', bgColor: '#000000', format: 'image/png', quality: 0.95 }
    }
  };

  // Toast Notification Helper
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl font-medium shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 ${
      type === 'success' 
        ? 'bg-emerald-600/90 text-white border border-emerald-400/30' 
        : 'bg-cyan-600/90 text-white border border-cyan-400/30'
    }`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // Helper to switch tab programmatically
  // =========================================================================
  // ENHANCED TAB & SIDEBAR NAVIGATION CONTROLLER
  // =========================================================================
  const appSidebar = document.getElementById('appSidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const mobileSidebarToggleBtn = document.getElementById('mobileSidebarToggleBtn');
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
  const collapseChevronIcon = document.getElementById('collapseChevronIcon');
  const mainNavButtons = document.querySelectorAll('.main-nav-btn');
  const sidebarNavButtons = document.querySelectorAll('.sidebar-nav-btn');
  const sidebarSubnavButtons = document.querySelectorAll('.sidebar-subnav-btn');
  const mainTabPanes = document.querySelectorAll('.main-tab-pane');

  // Graphics Sub-Tabs Elements
  const graphicsSubBtns = document.querySelectorAll('.graphics-sub-btn');
  const graphicsSubPanes = document.querySelectorAll('.graphics-sub-pane');

  // Map tab IDs to service keys
  const TAB_SERVICE_MAP = {
    graphics: 'graphics',
    video: 'video',
    aso: 'aso',
    privacy: 'privacy',
    checklist: 'checklist',
    resizer: 'resizer',
    export: 'export'
  };

  // Unified Tab & Sub-tab Switcher
  function switchTab(tabId, subTabId = null) {
    if (!tabId) return;

    // Strict Admin Access Guard
    if (tabId === 'admin' && (!window.AuthManager || !AuthManager.isAdmin())) {
      showToast("🔒 Accès refusé : Cet espace est strictement réservé aux Administrateurs.", "error");
      return;
    }

    // Service Access Guard for all modules (except landing and admin)
    const serviceKey = TAB_SERVICE_MAP[tabId];
    if (serviceKey && tabId !== 'landing') {
      if (!window.AuthManager || !AuthManager.getCurrentUser()) {
        // Not logged in — prompt login/register
        showToast("🔒 Veuillez vous inscrire pour accéder aux services.", "info");
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('hidden');
        return;
      }
      if (AuthManager.isPending()) {
        showToast("⏳ Votre compte est en attente d'approbation par l'administrateur.", "info");
        return;
      }
      if (!AuthManager.canAccessService(serviceKey)) {
        showToast(`🔒 Service non activé pour votre compte. Contactez l'administrateur.`, "error");
        return;
      }
    }

    AppState.activeTab = tabId;

    // 1. Update Top Main Navigation Buttons
    mainNavButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isTarget);
      btn.classList.toggle('border-cyan-400', isTarget);
      btn.classList.toggle('text-cyan-400', isTarget);
      btn.classList.toggle('bg-cyan-950/40', isTarget);
      btn.classList.toggle('text-gray-400', !isTarget);
      btn.classList.toggle('border-transparent', !isTarget);
    });

    // 2. Update Sidebar Navigation Buttons & Active Indicators
    sidebarNavButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabId;
      btn.classList.toggle('active', isTarget);
      
      const parentContainer = btn.parentElement;
      const submenu = parentContainer ? parentContainer.querySelector('.sidebar-submenu') : null;
      const chevron = btn.querySelector('.sidebar-chevron');

      if (submenu) {
        if (isTarget) {
          submenu.classList.add('open');
          if (chevron) chevron.classList.add('rotate-180');
        } else {
          submenu.classList.remove('open');
          if (chevron) chevron.classList.remove('rotate-180');
        }
      }
    });

    // 3. Show / Hide Main Tab Panes
    mainTabPanes.forEach(pane => {
      if (pane.id === `tab-${tabId}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // 4. Handle Sub-Tab Switching (Explicit or Default)
    if (tabId === 'graphics') {
      const activeSub = subTabId || AppState.graphicsSubTab || 'icon';
      AppState.graphicsSubTab = activeSub;
      graphicsSubBtns.forEach(btn => {
        const isSub = btn.getAttribute('data-subtab') === activeSub;
        btn.classList.toggle('bg-cyan-500', isSub);
        btn.classList.toggle('text-black', isSub);
        btn.classList.toggle('font-bold', isSub);
        btn.classList.toggle('bg-gray-800/80', !isSub);
        btn.classList.toggle('text-gray-300', !isSub);
      });
      graphicsSubPanes.forEach(pane => {
        const isPane = pane.id === `subtab-${activeSub}`;
        pane.classList.toggle('active', isPane);
      });
    } else if (tabId === 'resizer') {
      const activeSub = subTabId || 'adaptive';
      const resizerSubtabBtns = document.querySelectorAll('.resizer-subtab-btn');
      const resizerSubtabPanes = document.querySelectorAll('.resizer-subtab-pane');
      resizerSubtabBtns.forEach(b => {
        const isSub = b.getAttribute('data-resizertab') === activeSub;
        b.classList.toggle('active', isSub);
        b.classList.toggle('bg-purple-500', isSub);
        b.classList.toggle('text-white', isSub);
        b.classList.toggle('font-bold', isSub);
        b.classList.toggle('text-gray-400', !isSub);
      });
      resizerSubtabPanes.forEach(pane => {
        pane.classList.toggle('hidden', pane.id !== `resizer-subtab-${activeSub}`);
      });
    } else if (tabId === 'admin') {
      const activeSub = subTabId || 'upgrades';
      const adminSubBtns = document.querySelectorAll('.admin-sub-btn');
      const adminSubPanes = document.querySelectorAll('.admin-sub-pane');
      adminSubBtns.forEach(b => {
        const isSub = b.getAttribute('data-admintab') === activeSub;
        b.classList.toggle('active', isSub);
        b.classList.toggle('bg-amber-500', isSub);
        b.classList.toggle('text-black', isSub);
        b.classList.toggle('font-bold', isSub);
        b.classList.toggle('bg-gray-800', !isSub);
        b.classList.toggle('text-gray-300', !isSub);
      });
      adminSubPanes.forEach(pane => {
        pane.classList.toggle('hidden', pane.id !== `admintab-${activeSub}`);
        pane.classList.toggle('active', pane.id === `admintab-${activeSub}`);
      });
    }

    // 5. Update Sidebar Subnav Buttons Highlight
    sidebarSubnavButtons.forEach(btn => {
      const matchTab = btn.getAttribute('data-tab') === tabId;
      const subKey = btn.getAttribute('data-subtab') || btn.getAttribute('data-resizertab') || btn.getAttribute('data-admintab');
      const isSubMatch = subTabId ? subKey === subTabId : false;
      btn.classList.toggle('active', matchTab && isSubMatch);
    });

    // 6. Close Mobile Drawer
    if (appSidebar && appSidebar.classList.contains('mobile-open')) {
      appSidebar.classList.remove('mobile-open');
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.add('opacity-0');
        setTimeout(() => sidebarBackdrop.classList.add('hidden'), 250);
      }
    }

    // 7. Scroll Content to Top Smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 8. Trigger Renders & Updates
    if (tabId === 'graphics') {
      renderAllCanvases();
    } else if (tabId === 'resizer') {
      renderAllAssetCanvases();
    } else if (tabId === 'admin' && window.AuthManager && AuthManager.isAdmin()) {
      refreshAdminDashboard();
    }
  }

  // Bind Top Nav Buttons
  mainNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Bind Sidebar Nav Buttons
  sidebarNavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = btn.getAttribute('data-tab');
      const hasSub = btn.getAttribute('data-has-sub') === 'true';
      const submenu = btn.parentElement.querySelector('.sidebar-submenu');
      const chevron = btn.querySelector('.sidebar-chevron');

      // If sidebar is collapsed on desktop, clicking expands it
      if (appSidebar && appSidebar.classList.contains('sidebar-collapsed')) {
        appSidebar.classList.remove('sidebar-collapsed');
        if (collapseChevronIcon) collapseChevronIcon.classList.remove('rotate-180');
      }

      if (hasSub && submenu) {
        const isOpen = submenu.classList.contains('open');
        submenu.classList.toggle('open', !isOpen);
        if (chevron) chevron.classList.toggle('rotate-180', !isOpen);
      }

      switchTab(tabId);
    });
  });

  // Bind Sidebar Sub-nav Buttons
  sidebarSubnavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tabId = btn.getAttribute('data-tab');
      const subId = btn.getAttribute('data-subtab') || btn.getAttribute('data-resizertab') || btn.getAttribute('data-admintab');
      switchTab(tabId, subId);
    });
  });

  // Sidebar Desktop Collapse / Expand Toggle
  if (sidebarCollapseBtn && appSidebar) {
    if (localStorage.getItem('launch_studio_sidebar_collapsed') === 'true') {
      appSidebar.classList.add('sidebar-collapsed');
      if (collapseChevronIcon) collapseChevronIcon.classList.add('rotate-180');
    }

    sidebarCollapseBtn.addEventListener('click', () => {
      const isCollapsed = appSidebar.classList.toggle('sidebar-collapsed');
      if (collapseChevronIcon) collapseChevronIcon.classList.toggle('rotate-180', isCollapsed);
      localStorage.setItem('launch_studio_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    });
  }

  // Mobile Hamburger Toggle & Backdrop
  if (mobileSidebarToggleBtn && appSidebar) {
    mobileSidebarToggleBtn.addEventListener('click', () => {
      const isOpen = appSidebar.classList.toggle('mobile-open');
      if (sidebarBackdrop) {
        if (isOpen) {
          sidebarBackdrop.classList.remove('hidden');
          requestAnimationFrame(() => sidebarBackdrop.classList.remove('opacity-0'));
        } else {
          sidebarBackdrop.classList.add('opacity-0');
          setTimeout(() => sidebarBackdrop.classList.add('hidden'), 250);
        }
      }
    });
  }

  if (sidebarBackdrop && appSidebar) {
    sidebarBackdrop.addEventListener('click', () => {
      appSidebar.classList.remove('mobile-open');
      sidebarBackdrop.classList.add('opacity-0');
      setTimeout(() => sidebarBackdrop.classList.add('hidden'), 250);
    });
  }

  // Header Logo & Brand Click -> Goes to Landing Tab
  const headerLogoBrandBtn = document.getElementById('headerLogoBrandBtn');
  const headerTitleBrandBtn = document.getElementById('headerTitleBrandBtn');
  if (headerLogoBrandBtn) headerLogoBrandBtn.addEventListener('click', () => switchTab('landing'));
  if (headerTitleBrandBtn) headerTitleBrandBtn.addEventListener('click', () => switchTab('landing'));

  // Sidebar Master Export Button -> Triggers Export Tab
  const sidebarMasterExportBtn = document.getElementById('sidebarMasterExportBtn');
  if (sidebarMasterExportBtn) {
    sidebarMasterExportBtn.addEventListener('click', () => {
      switchTab('export');
    });
  }

  // Graphics Sub-Tabs (Icon / Feature / Screenshots)
  graphicsSubBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.getAttribute('data-subtab');
      switchTab('graphics', subId);
    });
  });

  // =========================================================================
  // CANVAS RENDERING BINDS
  // =========================================================================
  const iconCanvas = document.getElementById('iconCanvas');
  const featureCanvas = document.getElementById('featureCanvas');
  const screenshotCanvas = document.getElementById('screenshotCanvas');

  function renderAllCanvases() {
    if (iconCanvas) CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig);
    if (featureCanvas) CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig);
    if (screenshotCanvas && AppState.screenshotsList[AppState.activeScreenIndex]) {
      CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
    }
  }

  // ----------------- 1. ICON GENERATOR CONTROLS -----------------
  const iconPresetBtns = document.querySelectorAll('.icon-preset-btn');
  iconPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const c1 = btn.getAttribute('data-color1');
      const c2 = btn.getAttribute('data-color2');
      AppState.iconConfig.bg.type = 'gradient';
      AppState.iconConfig.bg.color1 = c1;
      AppState.iconConfig.bg.color2 = c2;
      document.getElementById('iconColor1').value = c1;
      document.getElementById('iconColor2').value = c2;
      CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig);
    });
  });

  const iconColor1 = document.getElementById('iconColor1');
  const iconColor2 = document.getElementById('iconColor2');
  const iconBgType = document.getElementById('iconBgType');
  const iconRadius = document.getElementById('iconRadius');
  const iconScale = document.getElementById('iconScale');
  const iconFgType = document.getElementById('iconFgType');
  const iconEmojiInput = document.getElementById('iconEmojiInput');
  const iconTextInput = document.getElementById('iconTextInput');
  const iconSelect = document.getElementById('iconSelect');
  const iconColor = document.getElementById('iconColor');
  const iconBorderWidth = document.getElementById('iconBorderWidth');
  const iconBorderColor = document.getElementById('iconBorderColor');
  const iconGlow = document.getElementById('iconGlow');
  const iconShadow = document.getElementById('iconShadow');
  const iconImageUpload = document.getElementById('iconImageUpload');

  if (iconColor1) iconColor1.addEventListener('input', (e) => { AppState.iconConfig.bg.color1 = e.target.value; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconColor2) iconColor2.addEventListener('input', (e) => { AppState.iconConfig.bg.color2 = e.target.value; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconBgType) iconBgType.addEventListener('change', (e) => { AppState.iconConfig.bg.type = e.target.value; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconRadius) iconRadius.addEventListener('input', (e) => { AppState.iconConfig.borderRadius = parseInt(e.target.value); CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconScale) iconScale.addEventListener('input', (e) => { AppState.iconConfig.iconScale = parseFloat(e.target.value); CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconColor) iconColor.addEventListener('input', (e) => { AppState.iconConfig.iconColor = e.target.value; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconBorderWidth) iconBorderWidth.addEventListener('input', (e) => { AppState.iconConfig.borderWidth = parseInt(e.target.value); CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconBorderColor) iconBorderColor.addEventListener('input', (e) => { AppState.iconConfig.borderColor = e.target.value; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconGlow) iconGlow.addEventListener('change', (e) => { AppState.iconConfig.glow = e.target.checked; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconShadow) iconShadow.addEventListener('change', (e) => { AppState.iconConfig.shadow = e.target.checked; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });

  if (iconFgType) {
    iconFgType.addEventListener('change', (e) => {
      AppState.iconConfig.fgType = e.target.value;
      document.getElementById('iconFgEmojiGroup').classList.toggle('hidden', e.target.value !== 'emoji');
      document.getElementById('iconFgTextGroup').classList.toggle('hidden', e.target.value !== 'text');
      document.getElementById('iconFgIconGroup').classList.toggle('hidden', e.target.value !== 'icon');
      document.getElementById('iconFgImageGroup').classList.toggle('hidden', e.target.value !== 'image');
      CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig);
    });
  }

  if (iconEmojiInput) iconEmojiInput.addEventListener('input', (e) => { AppState.iconConfig.emoji = e.target.value || '⚡'; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconTextInput) iconTextInput.addEventListener('input', (e) => { AppState.iconConfig.text = e.target.value || 'A'; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });
  if (iconSelect) iconSelect.addEventListener('change', (e) => { AppState.iconConfig.iconKey = e.target.value; CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig); });

  if (iconImageUpload) {
    iconImageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            AppState.iconConfig.imageElement = img;
            AppState.iconConfig.fgType = 'image';
            if (iconFgType) iconFgType.value = 'image';
            iconFgType.dispatchEvent(new Event('change'));
            CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig);
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Quick Emoji Pickers
  document.querySelectorAll('.quick-emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      AppState.iconConfig.emoji = btn.innerText;
      if (iconEmojiInput) iconEmojiInput.value = btn.innerText;
      AppState.iconConfig.fgType = 'emoji';
      if (iconFgType) iconFgType.value = 'emoji';
      iconFgType.dispatchEvent(new Event('change'));
      CanvasEngine.renderIcon(iconCanvas, AppState.iconConfig);
    });
  });

  // Download Icon Button
  const downloadIconBtn = document.getElementById('downloadIconBtn');
  if (downloadIconBtn) {
    downloadIconBtn.addEventListener('click', () => {
      Exporter.downloadCanvas(iconCanvas, "app-icon-512x512.png");
      showToast("✅ Icône 512x512 PNG téléchargée !");
    });
  }

  // ----------------- 2. FEATURE GRAPHIC CONTROLS -----------------
  const featTitle = document.getElementById('featTitle');
  const featSubtitle = document.getElementById('featSubtitle');
  const featBadge = document.getElementById('featBadge');
  const featMockupMode = document.getElementById('featMockupMode');
  const featBgPreset = document.getElementById('featBgPreset');
  const featFontFamily = document.getElementById('featFontFamily');
  const featRTL = document.getElementById('featRTL');
  const featBadgeColor = document.getElementById('featBadgeColor');
  const featScreenUpload = document.getElementById('featScreenUpload');

  if (featTitle) featTitle.addEventListener('input', (e) => { AppState.featureConfig.title = e.target.value; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });
  if (featSubtitle) featSubtitle.addEventListener('input', (e) => { AppState.featureConfig.subtitle = e.target.value; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });
  if (featBadge) featBadge.addEventListener('input', (e) => { AppState.featureConfig.badgeText = e.target.value; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });
  if (featMockupMode) featMockupMode.addEventListener('change', (e) => { AppState.featureConfig.mockupMode = e.target.value; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });
  if (featBgPreset) featBgPreset.addEventListener('change', (e) => { AppState.featureConfig.bg.preset = e.target.value; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });
  if (featFontFamily) featFontFamily.addEventListener('change', (e) => { AppState.featureConfig.fontFamily = e.target.value; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });
  if (featRTL) featRTL.addEventListener('change', (e) => { AppState.featureConfig.isRTL = e.target.checked; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });
  if (featBadgeColor) featBadgeColor.addEventListener('input', (e) => { AppState.featureConfig.badgeColor = e.target.value; CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig); });

  if (featScreenUpload) {
    featScreenUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            AppState.featureConfig.screenshotImg = img;
            CanvasEngine.renderFeatureGraphic(featureCanvas, AppState.featureConfig);
            showToast("📱 Capture chargée sur le Feature Graphic !");
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Download Feature Graphic Button
  const downloadFeatureBtn = document.getElementById('downloadFeatureBtn');
  if (downloadFeatureBtn) {
    downloadFeatureBtn.addEventListener('click', () => {
      Exporter.downloadCanvas(featureCanvas, "feature-graphic-1024x500.png");
      showToast("✅ Feature Graphic 1024x500 PNG téléchargé !");
    });
  }

  // ----------------- 3. SCREENSHOTS STUDIO CONTROLS -----------------
  const screenHeadline = document.getElementById('screenHeadline');
  const screenSubtitle = document.getElementById('screenSubtitle');
  const screenBadge = document.getElementById('screenBadge');
  const screenLayout = document.getElementById('screenLayout');
  const screenBgPreset = document.getElementById('screenBgPreset');
  const screenFontFamily = document.getElementById('screenFontFamily');
  const screenRTL = document.getElementById('screenRTL');
  const screenImageUpload = document.getElementById('screenImageUpload');
  const screensPagination = document.getElementById('screensPagination');

  function renderScreensPagination() {
    if (!screensPagination) return;
    screensPagination.innerHTML = '';

    AppState.screenshotsList.forEach((slide, idx) => {
      const btn = document.createElement('button');
      btn.className = `px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
        idx === AppState.activeScreenIndex 
          ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20' 
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
      }`;
      btn.innerHTML = `<span>#${idx + 1}</span>`;
      btn.addEventListener('click', () => {
        AppState.activeScreenIndex = idx;
        loadActiveScreenDataIntoInputs();
        renderScreensPagination();
        CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
      });
      screensPagination.appendChild(btn);
    });

    // Add Slide Button if less than 8
    if (AppState.screenshotsList.length < 8) {
      const addBtn = document.createElement('button');
      addBtn.className = 'px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-800 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/40 transition';
      addBtn.innerHTML = '+ Ajouter';
      addBtn.addEventListener('click', () => {
        AppState.screenshotsList.push({
          headline: `Fonctionnalité #${AppState.screenshotsList.length + 1}`,
          subtitle: "Détaillez les bénéfices pour l'utilisateur",
          badgeText: "",
          layoutStyle: "front_classic",
          bg: { preset: 'dark_navy' },
          fontFamily: "Outfit",
          textColor: "#FFFFFF",
          subColor: "rgba(255, 255, 255, 0.75)",
          isRTL: false,
          screenshotImg: null
        });
        AppState.activeScreenIndex = AppState.screenshotsList.length - 1;
        loadActiveScreenDataIntoInputs();
        renderScreensPagination();
        CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
        showToast("Slide ajouté !");
      });
      screensPagination.appendChild(addBtn);
    }
  }

  function loadActiveScreenDataIntoInputs() {
    const cur = AppState.screenshotsList[AppState.activeScreenIndex];
    if (!cur) return;
    if (screenHeadline) screenHeadline.value = cur.headline;
    if (screenSubtitle) screenSubtitle.value = cur.subtitle;
    if (screenBadge) screenBadge.value = cur.badgeText || '';
    if (screenLayout) screenLayout.value = cur.layoutStyle;
    if (screenBgPreset) screenBgPreset.value = cur.bg.preset || 'dark_navy';
    if (screenFontFamily) screenFontFamily.value = cur.fontFamily || 'Outfit';
    if (screenRTL) screenRTL.checked = !!cur.isRTL;
  }

  if (screenHeadline) screenHeadline.addEventListener('input', (e) => {
    AppState.screenshotsList[AppState.activeScreenIndex].headline = e.target.value;
    CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
  });
  if (screenSubtitle) screenSubtitle.addEventListener('input', (e) => {
    AppState.screenshotsList[AppState.activeScreenIndex].subtitle = e.target.value;
    CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
  });
  if (screenBadge) screenBadge.addEventListener('input', (e) => {
    AppState.screenshotsList[AppState.activeScreenIndex].badgeText = e.target.value;
    CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
  });
  if (screenLayout) screenLayout.addEventListener('change', (e) => {
    AppState.screenshotsList[AppState.activeScreenIndex].layoutStyle = e.target.value;
    CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
  });
  if (screenBgPreset) screenBgPreset.addEventListener('change', (e) => {
    AppState.screenshotsList[AppState.activeScreenIndex].bg.preset = e.target.value;
    CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
  });
  if (screenFontFamily) screenFontFamily.addEventListener('change', (e) => {
    AppState.screenshotsList[AppState.activeScreenIndex].fontFamily = e.target.value;
    CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
  });
  if (screenRTL) screenRTL.addEventListener('change', (e) => {
    AppState.screenshotsList[AppState.activeScreenIndex].isRTL = e.target.checked;
    CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
  });

  if (screenImageUpload) {
    screenImageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            AppState.screenshotsList[AppState.activeScreenIndex].screenshotImg = img;
            CanvasEngine.renderScreenshot(screenshotCanvas, AppState.screenshotsList[AppState.activeScreenIndex]);
            showToast(`Capture chargée sur la slide #${AppState.activeScreenIndex + 1} !`);
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Download Single Screenshot
  const downloadSingleScreenBtn = document.getElementById('downloadSingleScreenBtn');
  if (downloadSingleScreenBtn) {
    downloadSingleScreenBtn.addEventListener('click', () => {
      Exporter.downloadCanvas(screenshotCanvas, `screenshot-${AppState.activeScreenIndex + 1}-1080x1920.png`);
      showToast(`✅ Capture #${AppState.activeScreenIndex + 1} téléchargée !`);
    });
  }

  // Download All Screenshots ZIP
  const downloadScreenshotsZipBtn = document.getElementById('downloadScreenshotsZipBtn');
  if (downloadScreenshotsZipBtn) {
    downloadScreenshotsZipBtn.addEventListener('click', () => {
      Exporter.exportScreenshotsZip(AppState.screenshotsList);
      showToast("📦 Création et téléchargement du ZIP de toutes les captures...");
    });
  }

  // =========================================================================
  // ASO METADATA MODULE
  // =========================================================================
  const asoCategorySelect = document.getElementById('asoCategorySelect');
  const asoLangTabs = document.querySelectorAll('.aso-lang-tab');
  const asoAppTitle = document.getElementById('asoAppTitle');
  const asoShortDesc = document.getElementById('asoShortDesc');
  const asoFullDesc = document.getElementById('asoFullDesc');
  const asoReleaseNotes = document.getElementById('asoReleaseNotes');

  // Character Counter Badges
  const countTitle = document.getElementById('countTitle');
  const countShort = document.getElementById('countShort');
  const countFull = document.getElementById('countFull');
  const countRelease = document.getElementById('countRelease');

  function updateCharCount(input, counterElem, max) {
    if (!input || !counterElem) return;
    const len = input.value.length;
    counterElem.innerText = `${len} / ${max}`;
    if (len > max) {
      counterElem.className = 'char-counter-badge text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40';
    } else if (len >= max * 0.8) {
      counterElem.className = 'char-counter-badge text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40';
    } else {
      counterElem.className = 'char-counter-badge text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40';
    }
  }

  function loadAsoCategory(categoryKey, lang = 'fr') {
    const cat = window.ASO_TEMPLATES[categoryKey];
    if (!cat || !cat[lang]) return;

    AppState.asoData[lang] = {
      title: cat[lang].title,
      shortDesc: cat[lang].shortDesc,
      fullDesc: cat[lang].fullDesc,
      releaseNotes: cat[lang].releaseNotes
    };

    if (asoAppTitle) asoAppTitle.value = cat[lang].title;
    if (asoShortDesc) asoShortDesc.value = cat[lang].shortDesc;
    if (asoFullDesc) asoFullDesc.value = cat[lang].fullDesc;
    if (asoReleaseNotes) asoReleaseNotes.value = cat[lang].releaseNotes;

    // Apply RTL for Arabic
    const isAr = lang === 'ar';
    [asoAppTitle, asoShortDesc, asoFullDesc, asoReleaseNotes].forEach(el => {
      if (el) {
        el.dir = isAr ? 'rtl' : 'ltr';
        el.classList.toggle('font-cairo', isAr);
      }
    });

    updateCharCount(asoAppTitle, countTitle, 30);
    updateCharCount(asoShortDesc, countShort, 80);
    updateCharCount(asoFullDesc, countFull, 4000);
    updateCharCount(asoReleaseNotes, countRelease, 500);
  }

  // Init all languages in ASO data from default category
  function initAllAsoLangs(categoryKey) {
    const cat = window.ASO_TEMPLATES[categoryKey];
    if (!cat) return;
    ['fr', 'ar', 'en'].forEach(lang => {
      if (cat[lang]) {
        AppState.asoData[lang] = { ...cat[lang] };
      }
    });
  }

  if (asoCategorySelect) {
    asoCategorySelect.addEventListener('change', (e) => {
      AppState.selectedAsoCategory = e.target.value;
      initAllAsoLangs(e.target.value);
      loadAsoCategory(e.target.value, AppState.activeAsoLang);
      showToast(`Modèle "${e.target.selectedOptions[0].text}" chargé !`);
    });
  }

  asoLangTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const lang = tab.getAttribute('data-lang');
      AppState.activeAsoLang = lang;

      asoLangTabs.forEach(t => {
        t.classList.remove('bg-cyan-500', 'text-black', 'font-bold');
        t.classList.add('bg-gray-800', 'text-gray-400');
      });
      tab.classList.add('bg-cyan-500', 'text-black', 'font-bold');
      tab.classList.remove('bg-gray-800', 'text-gray-400');

      loadAsoCategory(AppState.selectedAsoCategory, lang);
    });
  });

  if (asoAppTitle) asoAppTitle.addEventListener('input', () => {
    updateCharCount(asoAppTitle, countTitle, 30);
    AppState.asoData[AppState.activeAsoLang].title = asoAppTitle.value;
  });
  if (asoShortDesc) asoShortDesc.addEventListener('input', () => {
    updateCharCount(asoShortDesc, countShort, 80);
    AppState.asoData[AppState.activeAsoLang].shortDesc = asoShortDesc.value;
  });
  if (asoFullDesc) asoFullDesc.addEventListener('input', () => {
    updateCharCount(asoFullDesc, countFull, 4000);
    AppState.asoData[AppState.activeAsoLang].fullDesc = asoFullDesc.value;
  });
  if (asoReleaseNotes) asoReleaseNotes.addEventListener('input', () => {
    updateCharCount(asoReleaseNotes, countRelease, 500);
    AppState.asoData[AppState.activeAsoLang].releaseNotes = asoReleaseNotes.value;
  });

  // 1-Click Copy Buttons for ASO fields
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.value).then(() => {
          showToast("📋 Copié dans le presse-papier !");
        });
      }
    });
  });

  // =========================================================================
  // AI ASO GENERATOR & PROOFREADER HANDLERS
  // =========================================================================
  const aiTopicInput = document.getElementById('aiTopicInput');
  const aiToneSelect = document.getElementById('aiToneSelect');
  const aiGenerateAllBtn = document.getElementById('aiGenerateAllBtn');
  const aiOptimizeAllBtn = document.getElementById('aiOptimizeAllBtn');

  if (aiGenerateAllBtn) {
    aiGenerateAllBtn.addEventListener('click', async () => {
      const topic = aiTopicInput ? aiTopicInput.value.trim() : '';
      if (!topic) {
        showToast("⚠️ Veuillez entrer un sujet ou une idée d'application (ex: 'App de fitness').", "info");
        if (aiTopicInput) aiTopicInput.focus();
        return;
      }

      const tone = aiToneSelect ? aiToneSelect.value : 'marketing';
      const lang = AppState.activeAsoLang || 'fr';

      showToast("✨ Génération des métadonnées ASO par l'IA en cours...", "info");

      try {
        const res = await fetch('/api/ai/generate-aso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, tone, lang, action: 'generate_all' })
        });
        const data = await res.json();
        if (data.success && data.result) {
          const r = data.result;
          if (asoAppTitle) asoAppTitle.value = r.title || '';
          if (asoShortDesc) asoShortDesc.value = r.shortDesc || '';
          if (asoFullDesc) asoFullDesc.value = r.fullDesc || '';
          if (asoReleaseNotes) asoReleaseNotes.value = r.releaseNotes || '';

          AppState.asoData[lang] = {
            title: r.title || '',
            shortDesc: r.shortDesc || '',
            fullDesc: r.fullDesc || '',
            releaseNotes: r.releaseNotes || ''
          };

          updateCharCount(asoAppTitle, countTitle, 30);
          updateCharCount(asoShortDesc, countShort, 80);
          updateCharCount(asoFullDesc, countFull, 4000);
          updateCharCount(asoReleaseNotes, countRelease, 500);

          showToast("🤖 Métadonnées ASO générées avec succès par l'IA !");
        } else {
          showToast(data.message || "Erreur de génération.", "error");
        }
      } catch (err) {
        showToast("Erreur lors de la communication avec le serveur IA.", "error");
      }
    });
  }

  // Optimize individual or all ASO fields with AI
  document.querySelectorAll('.ai-field-optimize-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const field = btn.getAttribute('data-field');
      let targetInput = null;
      if (field === 'title') targetInput = asoAppTitle;
      else if (field === 'shortDesc') targetInput = asoShortDesc;
      else if (field === 'fullDesc') targetInput = asoFullDesc;
      else if (field === 'releaseNotes') targetInput = asoReleaseNotes;

      if (!targetInput || !targetInput.value.trim()) {
        showToast("⚠️ Le champ est vide. Écrivez un texte avant de l'optimiser.", "info");
        return;
      }

      showToast("🪄 Optimisation IA du texte en cours...", "info");

      try {
        const res = await fetch('/api/ai/generate-aso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'optimize',
            field: field,
            text: targetInput.value,
            lang: AppState.activeAsoLang
          })
        });
        const data = await res.json();
        if (data.success && data.text) {
          targetInput.value = data.text;
          AppState.asoData[AppState.activeAsoLang][field] = data.text;
          if (field === 'title') updateCharCount(asoAppTitle, countTitle, 30);
          if (field === 'shortDesc') updateCharCount(asoShortDesc, countShort, 80);
          if (field === 'fullDesc') updateCharCount(asoFullDesc, countFull, 4000);
          if (field === 'releaseNotes') updateCharCount(asoReleaseNotes, countRelease, 500);
          showToast("✨ Texte optimisé et conforme Google Play Console !");
        }
      } catch (err) {
        showToast("Erreur d'optimisation.", "error");
      }
    });
  });

  if (aiOptimizeAllBtn) {
    aiOptimizeAllBtn.addEventListener('click', () => {
      document.querySelectorAll('.ai-field-optimize-btn').forEach(btn => btn.click());
    });
  }

  // =========================================================================
  // PRIVACY POLICY GENERATOR MODULE
  // =========================================================================
  function updatePrivacyPolicy() {
    AppState.privacyConfig.appName = document.getElementById('ppAppName')?.value || "Mon Application";
    AppState.privacyConfig.devName = document.getElementById('ppDevName')?.value || "Développeur";
    AppState.privacyConfig.contactEmail = document.getElementById('ppEmail')?.value || "support@example.com";
    AppState.privacyConfig.effectiveDate = document.getElementById('ppDate')?.value || new Date().toISOString().split('T')[0];
    AppState.privacyConfig.appType = document.getElementById('ppAppType')?.value || "Free";
    AppState.privacyConfig.coppa = document.getElementById('ppCoppa')?.value || "no";

    // Collect checkboxes
    AppState.privacyConfig.permissions.location = document.getElementById('permLocation')?.checked || false;
    AppState.privacyConfig.permissions.camera = document.getElementById('permCamera')?.checked || false;
    AppState.privacyConfig.permissions.storage = document.getElementById('permStorage')?.checked || false;
    AppState.privacyConfig.permissions.microphone = document.getElementById('permMic')?.checked || false;
    AppState.privacyConfig.permissions.notifications = document.getElementById('permNotif')?.checked || false;
    AppState.privacyConfig.permissions.contacts = document.getElementById('permContacts')?.checked || false;

    AppState.privacyConfig.sdks.playServices = document.getElementById('sdkPlayServices')?.checked || false;
    AppState.privacyConfig.sdks.admob = document.getElementById('sdkAdmob')?.checked || false;
    AppState.privacyConfig.sdks.firebase = document.getElementById('sdkFirebase')?.checked || false;
    AppState.privacyConfig.sdks.facebook = document.getElementById('sdkFacebook')?.checked || false;
    AppState.privacyConfig.sdks.onesignal = document.getElementById('sdkOneSignal')?.checked || false;
    AppState.privacyConfig.sdks.unity = document.getElementById('sdkUnity')?.checked || false;
    AppState.privacyConfig.sdks.weather = document.getElementById('sdkWeather')?.checked || false;

    AppState.privacyResult = PrivacyPolicyGenerator.generate(AppState.privacyConfig);

    // Update Views
    const previewContainer = document.getElementById('privacyPreviewHtml');
    const rawHtmlTextarea = document.getElementById('privacyRawHtml');
    const rawMdTextarea = document.getElementById('privacyRawMd');

    if (previewContainer) previewContainer.innerHTML = AppState.privacyResult.html;
    if (rawHtmlTextarea) rawHtmlTextarea.value = AppState.privacyResult.html;
    if (rawMdTextarea) rawMdTextarea.value = AppState.privacyResult.markdown;
  }

  // Privacy Policy input listeners
  const ppFormInputs = document.querySelectorAll('#tab-privacy input, #tab-privacy select');
  ppFormInputs.forEach(input => {
    input.addEventListener('change', updatePrivacyPolicy);
    input.addEventListener('input', updatePrivacyPolicy);
  });

  // Privacy Policy View Subtabs (Preview, HTML, Markdown)
  const ppViewTabs = document.querySelectorAll('.pp-view-tab');
  const ppViewPanes = document.querySelectorAll('.pp-view-pane');
  ppViewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.getAttribute('data-view');
      ppViewTabs.forEach(t => {
        t.classList.remove('bg-cyan-500', 'text-black', 'font-bold');
        t.classList.add('bg-gray-800', 'text-gray-400');
      });
      tab.classList.add('bg-cyan-500', 'text-black', 'font-bold');
      tab.classList.remove('bg-gray-800', 'text-gray-400');

      ppViewPanes.forEach(p => {
        p.classList.remove('active');
        if (p.id === `pp-pane-${view}`) p.classList.add('active');
      });
    });
  });

  // Download Privacy Policy Buttons
  const downloadPpHtmlBtn = document.getElementById('downloadPpHtmlBtn');
  const downloadPpMdBtn = document.getElementById('downloadPpMdBtn');

  if (downloadPpHtmlBtn) {
    downloadPpHtmlBtn.addEventListener('click', () => {
      const blob = new Blob([AppState.privacyResult.html], { type: 'text/html;charset=utf-8' });
      if (window.saveAs) {
        saveAs(blob, "privacy-policy.html");
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "privacy-policy.html";
        link.click();
      }
      showToast("📄 Fichier privacy-policy.html téléchargé !");
    });
  }

  if (downloadPpMdBtn) {
    downloadPpMdBtn.addEventListener('click', () => {
      const blob = new Blob([AppState.privacyResult.markdown], { type: 'text/markdown;charset=utf-8' });
      if (window.saveAs) {
        saveAs(blob, "privacy-policy.md");
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "privacy-policy.md";
        link.click();
      }
      showToast("📄 Fichier privacy-policy.md téléchargé !");
    });
  }

  // =========================================================================
  // CHECKLIST & GUIDE PLAY CONSOLE MODULE
  // =========================================================================
  const checklistContainer = document.getElementById('checklistContainer');
  const checklistProgressBar = document.getElementById('checklistProgressBar');
  const checklistProgressPercent = document.getElementById('checklistProgressPercent');
  const dataSafetyGuideContainer = document.getElementById('dataSafetyGuideContainer');
  const testerInviteTextarea = document.getElementById('testerInviteTextarea');
  const inviteLangSelect = document.getElementById('inviteLangSelect');
  const inviteChannelSelect = document.getElementById('inviteChannelSelect');

  // Load saved checklist state from localStorage
  let savedChecklist = {};
  try {
    savedChecklist = JSON.parse(localStorage.getItem('play_console_checklist_state') || '{}');
  } catch (e) {
    savedChecklist = {};
  }

  function renderChecklist() {
    if (!checklistContainer || !window.PLAY_CONSOLE_CHECKLIST) return;
    checklistContainer.innerHTML = '';

    let totalItems = 0;
    let checkedItems = 0;

    window.PLAY_CONSOLE_CHECKLIST.forEach(cat => {
      const catBox = document.createElement('div');
      catBox.className = 'glass-panel p-5 rounded-2xl mb-5';

      let itemsHtml = '';
      cat.items.forEach(item => {
        totalItems++;
        const isChecked = !!savedChecklist[item.id];
        if (isChecked) checkedItems++;

        itemsHtml += `
          <label class="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition cursor-pointer border border-transparent hover:border-white/5 ${isChecked ? 'opacity-70 line-through text-gray-400' : ''}">
            <input type="checkbox" data-id="${item.id}" class="checklist-item-check mt-1 w-5 h-5 rounded border-gray-600 text-cyan-500 focus:ring-cyan-400 custom-checkbox cursor-pointer" ${isChecked ? 'checked' : ''}>
            <div class="flex-1 text-sm font-medium leading-relaxed">
              <span>${item.text}</span>
              ${item.critical ? '<span class="ml-2 inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Obligatoire</span>' : ''}
            </div>
          </label>
        `;
      });

      catBox.innerHTML = `
        <div class="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
          <h3 class="font-bold text-base text-cyan-400">${cat.title}</h3>
        </div>
        <div class="space-y-1">
          ${itemsHtml}
        </div>
      `;

      checklistContainer.appendChild(catBox);
    });

    // Update Progress
    const pct = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
    if (checklistProgressBar) checklistProgressBar.style.width = `${pct}%`;
    if (checklistProgressPercent) checklistProgressPercent.innerText = `${pct}% Terminé (${checkedItems}/${totalItems})`;

    // Attach listeners
    document.querySelectorAll('.checklist-item-check').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        savedChecklist[id] = e.target.checked;
        localStorage.setItem('play_console_checklist_state', JSON.stringify(savedChecklist));
        renderChecklist();
      });
    });
  }

  // Render Data Safety Guide
  function renderDataSafetyGuide() {
    if (!dataSafetyGuideContainer || !window.DATA_SAFETY_GUIDE) return;
    dataSafetyGuideContainer.innerHTML = '';
    window.DATA_SAFETY_GUIDE.forEach(guide => {
      const card = document.createElement('div');
      card.className = 'glass-panel p-4 rounded-xl border-l-4 border-cyan-400';
      card.innerHTML = `
        <h4 class="font-bold text-sm text-cyan-300 mb-1">${guide.title}</h4>
        <p class="text-xs text-gray-300 leading-relaxed">${guide.answer}</p>
      `;
      dataSafetyGuideContainer.appendChild(card);
    });
  }

  // Render Tester Invitation Text
  function updateTesterInviteText() {
    if (!testerInviteTextarea) return;
    const lang = inviteLangSelect?.value || 'fr';
    const channel = inviteChannelSelect?.value || 'whatsapp';
    const template = window.TESTER_INVITATION_TEMPLATES[lang]?.[channel] || "";
    
    // Replace placeholder with app name
    const appName = document.getElementById('ppAppName')?.value || "Mon Application";
    testerInviteTextarea.value = template.replaceAll('[NOM_APP]', appName);
  }

  if (inviteLangSelect) inviteLangSelect.addEventListener('change', updateTesterInviteText);
  if (inviteChannelSelect) inviteChannelSelect.addEventListener('change', updateTesterInviteText);

  // Copy Tester Invitation
  const copyInviteBtn = document.getElementById('copyInviteBtn');
  if (copyInviteBtn) {
    copyInviteBtn.addEventListener('click', () => {
      if (testerInviteTextarea) {
        navigator.clipboard.writeText(testerInviteTextarea.value).then(() => {
          showToast("📋 Message d'invitation copié !");
        });
      }
    });
  }

  // =========================================================================
  // STUDIO VIDÉO PROMO & TRAILER MODULE
  // =========================================================================
  const videoCanvas = document.getElementById('videoCanvas');
  let videoEngine = null;
  if (videoCanvas && window.VideoEngine) {
    videoEngine = new VideoEngine(videoCanvas);
  }

  const videoFormat169Btn = document.getElementById('videoFormat169Btn');
  const videoFormat916Btn = document.getElementById('videoFormat916Btn');
  const videoSlideDuration = document.getElementById('videoSlideDuration');
  const videoTransition = document.getElementById('videoTransition');
  const videoFontFamily = document.getElementById('videoFontFamily');
  const videoAudioChime = document.getElementById('videoAudioChime');
  const videoSlidesList = document.getElementById('videoSlidesList');
  const videoTotalDurationLabel = document.getElementById('videoTotalDurationLabel');
  const videoResolutionBadge = document.getElementById('videoResolutionBadge');
  const videoViewportContainer = document.getElementById('videoViewportContainer');
  const videoPlayPauseBtn = document.getElementById('videoPlayPauseBtn');
  const videoPlayPauseLabel = document.getElementById('videoPlayPauseLabel');
  const videoReplayBtn = document.getElementById('videoReplayBtn');
  const videoCurrentTime = document.getElementById('videoCurrentTime');
  const videoTotalTime = document.getElementById('videoTotalTime');
  const exportVideoBtn = document.getElementById('exportVideoBtn');
  const videoExportProgressBox = document.getElementById('videoExportProgressBox');
  const videoExportProgressBar = document.getElementById('videoExportProgressBar');
  const videoExportPercent = document.getElementById('videoExportPercent');

  function getVideoState() {
    const is169 = AppState.videoConfig.format === '16_9';
    return {
      width: is169 ? 1920 : 1080,
      height: is169 ? 1080 : 1920,
      format: AppState.videoConfig.format,
      slides: AppState.screenshotsList,
      slideDuration: parseFloat(AppState.videoConfig.slideDuration) || 3,
      transitionEffect: AppState.videoConfig.transitionEffect || 'flash_glow',
      fontFamily: AppState.videoConfig.fontFamily || 'Outfit',
      audioChime: !!AppState.videoConfig.audioChime
    };
  }

  function updateVideoDurationUI() {
    const durationPerSlide = parseFloat(AppState.videoConfig.slideDuration) || 3;
    const totalSec = (durationPerSlide * AppState.screenshotsList.length).toFixed(1);
    if (videoTotalDurationLabel) videoTotalDurationLabel.innerText = `Durée totale : ${totalSec}s`;
    if (videoTotalTime) videoTotalTime.innerText = `${totalSec}s`;
  }

  function updateVideoResolutionUI() {
    const is169 = AppState.videoConfig.format === '16_9';
    if (videoCanvas) {
      videoCanvas.width = is169 ? 1920 : 1080;
      videoCanvas.height = is169 ? 1080 : 1920;
    }
    if (videoViewportContainer) {
      if (is169) {
        videoViewportContainer.className = "canvas-preview-box p-3 w-full aspect-[16/9] flex items-center justify-center transition-all duration-300";
      } else {
        videoViewportContainer.className = "canvas-preview-box p-3 w-full max-w-[340px] mx-auto aspect-[9/16] flex items-center justify-center transition-all duration-300";
      }
    }
    if (videoResolutionBadge) {
      videoResolutionBadge.innerText = is169 ? "1920 x 1080 px (16:9 Full HD)" : "1080 x 1920 px (9:16 Shorts/Reels)";
    }
    updateVideoDurationUI();
    // Render static first frame
    if (videoEngine) {
      videoEngine.renderFrame(getVideoState(), 0, 0, AppState.videoConfig.slideDuration * 1000);
    }
  }

  function renderVideoSlidesList() {
    if (!videoSlidesList) return;
    videoSlidesList.innerHTML = '';

    AppState.screenshotsList.forEach((slide, idx) => {
      const item = document.createElement('div');
      item.className = 'glass-panel p-3 rounded-xl flex items-center gap-3 border border-white/5';
      item.innerHTML = `
        <div class="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs shrink-0">
          #${idx + 1}
        </div>
        <div class="flex-1 min-w-0">
          <input type="text" data-idx="${idx}" class="video-slide-title-input w-full bg-transparent text-xs font-bold text-white border-b border-transparent hover:border-cyan-500/50 focus:border-cyan-400 focus:outline-none" value="${slide.headline}">
          <p class="text-[11px] text-gray-400 truncate">${slide.subtitle}</p>
        </div>
        <label class="px-2.5 py-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-[11px] text-cyan-300 font-medium cursor-pointer shrink-0 flex items-center gap-1">
          <i data-lucide="image-plus" class="w-3 h-3"></i>
          <span>Photo</span>
          <input type="file" data-idx="${idx}" accept="image/*" class="video-slide-img-upload hidden">
        </label>
      `;
      videoSlidesList.appendChild(item);
    });

    // Attach listeners to custom slide title inputs
    document.querySelectorAll('.video-slide-title-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        if (AppState.screenshotsList[idx]) {
          AppState.screenshotsList[idx].headline = e.target.value;
          if (videoEngine && !videoEngine.isPlaying) {
            videoEngine.renderFrame(getVideoState(), idx, 0.1, AppState.videoConfig.slideDuration * 1000);
          }
        }
      });
    });

    // Attach listeners to photo uploader per slide
    document.querySelectorAll('.video-slide-img-upload').forEach(input => {
      input.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        const file = e.target.files[0];
        if (file && AppState.screenshotsList[idx]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const img = new Image();
            img.onload = () => {
              AppState.screenshotsList[idx].screenshotImg = img;
              if (videoEngine && !videoEngine.isPlaying) {
                videoEngine.renderFrame(getVideoState(), idx, 0.1, AppState.videoConfig.slideDuration * 1000);
              }
              showToast(`Photo injectée dans la séquence #${idx + 1} !`);
            };
            img.src = evt.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  // Format Switchers
  if (videoFormat169Btn) {
    videoFormat169Btn.addEventListener('click', () => {
      AppState.videoConfig.format = '16_9';
      videoFormat169Btn.className = "video-format-btn active px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black flex items-center gap-1.5 transition";
      videoFormat916Btn.className = "video-format-btn px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-800 text-gray-400 hover:text-white flex items-center gap-1.5 transition";
      if (videoEngine) videoEngine.stop();
      if (videoPlayPauseLabel) videoPlayPauseLabel.innerText = "Lire l'Aperçu";
      updateVideoResolutionUI();
    });
  }

  if (videoFormat916Btn) {
    videoFormat916Btn.addEventListener('click', () => {
      AppState.videoConfig.format = '9_16';
      videoFormat916Btn.className = "video-format-btn active px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-black flex items-center gap-1.5 transition";
      videoFormat169Btn.className = "video-format-btn px-3.5 py-2 rounded-xl text-xs font-medium bg-gray-800 text-gray-400 hover:text-white flex items-center gap-1.5 transition";
      if (videoEngine) videoEngine.stop();
      if (videoPlayPauseLabel) videoPlayPauseLabel.innerText = "Lire l'Aperçu";
      updateVideoResolutionUI();
    });
  }

  // Slide Duration & Transition events
  if (videoSlideDuration) {
    videoSlideDuration.addEventListener('change', (e) => {
      AppState.videoConfig.slideDuration = parseFloat(e.target.value);
      updateVideoDurationUI();
      if (videoEngine && videoEngine.isPlaying) {
        videoEngine.startPreview(getVideoState(), handleVideoProgress);
      }
    });
  }

  if (videoTransition) {
    videoTransition.addEventListener('change', (e) => {
      AppState.videoConfig.transitionEffect = e.target.value;
    });
  }

  if (videoFontFamily) {
    videoFontFamily.addEventListener('change', (e) => {
      AppState.videoConfig.fontFamily = e.target.value;
      if (videoEngine && !videoEngine.isPlaying) {
        videoEngine.renderFrame(getVideoState(), 0, 0.1, AppState.videoConfig.slideDuration * 1000);
      }
    });
  }

  if (videoAudioChime) {
    videoAudioChime.addEventListener('change', (e) => {
      AppState.videoConfig.audioChime = e.target.checked;
    });
  }

  // Video Playback Progress Callback
  function handleVideoProgress(info) {
    if (videoCurrentTime) videoCurrentTime.innerText = `${info.currentTimeSec}s`;
    if (videoTotalTime) videoTotalTime.innerText = `${info.totalDurationSec}s`;
  }

  // Play / Pause Toggle
  if (videoPlayPauseBtn) {
    videoPlayPauseBtn.addEventListener('click', () => {
      if (!videoEngine) return;
      if (videoEngine.isPlaying) {
        videoEngine.stop();
        videoPlayPauseLabel.innerText = "Lire l'Aperçu";
      } else {
        videoEngine.startPreview(getVideoState(), handleVideoProgress);
        videoPlayPauseLabel.innerText = "Mettre en Pause";
      }
    });
  }

  // Replay Button
  if (videoReplayBtn) {
    videoReplayBtn.addEventListener('click', () => {
      if (!videoEngine) return;
      videoEngine.startPreview(getVideoState(), handleVideoProgress);
      if (videoPlayPauseLabel) videoPlayPauseLabel.innerText = "Mettre en Pause";
    });
  }

  // Export Video Button
  if (exportVideoBtn) {
    exportVideoBtn.addEventListener('click', () => {
      if (!videoEngine) return;

      showToast("🎬 Début de la génération de la vidéo HD...", "info");
      if (videoExportProgressBox) videoExportProgressBox.classList.remove('hidden');
      exportVideoBtn.disabled = true;
      exportVideoBtn.classList.add('opacity-50', 'cursor-not-allowed');

      videoEngine.exportVideo(
        getVideoState(),
        (progress) => {
          if (videoExportProgressBar) videoExportProgressBar.style.width = `${progress}%`;
          if (videoExportPercent) videoExportPercent.innerText = `${progress}%`;
        },
        (blob, extension) => {
          if (videoExportProgressBox) videoExportProgressBox.classList.add('hidden');
          exportVideoBtn.disabled = false;
          exportVideoBtn.classList.remove('opacity-50', 'cursor-not-allowed');

          const filename = `app-promo-trailer-${AppState.videoConfig.format === '16_9' ? '1080p' : 'shorts'}.${extension}`;
          Exporter.downloadVideo(blob, filename);
          showToast(`🎉 Vidéo ${filename} générée avec succès !`);
        }
      );
    });
  }

  // Stop video preview if user changes tab
  mainNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId !== 'video' && videoEngine) {
        videoEngine.stop();
        if (videoPlayPauseLabel) videoPlayPauseLabel.innerText = "Lire l'Aperçu";
      } else if (tabId === 'video') {
        renderVideoSlidesList();
        updateVideoResolutionUI();
      }
    });
  });

  // =========================================================================
  // MASTER EXPORT ALL PACK (.ZIP)
  // =========================================================================
  const masterExportBtn = document.getElementById('masterExportBtn');
  const masterExportHeaderBtn = document.getElementById('masterExportHeaderBtn');

  function handleMasterExport() {
    showToast("🚀 Génération du Pack Complet Google Play...");
    Exporter.exportFullPack({
      iconConfig: AppState.iconConfig,
      featureConfig: AppState.featureConfig,
      screenshotsList: AppState.screenshotsList,
      aso: AppState.asoData,
      privacy: AppState.privacyResult
    });
  }

  if (masterExportBtn) masterExportBtn.addEventListener('click', handleMasterExport);
  if (masterExportHeaderBtn) masterExportHeaderBtn.addEventListener('click', handleMasterExport);

  // =========================================================================
  // INITIALIZATION ON LOAD
  // =========================================================================
  initAllAsoLangs(AppState.selectedAsoCategory);
  loadAsoCategory(AppState.selectedAsoCategory, AppState.activeAsoLang);
  renderScreensPagination();
  loadActiveScreenDataIntoInputs();
  updatePrivacyPolicy();
  renderChecklist();
  renderDataSafetyGuide();
  updateTesterInviteText();
  renderVideoSlidesList();
  updateVideoResolutionUI();

  // =========================================================================
  // AUTHENTICATION & SESSION CONTROLLER
  // =========================================================================
  const authModal = document.getElementById('authModal');
  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const authSwitchLoginBtn = document.getElementById('authSwitchLoginBtn');
  const authSwitchRegisterBtn = document.getElementById('authSwitchRegisterBtn');
  const authForm = document.getElementById('authForm');
  const authNameField = document.getElementById('authNameField');
  const authInputName = document.getElementById('authInputName');
  const authInputEmail = document.getElementById('authInputEmail');
  const authInputPassword = document.getElementById('authInputPassword');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const userProfileHeaderPill = document.getElementById('userProfileHeaderPill');
  const userAvatarLetter = document.getElementById('userAvatarLetter');
  const userNameLabel = document.getElementById('userNameLabel');
  const userRoleBadge = document.getElementById('userRoleBadge');
  const userEmailLabel = document.getElementById('userEmailLabel');
  const logoutHeaderBtn = document.getElementById('logoutHeaderBtn');
  const adminNavTabBtn = document.getElementById('adminNavTabBtn');

  let authMode = 'login'; // 'login' or 'register'

  function updateAuthUI() {
    const currentUser = window.AuthManager ? AuthManager.getCurrentUser() : null;
    const adminSidebarGroup = document.getElementById('adminSidebarGroup');
    const pendingOverlay = document.getElementById('pendingAccountOverlay');
    const pendingUserNameEl = document.getElementById('pendingUserName');
    const appSidebar = document.getElementById('appSidebar');
    const mainEl = document.querySelector('main');

    if (currentUser && currentUser.status === 'pending') {
      // Show pending overlay, hide sidebar & main content
      if (pendingOverlay) { pendingOverlay.classList.remove('hidden'); pendingOverlay.classList.add('flex'); }
      if (userProfileHeaderPill) userProfileHeaderPill.classList.remove('hidden');
      if (openAuthModalBtn) openAuthModalBtn.classList.add('hidden');
      if (userAvatarLetter) userAvatarLetter.innerText = (currentUser.name || 'U').charAt(0).toUpperCase();
      if (userNameLabel) userNameLabel.innerText = currentUser.name || 'Utilisateur';
      if (userEmailLabel) userEmailLabel.innerText = currentUser.email;
      if (pendingUserNameEl) pendingUserNameEl.textContent = currentUser.name || 'Visiteur';
      if (appSidebar) appSidebar.classList.add('hidden');
      if (adminNavTabBtn) adminNavTabBtn.classList.add('hidden');
      if (adminSidebarGroup) adminSidebarGroup.classList.add('hidden');
      return;
    }

    // Hide pending overlay for approved/logged-out users
    if (pendingOverlay) { pendingOverlay.classList.add('hidden'); pendingOverlay.classList.remove('flex'); }
    if (appSidebar) appSidebar.classList.remove('hidden');

    if (currentUser) {
      if (userProfileHeaderPill) userProfileHeaderPill.classList.remove('hidden');
      if (openAuthModalBtn) openAuthModalBtn.classList.add('hidden');

      if (userAvatarLetter) userAvatarLetter.innerText = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';
      if (userNameLabel) userNameLabel.innerText = currentUser.name || 'Utilisateur';
      if (userEmailLabel) userEmailLabel.innerText = currentUser.email;

      if (userRoleBadge) {
        userRoleBadge.innerText = currentUser.role === 'admin' ? 'ADMIN' : (currentUser.plan || 'PRO');
        userRoleBadge.className = currentUser.role === 'admin' 
          ? 'text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30'
          : 'text-[9px] px-1.5 py-0.2 rounded font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      }

      if (currentUser.role === 'admin') {
        if (adminNavTabBtn) adminNavTabBtn.classList.remove('hidden');
        if (adminSidebarGroup) adminSidebarGroup.classList.remove('hidden');
      } else {
        if (adminNavTabBtn) adminNavTabBtn.classList.add('hidden');
        if (adminSidebarGroup) adminSidebarGroup.classList.add('hidden');
      }
    } else {
      if (userProfileHeaderPill) userProfileHeaderPill.classList.add('hidden');
      if (openAuthModalBtn) openAuthModalBtn.classList.remove('hidden');
      if (adminNavTabBtn) adminNavTabBtn.classList.add('hidden');
      if (adminSidebarGroup) adminSidebarGroup.classList.add('hidden');
    }

    // Refresh Admin Dashboard data if admin tab is active
    if (currentUser && currentUser.role === 'admin') {
      refreshAdminDashboard();
    }
  }

  function setAuthMode(mode, preselectedPlan = 'PRO') {
    authMode = mode;
    const authPlanField = document.getElementById('authPlanField');
    const authInputPlan = document.getElementById('authInputPlan');
    if (authInputPlan && preselectedPlan) authInputPlan.value = preselectedPlan;

    if (mode === 'register') {
      authSwitchRegisterBtn.className = "py-2 rounded-lg bg-cyan-500 text-black transition";
      authSwitchLoginBtn.className = "py-2 rounded-lg text-gray-400 hover:text-white transition";
      authNameField.classList.remove('hidden');
      if (authPlanField) authPlanField.classList.remove('hidden');
      authSubmitBtn.innerText = "Créer mon Compte";
    } else {
      authSwitchLoginBtn.className = "py-2 rounded-lg bg-cyan-500 text-black transition";
      authSwitchRegisterBtn.className = "py-2 rounded-lg text-gray-400 hover:text-white transition";
      authNameField.classList.add('hidden');
      if (authPlanField) authPlanField.classList.add('hidden');
      authSubmitBtn.innerText = "Se Connecter";
    }
  }

  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => authModal.classList.remove('hidden'));
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', () => authModal.classList.add('hidden'));

  if (authSwitchLoginBtn) authSwitchLoginBtn.addEventListener('click', () => setAuthMode('login'));
  if (authSwitchRegisterBtn) authSwitchRegisterBtn.addEventListener('click', () => setAuthMode('register'));

  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = authInputEmail.value;
      const password = authInputPassword.value;

      if (authMode === 'register') {
        const name = authInputName.value || email.split('@')[0];
        const plan = document.getElementById('authInputPlan')?.value || 'Gratuit';
        const res = await AuthManager.register(name, email, password, plan);
        if (res.success) {
          authModal.classList.add('hidden');
          if (res.pending) {
            // Show pending screen instead of entering the app
            const pendingOverlay = document.getElementById('pendingAccountOverlay');
            const pendingUserNameEl = document.getElementById('pendingUserName');
            if (pendingOverlay) { pendingOverlay.classList.remove('hidden'); pendingOverlay.classList.add('flex'); }
            if (pendingUserNameEl) pendingUserNameEl.textContent = name;
            showToast('✅ Compte créé ! En attente de validation par l\'administrateur.', 'info');
          } else {
            showToast(`🎉 Bienvenue ! Compte créé avec succès.`);
            updateAuthUI();
          }
        } else {
          showToast(res.message, "error");
        }
      } else {
        const res = await AuthManager.login(email, password);
        if (res.success) {
          authModal.classList.add('hidden');
          updateAuthUI();
          if (res.user && res.user.status !== 'pending') {
            showToast(`👋 Heureux de vous revoir, ${res.user.name} !`);
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('portal') === 'admin' || window.location.hash === '#admin') {
              if (res.user.role === 'admin') {
                switchTab('admin');
              }
            }
          }
        } else {
          showToast(res.message, "error");
        }
      }
    });
  }

  if (logoutHeaderBtn) {
    logoutHeaderBtn.addEventListener('click', () => {
      AuthManager.logout();
      showToast("Déconnexion réussie.");
      updateAuthUI();
      document.querySelector('[data-tab="landing"]')?.click();
    });
  }

  // Pending overlay logout button
  const pendingLogoutBtn = document.getElementById('pendingLogoutBtn');
  if (pendingLogoutBtn) {
    pendingLogoutBtn.addEventListener('click', () => {
      AuthManager.logout();
      const pendingOverlay = document.getElementById('pendingAccountOverlay');
      if (pendingOverlay) { pendingOverlay.classList.add('hidden'); pendingOverlay.classList.remove('flex'); }
      updateAuthUI();
      showToast("Déconnexion réussie.");
    });
  }

  // =========================================================================
  // UPGRADE MODAL & PERMISSIONS INTERCEPTOR
  // =========================================================================
  const upgradeModal = document.getElementById('upgradeModal');
  const closeUpgradeModalBtn = document.getElementById('closeUpgradeModalBtn');
  const requestProUpgradeBtn = document.getElementById('requestProUpgradeBtn');
  const requestVipUpgradeBtn = document.getElementById('requestVipUpgradeBtn');

  if (closeUpgradeModalBtn) closeUpgradeModalBtn.addEventListener('click', () => upgradeModal.classList.add('hidden'));

  function checkDownloadPermissionOrPrompt() {
    if (AuthManager.canDownload()) {
      return true;
    }
    // If not logged in, prompt login
    if (!AuthManager.getCurrentUser()) {
      setAuthMode('register', 'PRO');
      authModal.classList.remove('hidden');
      showToast("Veuillez vous inscrire pour exporter vos créations.", "info");
      return false;
    }
    // If user is on Free/Demo plan, show upgrade modal
    if (upgradeModal) {
      const plans = window.PricingManager ? PricingManager.getPlans() : null;
      if (plans) {
        const pBadge = document.getElementById('upgradeProPriceBadge');
        const vBadge = document.getElementById('upgradeVipPriceBadge');
        if (pBadge) pBadge.innerText = `${plans.pro.price}$ / mois`;
        if (vBadge) vBadge.innerText = `${plans.vip.price}$ / mois`;
      }
      upgradeModal.classList.remove('hidden');
    }
    return false;
  }

  if (requestProUpgradeBtn) {
    requestProUpgradeBtn.addEventListener('click', () => {
      const res = AuthManager.requestUpgrade('PRO');
      if (res.success) {
        showToast(res.message);
        upgradeModal.classList.add('hidden');
      }
    });
  }

  if (requestVipUpgradeBtn) {
    requestVipUpgradeBtn.addEventListener('click', () => {
      const res = AuthManager.requestUpgrade('VIP');
      if (res.success) {
        showToast(res.message);
        upgradeModal.classList.add('hidden');
      }
    });
  }

  // =========================================================================
  // LANDING PAGE, HUB NAVIGATION & PRICING RENDERER
  // =========================================================================
  const landingPricingCardsGrid = document.getElementById('landingPricingCardsGrid');
  const landingLaunchStudioBtn = document.getElementById('landingLaunchStudioBtn');
  const landingLaunchResizerBtn = document.getElementById('landingLaunchResizerBtn');
  const landingScrollPricingBtn = document.getElementById('landingScrollPricingBtn');
  const hubOpenPlayStudioBtn = document.getElementById('hubOpenPlayStudioBtn');
  const hubOpenResizerBtn = document.getElementById('hubOpenResizerBtn');

  if (landingLaunchStudioBtn) landingLaunchStudioBtn.addEventListener('click', () => switchTab('graphics'));
  if (landingLaunchResizerBtn) landingLaunchResizerBtn.addEventListener('click', () => switchTab('resizer'));
  if (hubOpenPlayStudioBtn) hubOpenPlayStudioBtn.addEventListener('click', () => switchTab('graphics'));
  if (hubOpenResizerBtn) hubOpenResizerBtn.addEventListener('click', () => switchTab('resizer'));

  if (landingScrollPricingBtn) {
    landingScrollPricingBtn.addEventListener('click', () => {
      document.getElementById('pricingSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  function renderLandingPricingCards() {
    if (!landingPricingCardsGrid || !window.PricingManager) return;
    landingPricingCardsGrid.innerHTML = '';
    const plans = PricingManager.getPlans();

    Object.keys(plans).forEach(key => {
      const plan = plans[key];
      const card = document.createElement('div');
      const isHighlighted = plan.highlighted;

      card.className = `glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6 relative transition-all duration-300 ${
        isHighlighted 
          ? 'border-2 border-cyan-400 bg-cyan-950/20 shadow-2xl shadow-cyan-500/10 scale-105' 
          : 'border border-white/10 hover:border-white/20'
      }`;

      let featuresHtml = '';
      plan.features.forEach(feat => {
        const isExcluded = feat.startsWith('❌');
        featuresHtml += `
          <li class="flex items-start gap-2.5 text-xs ${isExcluded ? 'text-gray-500' : 'text-gray-300'}">
            <span class="${isExcluded ? 'text-rose-500' : 'text-cyan-400'} font-bold">${isExcluded ? '✕' : '✓'}</span>
            <span>${feat.replace(/^[✅❌⭐🎬🎥🤖🍎⚡]\s*/, '')}</span>
          </li>
        `;
      });

      card.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
              isHighlighted ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-300'
            }">${plan.badge || plan.name}</span>
          </div>

          <div>
            <h3 class="text-xl font-bold text-white">${plan.name}</h3>
            <p class="text-xs text-gray-400 mt-1">${plan.description}</p>
          </div>

          <div class="pt-2 flex items-baseline gap-1">
            <span class="text-4xl font-black text-white font-['Outfit']">${plan.price}${plan.currency}</span>
            <span class="text-xs text-gray-400 font-medium">${plan.period}</span>
          </div>

          <ul class="space-y-2.5 pt-4 border-t border-white/10">
            ${featuresHtml}
          </ul>
        </div>

        <button data-plankey="${plan.id}" class="landing-select-plan-btn w-full py-3.5 px-6 rounded-2xl font-extrabold text-xs shadow-lg transition-all ${
          isHighlighted 
            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]' 
            : 'bg-gray-800 hover:bg-gray-700 text-white border border-white/10 hover:scale-[1.02]'
        }">
          ${plan.id === 'free' 
            ? (plan.ctaText || 'Tester Gratuitement') 
            : `Choisir le Plan ${plan.id === 'pro' ? 'PRO' : 'VIP'} (${plan.price}${plan.currency}/mois)`
          }
        </button>
      `;

      landingPricingCardsGrid.appendChild(card);
    });

    // Attach listeners to plan selection buttons
    document.querySelectorAll('.landing-select-plan-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const planKey = btn.getAttribute('data-plankey');
        const planName = planKey === 'vip' ? 'VIP' : planKey === 'pro' ? 'PRO' : 'Gratuit';
        
        const currentUser = AuthManager.getCurrentUser();
        if (currentUser) {
          if (planName === 'Gratuit') {
            document.querySelector('[data-tab="graphics"]')?.click();
          } else {
            AuthManager.requestUpgrade(planName);
            showToast(`Demande d'activation du Plan ${planName} envoyée à l'administrateur !`);
          }
        } else {
          setAuthMode('register', planName);
          authModal.classList.remove('hidden');
        }
      });
    });
  }

  // =========================================================================
  // ADMIN DASHBOARD CONTROLLER
  // =========================================================================
  const adminSubBtns = document.querySelectorAll('.admin-sub-btn');
  const adminSubPanes = document.querySelectorAll('.admin-sub-pane');
  const adminUsersTableBody = document.getElementById('adminUsersTableBody');
  const adminUpgradesTableBody = document.getElementById('adminUpgradesTableBody');
  const adminPendingBadge = document.getElementById('adminPendingBadge');
  const adminUserSearchInput = document.getElementById('adminUserSearchInput');
  const adminActivityLogsList = document.getElementById('adminActivityLogsList');
  const openAddUserModalBtn = document.getElementById('openAddUserModalBtn');
  const addUserModal = document.getElementById('addUserModal');
  const closeAddUserModalBtn = document.getElementById('closeAddUserModalBtn');
  const addUserForm = document.getElementById('addUserForm');
  const adminExportDbBtn = document.getElementById('adminExportDbBtn');

  // Pricing editor inputs
  const editProPrice = document.getElementById('editProPrice');
  const editProName = document.getElementById('editProName');
  const editProDesc = document.getElementById('editProDesc');
  const editProFeatures = document.getElementById('editProFeatures');
  const editVipPrice = document.getElementById('editVipPrice');
  const editVipName = document.getElementById('editVipName');
  const editVipDesc = document.getElementById('editVipDesc');
  const editVipFeatures = document.getElementById('editVipFeatures');
  const adminSavePricingBtn = document.getElementById('adminSavePricingBtn');

  // Feature flags inputs
  const flagAiAso = document.getElementById('flagAiAso');
  const flagIosSupport = document.getElementById('flagIosSupport');
  const flagUltraHdVideo = document.getElementById('flagUltraHdVideo');
  const flagPlayApiSync = document.getElementById('flagPlayApiSync');
  const flagStripePayments = document.getElementById('flagStripePayments');
  const flagMaintenanceMode = document.getElementById('flagMaintenanceMode');
  const adminSaveFeatureFlagsBtn = document.getElementById('adminSaveFeatureFlagsBtn');

  // Settings inputs
  const adminAnnouncementInput = document.getElementById('adminAnnouncementInput');
  const adminShowAnnouncementCheck = document.getElementById('adminShowAnnouncementCheck');
  const adminSaveSettingsBtn = document.getElementById('adminSaveSettingsBtn');
  const siteAnnouncementBanner = document.getElementById('siteAnnouncementBanner');
  const siteAnnouncementText = document.getElementById('siteAnnouncementText');

  // Admin Subtabs navigation
  adminSubBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.getAttribute('data-admintab');
      adminSubBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-black', 'font-bold');
        b.classList.add('bg-gray-800', 'text-gray-300');
      });
      btn.classList.add('bg-amber-500', 'text-black', 'font-bold');
      btn.classList.remove('bg-gray-800', 'text-gray-300');

      adminSubPanes.forEach(pane => {
        pane.classList.toggle('hidden', pane.id !== `admintab-${sub}`);
        pane.classList.toggle('active', pane.id === `admintab-${sub}`);
      });
    });
  });

  async function refreshAdminDashboard() {
    if (!window.AdminDashboard) return;

    // 1. KPIs
    const metrics = await AdminDashboard.getMetrics();
    const kpiTotal = document.getElementById('kpiTotalUsers');
    const kpiActive = document.getElementById('kpiActiveUsers');
    const kpiPro = document.getElementById('kpiProUsers');
    const kpiExports = document.getElementById('kpiTotalExports');
    if (kpiTotal) kpiTotal.innerText = metrics.totalUsers;
    if (kpiActive) kpiActive.innerText = metrics.activeUsers;
    if (kpiPro) kpiPro.innerText = metrics.proUsers;
    if (kpiExports) kpiExports.innerText = metrics.totalExports;
    if (adminPendingBadge) adminPendingBadge.innerText = metrics.pendingUpgradesCount;
    const sidebarAdminBadge = document.getElementById('sidebarAdminBadge');
    if (sidebarAdminBadge) sidebarAdminBadge.innerText = metrics.pendingUpgradesCount;

    // 2. Pending Upgrades Table
    await renderAdminUpgradesTable();

    // 3. Users Table (with pending section)
    await renderAdminUsersTable();

    // 4. Load Pricing into Editor
    loadPricingEditorData();

    // 5. Feature Flags
    const flags = await AdminDashboard.getFeatureFlags();
    if (flagAiAso) flagAiAso.checked = !!flags.aiAsoGenerator;
    if (flagIosSupport) flagIosSupport.checked = !!flags.iosAppStoreSupport;
    if (flagUltraHdVideo) flagUltraHdVideo.checked = !!flags.ultraHd4kVideo;
    if (flagPlayApiSync) flagPlayApiSync.checked = !!flags.googlePlayApiSync;
    if (flagStripePayments) flagStripePayments.checked = !!flags.stripePayments;
    if (flagMaintenanceMode) flagMaintenanceMode.checked = !!flags.maintenanceMode;

    // 6. Site Settings
    const settings = await AdminDashboard.getSiteSettings();
    if (adminAnnouncementInput) adminAnnouncementInput.value = settings.announcementMessage;
    if (adminShowAnnouncementCheck) adminShowAnnouncementCheck.checked = !!settings.showAnnouncement;
    if (siteAnnouncementBanner) siteAnnouncementBanner.classList.toggle('hidden', !settings.showAnnouncement);
    if (siteAnnouncementText) siteAnnouncementText.innerText = settings.announcementMessage;

    // 7. Activity Logs
    await renderAdminActivityLogs();

    // 8. AI Provider & Keys Config
    const aiConfig = await AdminDashboard.getAiConfig();
    if (aiConfig) {
      const providerRadio = document.querySelector(`input[name="activeAiProvider"][value="${aiConfig.activeProvider}"]`);
      if (providerRadio) providerRadio.checked = true;

      const keys = aiConfig.keys || {};
      const aiKeyGemini = document.getElementById('aiKeyGemini');
      const aiKeyGroq = document.getElementById('aiKeyGroq');
      const aiKeyOpenAi = document.getElementById('aiKeyOpenAi');
      const aiKeyClaude = document.getElementById('aiKeyClaude');
      const aiKeyDeepseek = document.getElementById('aiKeyDeepseek');
      const aiKeyKimi = document.getElementById('aiKeyKimi');
      const aiKeyManus = document.getElementById('aiKeyManus');

      if (aiKeyGemini) aiKeyGemini.value = keys.gemini || '';
      if (aiKeyGroq) aiKeyGroq.value = keys.groq || '';
      if (aiKeyOpenAi) aiKeyOpenAi.value = keys.openai || '';
      if (aiKeyClaude) aiKeyClaude.value = keys.claude || '';
      if (aiKeyDeepseek) aiKeyDeepseek.value = keys.deepseek || '';
      if (aiKeyKimi) aiKeyKimi.value = keys.kimi || '';
      if (aiKeyManus) aiKeyManus.value = keys.manus || '';
    }
  }

  // Save AI Config Handler
  const adminSaveAiConfigBtn = document.getElementById('adminSaveAiConfigBtn');
  if (adminSaveAiConfigBtn) {
    adminSaveAiConfigBtn.addEventListener('click', async () => {
      const activeRadio = document.querySelector('input[name="activeAiProvider"]:checked');
      const activeProvider = activeRadio ? activeRadio.value : 'gemini';

      const keys = {
        gemini: document.getElementById('aiKeyGemini')?.value || '',
        groq: document.getElementById('aiKeyGroq')?.value || '',
        openai: document.getElementById('aiKeyOpenAi')?.value || '',
        claude: document.getElementById('aiKeyClaude')?.value || '',
        deepseek: document.getElementById('aiKeyDeepseek')?.value || '',
        kimi: document.getElementById('aiKeyKimi')?.value || '',
        manus: document.getElementById('aiKeyManus')?.value || ''
      };

      const res = await AdminDashboard.saveAiConfig(activeProvider, keys);
      if (res.success) {
        showToast(`🤖 Fournisseur IA actif : ${activeProvider.toUpperCase()} enregistré !`);
        refreshAdminDashboard();
      } else {
        showToast(res.message || "Erreur lors de l'enregistrement.", "error");
      }
    });
  }

  async function renderAdminUpgradesTable() {
    if (!adminUpgradesTableBody) return;
    adminUpgradesTableBody.innerHTML = '';
    const allUpgrades = await AuthManager.getPendingUpgrades();
    const upgrades = allUpgrades.filter(u => u.status === 'pending');

    if (upgrades.length === 0) {
      adminUpgradesTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="py-6 text-center text-gray-500">
            Aucune demande d'activation en attente.
          </td>
        </tr>
      `;
      return;
    }

    upgrades.forEach(upg => {
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/5 transition';
      tr.innerHTML = `
        <td class="py-3 px-3">
          <div class="font-bold text-white">${upg.userName}</div>
          <div class="text-[10px] text-gray-400 font-mono">${upg.userEmail}</div>
        </td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${upg.requestedPlan === 'VIP' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'}">
            Plan ${upg.requestedPlan}
          </span>
        </td>
        <td class="py-3 px-3 font-bold text-emerald-400 font-mono">
          ${upg.price}$ / mois
        </td>
        <td class="py-3 px-3 text-[11px] text-gray-400 font-mono">
          ${new Date(upg.timestamp).toLocaleDateString()}
        </td>
        <td class="py-3 px-3 text-right">
          <button data-upgid="${upg.id}" class="admin-approve-upgrade-btn px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs shadow hover:scale-105 transition flex items-center gap-1 ml-auto">
            <i data-lucide="check" class="w-3.5 h-3.5"></i>
            <span>Activer le Premium</span>
          </button>
        </td>
      `;
      adminUpgradesTableBody.appendChild(tr);
    });

    document.querySelectorAll('.admin-approve-upgrade-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-upgid');
        const res = await AuthManager.approveUpgrade(id);
        if (res.success) {
          showToast(`✅ Accès Premium activé !`);
          refreshAdminDashboard();
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  async function renderAdminUsersTable(filter = '') {
    if (!adminUsersTableBody) return;
    adminUsersTableBody.innerHTML = '';

    const users = await AuthManager.getUsers();
    const query = filter.trim().toLowerCase();
    const allFiltered = query
      ? users.filter(u => (u.name || '').toLowerCase().includes(query) || (u.email || '').toLowerCase().includes(query))
      : users;

    // Separate pending and non-pending
    const pendingUsers = allFiltered.filter(u => u.status === 'pending');
    const activeUsers = allFiltered.filter(u => u.status !== 'pending');

    // Render pending users panel
    const pendingContainer = document.getElementById('pendingUsersContainer');
    const pendingCountEl = document.getElementById('pendingUsersCount');
    const pendingBadge = document.getElementById('adminPendingUsersBadge');
    if (pendingCountEl) pendingCountEl.textContent = pendingUsers.length;
    if (pendingBadge) {
      if (pendingUsers.length > 0) {
        pendingBadge.textContent = pendingUsers.length;
        pendingBadge.classList.remove('hidden');
      } else {
        pendingBadge.classList.add('hidden');
      }
    }

    if (pendingContainer) {
      if (pendingUsers.length === 0) {
        pendingContainer.innerHTML = `<p class="text-xs text-gray-500 py-2">Aucun compte en attente d'approbation.</p>`;
      } else {
        pendingContainer.innerHTML = '';
        pendingUsers.forEach(pu => {
          const card = document.createElement('div');
          card.className = 'flex items-center justify-between gap-4 bg-gray-900/60 border border-rose-500/20 rounded-xl p-3';
          card.innerHTML = `
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center font-bold text-[11px] text-black">${(pu.name || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <div class="font-bold text-white text-xs">${pu.name}</div>
                <div class="text-[10px] text-gray-400 font-mono">${pu.email} — Plan ${pu.plan}</div>
              </div>
            </div>
            <div class="flex gap-2 shrink-0">
              <button data-userid="${pu.id}" data-username="${pu.name}" class="admin-approve-user-btn px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-xs flex items-center gap-1 hover:scale-105 transition">
                <i data-lucide="check" class="w-3.5 h-3.5"></i>
                Approuver
              </button>
              <button data-userid="${pu.id}" data-username="${pu.email}" class="admin-manage-services-btn px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1 hover:bg-amber-500/30 transition">
                <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
                Gérer accès
              </button>
            </div>
          `;
          pendingContainer.appendChild(card);
        });
      }
    }

    // Render active users in main table
    activeUsers.forEach(u => {
      const statusColor = u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300';
      const statusDot = u.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400';
      const statusLabel = u.status === 'active' ? 'Actif' : (u.status === 'suspended' ? 'Suspendu' : u.status);
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-white/5 transition';
      tr.innerHTML = `
        <td class="py-3 px-3">
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-[11px] text-black shrink-0">
              ${u.name ? u.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div class="font-bold text-white">${u.name}</div>
              <div class="text-[10px] text-gray-400 font-mono">${u.email}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-3">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-gray-800 text-gray-300'}">
            ${(u.role || 'user').toUpperCase()}
          </span>
        </td>
        <td class="py-3 px-3">
          <span class="px-2 py-1 text-[11px] font-bold ${u.plan === 'PRO' || u.plan === 'VIP' || u.plan === 'Enterprise' ? 'text-amber-300' : 'text-gray-400'}">
            ${u.plan || 'Gratuit'}
          </span>
        </td>
        <td class="py-3 px-3">
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor}">
            <span class="w-1.5 h-1.5 rounded-full ${statusDot}"></span>
            ${statusLabel}
          </span>
        </td>
        <td class="py-3 px-3 text-[11px] text-gray-400 font-mono">
          ${u.createdAt ? u.createdAt.split('T')[0] : '-'}
        </td>
        <td class="py-3 px-3 text-right">
          <div class="flex items-center justify-end gap-1.5">
            <button data-userid="${u.id}" data-username="${u.email}" class="admin-manage-services-btn p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition" title="Gérer les accès services">
              <i data-lucide="sliders" class="w-3.5 h-3.5"></i>
            </button>
            <button data-userid="${u.id}" class="admin-toggle-status-btn p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 ${u.status === 'active' ? 'text-rose-400' : 'text-emerald-400'} transition" title="${u.status === 'active' ? 'Suspendre' : 'Réactiver'}">
              <i data-lucide="${u.status === 'active' ? 'ban' : 'check'}" class="w-3.5 h-3.5"></i>
            </button>
            <button data-userid="${u.id}" class="admin-delete-user-btn p-1.5 rounded-lg bg-gray-800 hover:bg-rose-900/50 text-gray-400 hover:text-rose-300 transition" title="Supprimer">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </td>
      `;
      adminUsersTableBody.appendChild(tr);
    });

    if (activeUsers.length === 0) {
      adminUsersTableBody.innerHTML = `
        <tr><td colspan="6" class="py-6 text-center text-gray-500">Aucun utilisateur actif trouvé.</td></tr>
      `;
    }

    // Attach: Approve user
    document.querySelectorAll('.admin-approve-user-btn').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-userid');
        const name = b.getAttribute('data-username');
        const res = await AuthManager.approveUser(id);
        if (res.success) {
          showToast(`✅ ${name} approuvé ! Son compte est maintenant actif.`);
          refreshAdminDashboard();
        } else {
          showToast(res.message, 'error');
        }
      });
    });

    // Attach: Manage service access
    document.querySelectorAll('.admin-manage-services-btn').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-userid');
        const name = b.getAttribute('data-username');
        openServiceAccessModal(id, name);
      });
    });

    // Attach: Toggle status
    document.querySelectorAll('.admin-toggle-status-btn').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-userid');
        const res = await AdminDashboard.toggleUserStatus(id);
        if (res.success) {
          showToast(`Statut utilisateur : ${res.status}`);
          refreshAdminDashboard();
        }
      });
    });

    // Attach: Delete user
    document.querySelectorAll('.admin-delete-user-btn').forEach(b => {
      b.addEventListener('click', async () => {
        const id = b.getAttribute('data-userid');
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
          const res = await AdminDashboard.deleteUser(id);
          if (res.success) {
            showToast('Utilisateur supprimé.');
            refreshAdminDashboard();
          } else {
            showToast(res.message, 'error');
          }
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  }

  // =========================================================================
  // SERVICE ACCESS MODAL LOGIC
  // =========================================================================
  const serviceAccessModal = document.getElementById('serviceAccessModal');
  const closeServiceModalBtn = document.getElementById('closeServiceModalBtn');
  const cancelServiceModalBtn = document.getElementById('cancelServiceModalBtn');
  const saveServiceAccessBtn = document.getElementById('saveServiceAccessBtn');
  const serviceTogglesList = document.getElementById('serviceTogglesList');
  const serviceModalUserLabel = document.getElementById('serviceModalUserLabel');

  const SERVICE_DEFINITIONS = [
    { key: 'graphics', label: '🎨 Studio Graphique', desc: 'Icône, Feature Graphic & Screenshots' },
    { key: 'video', label: '🎥 Vidéo Promo HD', desc: 'Générateur vidéo promotionnelle 1080p' },
    { key: 'aso', label: '✍️ Textes & ASO', desc: 'Métadonnées trilingues Google Play' },
    { key: 'privacy', label: '🔒 Confidentialité RGPD', desc: 'Politique de confidentialité légale' },
    { key: 'checklist', label: '📊 Checklist Testeurs', desc: 'Gestion de 20 testeurs alpha/beta' },
    { key: 'resizer', label: '📐 Redimensionneur Assets', desc: 'Générateur multi-formats Expo/Android' },
    { key: 'export', label: '📦 Pack Global .ZIP', desc: 'Export complet de tous les assets' },
  ];

  let _serviceModalUserId = null;
  let _serviceModalCurrentAccess = {};

  async function openServiceAccessModal(userId, userLabel) {
    _serviceModalUserId = userId;
    if (serviceModalUserLabel) serviceModalUserLabel.textContent = userLabel;
    const services = await AuthManager.getUserServices(userId);
    _serviceModalCurrentAccess = { ...services };

    if (serviceTogglesList) {
      serviceTogglesList.innerHTML = '';
      SERVICE_DEFINITIONS.forEach(({ key, label, desc }) => {
        const enabled = !!services[key];
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-800/60 border border-white/5';
        row.innerHTML = `
          <div>
            <p class="font-bold text-xs text-white">${label}</p>
            <p class="text-[10px] text-gray-400">${desc}</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" data-svckey="${key}" class="sr-only peer" ${enabled ? 'checked' : ''}>
            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        `;
        serviceTogglesList.appendChild(row);
      });
    }

    if (serviceAccessModal) { serviceAccessModal.classList.remove('hidden'); serviceAccessModal.classList.add('flex'); }
    if (window.lucide) lucide.createIcons();
  }

  function closeServiceModal() {
    if (serviceAccessModal) { serviceAccessModal.classList.add('hidden'); serviceAccessModal.classList.remove('flex'); }
    _serviceModalUserId = null;
  }

  if (closeServiceModalBtn) closeServiceModalBtn.addEventListener('click', closeServiceModal);
  if (cancelServiceModalBtn) cancelServiceModalBtn.addEventListener('click', closeServiceModal);

  if (saveServiceAccessBtn) {
    saveServiceAccessBtn.addEventListener('click', async () => {
      if (!_serviceModalUserId) return;
      const checkboxes = serviceTogglesList?.querySelectorAll('input[type="checkbox"]');
      const updatedServices = {};
      checkboxes?.forEach(cb => {
        updatedServices[cb.getAttribute('data-svckey')] = cb.checked;
      });
      const res = await AuthManager.updateUserServices(_serviceModalUserId, updatedServices);
      if (res.success) {
        showToast('✅ Accès aux services mis à jour !');
        closeServiceModal();
        refreshAdminDashboard();
      } else {
        showToast(res.message || 'Erreur lors de la mise à jour.', 'error');
      }
    });
  }

  if (adminUserSearchInput) {
    adminUserSearchInput.addEventListener('input', (e) => {
      renderAdminUsersTable(e.target.value);
    });
  }

  function loadPricingEditorData() {
    if (!window.PricingManager) return;
    const plans = PricingManager.getPlans();
    if (editProPrice) editProPrice.value = plans.pro.price;
    if (editProName) editProName.value = plans.pro.name;
    if (editProDesc) editProDesc.value = plans.pro.description;
    if (editProFeatures) editProFeatures.value = plans.pro.features.join('\n');

    if (editVipPrice) editVipPrice.value = plans.vip.price;
    if (editVipName) editVipName.value = plans.vip.name;
    if (editVipDesc) editVipDesc.value = plans.vip.description;
    if (editVipFeatures) editVipFeatures.value = plans.vip.features.join('\n');
  }

  if (adminSavePricingBtn) {
    adminSavePricingBtn.addEventListener('click', async () => {
      const proFeats = editProFeatures.value.split('\n').map(s => s.trim()).filter(Boolean);
      const vipFeats = editVipFeatures.value.split('\n').map(s => s.trim()).filter(Boolean);

      const proPrice = parseFloat(editProPrice.value) || 0;
      const vipPrice = parseFloat(editVipPrice.value) || 0;

      PricingManager.updatePlan('pro', proPrice, editProName.value, editProDesc.value, proFeats);
      PricingManager.updatePlan('vip', vipPrice, editVipName.value, editVipDesc.value, vipFeats);

      // Re-render landing pricing cards with new prices
      renderLandingPricingCards();

      // Update upgrade modal price badges
      const pBadge = document.getElementById('upgradeProPriceBadge');
      const vBadge = document.getElementById('upgradeVipPriceBadge');
      if (pBadge) pBadge.innerText = `${proPrice}$ / mois`;
      if (vBadge) vBadge.innerText = `${vipPrice}$ / mois`;

      // Update admin user management dropdowns that show plan prices
      document.querySelectorAll('option[value="PRO"]').forEach(opt => {
        if (opt.closest('select')) opt.text = opt.text.replace(/\d+\$\/mois/, `${proPrice}$/mois`);
      });
      document.querySelectorAll('option[value="VIP"]').forEach(opt => {
        if (opt.closest('select')) opt.text = opt.text.replace(/\d+\$\/mois/, `${vipPrice}$/mois`);
      });

      showToast(`💰 Tarifs mis à jour : PRO ${proPrice}$/mois — VIP ${vipPrice}$/mois !`);
    });
  }

  // Save Feature Flags
  if (adminSaveFeatureFlagsBtn) {
    adminSaveFeatureFlagsBtn.addEventListener('click', async () => {
      const flags = {
        aiAsoGenerator: flagAiAso.checked,
        iosAppStoreSupport: flagIosSupport.checked,
        ultraHd4kVideo: flagUltraHdVideo.checked,
        googlePlayApiSync: flagPlayApiSync.checked,
        stripePayments: flagStripePayments.checked,
        maintenanceMode: flagMaintenanceMode.checked
      };
      await AdminDashboard.saveFeatureFlags(flags);
      showToast("🚀 Préférences des fonctionnalités enregistrées !");
    });
  }

  // Save Site Settings
  if (adminSaveSettingsBtn) {
    adminSaveSettingsBtn.addEventListener('click', async () => {
      const settings = {
        siteName: "Google Play Launch Studio",
        announcementMessage: adminAnnouncementInput.value,
        showAnnouncement: adminShowAnnouncementCheck.checked,
        supportEmail: "support@launchstudio.com"
      };
      await AdminDashboard.saveSiteSettings(settings);
      if (siteAnnouncementBanner) siteAnnouncementBanner.classList.toggle('hidden', !settings.showAnnouncement);
      if (siteAnnouncementText) siteAnnouncementText.innerText = settings.announcementMessage;
      showToast("📢 Paramètres et bannière mis à jour !");
    });
  }

  // Activity Logs
  async function renderAdminActivityLogs() {
    if (!adminActivityLogsList) return;
    adminActivityLogsList.innerHTML = '';
    const logs = await AuthManager.getActivityLogs();

    logs.slice(0, 30).forEach(log => {
      const item = document.createElement('div');
      item.className = 'glass-panel p-3 rounded-xl flex items-center justify-between text-xs border border-white/5';
      item.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          <div>
            <span class="font-bold text-white">${log.user} :</span>
            <span class="text-gray-300 ml-1">${log.text}</span>
          </div>
        </div>
        <span class="text-[10px] text-gray-500 font-mono">${new Date(log.timestamp).toLocaleTimeString()}</span>
      `;
      adminActivityLogsList.appendChild(item);
    });
  }

  // Add User Modal
  if (openAddUserModalBtn) openAddUserModalBtn.addEventListener('click', () => addUserModal.classList.remove('hidden'));
  if (closeAddUserModalBtn) closeAddUserModalBtn.addEventListener('click', () => addUserModal.classList.add('hidden'));

  if (addUserForm) {
    addUserForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('newUserName').value;
      const email = document.getElementById('newUserEmail').value;
      const password = document.getElementById('newUserPassword').value;
      const role = document.getElementById('newUserRole').value;
      const plan = document.getElementById('newUserPlan').value;

      const res = AdminDashboard.addUser(name, email, password, role, plan);
      if (res.success) {
        showToast(`✅ Utilisateur ${name} créé avec succès !`);
        addUserModal.classList.add('hidden');
        addUserForm.reset();
        refreshAdminDashboard();
      } else {
        showToast(res.message, "error");
      }
    });
  }

  // Export JSON Database
  if (adminExportDbBtn) {
    adminExportDbBtn.addEventListener('click', () => {
      AdminDashboard.exportDatabaseJson();
      showToast("💾 Sauvegarde de la base JSON téléchargée !");
    });
  }

  // =========================================================================
  // ASSET RESIZER CONTROLLER & LIVE CANVAS RENDERING
  // =========================================================================
  const canvasAndroidBg = document.getElementById('canvasAndroidBg');
  const canvasAndroidFg = document.getElementById('canvasAndroidFg');
  const canvasAndroidMono = document.getElementById('canvasAndroidMono');
  const canvasUniversalIcon = document.getElementById('canvasUniversalIcon');
  const canvasSplashIcon = document.getElementById('canvasSplashIcon');
  const canvasFavicon = document.getElementById('canvasFavicon');
  const canvasFaviconReal = document.getElementById('canvasFaviconReal');

  function renderAllAssetCanvases() {
    if (typeof AssetResizerEngine === 'undefined') return;

    if (canvasAndroidBg) {
      AssetResizerEngine.renderAndroidBackground(canvasAndroidBg, AppState.assetConfig);
    }
    if (canvasAndroidFg) {
      AssetResizerEngine.renderAndroidForeground(canvasAndroidFg, AppState.assetConfig, AppState.assetConfig.showSafeZoneGuide);
    }
    if (canvasAndroidMono) {
      AssetResizerEngine.renderAndroidMonochrome(canvasAndroidMono, AppState.assetConfig, true);
    }
    if (canvasUniversalIcon) {
      AssetResizerEngine.renderUniversalIcon(canvasUniversalIcon, AppState.assetConfig, AppState.assetConfig.icon.previewMask);
    }
    if (canvasSplashIcon) {
      AssetResizerEngine.renderSplashIcon(canvasSplashIcon, AppState.assetConfig, AppState.assetConfig.splash.showSafeZone);
    }
    if (canvasFavicon) {
      AssetResizerEngine.renderFavicon(canvasFavicon, AppState.assetConfig);
      if (canvasFaviconReal) {
        const rCtx = canvasFaviconReal.getContext('2d');
        rCtx.imageSmoothingEnabled = false;
        rCtx.clearRect(0, 0, 48, 48);
        rCtx.drawImage(canvasFavicon, 0, 0, 48, 48);
      }
    }
  }

  // 1. Image Source Upload
  const resizerMainImageUpload = document.getElementById('resizerMainImageUpload');
  if (resizerMainImageUpload) {
    resizerMainImageUpload.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const img = await AssetResizerEngine.loadImageFromFile(file);
        AppState.assetConfig.sourceImage = img;
        AppState.assetConfig.sourceFileName = file.name;
        
        // Also set custom resizer image
        AppState.assetConfig.customResizer.image = img;

        const badge = document.getElementById('resizerSourceBadge');
        if (badge) badge.textContent = `${file.name.slice(0, 16)} (${img.width}×${img.height})`;

        renderAllAssetCanvases();
        showToast("✨ Logo importé ! Tous les assets ont été régénérés.");
      } catch (err) {
        console.error(err);
        showToast("Erreur lors de la lecture de l'image.", "error");
      }
    });
  }

  // 2. Import From Studio Button (Transfer from 512x512 icon generator)
  const resizerImportFromStudioBtn = document.getElementById('resizerImportFromStudioBtn');
  const resizerCopyFromStudioLink = document.getElementById('resizerCopyFromStudioLink');

  async function importFromIconStudio() {
    if (!iconCanvas) {
      showToast("Studio d'icône non disponible.", "error");
      return;
    }

    try {
      const dataUrl = iconCanvas.toDataURL('image/png');
      const img = await AssetResizerEngine.loadImageFromUrl(dataUrl);
      
      AppState.assetConfig.sourceImage = img;
      AppState.assetConfig.sourceFileName = "studio-icon-512x512.png";
      
      // Copy background settings from Studio icon config
      if (AppState.iconConfig.bg) {
        AppState.assetConfig.bg.type = AppState.iconConfig.bg.type || 'gradient';
        AppState.assetConfig.bg.color1 = AppState.iconConfig.bg.color1 || '#00F0FF';
        AppState.assetConfig.bg.color2 = AppState.iconConfig.bg.color2 || '#3B82F6';
        AppState.assetConfig.bg.angle = AppState.iconConfig.bg.angle || 135;

        // Sync inputs
        const bgC1 = document.getElementById('resizerBgColor1');
        const bgC2 = document.getElementById('resizerBgColor2');
        if (bgC1) bgC1.value = AppState.assetConfig.bg.color1;
        if (bgC2) bgC2.value = AppState.assetConfig.bg.color2;
      }

      const badge = document.getElementById('resizerSourceBadge');
      if (badge) badge.textContent = "Studio 512x512";

      switchTab('resizer');
      renderAllAssetCanvases();
      showToast("🚀 Icône du Studio importée avec succès dans le redimensionneur !");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de l'import depuis le Studio.", "error");
    }
  }

  if (resizerImportFromStudioBtn) resizerImportFromStudioBtn.addEventListener('click', importFromIconStudio);
  if (resizerCopyFromStudioLink) resizerCopyFromStudioLink.addEventListener('click', importFromIconStudio);

  // 3. Resizer Subtabs Navigation
  const resizerSubtabBtns = document.querySelectorAll('.resizer-subtab-btn');
  const resizerSubtabPanes = document.querySelectorAll('.resizer-subtab-pane');

  resizerSubtabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.getAttribute('data-resizertab');
      resizerSubtabBtns.forEach(b => {
        b.classList.remove('active', 'bg-purple-500', 'text-white', 'font-bold');
        b.classList.add('text-gray-400');
      });
      btn.classList.add('active', 'bg-purple-500', 'text-white', 'font-bold');
      btn.classList.remove('text-gray-400');

      resizerSubtabPanes.forEach(pane => {
        pane.classList.add('hidden');
        if (pane.id === `resizer-subtab-${subId}`) {
          pane.classList.remove('hidden');
        }
      });
    });
  });

  // 4. Background Settings Binds
  const resizerBgTypeBtns = document.querySelectorAll('.resizer-bgtype-btn');
  const resizerBgPaletteGroup = document.getElementById('resizerBgPaletteGroup');
  const resizerCustomBgUploadGroup = document.getElementById('resizerCustomBgUploadGroup');
  const resizerBgColor2Wrapper = document.getElementById('resizerBgColor2Wrapper');

  resizerBgTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-bgtype');
      AppState.assetConfig.bg.type = type;

      resizerBgTypeBtns.forEach(b => {
        b.classList.remove('active', 'bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40', 'font-bold');
        b.classList.add('bg-gray-800', 'text-gray-400');
      });
      btn.classList.add('active', 'bg-cyan-500/20', 'text-cyan-300', 'border-cyan-500/40', 'font-bold');
      btn.classList.remove('bg-gray-800', 'text-gray-400');

      if (type === 'image') {
        if (resizerBgPaletteGroup) resizerBgPaletteGroup.classList.add('hidden');
        if (resizerCustomBgUploadGroup) resizerCustomBgUploadGroup.classList.remove('hidden');
      } else if (type === 'solid') {
        if (resizerBgPaletteGroup) resizerBgPaletteGroup.classList.remove('hidden');
        if (resizerBgColor2Wrapper) resizerBgColor2Wrapper.classList.add('hidden');
        if (resizerCustomBgUploadGroup) resizerCustomBgUploadGroup.classList.add('hidden');
      } else if (type === 'transparent') {
        if (resizerBgPaletteGroup) resizerBgPaletteGroup.classList.add('hidden');
        if (resizerCustomBgUploadGroup) resizerCustomBgUploadGroup.classList.add('hidden');
      } else {
        // gradient
        if (resizerBgPaletteGroup) resizerBgPaletteGroup.classList.remove('hidden');
        if (resizerBgColor2Wrapper) resizerBgColor2Wrapper.classList.remove('hidden');
        if (resizerCustomBgUploadGroup) resizerCustomBgUploadGroup.classList.add('hidden');
      }

      renderAllAssetCanvases();
    });
  });

  // Palette Presets
  const resizerPresetColors = document.querySelectorAll('.resizer-preset-color');
  resizerPresetColors.forEach(btn => {
    btn.addEventListener('click', () => {
      const c1 = btn.getAttribute('data-c1');
      const c2 = btn.getAttribute('data-c2');
      AppState.assetConfig.bg.color1 = c1;
      AppState.assetConfig.bg.color2 = c2;
      document.getElementById('resizerBgColor1').value = c1;
      document.getElementById('resizerBgColor2').value = c2;
      renderAllAssetCanvases();
    });
  });

  const resizerBgColor1 = document.getElementById('resizerBgColor1');
  const resizerBgColor2 = document.getElementById('resizerBgColor2');
  if (resizerBgColor1) {
    resizerBgColor1.addEventListener('input', (e) => {
      AppState.assetConfig.bg.color1 = e.target.value;
      renderAllAssetCanvases();
    });
  }
  if (resizerBgColor2) {
    resizerBgColor2.addEventListener('input', (e) => {
      AppState.assetConfig.bg.color2 = e.target.value;
      renderAllAssetCanvases();
    });
  }

  // Custom Bg File
  const resizerCustomBgFile = document.getElementById('resizerCustomBgFile');
  if (resizerCustomBgFile) {
    resizerCustomBgFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const img = await AssetResizerEngine.loadImageFromFile(file);
        AppState.assetConfig.customBgImage = img;
        renderAllAssetCanvases();
      } catch (err) {
        console.error(err);
      }
    });
  }

  // 5. Foreground Controls
  const resizerFgScale = document.getElementById('resizerFgScale');
  const resizerFgScaleLabel = document.getElementById('resizerFgScaleLabel');
  if (resizerFgScale) {
    resizerFgScale.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      AppState.assetConfig.fg.scale = val;
      if (resizerFgScaleLabel) resizerFgScaleLabel.textContent = `${Math.round(val * 100)}%`;
      renderAllAssetCanvases();
    });
  }

  const resizerSafeZoneToggle = document.getElementById('resizerSafeZoneToggle');
  if (resizerSafeZoneToggle) {
    resizerSafeZoneToggle.addEventListener('change', (e) => {
      AppState.assetConfig.showSafeZoneGuide = e.target.checked;
      renderAllAssetCanvases();
    });
  }

  // 6. Monochrome Controls
  const resizerMonoMode = document.getElementById('resizerMonoMode');
  const resizerMonoThresholdGroup = document.getElementById('resizerMonoThresholdGroup');
  const resizerMonoThreshold = document.getElementById('resizerMonoThreshold');
  const resizerMonoThresholdLabel = document.getElementById('resizerMonoThresholdLabel');
  const resizerMonoInvert = document.getElementById('resizerMonoInvert');

  if (resizerMonoMode) {
    resizerMonoMode.addEventListener('change', (e) => {
      AppState.assetConfig.monochrome.mode = e.target.value;
      if (resizerMonoThresholdGroup) {
        if (e.target.value === 'threshold') {
          resizerMonoThresholdGroup.classList.remove('hidden');
        } else {
          resizerMonoThresholdGroup.classList.add('hidden');
        }
      }
      renderAllAssetCanvases();
    });
  }

  if (resizerMonoThreshold) {
    resizerMonoThreshold.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      AppState.assetConfig.monochrome.threshold = val;
      if (resizerMonoThresholdLabel) resizerMonoThresholdLabel.textContent = val;
      renderAllAssetCanvases();
    });
  }

  if (resizerMonoInvert) {
    resizerMonoInvert.addEventListener('change', (e) => {
      AppState.assetConfig.monochrome.invert = e.target.checked;
      renderAllAssetCanvases();
    });
  }

  // 7. Splash Controls
  const resizerSplashBgColor = document.getElementById('resizerSplashBgColor');
  const resizerSplashBgColorText = document.getElementById('resizerSplashBgColorText');
  const resizerSplashScale = document.getElementById('resizerSplashScale');
  const resizerSplashScaleLabel = document.getElementById('resizerSplashScaleLabel');
  const resizerSplashGuideToggle = document.getElementById('resizerSplashGuideToggle');

  if (resizerSplashBgColor) {
    resizerSplashBgColor.addEventListener('input', (e) => {
      AppState.assetConfig.splash.bgColor = e.target.value;
      if (resizerSplashBgColorText) resizerSplashBgColorText.value = e.target.value;
      renderAllAssetCanvases();
    });
  }

  if (resizerSplashBgColorText) {
    resizerSplashBgColorText.addEventListener('input', (e) => {
      AppState.assetConfig.splash.bgColor = e.target.value;
      if (resizerSplashBgColor) resizerSplashBgColor.value = e.target.value;
      renderAllAssetCanvases();
    });
  }

  if (resizerSplashScale) {
    resizerSplashScale.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      AppState.assetConfig.splash.logoScale = val;
      if (resizerSplashScaleLabel) resizerSplashScaleLabel.textContent = `${Math.round(val * 100)}%`;
      renderAllAssetCanvases();
    });
  }

  if (resizerSplashGuideToggle) {
    resizerSplashGuideToggle.addEventListener('change', (e) => {
      AppState.assetConfig.splash.showSafeZone = e.target.checked;
      renderAllAssetCanvases();
    });
  }

  // 8. Icon Preview Mask Controls
  const resizerIconMaskBtns = document.querySelectorAll('.resizer-iconmask-btn');
  resizerIconMaskBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const mask = btn.getAttribute('data-iconmask');
      AppState.assetConfig.icon.previewMask = mask;

      resizerIconMaskBtns.forEach(b => {
        b.classList.remove('active', 'bg-blue-500/20', 'text-blue-300', 'border-blue-500/40', 'font-bold');
        b.classList.add('bg-gray-800', 'text-gray-400');
      });
      btn.classList.add('active', 'bg-blue-500/20', 'text-blue-300', 'border-blue-500/40', 'font-bold');
      btn.classList.remove('bg-gray-800', 'text-gray-400');

      renderAllAssetCanvases();
    });
  });

  // 9. Custom Resizer Controls
  const resizerCustomWidth = document.getElementById('resizerCustomWidth');
  const resizerCustomHeight = document.getElementById('resizerCustomHeight');
  const resizerCustomLockAspect = document.getElementById('resizerCustomLockAspect');
  const resizerCustomInputFile = document.getElementById('resizerCustomInputFile');
  const resizerCustomMode = document.getElementById('resizerCustomMode');
  const resizerCustomFormat = document.getElementById('resizerCustomFormat');
  const resizerDownloadCustomBtn = document.getElementById('resizerDownloadCustomBtn');

  if (resizerCustomInputFile) {
    resizerCustomInputFile.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const img = await AssetResizerEngine.loadImageFromFile(file);
        AppState.assetConfig.customResizer.image = img;
        AppState.assetConfig.customResizer.aspectRatio = img.width / img.height;
        if (resizerCustomWidth) resizerCustomWidth.value = img.width;
        if (resizerCustomHeight) resizerCustomHeight.value = img.height;
        AppState.assetConfig.customResizer.width = img.width;
        AppState.assetConfig.customResizer.height = img.height;
        showToast(`Image chargée (${img.width}×${img.height} px)`);
      } catch (err) {
        console.error(err);
      }
    });
  }

  if (resizerCustomWidth) {
    resizerCustomWidth.addEventListener('input', (e) => {
      const w = parseInt(e.target.value, 10) || 1024;
      AppState.assetConfig.customResizer.width = w;
      if (resizerCustomLockAspect && resizerCustomLockAspect.checked && resizerCustomHeight) {
        const ratio = AppState.assetConfig.customResizer.aspectRatio || 1;
        const newH = Math.round(w / ratio);
        resizerCustomHeight.value = newH;
        AppState.assetConfig.customResizer.height = newH;
      }
    });
  }

  if (resizerCustomHeight) {
    resizerCustomHeight.addEventListener('input', (e) => {
      const h = parseInt(e.target.value, 10) || 1024;
      AppState.assetConfig.customResizer.height = h;
      if (resizerCustomLockAspect && resizerCustomLockAspect.checked && resizerCustomWidth) {
        const ratio = AppState.assetConfig.customResizer.aspectRatio || 1;
        const newW = Math.round(h * ratio);
        resizerCustomWidth.value = newW;
        AppState.assetConfig.customResizer.width = newW;
      }
    });
  }

  // Preset Buttons for Custom Resizer
  const resizerPresetBtns = document.querySelectorAll('.resizer-preset-btn');
  resizerPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const w = parseInt(btn.getAttribute('data-w'), 10);
      const h = parseInt(btn.getAttribute('data-h'), 10);
      if (resizerCustomWidth) resizerCustomWidth.value = w;
      if (resizerCustomHeight) resizerCustomHeight.value = h;
      AppState.assetConfig.customResizer.width = w;
      AppState.assetConfig.customResizer.height = h;
      AppState.assetConfig.customResizer.aspectRatio = w / h;
    });
  });

  // 10. Direct Download Handlers for Each of the 6 Assets
  const downloadAndroidBgBtn = document.getElementById('downloadAndroidBgBtn');
  if (downloadAndroidBgBtn) {
    downloadAndroidBgBtn.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      AssetResizerEngine.renderAndroidBackground(tempCanvas, AppState.assetConfig);
      Exporter.downloadCanvas(tempCanvas, "android-icon-background.png");
      AdminDashboard.incrementExportCount();
      showToast("📥 android-icon-background.png téléchargé (1024x1024) !");
    });
  }

  const downloadAndroidFgBtn = document.getElementById('downloadAndroidFgBtn');
  if (downloadAndroidFgBtn) {
    downloadAndroidFgBtn.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      // Export clean foreground without guides
      AssetResizerEngine.renderAndroidForeground(tempCanvas, AppState.assetConfig, false);
      Exporter.downloadCanvas(tempCanvas, "android-icon-foreground.png");
      AdminDashboard.incrementExportCount();
      showToast("📥 android-icon-foreground.png téléchargé (1024x1024) !");
    });
  }

  const downloadAndroidMonoBtn = document.getElementById('downloadAndroidMonoBtn');
  if (downloadAndroidMonoBtn) {
    downloadAndroidMonoBtn.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      // Export clean monochrome
      AssetResizerEngine.renderAndroidMonochrome(tempCanvas, AppState.assetConfig, false);
      Exporter.downloadCanvas(tempCanvas, "android-icon-monochrome.png");
      AdminDashboard.incrementExportCount();
      showToast("📥 android-icon-monochrome.png téléchargé (1024x1024) !");
    });
  }

  const downloadUniversalIconBtn = document.getElementById('downloadUniversalIconBtn');
  if (downloadUniversalIconBtn) {
    downloadUniversalIconBtn.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      // Universal icon exported clean square (1024x1024)
      AssetResizerEngine.renderUniversalIcon(tempCanvas, AppState.assetConfig, null);
      Exporter.downloadCanvas(tempCanvas, "icon.png");
      AdminDashboard.incrementExportCount();
      showToast("📥 icon.png téléchargé (1024x1024) !");
    });
  }

  const downloadSplashIconBtn = document.getElementById('downloadSplashIconBtn');
  if (downloadSplashIconBtn) {
    downloadSplashIconBtn.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      // Splash exported clean without guides
      AssetResizerEngine.renderSplashIcon(tempCanvas, AppState.assetConfig, false);
      Exporter.downloadCanvas(tempCanvas, "splash-icon.png");
      AdminDashboard.incrementExportCount();
      showToast("📥 splash-icon.png téléchargé (2048x2048) !");
    });
  }

  const downloadFaviconBtn = document.getElementById('downloadFaviconBtn');
  if (downloadFaviconBtn) {
    downloadFaviconBtn.addEventListener('click', () => {
      const tempCanvas = document.createElement('canvas');
      AssetResizerEngine.renderFavicon(tempCanvas, AppState.assetConfig);
      Exporter.downloadCanvas(tempCanvas, "favicon.png");
      AdminDashboard.incrementExportCount();
      showToast("📥 favicon.png téléchargé (48x48) !");
    });
  }

  // Custom Resize Download
  if (resizerDownloadCustomBtn) {
    resizerDownloadCustomBtn.addEventListener('click', () => {
      const img = AppState.assetConfig.customResizer.image || AppState.assetConfig.sourceImage;
      const w = parseInt(resizerCustomWidth?.value, 10) || 1024;
      const h = parseInt(resizerCustomHeight?.value, 10) || 1024;
      const mode = resizerCustomMode?.value || 'contain';
      const format = resizerCustomFormat?.value || 'image/png';
      const ext = format === 'image/jpeg' ? 'jpg' : (format === 'image/webp' ? 'webp' : 'png');

      const tempCanvas = document.createElement('canvas');
      AssetResizerEngine.renderCustomResize(tempCanvas, {
        image: img,
        width: w,
        height: h,
        mode: mode,
        bgColor: '#000000'
      });

      tempCanvas.toBlob((blob) => {
        if (!blob) return;
        const filename = `resized-${w}x${h}.${ext}`;
        if (window.saveAs) {
          saveAs(blob, filename);
        } else {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);
        }
        AdminDashboard.incrementExportCount();
        showToast(`📥 Image redimensionnée ${w}×${h} téléchargée !`);
      }, format, 0.95);
    });
  }

  // Master ZIP Exports for Resizer
  const resizerDownloadAllZipBtn = document.getElementById('resizerDownloadAllZipBtn');
  const resizerDownloadMasterZipBtn = document.getElementById('resizerDownloadMasterZipBtn');

  async function handleDownloadAppAssetsZip() {
    showToast("📦 Génération du pack complet d'assets mobile en cours...");
    try {
      await Exporter.exportAppAssetsZip(AppState.assetConfig);
      AdminDashboard.incrementExportCount();
      showToast("✅ Pack App_Icons_And_Assets_Pack.zip généré et téléchargé !");
    } catch (err) {
      console.error(err);
      showToast("Erreur lors de la génération du ZIP.", "error");
    }
  }

  if (resizerDownloadAllZipBtn) resizerDownloadAllZipBtn.addEventListener('click', handleDownloadAppAssetsZip);
  if (resizerDownloadMasterZipBtn) resizerDownloadMasterZipBtn.addEventListener('click', handleDownloadAppAssetsZip);

  // =========================================================================
  // ATTACH DOWNLOAD PERMISSIONS INTERCEPTORS
  // =========================================================================
  const originalDownloadIcon = downloadIconBtn?.onclick;
  if (downloadIconBtn) {
    downloadIconBtn.addEventListener('click', (e) => {
      if (!checkDownloadPermissionOrPrompt()) {
        e.stopImmediatePropagation();
      }
    }, true);
  }

  if (downloadFeatureBtn) {
    downloadFeatureBtn.addEventListener('click', (e) => {
      if (!checkDownloadPermissionOrPrompt()) {
        e.stopImmediatePropagation();
      }
    }, true);
  }

  if (downloadSingleScreenBtn) {
    downloadSingleScreenBtn.addEventListener('click', (e) => {
      if (!checkDownloadPermissionOrPrompt()) {
        e.stopImmediatePropagation();
      }
    }, true);
  }

  if (downloadScreenshotsZipBtn) {
    downloadScreenshotsZipBtn.addEventListener('click', (e) => {
      if (!checkDownloadPermissionOrPrompt()) {
        e.stopImmediatePropagation();
      }
    }, true);
  }

  if (exportVideoBtn) {
    exportVideoBtn.addEventListener('click', (e) => {
      if (!checkDownloadPermissionOrPrompt()) {
        e.stopImmediatePropagation();
      }
    }, true);
  }

  if (masterExportBtn) {
    masterExportBtn.addEventListener('click', (e) => {
      if (!checkDownloadPermissionOrPrompt()) {
        e.stopImmediatePropagation();
      }
    }, true);
  }

  if (masterExportHeaderBtn) {
    masterExportHeaderBtn.addEventListener('click', (e) => {
      if (!checkDownloadPermissionOrPrompt()) {
        e.stopImmediatePropagation();
      }
    }, true);
  }

  // Intercept Asset Resizer Downloads with same VIP/PRO permission system
  const resizerDownloadButtons = [
    downloadAndroidBgBtn,
    downloadAndroidFgBtn,
    downloadAndroidMonoBtn,
    downloadUniversalIconBtn,
    downloadSplashIconBtn,
    downloadFaviconBtn,
    resizerDownloadCustomBtn,
    resizerDownloadAllZipBtn,
    resizerDownloadMasterZipBtn
  ];

  resizerDownloadButtons.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        if (!checkDownloadPermissionOrPrompt()) {
          e.stopImmediatePropagation();
        }
      }, true);
    }
  });

  // =========================================================================
  // PROJECT RESET / NEW APPLICATION SESSION CONTROLLER
  // =========================================================================
  const headerResetProjectBtn = document.getElementById('headerResetProjectBtn');
  const resetProjectModal = document.getElementById('resetProjectModal');
  const closeResetModalBtn = document.getElementById('closeResetModalBtn');
  const cancelResetModalBtn = document.getElementById('cancelResetModalBtn');
  const confirmResetProjectBtn = document.getElementById('confirmResetProjectBtn');

  if (headerResetProjectBtn) {
    headerResetProjectBtn.addEventListener('click', () => {
      if (resetProjectModal) resetProjectModal.classList.remove('hidden');
    });
  }

  if (closeResetModalBtn) closeResetModalBtn.addEventListener('click', () => resetProjectModal.classList.add('hidden'));
  if (cancelResetModalBtn) cancelResetModalBtn.addEventListener('click', () => resetProjectModal.classList.add('hidden'));

  function resetAppProject() {
    // 1. Reset Icon Config
    AppState.iconConfig = {
      bg: { type: 'gradient', color1: '#00F0FF', color2: '#3B82F6', angle: 135 },
      fgType: 'icon',
      emoji: '⚡',
      text: 'G',
      iconKey: 'bolt',
      imageElement: null,
      iconColor: '#FFFFFF',
      iconScale: 1.0,
      fontFamily: 'Outfit',
      borderRadius: 115,
      borderWidth: 0,
      borderColor: '#FFFFFF',
      shadow: true,
      glow: false
    };

    // 2. Reset Feature Graphic Config
    AppState.featureConfig = {
      bg: { preset: 'dark_navy', color1: '#0F172A', color2: '#1E1B4B', type: 'gradient' },
      title: "Votre Application Révolutionnaire",
      subtitle: "Gagnez du temps et boostez vos résultats dès aujourd'hui",
      badgeText: "⭐ NOUVELLE VERSION",
      fontFamily: "Outfit",
      textColor: "#FFFFFF",
      badgeColor: "#00F0FF",
      isRTL: false,
      mockupMode: 'single_tilted',
      screenshotImg: null
    };

    // 3. Reset Screenshots List
    AppState.activeScreenIndex = 0;
    AppState.screenshotsList = [
      { headline: "Tableau de Bord Intelligent", subtitle: "Visualisez toutes vos données en un coup d'œil", badgeText: "NOUVEAU", layoutStyle: "tilt_left", bg: { preset: 'dark_navy' }, fontFamily: "Outfit", textColor: "#FFFFFF", subColor: "rgba(255, 255, 255, 0.75)", isRTL: false, screenshotImg: null },
      { headline: "Performances Ultra-Rapides", subtitle: "Optimisé pour une expérience utilisateur fluide et sans accroc", badgeText: "⚡ VITESSE", layoutStyle: "front_classic", bg: { preset: 'cyberpunk' }, fontFamily: "Outfit", textColor: "#FFFFFF", subColor: "rgba(255, 255, 255, 0.75)", isRTL: false, screenshotImg: null },
      { headline: "Sécurité & Confidentialité 100%", subtitle: "Vos données personnelles sont chiffrées et protégées", badgeText: "🔒 PROTÉGÉ", layoutStyle: "tilt_right", bg: { preset: 'emerald' }, fontFamily: "Outfit", textColor: "#FFFFFF", subColor: "rgba(255, 255, 255, 0.75)", isRTL: false, screenshotImg: null },
      { headline: "Mode Sombre & Personnalisation", subtitle: "Adaptez l'interface selon votre style et vos préférences", badgeText: "🎨 DESIGN", layoutStyle: "sunset", bg: { preset: 'sunset' }, fontFamily: "Outfit", textColor: "#FFFFFF", subColor: "rgba(255, 255, 255, 0.75)", isRTL: false, screenshotImg: null }
    ];

    // 4. Reset ASO Data
    AppState.asoData = {
      fr: { title: "", shortDesc: "", fullDesc: "", releaseNotes: "" },
      ar: { title: "", shortDesc: "", fullDesc: "", releaseNotes: "" },
      en: { title: "", shortDesc: "", fullDesc: "", releaseNotes: "" }
    };
    const asoTitleInput = document.getElementById('asoTitleInput');
    const asoShortDescInput = document.getElementById('asoShortDescInput');
    const asoFullDescInput = document.getElementById('asoFullDescInput');
    const asoReleaseNotesInput = document.getElementById('asoReleaseNotesInput');
    if (asoTitleInput) asoTitleInput.value = "";
    if (asoShortDescInput) asoShortDescInput.value = "";
    if (asoFullDescInput) asoFullDescInput.value = "";
    if (asoReleaseNotesInput) asoReleaseNotesInput.value = "";
    if (typeof updateAsoCounters === 'function') updateAsoCounters();

    // 5. Reset Privacy Config
    AppState.privacyConfig = {
      appName: "Mon Application",
      devName: "Mon Studio Dev",
      contactEmail: "contact@monapp.com",
      effectiveDate: new Date().toISOString().split('T')[0],
      appType: "Free",
      permissions: { location: true, notifications: true, camera: false, storage: false, microphone: false, contacts: false },
      sdks: { playServices: true, admob: true, firebase: true, facebook: false, onesignal: false, unity: false, weather: false },
      coppa: "no"
    };
    AppState.privacyResult = { markdown: "", html: "" };
    const privacyAppName = document.getElementById('privacyAppName');
    const privacyDevName = document.getElementById('privacyDevName');
    const privacyEmail = document.getElementById('privacyEmail');
    if (privacyAppName) privacyAppName.value = "Mon Application";
    if (privacyDevName) privacyDevName.value = "Mon Studio Dev";
    if (privacyEmail) privacyEmail.value = "contact@monapp.com";

    // 6. Reset Asset Resizer Config
    AppState.assetConfig.sourceImage = null;
    AppState.assetConfig.customBgImage = null;
    AppState.assetConfig.customFgImage = null;
    AppState.assetConfig.customMonochromeImage = null;
    if (AppState.assetConfig.customResizer) AppState.assetConfig.customResizer.image = null;

    // 7. Update Inputs DOM
    const featureTitleInput = document.getElementById('featureTitleInput');
    const featureSubtitleInput = document.getElementById('featureSubtitleInput');
    const featureBadgeInput = document.getElementById('featureBadgeInput');
    const scrHeadlineInput = document.getElementById('scrHeadlineInput');
    const scrSubtitleInput = document.getElementById('scrSubtitleInput');
    const scrBadgeInput = document.getElementById('scrBadgeInput');
    if (featureTitleInput) featureTitleInput.value = AppState.featureConfig.title;
    if (featureSubtitleInput) featureSubtitleInput.value = AppState.featureConfig.subtitle;
    if (featureBadgeInput) featureBadgeInput.value = AppState.featureConfig.badgeText;
    if (scrHeadlineInput) scrHeadlineInput.value = AppState.screenshotsList[0].headline;
    if (scrSubtitleInput) scrSubtitleInput.value = AppState.screenshotsList[0].subtitle;
    if (scrBadgeInput) scrBadgeInput.value = AppState.screenshotsList[0].badgeText;

    // 8. Re-render all canvases
    renderAllCanvases();
    renderAllAssetCanvases();

    showToast("✨ Nouveau projet réinitialisé ! Vous démarrez avec une session propre.");
  }

  if (confirmResetProjectBtn) {
    confirmResetProjectBtn.addEventListener('click', () => {
      resetAppProject();
      if (resetProjectModal) resetProjectModal.classList.add('hidden');
    });
  }

  // Initial Lucide Icons & Auth check
  if (window.lucide) lucide.createIcons();
  updateAuthUI();
  renderLandingPricingCards();

  // Handle secret admin link on load (?portal=admin or #admin)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('portal') === 'admin' || window.location.hash === '#admin') {
    if (window.AuthManager && AuthManager.isAdmin()) {
      switchTab('admin');
    } else {
      setAuthMode('login');
      const authModal = document.getElementById('authModal');
      if (authModal) authModal.classList.remove('hidden');
      showToast("🔒 Zone Admin : Veuillez vous connecter.", "info");
    }
  }

  // Initial Canvases Render
  setTimeout(() => {
    renderAllCanvases();
    renderAllAssetCanvases();
  }, 150);
});
