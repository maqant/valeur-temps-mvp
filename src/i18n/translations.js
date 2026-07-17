// Dictionnaire de traductions FR / EN
// Ajoutez de nouvelles langues en dupliquant un bloc et en changeant la cle.

export const translations = {
  fr: {
    // App
    appTitle: 'SweatCost',

    // SettingsModal
    settingsTitle: 'Combien vaut ta sueur ?',
    settingsSubtitle: 'Dis-nous combien tu gagnes, promis on ne juge pas.',
    salaryLabel: 'Salaire net mensuel (€)',
    salaryPlaceholder: 'Ex : 2500',
    hoursLabel: 'Heures de taf par semaine',
    hoursPlaceholder: 'Ex : 35',
    saveButton: 'C\'est parti !',
    validationError: 'Veuillez entrer des valeurs valides supérieures à zéro.',
    languageLabel: 'Langue / Language',

    // MainScreen — inputs
    priceLabel: 'Ça coûte combien ?',
    pricePlaceholder: '0.00',
    usesLabel: 'Tu vas vraiment t\'en servir combien de fois ?',

    // MainScreen — results
    resultMainLabel: 'Ce petit plaisir va te coûter :',
    resultMainSubtext: 'de ta vie au boulot',
    resultCostPerUse: 'Prix par utilisation',
    resultTimePerUse: 'Temps pour 1 utilisation',

    // MainScreen — empty state
    emptyState: 'Entre un prix pour voir combien de temps tu vas devoir transpirer.',

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
    salaryLabel: 'Monthly net salary (€)',
    salaryPlaceholder: 'E.g. 2500',
    hoursLabel: 'Work hours per week',
    hoursPlaceholder: 'E.g. 35',
    saveButton: 'Let\'s go!',
    validationError: 'Please enter valid values greater than zero.',
    languageLabel: 'Langue / Language',

    // MainScreen — inputs
    priceLabel: 'Price of this whim?',
    pricePlaceholder: '0.00',
    usesLabel: 'How many times will you actually use it?',

    // MainScreen — results
    resultMainLabel: 'This little treat will cost you:',
    resultMainSubtext: 'of your life at work',
    resultCostPerUse: 'Real cost per use',
    resultTimePerUse: 'Time per use',

    // MainScreen — empty state
    emptyState: 'Enter a price to see how long you\'ll have to sweat for it.',

    // Time units
    day: 'day',
    days: 'days',
    hour: 'h',
    minute: 'min',
  },
};

export const DEFAULT_LANGUAGE = 'fr';
