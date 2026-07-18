// Dictionnaire de traductions FR / EN
// Ajoutez de nouvelles langues en dupliquant un bloc et en changeant la cle.

export const translations = {
  fr: {
    // App
    appTitle: 'SweatCost',

    // SettingsModal
    settingsTitle: 'Combien vaut ta sueur ?',
    settingsSubtitle: 'Dis-nous combien tu gagnes, promis on ne juge pas.',
    currencyLabel: 'Devise',
    salaryLabel: 'Salaire net mensuel',
    salaryPlaceholder: 'Ex : 2500',
    hoursLabel: 'Heures de taf par semaine',
    hoursPlaceholder: 'Ex : 35',
    saveButton: 'C\'est parti !',
    validationError: 'Veuillez entrer des valeurs valides supérieures à zéro.',
    languageLabel: 'Langue / Language',
    howItWorksBtn: 'Comprendre le calcul 🧮',
    howItWorksTitle: 'Le secret du calcul',
    howItWorksText: 'Pour être précis, on divise votre salaire par vos heures mensuelles. On trouve vos heures mensuelles en multipliant vos heures hebdos par 4,33 (la moyenne des semaines dans un mois : 52 semaines / 12 mois).',
    premiumTitle: "Vous détestez les pubs ?",
    removeAdsBtn: "Supprimer les pubs à vie",
    premiumActiveTitle: "SweatCost Pro Actif 💎",
    managePurchaseBtn: "Gérer mon achat",
    removeAdsSuccess: "Merci pour votre achat ! Les publicités ont été supprimées.",
    taxLabel: "Taxe de la vraie vie (Loyer, factures...)",

    // MainScreen — inputs
    priceLabel: 'Ça coûte combien ?',
    pricePlaceholder: '0.00',
    usesLabel: 'Tu vas vraiment t\'en servir combien de fois ?',

    // MainScreen — results
    resultMainLabel: 'Ce petit plaisir va te coûter :',
    resultMainSubtext: 'de ta vie au boulot',
    resultCostPerUse: 'Prix par utilisation',
    resultTimePerUse: 'Temps de travail par utilisation',

    // MainScreen — empty state
    emptyState: 'Entre un prix pour voir combien de temps tu vas devoir transpirer.',

    // Details
    showDetailsBtn: 'Voir le détail du calcul',
    calcStep1_pt1: 'Taux horaire réel =',
    calcStep2_pt1: 'Coût en temps =',

    // MainScreen - saved state
    savedTitle: 'Bravo ! 🎉',
    savedText: 'Tu as été fort. Ton banquier est fier de toi.',
    quitAppBtn: 'Quitter l\'appli et revenir à la raison',
    resetCalcBtn: 'Refaire un calcul',

    // Equivalents & Actions
    cancelBtn: 'J\'abandonne l\'achat 💸',
    buyInsteadBtn: 'Que puis-je acheter à la place ? 🤔',
    equivalentsTitle: 'Si tu n\'achètes pas ça, tu pourrais te payer :',
    eqPasta: 'paquets de pâtes',
    eqCoffee: 'cafés avec un ami',
    eqBook: 'livres',
    eqSP500: 'Investi dans le S&P500',

    // Time units
    day: 'jour',
    days: 'jours',
    hour: 'h',
    minute: 'min',
  },

  en: {
    // App
    appTitle: 'SweatCost',

    // SettingsModal
    settingsTitle: 'What\'s your sweat worth?',
    settingsSubtitle: 'Tell us what you earn, we promise we won\'t judge.',
    currencyLabel: 'Currency',
    salaryLabel: 'Monthly net salary',
    salaryPlaceholder: 'E.g. 2500',
    hoursLabel: 'Work hours per week',
    hoursPlaceholder: 'E.g. 35',
    saveButton: 'Let\'s go!',
    validationError: 'Please enter valid values greater than zero.',
    languageLabel: 'Langue / Language',
    howItWorksBtn: 'How is this calculated? 🧮',
    howItWorksTitle: 'The math behind the magic',
    howItWorksText: 'To be hyper-accurate, we divide your salary by your monthly hours. We find your monthly hours by multiplying your weekly hours by 4.33 (the average weeks in a month: 52 weeks / 12 months).',
    premiumTitle: "Hate ads?",
    removeAdsBtn: "Remove ads forever",
    premiumActiveTitle: "SweatCost Pro Active 💎",
    managePurchaseBtn: "Manage my purchase",
    removeAdsSuccess: "Thank you for your purchase! Ads have been removed.",
    taxLabel: "Real life tax (Rent, bills...)",

    // MainScreen — inputs
    priceLabel: 'Price of this whim?',
    pricePlaceholder: '0.00',
    usesLabel: 'How many times will you actually use it?',

    // MainScreen — results
    resultMainLabel: 'This little treat will cost you:',
    resultMainSubtext: 'of your life at work',
    resultCostPerUse: 'Real cost per use',
    resultTimePerUse: 'Time at work per use',

    // MainScreen — empty state
    emptyState: 'Enter a price to see how long you\'ll have to sweat for it.',

    // Details
    showDetailsBtn: 'View calculation details',
    calcStep1_pt1: 'Real hourly rate =',
    calcStep2_pt1: 'Time cost =',

    // MainScreen - saved state
    savedTitle: 'Well done! 🎉',
    savedText: 'You stayed strong. Your banker is proud of you.',
    quitAppBtn: 'Quit app and return to sanity',
    resetCalcBtn: 'Calculate again',

    // Equivalents & Actions
    cancelBtn: 'I\'m not buying it 💸',
    buyInsteadBtn: 'What else could I buy? 🤔',
    equivalentsTitle: 'If you don\'t buy this, you could afford:',
    eqPasta: 'packs of pasta',
    eqCoffee: 'coffees with a friend',
    eqBook: 'books',
    eqSP500: 'Invested in S&P500',

    // Time units
    day: 'day',
    days: 'days',
    hour: 'h',
    minute: 'min',
  },
};

export const DEFAULT_LANGUAGE = 'fr';
