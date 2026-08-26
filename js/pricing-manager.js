/**
 * Google Play Launch Studio - Pricing & Plans Manager
 * Manages Dynamic Plans (5$/mo, 8$/mo, Free), Features list and Admin customization
 */

class PricingManager {
  static STORAGE_PRICING_KEY = 'launch_studio_pricing_plans';

  static getDefaultPlans() {
    return {
      free: {
        id: 'free',
        name: 'Découverte / Test',
        price: 0,
        currency: '$',
        period: '/mois',
        badge: 'ACCÈS DÉMO',
        description: 'Idéal pour tester l\'interface et concevoir vos premiers visuels.',
        features: [
          'Accès au générateur d\'icônes 512x512 (Aperçu)',
          'Accès au Feature Graphic 1024x500 (Aperçu)',
          'Générateur de captures d\'écran smartphone (Aperçu)',
          'Lecteur vidéo teaser démo',
          'Accès à la checklist des 20 testeurs Google Play',
          '❌ Téléchargements HD & Packs ZIP désactivés (Nécessite approbation Admin)'
        ],
        ctaText: 'Tester Gratuitement',
        highlighted: false
      },
      pro: {
        id: 'pro',
        name: 'Plan Développeur PRO',
        price: 5,
        currency: '$',
        period: '/mois',
        badge: 'LE PLUS POPULAIRE',
        description: 'La solution complète pour publier vos applications Android en toute conformité.',
        features: [
          '✅ Téléchargement illimité des Icônes 512x512 PNG Ultra-HD',
          '✅ Téléchargement illimité des Feature Graphics 1024x500 PNG',
          '✅ Téléchargement de toutes les captures 1080x1920 en .ZIP',
          '✅ Textes & descriptions ASO complètes en FR, AR et EN',
          '✅ Générateur de Politique de Confidentialité (HTML & Markdown)',
          '✅ Guide & Messages types pour les 20 testeurs (14 jours)',
          '✅ Téléchargement du Pack Complet Google Play (.ZIP en 1 clic)'
        ],
        ctaText: 'Choisir le Plan PRO (5$/mois)',
        highlighted: true
      },
      vip: {
        id: 'vip',
        name: 'Plan Ultimate VIP & Studio Vidéo',
        price: 8,
        currency: '$',
        period: '/mois',
        badge: 'TOUT ILLIMITÉ',
        description: 'L\'expérience ultime avec le studio vidéo trailer animé et toutes les options futures.',
        features: [
          '⭐ TOUT le contenu du Plan PRO inclus',
          '🎬 Studio Vidéo Promo & Trailer animé illimité (16:9 & 9:16 Shorts)',
          '🎥 Téléchargements vidéo HD (.MP4 / .WebM) sans filigrane',
          '🤖 Accès prioritaire au futur Générateur ASO par IA (GPT-4o)',
          '🍎 Accès anticipé au module Apple App Store iOS',
          '⚡ Support développeur prioritaire 7j/7'
        ],
        ctaText: 'Choisir le Plan VIP (8$/mois)',
        highlighted: false
      }
    };
  }

  static getPlans() {
    try {
      const stored = localStorage.getItem(this.STORAGE_PRICING_KEY);
      if (stored) {
        return Object.assign(this.getDefaultPlans(), JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load pricing plans", e);
    }
    return this.getDefaultPlans();
  }

  static savePlans(plans) {
    localStorage.setItem(this.STORAGE_PRICING_KEY, JSON.stringify(plans));
  }

  static updatePlan(planKey, price, name, description, featuresArray) {
    const plans = this.getPlans();
    if (plans[planKey]) {
      plans[planKey].price = parseFloat(price) || 0;
      if (name) plans[planKey].name = name;
      if (description) plans[planKey].description = description;
      if (Array.isArray(featuresArray)) plans[planKey].features = featuresArray;
      this.savePlans(plans);
      return { success: true, plans };
    }
    return { success: false, message: "Plan introuvable." };
  }
}

window.PricingManager = PricingManager;
