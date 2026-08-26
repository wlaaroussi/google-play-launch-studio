/**
 * Google Play Launch Studio - High Performance 2D Canvas Engine
 * Renders Pixel-Perfect 512x512 Icons, 1024x500 Feature Graphics & 1080x1920 Screenshots
 */

class CanvasEngine {
  // Built-in vector icons paths for Icon Generator
  static ICONS_SVG = {
    mosque: '<path d="M12 2L15 5V9H9V5L12 2Z" fill="currentColor"/><path d="M4 10C4 8.5 7 5 12 5C17 5 20 8.5 20 10V21H4V10Z" fill="currentColor"/><circle cx="12" cy="14" r="3" fill="#0B0F19"/><rect x="10" y="17" width="4" height="4" fill="#0B0F19"/>',
    quran: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v-14H6.5A2.5 2.5 0 0 0 4 5.5v14z" fill="currentColor"/><path d="M6 5h12v10H6z" fill="#0B0F19"/><path d="M9 8h6M9 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    weather: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" fill="currentColor"/><circle cx="19" cy="6" r="3" fill="#FBBF24"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#F43F5E"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="currentColor"/><circle cx="15" cy="9" r="2" fill="#0B0F19"/>',
    fitness: '<path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="12" cy="4" r="2" fill="currentColor"/><path d="M4 14a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6H4v-6z" fill="currentColor"/>',
    calculator: '<rect width="18" height="20" x="3" y="2" rx="4" fill="currentColor"/><rect width="12" height="4" x="6" y="5" rx="1" fill="#0B0F19"/><circle cx="7.5" cy="13.5" r="1.5" fill="#0B0F19"/><circle cx="12" cy="13.5" r="1.5" fill="#0B0F19"/><circle cx="16.5" cy="13.5" r="1.5" fill="#0B0F19"/><circle cx="7.5" cy="17.5" r="1.5" fill="#0B0F19"/><circle cx="12" cy="17.5" r="1.5" fill="#0B0F19"/><circle cx="16.5" cy="17.5" r="1.5" fill="#0B0F19"/>',
    cart: '<circle cx="8" cy="21" r="2" fill="currentColor"/><circle cx="19" cy="21" r="2" fill="currentColor"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    wallet: '<rect width="20" height="14" x="2" y="5" rx="2" fill="currentColor"/><circle cx="16.5" cy="12" r="1.5" fill="#0B0F19"/><path d="M2 10h20" stroke="#0B0F19" stroke-width="1.5"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" fill="currentColor"/><path d="m9 12 2 2 4-4" stroke="#0B0F19" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>',
    sparkles: '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" fill="currentColor"/>'
  };

  /**
   * Helper: Parse Gradient or Solid background
   */
  static applyBackground(ctx, width, height, bgConfig) {
    const { type = 'gradient', color1 = '#1E3A8A', color2 = '#06B6D4', angle = 135, preset = '' } = bgConfig;

    if (preset === 'dark_navy') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = grad;
    } else if (preset === 'cyberpunk') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4C1D95');
      grad.addColorStop(0.5, '#701A75');
      grad.addColorStop(1, '#065F46');
      ctx.fillStyle = grad;
    } else if (preset === 'emerald') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#064E3B');
      grad.addColorStop(0.6, '#047857');
      grad.addColorStop(1, '#10B981');
      ctx.fillStyle = grad;
    } else if (preset === 'sunset') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#831843');
      grad.addColorStop(0.5, '#C2410C');
      grad.addColorStop(1, '#F59E0B');
      ctx.fillStyle = grad;
    } else if (preset === 'deep_space') {
      const grad = ctx.createRadialGradient(width * 0.3, height * 0.3, 50, width * 0.5, height * 0.5, Math.max(width, height));
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(0.5, '#0F172A');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
    } else if (preset === 'minimal_light') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#F8FAFC');
      grad.addColorStop(1, '#E2E8F0');
      ctx.fillStyle = grad;
    } else if (type === 'solid') {
      ctx.fillStyle = color1;
    } else if (type === 'radial') {
      const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) / 1.4);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
    } else {
      // Linear gradient with angle
      const rad = (angle * Math.PI) / 180;
      const x1 = width / 2 - (Math.cos(rad) * width) / 2;
      const y1 = height / 2 - (Math.sin(rad) * height) / 2;
      const x2 = width / 2 + (Math.cos(rad) * width) / 2;
      const y2 = height / 2 + (Math.sin(rad) * height) / 2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, color1);
      grad.addColorStop(1, color2);
      ctx.fillStyle = grad;
    }

    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Helper: Draw subtle decorative background particles / glass circles
   */
  static drawBackgroundDecorations(ctx, width, height, isStars = true) {
    ctx.save();
    if (isStars) {
      // Glow orbs
      const orb1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 0, width * 0.8, height * 0.2, 200);
      orb1.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
      orb1.addColorStop(1, 'transparent');
      ctx.fillStyle = orb1;
      ctx.fillRect(0, 0, width, height);

      const orb2 = ctx.createRadialGradient(width * 0.2, height * 0.8, 0, width * 0.2, height * 0.8, 250);
      orb2.addColorStop(0, 'rgba(168, 85, 247, 0.2)');
      orb2.addColorStop(1, 'transparent');
      ctx.fillStyle = orb2;
      ctx.fillRect(0, 0, width, height);
    }

    // Grid pattern / particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let x = 30; x < width; x += 60) {
      for (let y = 30; y < height; y += 60) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /**
   * Helper: Draw rounded rectangle path
   */
  static drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * =========================================================================
   * 1. ICON GENERATOR (512 x 512 px)
   * =========================================================================
   */
  static renderIcon(canvas, config) {
    const ctx = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    const {
      bg = { type: 'gradient', color1: '#00F0FF', color2: '#3B82F6', angle: 135 },
      fgType = 'emoji', // 'emoji', 'text', 'icon', 'image'
      emoji = '⚡',
      text = 'A',
      iconKey = 'bolt',
      imageElement = null,
      iconColor = '#FFFFFF',
      iconScale = 1.0,
      fontFamily = 'Outfit',
      borderRadius = 115, // 0 = sharp, 115 = squircle, 256 = circle
      borderWidth = 0,
      borderColor = '#FFFFFF',
      shadow = true,
      glow = false
    } = config;

    ctx.clearRect(0, 0, 512, 512);

    // Save context for shape clipping
    ctx.save();

    // Clip to rounded shape
    this.drawRoundedRect(ctx, 0, 0, 512, 512, borderRadius);
    ctx.clip();

    // Draw Background
    this.applyBackground(ctx, 512, 512, bg);
    this.drawBackgroundDecorations(ctx, 512, 512, true);

    // Draw Foreground Content
    ctx.save();
    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 12;
    }
    if (glow) {
      ctx.shadowColor = bg.color1 || '#00F0FF';
      ctx.shadowBlur = 35;
    }

    const centerX = 256;
    const centerY = 256;

    if (fgType === 'image' && imageElement) {
      const imgSize = 360 * iconScale;
      ctx.drawImage(
        imageElement,
        centerX - imgSize / 2,
        centerY - imgSize / 2,
        imgSize,
        imgSize
      );
    } else if (fgType === 'emoji') {
      const fontSize = Math.floor(220 * iconScale);
      ctx.font = `${fontSize}px system-ui, "Apple Color Emoji", "Segoe UI Emoji"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, centerX, centerY + fontSize * 0.08);
    } else if (fgType === 'text') {
      const fontSize = Math.floor(240 * iconScale);
      ctx.font = `800 ${fontSize}px "${fontFamily}", Inter, sans-serif`;
      ctx.fillStyle = iconColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, centerX, centerY + fontSize * 0.05);
    } else if (fgType === 'icon') {
      // Draw Vector Icon onto temporary SVG path / Canvas
      const iconPath = this.ICONS_SVG[iconKey] || this.ICONS_SVG.bolt;
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" color="${iconColor}">${iconPath}</svg>`;
      const iconImg = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      iconImg.onload = () => {
        const size = 260 * iconScale;
        ctx.drawImage(iconImg, centerX - size / 2, centerY - size / 2, size, size);
        URL.revokeObjectURL(blobURL);
      };
      iconImg.src = blobURL;
    }

    ctx.restore(); // Restore shadow
    ctx.restore(); // Restore clip

    // Draw Outer Border if requested
    if (borderWidth > 0) {
      ctx.save();
      this.drawRoundedRect(ctx, borderWidth / 2, borderWidth / 2, 512 - borderWidth, 512 - borderWidth, borderRadius);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = borderWidth;
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * =========================================================================
   * 2. SMARTPHONE MOCKUP RENDERER (Reusable for Feature Graphic & Screenshots)
   * =========================================================================
   */
  static drawPhoneMockup(ctx, options) {
    const {
      x = 500,
      y = 100,
      width = 300,
      height = 620,
      screenshotImg = null,
      tilt = 0, // In degrees (e.g. -12, 0, 12)
      scale = 1.0,
      shadow = true,
      mockupColor = '#111827',
      accentGlow = true
    } = options;

    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.scale(scale, scale);

    const halfW = width / 2;
    const halfH = height / 2;
    const radius = 38;

    // Realistic Drop Shadow
    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
      ctx.shadowBlur = 40;
      ctx.shadowOffsetX = tilt > 0 ? 25 : tilt < 0 ? -25 : 0;
      ctx.shadowOffsetY = 30;
    }

    // Outer Phone Body / Bezel
    this.drawRoundedRect(ctx, -halfW, -halfH, width, height, radius);
    ctx.fillStyle = mockupColor;
    ctx.fill();

    // Reset shadow for inner elements
    ctx.shadowColor = 'transparent';

    // Metallic Outer Edge Border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Inner Bezel (Black rim)
    const bezel = 10;
    const screenX = -halfW + bezel;
    const screenY = -halfH + bezel;
    const screenW = width - bezel * 2;
    const screenH = height - bezel * 2;
    const screenRadius = radius - 8;

    // Screen Clipping
    ctx.save();
    this.drawRoundedRect(ctx, screenX, screenY, screenW, screenH, screenRadius);
    ctx.clip();

    // Draw Screen Content (User Screenshot or Default App UI)
    if (screenshotImg) {
      ctx.drawImage(screenshotImg, screenX, screenY, screenW, screenH);
    } else {
      // Default Beautiful App Mockup Screen
      const screenGrad = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
      screenGrad.addColorStop(0, '#0F172A');
      screenGrad.addColorStop(0.5, '#1E293B');
      screenGrad.addColorStop(1, '#020617');
      ctx.fillStyle = screenGrad;
      ctx.fillRect(screenX, screenY, screenW, screenH);

      // App Header simulation
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(screenX + 16, screenY + 40, screenW - 32, 45);

      // Stat cards simulation
      ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.fillRect(screenX + 16, screenY + 100, (screenW - 40) / 2, 70);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
      ctx.fillRect(screenX + 24 + (screenW - 40) / 2, screenY + 100, (screenW - 40) / 2, 70);

      // Content rows simulation
      for (let r = 0; r < 4; r++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.fillRect(screenX + 16, screenY + 190 + r * 60, screenW - 32, 48);
      }

      // App button
      const btnGrad = ctx.createLinearGradient(screenX + 16, 0, screenX + screenW - 16, 0);
      btnGrad.addColorStop(0, '#00F0FF');
      btnGrad.addColorStop(1, '#3B82F6');
      ctx.fillStyle = btnGrad;
      this.drawRoundedRect(ctx, screenX + 16, screenY + screenH - 65, screenW - 32, 44, 12);
      ctx.fill();
    }

    // Dynamic Island / Camera Punch-Hole
    ctx.fillStyle = '#000000';
    this.drawRoundedRect(ctx, -32, screenY + 8, 64, 16, 8);
    ctx.fill();
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(16, screenY + 16, 4, 0, Math.PI * 2);
    ctx.fill();

    // Glossy glass reflection streak across screen
    const glassGrad = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
    glassGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
    glassGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(screenX, screenY, screenW, screenH);

    ctx.restore(); // Restore screen clip
    ctx.restore(); // Restore phone transform
  }

  /**
   * =========================================================================
   * 3. FEATURE GRAPHIC GENERATOR (1024 x 500 px)
   * =========================================================================
   */
  static renderFeatureGraphic(canvas, config) {
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 500;

    const {
      bg = { preset: 'dark_navy' },
      title = "Mon Application Révolutionnaire",
      subtitle = "La solution complète et moderne pour votre quotidien",
      badgeText = "⭐ NOUVELLE VERSION",
      fontFamily = "Outfit",
      textColor = "#FFFFFF",
      badgeColor = "#00F0FF",
      isRTL = false,
      mockupMode = 'single_tilted', // 'none', 'single_front', 'single_tilted', 'dual', 'triple'
      screenshotImg = null
    } = config;

    ctx.clearRect(0, 0, 1024, 500);

    // 1. Background
    this.applyBackground(ctx, 1024, 500, bg);
    this.drawBackgroundDecorations(ctx, 1024, 500, true);

    // 2. Draw Mockups based on layout
    if (mockupMode === 'single_front') {
      const phoneX = isRTL ? 80 : 660;
      this.drawPhoneMockup(ctx, {
        x: phoneX,
        y: 40,
        width: 250,
        height: 520,
        tilt: 0,
        scale: 0.92,
        screenshotImg: screenshotImg
      });
    } else if (mockupMode === 'single_tilted') {
      const phoneX = isRTL ? 90 : 660;
      const tiltAngle = isRTL ? 12 : -12;
      this.drawPhoneMockup(ctx, {
        x: phoneX,
        y: 35,
        width: 250,
        height: 520,
        tilt: tiltAngle,
        scale: 0.95,
        screenshotImg: screenshotImg
      });
    } else if (mockupMode === 'dual') {
      const x1 = isRTL ? 60 : 580;
      const x2 = isRTL ? 180 : 720;
      this.drawPhoneMockup(ctx, { x: x1, y: 70, width: 230, height: 480, tilt: isRTL ? 14 : -14, scale: 0.82, screenshotImg });
      this.drawPhoneMockup(ctx, { x: x2, y: 30, width: 240, height: 500, tilt: isRTL ? -6 : 6, scale: 0.9, screenshotImg });
    } else if (mockupMode === 'triple') {
      this.drawPhoneMockup(ctx, { x: 500, y: 80, width: 210, height: 440, tilt: -15, scale: 0.78, screenshotImg });
      this.drawPhoneMockup(ctx, { x: 770, y: 80, width: 210, height: 440, tilt: 15, scale: 0.78, screenshotImg });
      this.drawPhoneMockup(ctx, { x: 635, y: 30, width: 230, height: 480, tilt: 0, scale: 0.92, screenshotImg });
    }

    // 3. Draw Promotional Texts & Badge
    ctx.save();
    ctx.direction = isRTL ? 'rtl' : 'ltr';

    let textStartX = isRTL ? 940 : 70;
    let maxTextWidth = mockupMode === 'none' ? 880 : 520;
    if (isRTL && mockupMode !== 'none') {
      textStartX = 940;
    }

    const textAlign = isRTL ? 'right' : 'left';
    ctx.textAlign = textAlign;

    let currentY = 120;

    // Badge pill
    if (badgeText && badgeText.trim()) {
      ctx.font = `700 14px "${fontFamily}", Inter, sans-serif`;
      const badgeWidth = ctx.measureText(badgeText).width + 32;
      const badgeHeight = 32;
      const badgeBoxX = isRTL ? textStartX - badgeWidth : textStartX;

      // Glow pill background
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      this.drawRoundedRect(ctx, badgeBoxX, currentY - 22, badgeWidth, badgeHeight, 16);
      ctx.fill();
      ctx.strokeStyle = badgeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Badge text
      ctx.fillStyle = badgeColor;
      ctx.fillText(badgeText, isRTL ? textStartX - 16 : textStartX + 16, currentY);
      currentY += 55;
    }

    // Catchy Main Title (Supports multi-line wrapping)
    ctx.fillStyle = textColor;
    ctx.font = `800 42px "${fontFamily}", Inter, sans-serif`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;

    const titleLines = this.wrapText(ctx, title, maxTextWidth);
    for (const line of titleLines.slice(0, 2)) {
      ctx.fillText(line, textStartX, currentY);
      currentY += 50;
    }

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = `500 20px "${fontFamily}", Inter, sans-serif`;

    const subLines = this.wrapText(ctx, subtitle, maxTextWidth);
    for (const line of subLines.slice(0, 2)) {
      ctx.fillText(line, textStartX, currentY + 10);
      currentY += 30;
    }

    ctx.restore();
  }

  /**
   * =========================================================================
   * 4. PHONE SCREENSHOTS STUDIO (1080 x 1920 px - 9:16)
   * =========================================================================
   */
  static renderScreenshot(canvas, config) {
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1920;

    const {
      bg = { preset: 'dark_navy' },
      headline = "Titre Impactant du Screenshot",
      subtitle = "Explication claire et vendeuse de la fonctionnalité",
      badgeText = "",
      fontFamily = "Outfit",
      textColor = "#FFFFFF",
      subColor = "rgba(255, 255, 255, 0.75)",
      isRTL = false,
      layoutStyle = 'front_classic', // 'front_classic', 'tilt_left', 'tilt_right', 'dual_phone', 'hero_bottom', 'floating'
      screenshotImg = null
    } = config;

    ctx.clearRect(0, 0, 1080, 1920);

    // 1. Background
    this.applyBackground(ctx, 1080, 1920, bg);
    this.drawBackgroundDecorations(ctx, 1080, 1920, true);

    // 2. Text Header (Top Area: 0 to 550px)
    ctx.save();
    ctx.direction = isRTL ? 'rtl' : 'ltr';
    ctx.textAlign = 'center';

    let currentY = 160;

    // Badge
    if (badgeText && badgeText.trim()) {
      ctx.font = `700 24px "${fontFamily}", Inter, sans-serif`;
      const badgeW = ctx.measureText(badgeText).width + 48;
      const badgeH = 48;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      this.drawRoundedRect(ctx, 540 - badgeW / 2, currentY - 34, badgeW, badgeH, 24);
      ctx.fill();
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#00F0FF';
      ctx.fillText(badgeText, 540, currentY);
      currentY += 80;
    }

    // Headline
    ctx.fillStyle = textColor;
    ctx.font = `900 68px "${fontFamily}", Inter, sans-serif`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    const headLines = this.wrapText(ctx, headline, 920);
    for (const line of headLines.slice(0, 2)) {
      ctx.fillText(line, 540, currentY);
      currentY += 80;
    }

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = subColor;
    ctx.font = `500 34px "${fontFamily}", Inter, sans-serif`;

    const subLines = this.wrapText(ctx, subtitle, 900);
    for (const line of subLines.slice(0, 2)) {
      ctx.fillText(line, 540, currentY + 10);
      currentY += 46;
    }

    ctx.restore();

    // 3. Draw Smartphone Mockup in Body Area (600px to 1920px)
    const phoneW = 680;
    const phoneH = 1400;

    if (layoutStyle === 'front_classic') {
      this.drawPhoneMockup(ctx, {
        x: 540 - phoneW / 2,
        y: 600,
        width: phoneW,
        height: phoneH,
        tilt: 0,
        scale: 1.0,
        screenshotImg: screenshotImg
      });
    } else if (layoutStyle === 'tilt_left') {
      this.drawPhoneMockup(ctx, {
        x: 540 - phoneW / 2 + 30,
        y: 620,
        width: phoneW,
        height: phoneH,
        tilt: -10,
        scale: 1.02,
        screenshotImg: screenshotImg
      });
    } else if (layoutStyle === 'tilt_right') {
      this.drawPhoneMockup(ctx, {
        x: 540 - phoneW / 2 - 30,
        y: 620,
        width: phoneW,
        height: phoneH,
        tilt: 10,
        scale: 1.02,
        screenshotImg: screenshotImg
      });
    } else if (layoutStyle === 'dual_phone') {
      this.drawPhoneMockup(ctx, {
        x: 100,
        y: 690,
        width: 540,
        height: 1120,
        tilt: -12,
        scale: 0.88,
        screenshotImg: screenshotImg
      });
      this.drawPhoneMockup(ctx, {
        x: 440,
        y: 620,
        width: 560,
        height: 1160,
        tilt: 8,
        scale: 0.94,
        screenshotImg: screenshotImg
      });
    } else if (layoutStyle === 'hero_bottom') {
      // Big focus on top half of device
      this.drawPhoneMockup(ctx, {
        x: 540 - 780 / 2,
        y: 660,
        width: 780,
        height: 1550,
        tilt: 0,
        scale: 1.08,
        screenshotImg: screenshotImg
      });
    } else if (layoutStyle === 'floating') {
      this.drawPhoneMockup(ctx, {
        x: 540 - phoneW / 2,
        y: 560,
        width: phoneW,
        height: phoneH,
        tilt: -6,
        scale: 1.05,
        screenshotImg: screenshotImg
      });
    }
  }

  /**
   * Helper: Wrap text by maxWidth
   */
  static wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}

window.CanvasEngine = CanvasEngine;
