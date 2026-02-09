
import { GoogleGenAI } from "@google/genai";
import { VideoSettings, MotionPath } from "../types";

export class VideoService {
  private static async getAI() {
    // Create a new instance right before calling the API to ensure the latest API key is used
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async generateMotionVideo(
    base64Image: string,
    paths: MotionPath[],
    settings: VideoSettings,
    onStatusUpdate: (msg: string) => void
  ) {
    const ai = await this.getAI();
    
    // Construct motion description from paths to provide spatial context to the model
    const motionContext = paths.length > 0 
      ? `Follow these motion trajectories: ${paths.map(p => `from (${Math.round(p.startX)}, ${Math.round(p.startY)}) to (${Math.round(p.endX)}, ${Math.round(p.endY)})`).join(', ')}. `
      : "";

    const fullPrompt = `${settings.prompt}. ${motionContext} Make the motion intensity around ${settings.intensity}/10. High quality, cinematic motion.`;

    try {
      onStatusUpdate("Initializing video generation...");
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: fullPrompt,
        image: {
          imageBytes: base64Image.split(',')[1],
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: settings.resolution,
          aspectRatio: settings.aspectRatio
        }
      });

      onStatusUpdate("AI is processing your motion paths...");

      while (!operation.done) {
        // Poll every 10 seconds as recommended for video generation operations
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        onStatusUpdate("The AI model is animating the frames... this can take 1-3 minutes.");
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed - no URI returned.");

      // Appending API key to fetch the video stream content
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      // Signal UI to prompt for key selection if the requested project/key is not found or valid
      if (error.message?.includes("Requested entity was not found")) {
        throw new Error("AUTH_REQUIRED");
      }
      throw error;
    }
  }
}
