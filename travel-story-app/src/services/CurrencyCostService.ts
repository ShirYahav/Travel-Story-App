import LocationModel from "../models/LocationModel";
import RouteModel from "../models/RouteModel";

const conversionRates: { [key: string]: { [key: string]: number } } = {
  EUR: { USD: 1.1, EUR: 1 },
  USD: { EUR: 0.91, USD: 1 },
};

const convertCurrency = (
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number => {
  if (fromCurrency === toCurrency) return amount;
  return amount * (conversionRates[fromCurrency][toCurrency] || 1);
};

export const calculateTotalBudget = (
  locations: LocationModel[],
  routes: RouteModel[]
): { totalBudget: number; currency: string } => {
  const currencyCount: { [key: string]: number } = {};
  const totalCosts: { [key: string]: number } = {};

  locations.forEach((location) => {
    const { cost, currency } = location;
    if (!currency) return;

    currencyCount[currency] = (currencyCount[currency] || 0) + 1;
    totalCosts[currency] = (totalCosts[currency] || 0) + cost;
  });

  routes.forEach((route) => {
    const { cost, currency } = route;
    if (!currency) return;

    currencyCount[currency] = (currencyCount[currency] || 0) + 1;
    totalCosts[currency] = (totalCosts[currency] || 0) + cost;
  });

  const mostFrequentCurrency = Object.keys(currencyCount).reduce((a, b) =>
    currencyCount[a] > currencyCount[b] ? a : b
  );

  let totalBudget = 0;
  Object.keys(totalCosts).forEach((currency) => {
    totalBudget += convertCurrency(
      totalCosts[currency],
      currency,
      mostFrequentCurrency
    );
  });

  return { totalBudget, currency: mostFrequentCurrency };
};
