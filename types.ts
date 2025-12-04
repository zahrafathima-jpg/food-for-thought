export interface Quote {
  text: string;
  author?: string;
}

// Declaration for the global canvas-confetti library loaded via CDN
declare global {
  interface Window {
    confetti: (options?: {
      particleCount?: number;
      angle?: number;
      spread?: number;
      startVelocity?: number;
      decay?: number;
      gravity?: number;
      drift?: number;
      ticks?: number;
      origin?: { x?: number; y?: number };
      colors?: string[];
      shapes?: string[];
      scalar?: number;
      zIndex?: number;
      disableForReducedMotion?: boolean;
    }) => Promise<null> | null;
  }
}