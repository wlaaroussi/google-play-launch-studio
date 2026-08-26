/**
 * Google Play Launch Studio - Checklist & Guide Play Console Database
 */

const PLAY_CONSOLE_CHECKLIST = [
  {
    id: "account",
    title: "1. Compte Développeur & Identité",
    icon: "user-check",
    items: [
      { id: "acc_fee", text: "Payer les frais d'inscription uniques de 25 $ USD sur Google Play Console.", critical: true },
      { id: "acc_verify", text: "Effectuer la vérification d'identité (Carte d'identité / Passeport + Justificatif de domicile).", critical: true },
      { id: "acc_duns", text: "Si compte Entreprise : Fournir le numéro D-U-N-S valide auprès de Dun & Bradstreet.", critical: false },
      { id: "acc_merchant", text: "Si vente d'achats in-app/abonnements : Configurer le profil de paiement marchand.", critical: false }
    ]
  },
  {
    id: "assets",
    title: "2. Fiche du Play Store & Assets Graphiques",
    icon: "image",
    items: [
      { id: "ast_icon", text: "Icône de l'application prête au format exact 512 x 512 px (PNG 32 bits sans transparence de fond).", critical: true },
      { id: "ast_feature", text: "Image de présentation (Feature Graphic) 1024 x 500 px (PNG/JPEG sans bordures).", critical: true },
      { id: "ast_screens", text: "Au moins 4 à 8 captures d'écran smartphone HD (1080 x 1920 px ou ratio 9:16).", critical: true },
      { id: "ast_title", text: "Titre de l'application optimisé ASO (Maximum 30 caractères, sans mots interdits comme 'Gratuit' ou 'Meilleur').", critical: true },
      { id: "ast_short", text: "Description courte percutante (Maximum 80 caractères).", critical: true },
      { id: "ast_full", text: "Description complète riche avec fonctionnalités, puces et mots-clés (Maximum 4000 caractères).", critical: true }
    ]
  },
  {
    id: "compliance",
    title: "3. Politiques & Sécurité des Données (Data Safety)",
    icon: "shield-check",
    items: [
      { id: "pol_privacy", text: "URL publique valide de la politique de confidentialité (hébergée sur GitHub Pages ou votre site).", critical: true },
      { id: "pol_adid", text: "Déclaration de l'ID Publicitaire (AD_ID) dans la console (requis si AdMob ou Firebase Analytics est présent).", critical: true },
      { id: "pol_safety", text: "Remplir le questionnaire 'Sécurité des données' (Data Safety) pour chaque donnée collectée/partagée.", critical: true },
      { id: "pol_iarc", text: "Compléter le questionnaire de classification d'âge (IARC / PEGI).", critical: true },
      { id: "pol_target", text: "Définir le public cible et contenu (préciser si l'application s'adresse ou non aux enfants de moins de 13 ans).", critical: true },
      { id: "pol_covid_govt", text: "Déclarer les applications gouvernementales / COVID / Services financiers le cas échéant.", critical: false }
    ]
  },
  {
    id: "testing",
    title: "4. Test Fermé Obligatoire (20 Testeurs / 14 Jours)",
    icon: "users",
    items: [
      { id: "tst_group", text: "Créer un Groupe Google (Google Group) contenant les adresses Gmail des testeurs.", critical: true },
      { id: "tst_20", text: "Recruter au moins 20 testeurs actifs ayant accepté l'invitation sur le Play Store.", critical: true },
      { id: "tst_14days", text: "Maintenir l'application en test fermé pendant 14 jours consécutifs sans interruption.", critical: true },
      { id: "tst_feedback", text: "Recueillir des commentaires et avis réguliers des testeurs durant la phase de test.", critical: true },
      { id: "tst_prod_request", text: "Remplir le questionnaire de demande d'accès à la production avec des réponses détaillées sur les retours obtenus.", critical: true }
    ]
  },
  {
    id: "release",
    title: "5. Préparation du Bundle & Déploiement",
    icon: "rocket",
    items: [
      { id: "rel_aab", text: "Générer le fichier Android App Bundle (.aab) signé en mode Release avec Proguard/R8 activé.", critical: true },
      { id: "rel_keystore", text: "Conserver une sauvegarde sécurisée de votre clé de signature (Keystore & Google Play App Signing).", critical: true },
      { id: "rel_targetsdk", text: "Vérifier que targetSdkVersion cible la version d'Android la plus récente exigée par Google (Android 14+ / API 34+).", critical: true },
      { id: "rel_notes", text: "Rédiger les notes de version (Release Notes) dans toutes les langues configurées.", critical: false },
      { id: "rel_submit", text: "Soumettre la version finale pour examen par les équipes de Google Play.", critical: true }
    ]
  }
];

const DATA_SAFETY_GUIDE = [
  {
    title: "Collecte de l'Emplacement (GPS)",
    answer: "Déclarer 'Emplacement précis' ou 'Emplacement approximatif'. Cocher 'Fonctionnalité de l'application'. Indiquer si les données sont chiffrées en transit (Oui) et si l'utilisateur peut demander la suppression (Oui/Non)."
  },
  {
    title: "Identifiants de l'Appareil & ID Publicitaire (AD_ID)",
    answer: "Si vous utilisez AdMob, Firebase ou OneSignal : Cocher 'Identifiants de l'appareil'. Préciser les finalités : 'Publicité ou marketing' et 'Statistiques / Analyses'."
  },
  {
    title: "Informations Personnelles (Nom, Email, Téléphone)",
    answer: "Uniquement si vous proposez une inscription / connexion utilisateur. Déclarer 'Gestion du compte' et 'Fonctionnalités de l'application'."
  },
  {
    title: "Diagnostics & Rappels de Crash (Crashlytics)",
    answer: "Cocher 'Journaux de plantage' et 'Performances de l'application'. Préciser que ces données sont partagées à des fins d'analyse technique."
  }
];

const TESTER_INVITATION_TEMPLATES = {
  fr: {
    whatsapp: `👋 Salut ! J'ai développé une nouvelle application Android : *[NOM_APP]* 📱✨

Google exige que 20 personnes testent l'application pendant 14 jours avant son lancement officiel. Peux-tu m'aider en rejoignant le test ?

👉 **Étape 1 :** Rejoins notre groupe de testeurs :
[LIEN_GROUPE_GOOGLE]

👉 **Étape 2 :** Télécharge l'application sur le Play Store :
[LIEN_TEST_PLAY_STORE]

Il te suffit d'ouvrir l'app quelques secondes de temps en temps pendant les 14 jours. Merci infiniment pour ton soutien ! 🙏🚀`,
    email: `Objet : Invitation au test privé de l'application [NOM_APP] sur Google Play

Bonjour,

Je prépare le lancement de ma nouvelle application Android "[NOM_APP]" et j'aimerais vous inviter à faire partie de notre groupe de testeurs privilégiés.

Pour participer, suivez ces deux étapes simples :
1. Rejoignez le groupe de testeurs Google : [LIEN_GROUPE_GOOGLE]
2. Téléchargez l'application en avant-première sur le Google Play Store : [LIEN_TEST_PLAY_STORE]

Vos retours et suggestions me seront très précieux pour perfectionner l'application avant sa publication grand public.

Un grand merci pour votre aide et votre temps !

Bien cordialement,
[VOTRE_NOM]`
  },
  ar: {
    whatsapp: `👋 مرحباً بك! لقد قمت بتطوير تطبيق أندرويد جديد : *[NOM_APP]* 📱✨

تتطلب سياسة جوجل بلاي مشاركة 20 مختبراً لتجربة التطبيق لمدة 14 يوماً قبل إطلاقه رسمياً. يسعدني جداً دعمك ومشاركتك في هذا الاختبار !

👉 **الخطوة 1 :** انضم أولاً لمجموعة المختبرين :
[LIEN_GROUPE_GOOGLE]

👉 **الخطوة 2 :** حمّل التطبيق من متجر جوجل بلاي :
[LIEN_TEST_PLAY_STORE]

يكفي فتح التطبيق وتصفحه لبضع ثوانٍ يومياً خلال فترة الاختبار. شكراً جزيلاً لدعمك المتواصل ! 🙏🚀`,
    email: `الموضوع : دعوة لتجربة واختبار تطبيق [NOM_APP] على متجر Google Play

السلام عليكم ورحمة الله،

يسرني دعوتكم للمشاركة في الاختبار التجريبي المغلق لتطبيقي الجديد "[NOM_APP]" على منصة Google Play.

للمشاركة، يرجى اتباع الخطوتين التاليتين :
1. الانضمام إلى مجموعة المختبرين : [LIEN_GROUPE_GOOGLE]
2. تحميل وتثبيت التطبيق من الرابط المباشر : [LIEN_TEST_PLAY_STORE]

ملاحظاتكم القيمة ستساعدنا في تقديم أفضل تجربة ممكنة قبل الإطلاق النهائي.

شكراً جزيلاً لتعاونكم ودعمكم الكريم.

تحياتي،
[VOTRE_NOM]`
  },
  en: {
    whatsapp: `👋 Hey! I just built a new Android app: *[NOM_APP]* 📱✨

Google Play requires 20 testers for 14 days before public launch. Would you mind helping me out by joining the closed beta?

👉 **Step 1:** Join our Google Group:
[LIEN_GROUPE_GOOGLE]

👉 **Step 2:** Download the app on Google Play:
[LIEN_TEST_PLAY_STORE]

Just open and check the app a couple of times during the next 14 days. Thank you so much for your support! 🙏🚀`,
    email: `Subject: Invitation to test [NOM_APP] on Google Play Closed Beta

Hi there,

I am preparing the official release of my Android app "[NOM_APP]" and would love to have you as one of our early closed testers.

To join the test, please follow these 2 quick steps:
1. Join our Google Group: [LIEN_GROUPE_GOOGLE]
2. Opt-in and download from Google Play: [LIEN_TEST_PLAY_STORE]

Your feedback will be tremendously helpful in making the app ready for the public launch.

Thank you very much for your time and help!

Best regards,
[VOTRE_NOM]`
  }
};

window.PLAY_CONSOLE_CHECKLIST = PLAY_CONSOLE_CHECKLIST;
window.DATA_SAFETY_GUIDE = DATA_SAFETY_GUIDE;
window.TESTER_INVITATION_TEMPLATES = TESTER_INVITATION_TEMPLATES;
