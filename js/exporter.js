/**
 * Google Play Launch Studio - Exporter Module (ZIP & Direct Asset Downloads)
 * Bundles all graphics, ASO metadata, privacy policies, and checklists
 */

class Exporter {
  /**
   * Download a single HTML Canvas as PNG
   */
  static downloadCanvas(canvas, filename = "asset.png") {
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (window.saveAs) {
        saveAs(blob, filename);
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
      }
    }, 'image/png');
  }

  /**
   * Download a Video Blob as WebM / MP4
   */
  static downloadVideo(blob, filename = "app-promo-trailer.webm") {
    if (!blob) return;
    if (window.saveAs) {
      saveAs(blob, filename);
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  /**
   * Helper to convert Canvas to Blob Promise
   */
  static canvasToBlobAsync(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  /**
   * Download All Screenshots as a ZIP
   */
  static async exportScreenshotsZip(screenshotsList, globalSettings = {}) {
    if (typeof JSZip === 'undefined') {
      alert("Erreur : La bibliothèque JSZip n'est pas chargée.");
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder("screenshots-google-play");
    const tempCanvas = document.createElement('canvas');

    for (let i = 0; i < screenshotsList.length; i++) {
      const config = screenshotsList[i];
      CanvasEngine.renderScreenshot(tempCanvas, config);
      const blob = await this.canvasToBlobAsync(tempCanvas);
      folder.file(`screenshot-${i + 1}-${config.headline.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)}.png`, blob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    if (window.saveAs) {
      saveAs(zipBlob, "google-play-screenshots.zip");
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = "google-play-screenshots.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  /**
   * Master Export: Bundle ALL Assets, Textes, Privacy Policy & Checklists
   */
  static async exportFullPack(appData) {
    if (typeof JSZip === 'undefined') {
      alert("Erreur : La bibliothèque JSZip n'est pas chargée.");
      return;
    }

    const zip = new JSZip();
    const tempCanvas = document.createElement('canvas');

    // 1. Assets Graphiques
    const graphicsFolder = zip.folder("1_assets_graphiques");

    // Icon (512x512)
    CanvasEngine.renderIcon(tempCanvas, appData.iconConfig);
    const iconBlob = await this.canvasToBlobAsync(tempCanvas);
    graphicsFolder.file("app-icon-512x512.png", iconBlob);

    // Feature Graphic (1024x500)
    CanvasEngine.renderFeatureGraphic(tempCanvas, appData.featureConfig);
    const featureBlob = await this.canvasToBlobAsync(tempCanvas);
    graphicsFolder.file("feature-graphic-1024x500.png", featureBlob);

    // Screenshots (1080x1920)
    const screensFolder = graphicsFolder.folder("screenshots_phone_1080x1920");
    for (let i = 0; i < appData.screenshotsList.length; i++) {
      const screenConfig = appData.screenshotsList[i];
      CanvasEngine.renderScreenshot(tempCanvas, screenConfig);
      const screenBlob = await this.canvasToBlobAsync(tempCanvas);
      screensFolder.file(`screenshot-${i + 1}.png`, screenBlob);
    }

    // 2. Textes & Métadonnées ASO
    const asoFolder = zip.folder("2_textes_et_metadonnees_aso");

    if (appData.aso) {
      // FR
      const frContent = `=== MÉTADONNÉES GOOGLE PLAY (FRANÇAIS) ===\n\n` +
        `[NOM DE L'APPLICATION] (Max 30 car.) :\n${appData.aso.fr.title}\n\n` +
        `[DESCRIPTION COURTE] (Max 80 car.) :\n${appData.aso.fr.shortDesc}\n\n` +
        `[DESCRIPTION COMPLÈTE] (Max 4000 car.) :\n${appData.aso.fr.fullDesc}\n\n` +
        `[NOTES DE VERSION / RELEASE NOTES] :\n${appData.aso.fr.releaseNotes}\n`;
      asoFolder.file("aso_francais.txt", frContent);

      // AR
      const arContent = `=== GOOGLE PLAY METADATA (ARABIC) ===\n\n` +
        `[اسم التطبيق] (30 حرف كحد أقصى) :\n${appData.aso.ar.title}\n\n` +
        `[الوصف المختصر] (80 حرف كحد أقصى) :\n${appData.aso.ar.shortDesc}\n\n` +
        `[الوصف الكامل] (4000 حرف كحد أقصى) :\n${appData.aso.ar.fullDesc}\n\n` +
        `[ملاحظات الإصدار] :\n${appData.aso.ar.releaseNotes}\n`;
      asoFolder.file("aso_arabic.txt", arContent);

      // EN
      const enContent = `=== GOOGLE PLAY METADATA (ENGLISH) ===\n\n` +
        `[APP NAME] (Max 30 chars) :\n${appData.aso.en.title}\n\n` +
        `[SHORT DESCRIPTION] (Max 80 chars) :\n${appData.aso.en.shortDesc}\n\n` +
        `[FULL DESCRIPTION] (Max 4000 chars) :\n${appData.aso.en.fullDesc}\n\n` +
        `[RELEASE NOTES] :\n${appData.aso.en.releaseNotes}\n`;
      asoFolder.file("aso_english.txt", enContent);
    }

    // 3. Politique de Confidentialité (HTML + Markdown)
    const privacyFolder = zip.folder("3_politique_confidentialite");
    if (appData.privacy) {
      privacyFolder.file("privacy-policy.html", appData.privacy.html);
      privacyFolder.file("privacy-policy.md", appData.privacy.markdown);
    }

    // 4. Checklist & Guide Play Console
    const guideFolder = zip.folder("4_guide_et_checklist");
    let checklistText = `=== CHECK-LIST PLAY CONSOLE ===\n\n`;
    if (window.PLAY_CONSOLE_CHECKLIST) {
      window.PLAY_CONSOLE_CHECKLIST.forEach(cat => {
        checklistText += `\n## ${cat.title}\n`;
        cat.items.forEach(item => {
          checklistText += `[ ] ${item.text}\n`;
        });
      });
    }
    guideFolder.file("checklist_play_console.txt", checklistText);

    // Modèles d'invitations
    if (window.TESTER_INVITATION_TEMPLATES) {
      const invFr = `=== MODÈLES INVITATION TESTEURS (FR) ===\n\n` +
        `[WHATSAPP / TELEGRAM] :\n${window.TESTER_INVITATION_TEMPLATES.fr.whatsapp}\n\n` +
        `[EMAIL] :\n${window.TESTER_INVITATION_TEMPLATES.fr.email}\n`;
      guideFolder.file("invitations_testeurs_fr.txt", invFr);
    }

    // README d'instructions
    const readmeContent = `# PACK DE PUBLICATION GOOGLE PLAY
Généré avec succès via Google Play Launch Studio.

## 📂 Contenu du Pack :
1. **1_assets_graphiques** : Icône 512x512, Feature Graphic 1024x500 et Screenshots 1080x1920.
2. **2_textes_et_metadonnees_aso** : Titres, descriptions courtes et longues optimisées ASO en FR, AR, EN.
3. **3_politique_confidentialite** : Fichiers HTML & Markdown prêts à être hébergés.
4. **4_guide_et_checklist** : Checklist complète et messages types pour recruter vos 20 testeurs (14 jours).

Bonne publication sur Google Play ! 🚀`;
    zip.file("README_GOOGLE_PLAY.txt", readmeContent);

    // Generate and download
    const masterBlob = await zip.generateAsync({ type: "blob" });
    if (window.saveAs) {
      saveAs(masterBlob, "Google_Play_Launch_Pack_Complete.zip");
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(masterBlob);
      link.download = "Google_Play_Launch_Pack_Complete.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  /**
   * Export Mobile App Assets Pack (.ZIP)
   * Contains exact 6 files requested + Android mipmaps + iOS icons + Expo app.json snippet
   */
  static async exportAppAssetsZip(assetConfig) {
    if (typeof JSZip === 'undefined') {
      alert("Erreur : La bibliothèque JSZip n'est pas chargée.");
      return;
    }

    if (typeof AssetResizerEngine === 'undefined') {
      alert("Erreur : Le moteur AssetResizerEngine n'est pas disponible.");
      return;
    }

    const zip = new JSZip();
    const tempCanvas = document.createElement('canvas');

    // 1. Root Assets (The 6 exact files requested)
    // 1a. android-icon-background.png (1024x1024)
    AssetResizerEngine.renderAndroidBackground(tempCanvas, assetConfig);
    const bgBlob = await this.canvasToBlobAsync(tempCanvas);
    zip.file("android-icon-background.png", bgBlob);

    // 1b. android-icon-foreground.png (1024x1024)
    AssetResizerEngine.renderAndroidForeground(tempCanvas, assetConfig, false);
    const fgBlob = await this.canvasToBlobAsync(tempCanvas);
    zip.file("android-icon-foreground.png", fgBlob);

    // 1c. android-icon-monochrome.png (1024x1024)
    AssetResizerEngine.renderAndroidMonochrome(tempCanvas, assetConfig, false);
    const monoBlob = await this.canvasToBlobAsync(tempCanvas);
    zip.file("android-icon-monochrome.png", monoBlob);

    // 1d. icon.png (1024x1024)
    AssetResizerEngine.renderUniversalIcon(tempCanvas, assetConfig, null);
    const iconBlob = await this.canvasToBlobAsync(tempCanvas);
    zip.file("icon.png", iconBlob);

    // 1e. splash-icon.png (2048x2048)
    AssetResizerEngine.renderSplashIcon(tempCanvas, assetConfig, false);
    const splashBlob = await this.canvasToBlobAsync(tempCanvas);
    zip.file("splash-icon.png", splashBlob);

    // 1f. favicon.png (48x48)
    AssetResizerEngine.renderFavicon(tempCanvas, assetConfig);
    const favBlob = await this.canvasToBlobAsync(tempCanvas);
    zip.file("favicon.png", favBlob);

    // 2. Android Mipmap Folders
    const androidFolder = zip.folder("android_res");
    const mipmaps = [
      { folder: "mipmap-mdpi", size: 48 },
      { folder: "mipmap-hdpi", size: 72 },
      { folder: "mipmap-xhdpi", size: 96 },
      { folder: "mipmap-xxhdpi", size: 144 },
      { folder: "mipmap-xxxhdpi", size: 192 }
    ];

    const icon1024Canvas = document.createElement('canvas');
    AssetResizerEngine.renderUniversalIcon(icon1024Canvas, assetConfig, null);

    const round1024Canvas = document.createElement('canvas');
    AssetResizerEngine.renderUniversalIcon(round1024Canvas, assetConfig, 'circle');

    for (const m of mipmaps) {
      const mFolder = androidFolder.folder(m.folder);
      
      // Square launcher
      const scaledCanvas = document.createElement('canvas');
      scaledCanvas.width = m.size;
      scaledCanvas.height = m.size;
      const ctx = scaledCanvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(icon1024Canvas, 0, 0, m.size, m.size);
      const mBlob = await this.canvasToBlobAsync(scaledCanvas);
      mFolder.file("ic_launcher.png", mBlob);

      // Round launcher
      const roundScaled = document.createElement('canvas');
      roundScaled.width = m.size;
      roundScaled.height = m.size;
      const ctxRound = roundScaled.getContext('2d');
      ctxRound.imageSmoothingQuality = 'high';
      ctxRound.drawImage(round1024Canvas, 0, 0, m.size, m.size);
      const mRoundBlob = await this.canvasToBlobAsync(roundScaled);
      mFolder.file("ic_launcher_round.png", mRoundBlob);
    }

    // 3. iOS Icons Folder
    const iosFolder = zip.folder("ios_AppIcon.appiconset");
    const iosSizes = [
      { name: "AppIcon-1024x1024.png", size: 1024 },
      { name: "AppIcon-180x180.png", size: 180 },
      { name: "AppIcon-120x120.png", size: 120 },
      { name: "AppIcon-87x87.png", size: 87 },
      { name: "AppIcon-80x80.png", size: 80 },
      { name: "AppIcon-58x58.png", size: 58 },
      { name: "AppIcon-40x40.png", size: 40 }
    ];

    for (const ios of iosSizes) {
      const scaledIos = document.createElement('canvas');
      scaledIos.width = ios.size;
      scaledIos.height = ios.size;
      const ctxIos = scaledIos.getContext('2d');
      ctxIos.imageSmoothingQuality = 'high';
      ctxIos.drawImage(icon1024Canvas, 0, 0, ios.size, ios.size);
      const iosBlob = await this.canvasToBlobAsync(scaledIos);
      iosFolder.file(ios.name, iosBlob);
    }

    // 4. Expo / React Native app.json snippet
    const expoBgColor = assetConfig.bg.type === 'solid' ? assetConfig.bg.color1 : (assetConfig.splash.bgColor || '#0B0F19');
    const expoConfigSnippet = JSON.stringify({
      "expo": {
        "name": "My Mobile App",
        "slug": "my-mobile-app",
        "version": "1.0.0",
        "icon": "./assets/icon.png",
        "splash": {
          "image": "./assets/splash-icon.png",
          "resizeMode": "contain",
          "backgroundColor": assetConfig.splash.bgColor || "#0B0F19"
        },
        "android": {
          "adaptiveIcon": {
            "foregroundImage": "./assets/android-icon-foreground.png",
            "backgroundImage": "./assets/android-icon-background.png",
            "monochromeImage": "./assets/android-icon-monochrome.png",
            "backgroundColor": expoBgColor
          }
        },
        "web": {
          "favicon": "./assets/favicon.png"
        }
      }
    }, null, 2);
    zip.file("app.json_expo_snippet.json", expoConfigSnippet);

    // 5. Documentation README
    const readmeContent = `# PACK D'ASSETS MOBILES & ICÔNES D'APPLICATION
Généré avec succès via Google Play Launch Studio - Module Assets & Redimensionneur.

## 📁 1. ASSETS RACINES (Formats Expo & React Native Ready) :
- **android-icon-background.png** (1024×1024) : Fond pour l'icône adaptative Android.
- **android-icon-foreground.png** (1024×1024) : Premier plan avec votre logo centré dans la Safe Zone 66% (fond transparent).
- **android-icon-monochrome.png** (1024×1024) : Version monochrome pour Android 13+ (Themed Icons / Material You).
- **icon.png** (1024×1024) : Icône universelle fusionnée (App Store iOS, Google Play Console, Expo).
- **splash-icon.png** (2048×2048) : Écran de démarrage / Splash Screen Ultra-HD.
- **favicon.png** (48×48) : Favicon pour navigateurs Web et PWA.

## 📱 2. DOSSIER ANDROID RES (Android Studio & Flutter) :
Placez le contenu du dossier \`android_res/\` dans \`android/app/src/main/res/\`.
Contient les résolutions mipmap mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi (icônes carrées et rondes).

## 🍏 3. DOSSIER IOS (Xcode & iOS App Store) :
Importez le dossier \`ios_AppIcon.appiconset/\` dans votre projet Xcode (\`Images.xcassets\`).

## ⚡ 4. EXPO / REACT NATIVE :
Copiez simplement les 6 fichiers du dossier racine dans votre dossier \`./assets/\` de projet Expo, et insérez la configuration incluse dans \`app.json_expo_snippet.json\`.

Généré 100% côté client en Ultra-HD. 🚀`;

    zip.file("README_ASSETS.txt", readmeContent);

    // Generate and download zip
    const assetsZipBlob = await zip.generateAsync({ type: "blob" });
    if (window.saveAs) {
      saveAs(assetsZipBlob, "App_Icons_And_Assets_Pack.zip");
    } else {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(assetsZipBlob);
      link.download = "App_Icons_And_Assets_Pack.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }
}

window.Exporter = Exporter;
