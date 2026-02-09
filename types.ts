
export interface MotionPath {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface GenerationStatus {
  isGenerating: boolean;
  progress: number;
  message: string;
  videoUrl?: string;
  error?: string;
}

export enum CanvasTool {
  SELECT = 'select',
  ARROW = 'arrow',
  BRUSH = 'brush'
}

export interface VideoSettings {
  intensity: number;
  resolution: '720p' | '1080p';
  aspectRatio: '16:9' | '9:16';
  prompt: string;
}

/**
 * Interface for the AI Studio key selection utility.
 */
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    // Fixed: Changed 'any' to 'AIStudio' to resolve the "Subsequent property declarations must have the same type" error.
    // This ensures consistency with the environment's global definition of the aistudio object.
    aistudio?: AIStudio;
    fabric: any;
  }
}
