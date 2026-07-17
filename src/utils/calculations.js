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

  const days = Math.floor(totalHours / workDayHours);
  const remainingHours = totalHours - (days * workDayHours);

  const hours = Math.floor(remainingHours);
  const minutes = Math.round((remainingHours - hours) * 60);

  return { days, hours, minutes };
};
