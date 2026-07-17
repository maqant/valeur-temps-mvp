// Dictionnaire de traductions FR / EN
// Ajoutez de nouvelles langues en dupliquant un bloc et en changeant la cle.

export const translations = {
  fr: {
    // App
    appTitle: 'Your Life Cost',

    // SettingsModal
    settingsTitle: 'Vos Parametres de Vie',
    settingsSubtitle: 'Pour calculer le cout reel, nous avons besoin de connaitre la valeur de votre temps.',
    salaryLabel: 'Salaire net mensuel (EUR)',
    salaryPlaceholder: 'Ex : 2500',
    hoursLabel: 'Heures de travail par semaine',
    hoursPlaceholder: 'Ex : 35',
    saveButton: 'Enregistrer et Commencer',
    validationError: 'Veuillez entrer des valeurs valides superieures a zero.',
    languageLabel: 'Langue / Language',

    // MainScreen - inputs
    priceLabel: "Combien coute cet achat ?",
    pricePlaceholder: '0.00',
    usesLabel: "Combien de fois allez-vous l'utiliser ?",

    // MainScreen - results
    resultMainLabel: 'Cet achat va vous couter :',
    resultMainSubtext: 'de votre vie au travail',
    resultCostPerUse: 'Prix par utilisation',
    resultTimePerUse: 'Temps par utilisation',

    // MainScreen - empty state
    emptyState: 'Entrez un prix pour voir son cout reel en temps de vie.',

    // Time units
    day: 'jour',
    days: 'jours',
    hour: 'h',
    minute: 'min',
  },

  en: {
    // App
    appTitle: 'Your Life Cost',

    // SettingsModal
    settingsTitle: 'Your Life Settings',
    settingsSubtitle: 'To calculate the real cost, we need to know the value of your time.',
    salaryLabel: 'Monthly net salary (EUR)',
    salaryPlaceholder: 'E.g. 2500',
    hoursLabel: 'Working hours per week',
    hoursPlaceholder: 'E.g. 35',
    saveButton: 'Save & Get Started',
    validationError: 'Please enter valid values greater than zero.',
    languageLabel: 'Langue / Language',

    // MainScreen - inputs
    priceLabel: 'How much does it cost?',
    pricePlaceholder: '0.00',
    usesLabel: 'How many times will you use it?',

    // MainScreen - results
    resultMainLabel: 'This purchase will cost you:',
    resultMainSubtext: 'of your working life',
    resultCostPerUse: 'Price per use',
    resultTimePerUse: 'Time per use',

    // MainScreen - empty state
    emptyState: 'Enter a price to see its real cost in life time.',

    // Time units
    day: 'day',
    days: 'days',
    hour: 'h',
    minute: 'min',
  },
};

export const DEFAULT_LANGUAGE = 'fr';
