export interface CountryLifespanData {
  country: string;
  maleExpectancy: number;
  femaleExpectancy: number;
  nonNaturalRiskPercent: number; 
  cancerRiskPercent: number;
  diabetesRiskPercent: number;
}

// Data approximated from WHO/World Bank Life Expectancy metrics (circa 2021-2023)
export const LIFESPAN_DATA: CountryLifespanData[] = [
  { country: "Global Average", maleExpectancy: 70.8, femaleExpectancy: 75.6, nonNaturalRiskPercent: 8.5, cancerRiskPercent: 16.0, diabetesRiskPercent: 9.3 },
  { country: "Afghanistan", maleExpectancy: 60.6, femaleExpectancy: 63.6, nonNaturalRiskPercent: 12.4, cancerRiskPercent: 5.2, diabetesRiskPercent: 8.1 },
  { country: "Argentina", maleExpectancy: 73.5, femaleExpectancy: 80.3, nonNaturalRiskPercent: 9.1, cancerRiskPercent: 20.4, diabetesRiskPercent: 10.9 },
  { country: "Australia", maleExpectancy: 81.3, femaleExpectancy: 85.4, nonNaturalRiskPercent: 5.2, cancerRiskPercent: 29.3, diabetesRiskPercent: 6.4 },
  { country: "Bangladesh", maleExpectancy: 71.1, femaleExpectancy: 75.4, nonNaturalRiskPercent: 9.8, cancerRiskPercent: 11.2, diabetesRiskPercent: 11.4 },
  { country: "Brazil", maleExpectancy: 72.5, femaleExpectancy: 79.6, nonNaturalRiskPercent: 11.5, cancerRiskPercent: 17.8, diabetesRiskPercent: 10.4 },
  { country: "Canada", maleExpectancy: 80.4, femaleExpectancy: 84.7, nonNaturalRiskPercent: 5.6, cancerRiskPercent: 28.2, diabetesRiskPercent: 7.3 },
  { country: "China", maleExpectancy: 75.5, femaleExpectancy: 81.2, nonNaturalRiskPercent: 6.8, cancerRiskPercent: 23.5, diabetesRiskPercent: 10.6 },
  { country: "Colombia", maleExpectancy: 73.8, femaleExpectancy: 80.0, nonNaturalRiskPercent: 13.2, cancerRiskPercent: 15.6, diabetesRiskPercent: 8.9 },
  { country: "Egypt", maleExpectancy: 69.0, femaleExpectancy: 73.6, nonNaturalRiskPercent: 7.9, cancerRiskPercent: 12.4, diabetesRiskPercent: 20.9 },
  { country: "France", maleExpectancy: 79.8, femaleExpectancy: 85.7, nonNaturalRiskPercent: 5.8, cancerRiskPercent: 28.5, diabetesRiskPercent: 5.3 },
  { country: "Germany", maleExpectancy: 78.7, femaleExpectancy: 83.5, nonNaturalRiskPercent: 5.5, cancerRiskPercent: 25.1, diabetesRiskPercent: 6.9 },
  { country: "India", maleExpectancy: 69.5, femaleExpectancy: 72.2, nonNaturalRiskPercent: 10.2, cancerRiskPercent: 9.5, diabetesRiskPercent: 11.4 },
  { country: "Indonesia", maleExpectancy: 69.4, femaleExpectancy: 73.5, nonNaturalRiskPercent: 8.4, cancerRiskPercent: 12.3, diabetesRiskPercent: 10.6 },
  { country: "Iran", maleExpectancy: 72.7, femaleExpectancy: 75.7, nonNaturalRiskPercent: 9.0, cancerRiskPercent: 14.2, diabetesRiskPercent: 9.5 },
  { country: "Italy", maleExpectancy: 80.5, femaleExpectancy: 84.9, nonNaturalRiskPercent: 4.8, cancerRiskPercent: 29.1, diabetesRiskPercent: 5.3 },
  { country: "Japan", maleExpectancy: 81.5, femaleExpectancy: 87.5, nonNaturalRiskPercent: 4.5, cancerRiskPercent: 28.4, diabetesRiskPercent: 6.6 },
  { country: "Kenya", maleExpectancy: 61.1, femaleExpectancy: 65.8, nonNaturalRiskPercent: 11.2, cancerRiskPercent: 8.1, diabetesRiskPercent: 4.3 },
  { country: "Mexico", maleExpectancy: 72.3, femaleExpectancy: 78.4, nonNaturalRiskPercent: 12.8, cancerRiskPercent: 13.9, diabetesRiskPercent: 16.9 },
  { country: "Morocco", maleExpectancy: 71.9, femaleExpectancy: 75.3, nonNaturalRiskPercent: 7.5, cancerRiskPercent: 12.8, diabetesRiskPercent: 7.1 },
  { country: "Nigeria", maleExpectancy: 53.4, femaleExpectancy: 55.6, nonNaturalRiskPercent: 14.5, cancerRiskPercent: 4.5, diabetesRiskPercent: 3.6 },
  { country: "Pakistan", maleExpectancy: 65.5, femaleExpectancy: 68.3, nonNaturalRiskPercent: 10.5, cancerRiskPercent: 9.1, diabetesRiskPercent: 30.8 },
  { country: "Peru", maleExpectancy: 74.3, femaleExpectancy: 79.6, nonNaturalRiskPercent: 9.4, cancerRiskPercent: 16.2, diabetesRiskPercent: 7.5 },
  { country: "Philippines", maleExpectancy: 69.6, femaleExpectancy: 75.9, nonNaturalRiskPercent: 9.2, cancerRiskPercent: 11.2, diabetesRiskPercent: 7.1 },
  { country: "Poland", maleExpectancy: 72.6, femaleExpectancy: 80.8, nonNaturalRiskPercent: 6.9, cancerRiskPercent: 25.3, diabetesRiskPercent: 6.8 },
  { country: "Russia", maleExpectancy: 66.5, femaleExpectancy: 76.4, nonNaturalRiskPercent: 11.8, cancerRiskPercent: 16.2, diabetesRiskPercent: 5.6 },
  { country: "Saudi Arabia", maleExpectancy: 73.9, femaleExpectancy: 76.6, nonNaturalRiskPercent: 8.2, cancerRiskPercent: 9.8, diabetesRiskPercent: 18.7 },
  { country: "South Africa", maleExpectancy: 62.2, femaleExpectancy: 68.3, nonNaturalRiskPercent: 13.9, cancerRiskPercent: 8.7, diabetesRiskPercent: 11.3 },
  { country: "South Korea", maleExpectancy: 80.6, femaleExpectancy: 86.6, nonNaturalRiskPercent: 5.9, cancerRiskPercent: 27.5, diabetesRiskPercent: 6.9 },
  { country: "Spain", maleExpectancy: 80.9, femaleExpectancy: 86.2, nonNaturalRiskPercent: 4.9, cancerRiskPercent: 27.8, diabetesRiskPercent: 6.9 },
  { country: "Sweden", maleExpectancy: 81.3, femaleExpectancy: 84.7, nonNaturalRiskPercent: 5.1, cancerRiskPercent: 26.2, diabetesRiskPercent: 5.2 },
  { country: "Switzerland", maleExpectancy: 81.9, femaleExpectancy: 85.9, nonNaturalRiskPercent: 4.6, cancerRiskPercent: 26.9, diabetesRiskPercent: 5.5 },
  { country: "Thailand", maleExpectancy: 74.5, femaleExpectancy: 83.0, nonNaturalRiskPercent: 10.1, cancerRiskPercent: 17.5, diabetesRiskPercent: 9.7 },
  { country: "Turkey", maleExpectancy: 75.6, femaleExpectancy: 81.2, nonNaturalRiskPercent: 7.4, cancerRiskPercent: 19.3, diabetesRiskPercent: 14.5 },
  { country: "United Kingdom", maleExpectancy: 78.7, femaleExpectancy: 82.7, nonNaturalRiskPercent: 5.3, cancerRiskPercent: 28.1, diabetesRiskPercent: 6.0 },
  { country: "United States", maleExpectancy: 74.8, femaleExpectancy: 80.2, nonNaturalRiskPercent: 7.8, cancerRiskPercent: 21.2, diabetesRiskPercent: 10.7 },
  { country: "Vietnam", maleExpectancy: 71.3, femaleExpectancy: 80.7, nonNaturalRiskPercent: 9.3, cancerRiskPercent: 16.5, diabetesRiskPercent: 6.1 },
].sort((a, b) => a.country.localeCompare(b.country));

export interface LifespanResult {
  expectedAge: number;
  totalDaysExpected: number;
  daysLived: number;
  daysRemaining: number;
  percentageLived: number;
  percentageRemaining: number;
  nonNaturalRisk: number;
  cancerRisk: number;
  diabetesRisk: number;
  eliteExpectedAge: number;
}

export function calculateLifespan(dobStr: string, gender: "male" | "female", countryName: string): LifespanResult {
  const dob = new Date(dobStr);
  const today = new Date();
  const daysLived = Math.max(0, Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24)));

  const countryData = LIFESPAN_DATA.find(c => c.country === countryName) || LIFESPAN_DATA[0];
  const expectedAge = gender === "male" ? countryData.maleExpectancy : countryData.femaleExpectancy;
  
  // Elite Class Bonus (Access to advanced medicine, best diets, lowest stress)
  // Typically adds 8 to 12 years to average life expectancy.
  const eliteBonus = 10.5;
  const eliteExpectedAge = expectedAge + eliteBonus;

  const totalDaysExpected = expectedAge * 365.25;
  const daysRemaining = Math.max(0, totalDaysExpected - daysLived);
  
  const percentageLived = Math.min(100, Math.max(0, (daysLived / totalDaysExpected) * 100));
  const percentageRemaining = 100 - percentageLived;

  return {
    expectedAge,
    totalDaysExpected: Math.floor(totalDaysExpected),
    daysLived,
    daysRemaining: Math.floor(daysRemaining),
    percentageLived,
    percentageRemaining,
    nonNaturalRisk: countryData.nonNaturalRiskPercent,
    cancerRisk: countryData.cancerRiskPercent,
    diabetesRisk: countryData.diabetesRiskPercent,
    eliteExpectedAge
  };
}
