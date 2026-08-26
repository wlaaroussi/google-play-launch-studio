/**
 * Google Play Launch Studio - Privacy Policy Generator (GDPR & Google Play Policy Compliant)
 */

class PrivacyPolicyGenerator {
  static generate(data) {
    const {
      appName = "Mon Application",
      devName = "Développeur Indépendant",
      contactEmail = "support@example.com",
      effectiveDate = new Date().toISOString().split('T')[0],
      appType = "Free", // Free, Ad-Supported, Freemium, Commercial
      permissions = {},
      sdks = {},
      coppa = "no" // 'no' = not aimed at children under 13, 'yes' = compliant with COPPA
    } = data;

    // Collect permissions list
    const activePermissions = [];
    if (permissions.location) activePermissions.push("Localisation géographique (GPS précis ou réseau approximatif) pour fournir des fonctionnalités géolocalisées.");
    if (permissions.camera) activePermissions.push("Appareil photo pour la prise de photos, le scan de codes ou la réalité augmentée.");
    if (permissions.storage) activePermissions.push("Stockage / Fichiers multimédias pour sauvegarder ou charger des documents et images locaux.");
    if (permissions.microphone) activePermissions.push("Microphone pour l'enregistrement vocal ou le traitement audio.");
    if (permissions.notifications) activePermissions.push("Notifications push pour vous envoyer des alertes importantes et des rappels.");
    if (permissions.contacts) activePermissions.push("Contacts pour faciliter le partage ou la recherche de contacts avec votre consentement.");

    // Collect third party SDKs
    const activeSdks = [];
    if (sdks.playServices) activeSdks.push({ name: "Google Play Services", url: "https://policies.google.com/privacy" });
    if (sdks.admob) activeSdks.push({ name: "Google AdMob (Publicités)", url: "https://support.google.com/admob/answer/6128543?hl=fr" });
    if (sdks.firebase) activeSdks.push({ name: "Google Firebase (Analytics & Crashlytics)", url: "https://firebase.google.com/support/privacy" });
    if (sdks.facebook) activeSdks.push({ name: "Meta Audience Network / Facebook SDK", url: "https://www.facebook.com/about/privacy" });
    if (sdks.onesignal) activeSdks.push({ name: "OneSignal (Push Notifications)", url: "https://onesignal.com/privacy_policy" });
    if (sdks.unity) activeSdks.push({ name: "Unity Ads", url: "https://unity.com/legal/privacy-policy" });
    if (sdks.weather) activeSdks.push({ name: "OpenWeatherMap API", url: "https://openweather.co.uk/privacy-policy" });

    // Build Markdown
    const markdown = `# Politique de Confidentialité de ${appName}

**Date d'entrée en vigueur :** ${effectiveDate}

Cette politique de confidentialité s'applique à l'application mobile **${appName}** (ci-après désignée l'« Application »), créée par **${devName}** (ci-après désigné le « Prestataire de services »). Ce service est fourni sous forme d'application **${appType}** et est destiné à être utilisé tel quel.

---

## 1. Collecte et Utilisation des Données

L'Application recueille des informations lorsque vous la téléchargez et l'utilisez. Ces informations peuvent inclure :
- L'adresse IP de votre appareil
- Le modèle de l'appareil, la version du système d'exploitation et les identifiants uniques
- Des statistiques d'utilisation et des rapports de crash anonymes

${activePermissions.length > 0 ? `### Permissions Demandées par l'Application :
L'Application peut solliciter l'accès aux fonctionnalités suivantes de votre appareil afin d'assurer son bon fonctionnement :
${activePermissions.map(p => `- **${p}**`).join('\n')}
` : `L'Application ne demande pas d'accès sensible aux données personnelles de votre appareil.`}

---

## 2. Services et Fournisseurs Tiers

L'Application fait appel à des services tiers susceptibles de collecter des informations utilisées pour vous identifier ou pour améliorer les performances de l'application :

${activeSdks.length > 0 ? activeSdks.map(s => `- **[${s.name}](${s.url})**`).join('\n') : `- Aucun service tiers collectant des données n'est intégré.`}

---

## 3. Sécurité des Données

La sécurité de vos données est primordiale pour nous. Nous mettons en œuvre des mesures de sécurité physiques, électroniques et organisationnelles adaptées pour protéger vos informations contre tout accès non autorisé, altération ou divulgation.

---

## 4. Protection des Enfants (Règle COPPA)

${coppa === 'yes' 
  ? `Cette Application est conçue pour être adaptée à tous les publics et respecte scrupuleusement les exigences de la politique familiale de Google Play ainsi que le Children's Online Privacy Protection Act (COPPA). Aucune donnée nominative n'est sciemment collectée auprès d'enfants sans le consentement parental préalable.`
  : `Cette Application ne s'adresse pas aux enfants de moins de 13 ans. Le Prestataire de services ne collecte pas sciemment de données d'identification personnelle auprès d'enfants de moins de 13 ans. Si nous découvrons qu'un enfant nous a fourni des informations personnelles, nous les supprimons immédiatement de nos serveurs.`}

---

## 5. Vos Droits (Conformité RGPD / GDPR & CCPA)

Conformément à la réglementation applicable en matière de protection des données (RGPD), vous disposez des droits suivants concernant vos données personnelles :
- Droit d'accès et de rectification de vos données
- Droit à l'effacement (« droit à l'oubli »)
- Droit à la limitation et à l'opposition au traitement
- Droit à la portabilité des données

---

## 6. Modifications de la Politique de Confidentialité

Nous nous réservons le droit de mettre à jour cette politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de révision actualisée.

---

## 7. Nous Contacter

Si vous avez des questions ou des suggestions concernant cette politique de confidentialité, n'hésitez pas à contacter le développeur à l'adresse suivante :
📧 **Email de contact :** [${contactEmail}](mailto:${contactEmail})
`;

    // Build Full HTML Document
    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Politique de Confidentialité - ${appName}</title>
  <style>
    :root {
      --primary: #2563eb;
      --text: #1f2937;
      --bg: #f9fafb;
      --card: #ffffff;
      --border: #e5e7eb;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --primary: #38bdf8;
        --text: #f3f4f6;
        --bg: #0f172a;
        --card: #1e293b;
        --border: #334155;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      background-color: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 40px 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: var(--card);
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.05);
      border: 1px solid var(--border);
    }
    h1 { font-size: 2rem; color: var(--primary); margin-top: 0; }
    h2 { font-size: 1.35rem; margin-top: 2rem; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
    h3 { font-size: 1.1rem; }
    ul { padding-left: 20px; }
    li { margin-bottom: 8px; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(37,99,235,0.1); color: var(--primary); border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin-bottom: 20px; }
    .footer { margin-top: 40px; text-align: center; font-size: 0.9rem; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">Google Play & RGPD Compliant</span>
    <h1>Politique de Confidentialité</h1>
    <p><strong>Application :</strong> ${appName}</p>
    <p><strong>Éditeur / Développeur :</strong> ${devName}</p>
    <p><strong>Date d'effet :</strong> ${effectiveDate}</p>
    
    <h2>1. Introduction & Présentation</h2>
    <p>La présente politique de confidentialité décrit la façon dont vos données personnelles sont recueillies, utilisées et protégées lors de l'utilisation de l'application mobile <strong>${appName}</strong>.</p>
    
    <h2>2. Collecte et Données Utilisées</h2>
    <p>L'application utilise les services de votre appareil pour offrir ses fonctionnalités.</p>
    ${activePermissions.length > 0 ? `
    <h3>Permissions requises :</h3>
    <ul>
      ${activePermissions.map(p => `<li>${p}</li>`).join('')}
    </ul>
    ` : `<p>Cette application ne requiert aucune permission sensible.</p>`}

    <h2>3. Services Tiers et Partenaires</h2>
    <p>Pour assurer le bon fonctionnement, la mesure d'audience et/ou la diffusion de contenu publicitaire, l'application intègre les services tiers suivants :</p>
    ${activeSdks.length > 0 ? `
    <ul>
      ${activeSdks.map(s => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.name}</a></li>`).join('')}
    </ul>
    ` : `<p>Aucun service tiers de suivi externe n'est utilisé.</p>`}

    <h2>4. Protection des Enfants</h2>
    <p>${coppa === 'yes' 
      ? `L'application est conforme aux directives relatives aux enfants (COPPA) et à la politique Famille de Google Play.` 
      : `L'application n'est pas directement destinée aux enfants de moins de 13 ans. Aucune donnée d'enfants n'est collectée sciemment.`}</p>

    <h2>5. Sécurité et Vos Droits RGPD</h2>
    <p>Vous conservez un droit total d'accès, de modification ou de suppression de vos données personnelles. Vous pouvez exercer vos droits en nous contactant directement.</p>

    <h2>6. Contact</h2>
    <p>Pour toute question relative à cette politique de confidentialité :<br>
    <strong>Email :</strong> <a href="mailto:${contactEmail}">${contactEmail}</a></p>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${devName} - Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>`;

    return { markdown, html };
  }
}

window.PrivacyPolicyGenerator = PrivacyPolicyGenerator;
