export interface DivisionCycleStep {
  cycleIndex: number;
  currentNumber: number; // Porción actual del dividendo que se está dividiendo
  quotientDigit: number; // Cifra que se pone en el cociente (0-9)
  product: number; // quotientDigit * divisor
  subtractionResult: number; // currentNumber - product
  broughtDownDigit: number | null; // Cifra que baja del dividendo, si hay
  nextNumber: number | null; // El nuevo número formado tras bajar la cifra
  explanation: string; // Explicación pedagógica para el alumno
  isZeroToQuotient: boolean; // Si fue un caso de "cero al cociente"
  dividendDigitsUsedCount: number; // Cifras tomadas inicialmente en este paso si es el primero
}

export interface DivisionProblem {
  dividend: number;
  divisor: number;
  quotient: number;
  remainder: number;
  isExact: boolean;
  initialDigitsCount: number; // Cuántas cifras se toman del dividendo inicialmente (1 o 2)
  cycles: DivisionCycleStep[];
  allSteps: DetailedStep[];
}

export type StepType = 
  | 'INITIAL_SELECTION' // Determinar cuántas cifras tomar del dividendo
  | 'FIND_QUOTIENT'     // Buscar número en la tabla del divisor
  | 'MULTIPLY_SUBTRACT' // Multiplicar y restar para obtener el resto parcial
  | 'BRING_DOWN'        // Bajar la siguiente cifra del dividendo
  | 'FINISH';           // División completada y prueba de la división

export interface DetailedStep {
  id: string;
  cycleIndex: number;
  type: StepType;
  title: string;
  description: string;
  question?: string;
  targetExpectedValue: number;
  highlightDigits: {
    dividendIndices: number[]; // qué dígitos del dividendo están activos
    quotientIndex: number; // qué posición del cociente se calcula
    currentRowIndex?: number;
  };
  currentWorkingNumber: number;
  quotientDigit: number;
  product: number;
  remainder: number;
  broughtDownDigit?: number;
}

export type AppMode = 
  | 'step-by-step' 
  | 'visual-sharing' 
  | 'game-missions' 
  | 'two-player-duel' 
  | 'leaderboard' 
  | 'teacher-hub';
