export type SlidePersona = "shared" | "technical" | "marketing";

export interface SlideData {
  id: number;
  number: number;
  title: string;
  persona: SlidePersona;
  concept: string;
  content: {
    points: string[];
    punchline?: string;
    subheading?: string;
  };
  speakerNotes: string;
}

export interface PresentationTimer {
  minutes: number;
  seconds: number;
  isRunning: boolean;
}
