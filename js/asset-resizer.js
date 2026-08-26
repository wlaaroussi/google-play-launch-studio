/**
 * Google Play Launch Studio - Mobile App Icon & Asset Resizer Engine
 * High-performance client-side image processing, adaptive icon generation,
 * splash screen scaling, monochrome filters, and custom resizer.
 */

class AssetResizerEngine {
  /**
   * Default configuration for app assets
   */
  static getDefaultConfig() {
    return {
      // Source image (Image object or null)
      sourceImage: null,
      sourceFileName: "app-logo.png",
      
      // Separate background/foreground if uploaded
      customBgImage: null,
      customFgImage: null,
      customMonochromeImage: null,

      // Background settings
      bg: {
        type: 'gradient', // 'gradient', 'solid', 'transparent', 'image'
        color1: '#00F0FF',
        color2: '#3B82F6',
        angle: 135,
        preset: ''
      },

      // Foreground settings (for android-icon-foreground.png & icon.png)
      fg: {
        scale: 0.65, // Recommended safe zone is ~66% for Android Adaptive Icon
        offsetX: 0,
        offsetY: 0,
        tint: null // optional color overlay
      },

      // Monochrome settings (for android-icon-monochrome.png - Android 13+)
      monochrome: {
        mode: 'auto_white', // 'auto_white', 'auto_black', 'grayscale', 'threshold'
        threshold: 128,
        invert: false
      },

      // Splash Screen settings (splash-icon.png 2048x2048)
      splash: {
        bgColor: '#0B0F19',
        logoScale: 0.35, // Percentage of splash width
        fitMode: 'contain', // 'contain', 'cover', 'center_logo'
        showSafeZone: false
      },

      // Favicon settings (favicon.png 48x48)
      favicon: {
        includeBackground: true,
        borderRadius: 8 // in px
      },

      // Universal Icon settings (icon.png 1024x1024)
      icon: {
        borderRadius: 0, // 0 = square, preview mask applied separately
        previewMask: 'squircle' // 'squircle', 'circle', 'ios', 'square'
      },

      // Custom Image Resizer settings
      customResizer: {
        image: null,
        width: 1024,
        height: 1024,
        lockAspect: true,
        aspectRatio: 1,
        mode: 'contain', // 'contain', 'cover', 'stretch'
        bgColor: '#000000',
        format: 'image/png', // 'image/png', 'image/jpeg', 'image/webp'
        quality: 0.95
      }
    };
  }

  /**
   * Render android-icon-background.png (1024x1024)
   */
  static renderAndroidBackground(canvas, config) {
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 1024);

    const bg = config.bg;
    if (bg.type === 'transparent') {
      // Leave transparent
      return;
    }

    if (bg.type === 'image' && config.customBgImage) {
      this.drawImageFit(ctx, config.customBgImage, 0, 0, 1024, 1024, 'cover');
      return;
    }

    if (bg.type === 'solid') {
      ctx.fillStyle = bg.color1 || '#00F0FF';
      ctx.fillRect(0, 0, 1024, 1024);
    } else if (bg.type === 'radial') {
      const grad = ctx.createRadialGradient(512, 512, 50, 512, 512, 724);
      grad.addColorStop(0, bg.color1 || '#00F0FF');
      grad.addColorStop(1, bg.color2 || '#3B82F6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);
    } else {
      // Linear gradient
      const rad = ((bg.angle || 135) * Math.PI) / 180;
      const x1 = 512 - (Math.cos(rad) * 512);
      const y1 = 512 - (Math.sin(rad) * 512);
      const x2 = 512 + (Math.cos(rad) * 512);
      const y2 = 512 + (Math.sin(rad) * 512);
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, bg.color1 || '#00F0FF');
      grad.addColorStop(1, bg.color2 || '#3B82F6');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1024, 1024);
    }
  }

  /**
   * Render android-icon-foreground.png (1024x1024)
   * Must have transparent background with centered icon within safe area
   */
  static renderAndroidForeground(canvas, config, showSafeZoneGuide = false) {
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 1024);

    const fgImg = config.customFgImage || config.sourceImage;
    if (fgImg) {
      ctx.save();
      const scale = config.fg.scale || 0.65;
      const offsetX = config.fg.offsetX || 0;
      const offsetY = config.fg.offsetY || 0;

      const maxDim = 1024 * scale;
      const imgRatio = fgImg.width / fgImg.height;
      let drawW, drawH;

      if (imgRatio >= 1) {
        drawW = maxDim;
        drawH = maxDim / imgRatio;
      } else {
        drawH = maxDim;
        drawW = maxDim * imgRatio;
      }

      const dx = (1024 - drawW) / 2 + offsetX;
      const dy = (1024 - drawH) / 2 + offsetY;

      // Draw shadow if needed
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 12;

      ctx.drawImage(fgImg, dx, dy, drawW, drawH);
      ctx.restore();
    } else {
      // Fallback placeholder
      this.drawPlaceholderIcon(ctx, 1024, 1024, "Foreground Logo", false);
    }

    // Draw visual safe-zone guides if requested (for live preview, not for export)
    if (showSafeZoneGuide) {
      this.drawSafeZoneGuide(ctx, 1024, 1024);
    }
  }

  /**
   * Render android-icon-monochrome.png (1024x1024)
   * Material You Android 13+ Themed Icons format (monochrome silhouette)
   */
  static renderAndroidMonochrome(canvas, config, previewBackground = false) {
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 1024);

    if (previewBackground) {
      // Material You dark theme preview container
      ctx.fillStyle = '#1A1C1E';
      ctx.fillRect(0, 0, 1024, 1024);
    }

    if (config.customMonochromeImage) {
      // User provided explicit monochrome asset
      const scale = config.fg.scale || 0.65;
      const maxDim = 1024 * scale;
      const img = config.customMonochromeImage;
      const imgRatio = img.width / img.height;
      const drawW = imgRatio >= 1 ? maxDim : maxDim * imgRatio;
      const drawH = imgRatio >= 1 ? maxDim / imgRatio : maxDim;
      const dx = (1024 - drawW) / 2 + (config.fg.offsetX || 0);
      const dy = (1024 - drawH) / 2 + (config.fg.offsetY || 0);
      ctx.drawImage(img, dx, dy, drawW, drawH);
      return;
    }

    const fgImg = config.customFgImage || config.sourceImage;
    if (!fgImg) {
      this.drawPlaceholderIcon(ctx, 1024, 1024, "Monochrome Icon", false);
      return;
    }

    // Render foreground to an offscreen canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;
    const tempCtx = tempCanvas.getContext('2d');

    const scale = config.fg.scale || 0.65;
    const maxDim = 1024 * scale;
    const imgRatio = fgImg.width / fgImg.height;
    const drawW = imgRatio >= 1 ? maxDim : maxDim * imgRatio;
    const drawH = imgRatio >= 1 ? maxDim / imgRatio : maxDim;
    const dx = (1024 - drawW) / 2 + (config.fg.offsetX || 0);
    const dy = (1024 - drawH) / 2 + (config.fg.offsetY || 0);
    tempCtx.drawImage(fgImg, dx, dy, drawW, drawH);

    // Apply monochrome image transformation
    const imgData = tempCtx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;
    const mode = config.monochrome.mode || 'auto_white';
    const threshold = config.monochrome.threshold || 128;
    const invert = config.monochrome.invert || false;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      if (a === 0) continue;

      // Luminance
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      if (mode === 'auto_white') {
        // Pure white silhouette preserving alpha & lightness
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = invert ? (255 - lum) * (a / 255) : lum * (a / 255);
      } else if (mode === 'auto_black') {
        // Pure black silhouette
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = invert ? lum * (a / 255) : (255 - lum) * (a / 255);
      } else if (mode === 'threshold') {
        // High contrast binarization
        const isWhite = invert ? lum < threshold : lum >= threshold;
        const val = isWhite ? 255 : 0;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = isWhite ? a : 0;
      } else {
        // Grayscale
        data[i] = lum;
        data[i + 1] = lum;
        data[i + 2] = lum;
      }
    }

    tempCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  }

  /**
   * Render icon.png (1024x1024)
   * Universal combined app icon (iOS App Store, Play Store, Expo default)
   */
  static renderUniversalIcon(canvas, config, previewMask = null) {
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 1024, 1024);

    ctx.save();

    // Apply preview mask if specified (for display preview only)
    if (previewMask && previewMask !== 'square') {
      ctx.beginPath();
      if (previewMask === 'squircle') {
        this.drawSquirclePath(ctx, 0, 0, 1024, 1024, 230); // 1024 scale squircle
      } else if (previewMask === 'circle') {
        ctx.arc(512, 512, 512, 0, Math.PI * 2);
      } else if (previewMask === 'ios') {
        this.drawRoundedRectPath(ctx, 0, 0, 1024, 1024, 228);
      }
      ctx.clip();
    }

    // 1. Draw Background
    const bgCanvas = document.createElement('canvas');
    this.renderAndroidBackground(bgCanvas, config);
    ctx.drawImage(bgCanvas, 0, 0);

    // 2. Draw Foreground Logo
    const fgCanvas = document.createElement('canvas');
    this.renderAndroidForeground(fgCanvas, config, false);
    ctx.drawImage(fgCanvas, 0, 0);

    ctx.restore();
  }

  /**
   * Render splash-icon.png (2048x2048)
   * Ultra-HD Splash Screen for Expo, React Native, Android & iOS
   */
  static renderSplashIcon(canvas, config, showGuides = false) {
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 2048, 2048);

    const splash = config.splash || {};
    const bgColor = splash.bgColor || '#0B0F19';

    // 1. Background Fill
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, 2048, 2048);

    // 2. Centered Logo
    const fgImg = config.customFgImage || config.sourceImage;
    if (fgImg) {
      ctx.save();
      const logoScale = splash.logoScale || 0.35;
      const maxDim = 2048 * logoScale;
      const imgRatio = fgImg.width / fgImg.height;
      const drawW = imgRatio >= 1 ? maxDim : maxDim * imgRatio;
      const drawH = imgRatio >= 1 ? maxDim / imgRatio : maxDim;
      const dx = (2048 - drawW) / 2;
      const dy = (2048 - drawH) / 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 36;
      ctx.shadowOffsetY = 16;

      ctx.drawImage(fgImg, dx, dy, drawW, drawH);
      ctx.restore();
    } else {
      this.drawPlaceholderIcon(ctx, 2048, 2048, "Splash Screen Logo", true);
    }

    // 3. Optional visual guides for phone viewport aspect ratios (9:16 and 9:19.5)
    if (showGuides) {
      this.drawSplashGuides(ctx, 2048, 2048);
    }
  }

  /**
   * Render favicon.png (48x48)
   * High sharpness downscaling for web & browser tabs
   */
  static renderFavicon(canvas, config) {
    canvas.width = 48;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, 48, 48);

    // Render universal icon at full 1024 then downscale
    const tempCanvas = document.createElement('canvas');
    this.renderUniversalIcon(tempCanvas, config, null);

    ctx.drawImage(tempCanvas, 0, 0, 48, 48);
  }

  /**
   * Render Custom Resized Image (Custom Width x Height)
   */
  static renderCustomResize(canvas, options) {
    const {
      image,
      width = 1024,
      height = 1024,
      mode = 'contain',
      bgColor = '#000000'
    } = options;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, width, height);

    if (!image) {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${width} × ${height} px`, width / 2, height / 2);
      return;
    }

    if (mode === 'contain') {
      if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
      }
      this.drawImageFit(ctx, image, 0, 0, width, height, 'contain');
    } else if (mode === 'cover') {
      this.drawImageFit(ctx, image, 0, 0, width, height, 'cover');
    } else {
      // stretch
      ctx.drawImage(image, 0, 0, width, height);
    }
  }

  /**
   * Helper: Draw safe zone guide overlay for Android Adaptive Icons
   */
  static drawSafeZoneGuide(ctx, w, h) {
    ctx.save();
    
    // Outer masked area (outside 66% circle)
    const centerX = w / 2;
    const centerY = h / 2;
    const safeRadius = (w * 0.66) / 2; // Android spec: 66% safe zone diameter

    // Semi-transparent danger zone overlay
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(centerX, centerY, safeRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.2)'; // light red overlay
    ctx.fill();

    // Safe zone border
    ctx.beginPath();
    ctx.arc(centerX, centerY, safeRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.stroke();

    // Badge label
    ctx.fillStyle = '#00F0FF';
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ Android Safe Zone (66%)', centerX, centerY - safeRadius - 16);

    ctx.restore();
  }

  /**
   * Helper: Draw phone screen cutout guides on Splash Screen
   */
  static drawSplashGuides(ctx, w, h) {
    ctx.save();
    const centerX = w / 2;
    const centerY = h / 2;

    // 9:16 portrait viewport box
    const h916 = w * (16 / 9);
    const top916 = (h - h916) / 2;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 6]);
    ctx.strokeRect(0, top916, w, h916);

    // Center crosshair
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(centerX - 40, centerY);
    ctx.lineTo(centerX + 40, centerY);
    ctx.moveTo(centerX, centerY - 40);
    ctx.lineTo(centerX, centerY + 40);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Helper: Draw squircle path
   */
  static drawSquirclePath(ctx, x, y, width, height, radius) {
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
   * Helper: Draw rounded rectangle path
   */
  static drawRoundedRectPath(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.closePath();
  }

  /**
   * Helper: Draw image with contain/cover fit
   */
  static drawImageFit(ctx, img, x, y, w, h, mode = 'contain') {
    const imgRatio = img.width / img.height;
    const boxRatio = w / h;
    let drawW, drawH, drawX, drawY;

    if (mode === 'cover') {
      if (imgRatio > boxRatio) {
        drawH = h;
        drawW = h * imgRatio;
        drawX = x + (w - drawW) / 2;
        drawY = y;
      } else {
        drawW = w;
        drawH = w / imgRatio;
        drawX = x;
        drawY = y + (h - drawH) / 2;
      }
    } else {
      // contain
      if (imgRatio > boxRatio) {
        drawW = w;
        drawH = w / imgRatio;
        drawX = x;
        drawY = y + (h - drawH) / 2;
      } else {
        drawH = h;
        drawW = h * imgRatio;
        drawX = x + (w - drawW) / 2;
        drawY = y;
      }
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  /**
   * Helper: Placeholder graphic if no image is uploaded
   */
  static drawPlaceholderIcon(ctx, w, h, label, withBackdrop = true) {
    if (withBackdrop) {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
    }

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.18;

    // Glowing circle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#00F0FF';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // App Icon Symbol (Bolt)
    ctx.fillStyle = '#0B0F19';
    ctx.beginPath();
    const s = r * 0.6;
    ctx.moveTo(cx + s * 0.2, cy - s);
    ctx.lineTo(cx - s * 0.8, cy + s * 0.2);
    ctx.lineTo(cx + s * 0.1, cy + s * 0.2);
    ctx.lineTo(cx - s * 0.2, cy + s);
    ctx.lineTo(cx + s * 0.8, cy - s * 0.2);
    ctx.lineTo(cx - s * 0.1, cy - s * 0.2);
    ctx.closePath();
    ctx.fill();

    if (label) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.max(16, Math.floor(w * 0.03))}px Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy + r * 1.6);
    }
    ctx.restore();
  }

  /**
   * Load Image file to Image object
   */
  static loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Load Image from Data URL or Canvas
   */
  static loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}

window.AssetResizerEngine = AssetResizerEngine;
