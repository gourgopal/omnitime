export function getLifePathNumber(date: Date): number {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  function sumDigits(num: number): number {
    if (num < 10) return num;
    let sum = 0;
    while (num > 0) {
      sum += num % 10;
      num = Math.floor(num / 10);
    }
    return sum;
  }

  function reduceToSingleDigit(num: number): number {
    // Master numbers are not reduced
    if (num === 11 || num === 22 || num === 33) return num;
    if (num < 10) return num;
    return reduceToSingleDigit(sumDigits(num));
  }

  const reducedDay = reduceToSingleDigit(d);
  const reducedMonth = reduceToSingleDigit(m);
  const reducedYear = reduceToSingleDigit(y);

  return reduceToSingleDigit(reducedDay + reducedMonth + reducedYear);
}

export function getLifePathMeaning(number: number): string {
  const meanings: Record<number, string> = {
    1: "The Leader: Independent, pioneering, and fiercely individualistic.",
    2: "The Peacemaker: Cooperative, sensitive, and deeply intuitive.",
    3: "The Communicator: Creative, expressive, and highly sociable.",
    4: "The Builder: Practical, hard-working, and highly disciplined.",
    5: "The Adventurer: Freedom-loving, versatile, and dynamic.",
    6: "The Nurturer: Responsible, caring, and deeply compassionate.",
    7: "The Seeker: Intellectual, spiritual, and analytically minded.",
    8: "The Powerhouse: Ambitious, authoritative, and goal-oriented.",
    9: "The Humanitarian: Compassionate, generous, and universally loving.",
    11: "The Inspirer (Master Number): Intuitive, visionary, and illuminating.",
    22: "The Master Builder (Master Number): Practical, ambitious, and capable of turning dreams into reality.",
    33: "The Master Teacher (Master Number): Compassionate, healing, and focused on spiritual upliftment."
  };
  return meanings[number] || "Unknown";
}
