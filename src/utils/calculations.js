export const calculateHourlyRate = (monthlySalary, hoursPerWeek) => {
  if (!monthlySalary || !hoursPerWeek) return 0;
  // Formule du taux horaire = Salaire mensuel / (Heures par semaine × 4.33).
  return monthlySalary / (hoursPerWeek * 4.33);
};

export const calculateWorkDayHours = (hoursPerWeek) => {
  if (!hoursPerWeek) return 0;
  // Formule d'une journée de travail = Heures par semaine / 5.
  return hoursPerWeek / 5;
};

export const convertCostToTime = (price, hourlyRate, workDayHours) => {
  if (!price || !hourlyRate || !workDayHours) return { days: 0, hours: 0, minutes: 0 };

  const totalHours = price / hourlyRate;

  let days = Math.floor(totalHours / workDayHours);
  let remainingHours = totalHours - (days * workDayHours);

  let hours = Math.floor(remainingHours);
  let minutes = Math.round((remainingHours - hours) * 60);

  // Garde-fou : Math.round peut retourner 60 quand la fraction est ≥ 0.995
  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }
  if (hours >= workDayHours) {
    hours = 0;
    days += 1;
  }

  return { days, hours, minutes };
};
