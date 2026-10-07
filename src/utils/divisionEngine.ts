import { DivisionProblem, DivisionCycleStep, DetailedStep } from '../types/division';

/**
 * Computes all mathematical steps of a division using the traditional Spanish algorithm.
 */
export function calculateDivision(dividend: number, divisor: number): DivisionProblem {
  if (divisor <= 0) {
    throw new Error('El divisor debe ser mayor que 0');
  }
  if (dividend < 0) {
    throw new Error('El dividendo debe ser mayor o igual que 0');
  }

  const dividendStr = dividend.toString();
  const quotient = Math.floor(dividend / divisor);
  const remainder = dividend % divisor;
  const isExact = remainder === 0;

  // 1. Initial selection
  let initialDigitsCount = 1;
  let currentStr = dividendStr[0];
  let currentVal = parseInt(currentStr, 10);

  // If first digit is smaller than divisor, take two digits
  if (currentVal < divisor && dividendStr.length > 1) {
    initialDigitsCount = 2;
    currentStr = dividendStr.slice(0, 2);
    currentVal = parseInt(currentStr, 10);
  }

  const cycles: DivisionCycleStep[] = [];
  const allSteps: DetailedStep[] = [];

  let currentIndex = initialDigitsCount;
  let cycleIdx = 0;
  let runningVal = currentVal;

  // Step 0: Initial selection question step
  allSteps.push({
    id: `step-init`,
    cycleIndex: 0,
    type: 'INITIAL_SELECTION',
    title: '1. Selección de cifras',
    description: initialDigitsCount === 1
      ? `Como la primera cifra (${dividendStr[0]}) es mayor o igual que el divisor (${divisor}), ponemos el arquito sobre 1 cifra: el ${dividendStr[0]}.`
      : `Como la primera cifra (${dividendStr[0]}) es menor que el divisor (${divisor}), necesitamos coger 2 cifras: el ${dividendStr.slice(0, 2)}.`,
    question: `¿Cuántas cifras del dividendo (${dividend}) tomamos para empezar a dividir entre ${divisor}?`,
    targetExpectedValue: initialDigitsCount,
    highlightDigits: {
      dividendIndices: Array.from({ length: initialDigitsCount }, (_, i) => i),
      quotientIndex: 0,
    },
    currentWorkingNumber: currentVal,
    quotientDigit: 0,
    product: 0,
    remainder: 0,
  });

  while (true) {
    const qDigit = Math.floor(runningVal / divisor);
    const prod = qDigit * divisor;
    const subResult = runningVal - prod;
    const isZeroToQuotient = qDigit === 0 && cycleIdx > 0;

    const hasMoreDigits = currentIndex < dividendStr.length;
    const broughtDownDigit = hasMoreDigits ? parseInt(dividendStr[currentIndex], 10) : null;
    const nextNumber = hasMoreDigits && broughtDownDigit !== null
      ? subResult * 10 + broughtDownDigit
      : null;

    // Step A: Find quotient
    allSteps.push({
      id: `step-q-${cycleIdx}`,
      cycleIndex: cycleIdx,
      type: 'FIND_QUOTIENT',
      title: isZeroToQuotient ? '¡Cero al cociente!' : `Buscar en la tabla del ${divisor}`,
      description: isZeroToQuotient
        ? `Como ${runningVal} es menor que ${divisor}, no cabe ninguna vez: ponemos un 0 en el cociente y bajamos la siguiente cifra.`
        : `Buscamos qué número multiplicado por ${divisor} se acerca más a ${runningVal} sin pasarse: ${divisor} × ${qDigit} = ${prod}. Ponemos ${qDigit} en el cociente.`,
      question: `¿Qué número ponemos en el cociente para dividir ${runningVal} entre ${divisor}?`,
      targetExpectedValue: qDigit,
      highlightDigits: {
        dividendIndices: cycleIdx === 0
          ? Array.from({ length: initialDigitsCount }, (_, i) => i)
          : [currentIndex - 1],
        quotientIndex: cycleIdx,
        currentRowIndex: cycleIdx,
      },
      currentWorkingNumber: runningVal,
      quotientDigit: qDigit,
      product: prod,
      remainder: subResult,
    });

    // Step B: Multiply and subtract
    allSteps.push({
      id: `step-sub-${cycleIdx}`,
      cycleIndex: cycleIdx,
      type: 'MULTIPLY_SUBTRACT',
      title: 'Multiplicar y restar',
      description: `Multiplicamos ${divisor} × ${qDigit} = ${prod}. Luego restamos: ${runningVal} - ${prod} = ${subResult}. Escribimos el ${subResult} debajo.`,
      question: `¿Cuánto nos queda al restar ${runningVal} - ${prod}?`,
      targetExpectedValue: subResult,
      highlightDigits: {
        dividendIndices: [],
        quotientIndex: cycleIdx,
        currentRowIndex: cycleIdx,
      },
      currentWorkingNumber: runningVal,
      quotientDigit: qDigit,
      product: prod,
      remainder: subResult,
    });

    // Step C: Bring down digit if there are more
    if (hasMoreDigits && broughtDownDigit !== null) {
      allSteps.push({
        id: `step-down-${cycleIdx}`,
        cycleIndex: cycleIdx,
        type: 'BRING_DOWN',
        title: 'Bajar la siguiente cifra',
        description: `Bajamos la siguiente cifra del dividendo (${broughtDownDigit}) al lado del ${subResult}. Ahora tenemos el número ${subResult * 10 + broughtDownDigit}.`,
        question: `¿Qué cifra del dividendo bajamos a continuación?`,
        targetExpectedValue: broughtDownDigit,
        highlightDigits: {
          dividendIndices: [currentIndex],
          quotientIndex: cycleIdx,
          currentRowIndex: cycleIdx,
        },
        currentWorkingNumber: runningVal,
        quotientDigit: qDigit,
        product: prod,
        remainder: subResult,
        broughtDownDigit: broughtDownDigit,
      });
    }

    cycles.push({
      cycleIndex: cycleIdx,
      currentNumber: runningVal,
      quotientDigit: qDigit,
      product: prod,
      subtractionResult: subResult,
      broughtDownDigit: broughtDownDigit,
      nextNumber: nextNumber,
      explanation: `${runningVal} entre ${divisor} cabe a ${qDigit}. ${divisor} × ${qDigit} = ${prod}. Restamos ${runningVal} - ${prod} = ${subResult}.`,
      isZeroToQuotient,
      dividendDigitsUsedCount: cycleIdx === 0 ? initialDigitsCount : 1,
    });

    if (!hasMoreDigits) {
      break;
    }

    runningVal = nextNumber!;
    currentIndex++;
    cycleIdx++;
  }

  // Final Step: Complete & Verification
  allSteps.push({
    id: `step-finish`,
    cycleIndex: cycleIdx,
    type: 'FINISH',
    title: '¡División terminada!',
    description: `La división ha finalizado. Cociente: ${quotient}, Resto: ${remainder}. Es una división ${isExact ? 'EXACTA (resto = 0)' : 'INEXACTA o ENTERA (resto > 0)'}. Comprobamos: ${divisor} × ${quotient} + ${remainder} = ${dividend}.`,
    targetExpectedValue: quotient,
    highlightDigits: {
      dividendIndices: [],
      quotientIndex: -1,
    },
    currentWorkingNumber: remainder,
    quotientDigit: 0,
    product: 0,
    remainder: remainder,
  });

  return {
    dividend,
    divisor,
    quotient,
    remainder,
    isExact,
    initialDigitsCount,
    cycles,
    allSteps,
  };
}

/**
 * Predefined pedagogical problem presets for different grade levels.
 */
export interface ProblemPreset {
  id: string;
  name: string;
  grade: string;
  dividend: number;
  divisor: number;
  description: string;
  tag: string;
}

export const PRESET_PROBLEMS: ProblemPreset[] = [
  {
    id: 'starter-1',
    name: 'Primera División (1 Cifra)',
    grade: '3º Primaria',
    dividend: 75,
    divisor: 3,
    description: 'Excelente para iniciarse. 1 cifra en el divisor y división exacta.',
    tag: 'Exacta',
  },
  {
    id: 'starter-2',
    name: 'Con Resto (División Entera)',
    grade: '3º / 4º Primaria',
    dividend: 89,
    divisor: 4,
    description: 'Aprende qué significa el resto y comprueba la prueba de la división.',
    tag: 'Con Resto',
  },
  {
    id: 'two-digits-first',
    name: 'Coger 2 Cifras al Inicio',
    grade: '3º / 4º Primaria',
    dividend: 256,
    divisor: 4,
    description: 'Como 2 es menor que 4, ¡aprendemos a poner el arquito sobre el 25!',
    tag: 'Arquito Doble',
  },
  {
    id: 'zero-in-quotient',
    name: 'Cero al Cociente',
    grade: '4º Primaria',
    dividend: 816,
    divisor: 4,
    description: 'El clásico caso: al bajar el 1, como 1 < 4, ¡cero al cociente y bajo el 6!',
    tag: 'Cero al Cociente',
  },
  {
    id: 'three-digit-dividend',
    name: 'Dividendo de 3 Cifras',
    grade: '4º / 5º Primaria',
    dividend: 748,
    divisor: 6,
    description: 'División larga completa con 3 ciclos y resto final.',
    tag: '3 Cifras',
  },
  {
    id: 'two-digit-divisor',
    name: 'Divisor de 2 Cifras',
    grade: '5º / 6º Primaria',
    dividend: 864,
    divisor: 12,
    description: 'Aprende a estimar y dividir entre números de 2 cifras paso a paso.',
    tag: '2 Cifras Divisor',
  },
  {
    id: 'challenging-2dig',
    name: 'Gran Desafío 2 Cifras',
    grade: '5º / 6º Primaria',
    dividend: 945,
    divisor: 25,
    description: 'División de 2 cifras con resto, perfecta para afianzar el cálculo.',
    tag: 'Avanzado',
  },
];

/**
 * Random generator with customizable parameters for practice
 */
export function generateRandomProblem(level: 'easy' | 'medium' | 'zero-quotient' | 'two-digit-divisor'): { dividend: number; divisor: number } {
  if (level === 'easy') {
    // 1 digit divisor (2-5), 2 digits dividend, exact or small remainder
    const divisor = Math.floor(Math.random() * 4) + 2; // 2..5
    const q = Math.floor(Math.random() * 20) + 11; // 11..30
    const rem = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * (divisor - 1)) + 1;
    return { dividend: divisor * q + rem, divisor };
  } else if (level === 'medium') {
    // 1 digit divisor (4-9), 3 digits dividend
    const divisor = Math.floor(Math.random() * 6) + 4; // 4..9
    const q = Math.floor(Math.random() * 70) + 25; // 25..94
    const rem = Math.floor(Math.random() * divisor);
    return { dividend: divisor * q + rem, divisor };
  } else if (level === 'zero-quotient') {
    // e.g. 615 / 3 or 824 / 4
    const divisor = [3, 4, 5, 6, 7][Math.floor(Math.random() * 5)];
    const qHundreds = Math.floor(Math.random() * 2) + 1;
    const qUnits = Math.floor(Math.random() * (divisor - 1)) + 1;
    const quotient = qHundreds * 100 + qUnits; // e.g. 204, 103...
    const rem = Math.floor(Math.random() * divisor);
    return { dividend: quotient * divisor + rem, divisor };
  } else {
    // 2 digits divisor
    const divisor = [12, 15, 20, 24, 25, 30, 32][Math.floor(Math.random() * 7)];
    const q = Math.floor(Math.random() * 40) + 12;
    const rem = Math.floor(Math.random() * divisor);
    return { dividend: divisor * q + rem, divisor };
  }
}
