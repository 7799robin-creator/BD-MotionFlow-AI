
import React from 'react';
import { VideoSettings, CanvasTool } from '../types';

interface Props {
  settings: VideoSettings;
  setSettings: React.Dispatch<React.SetStateAction<VideoSettings>>;
  tool: CanvasTool;
  setTool: (tool: CanvasTool) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const Sidebar: React.FC<Props> = ({ 
  settings, 
  setSettings, 
  tool, 
  setTool, 
  onGenerate, 
  isGenerating 
}) => {
  return (
    <aside className="w-80 border-r border-zinc-800 bg-zinc-950 p-6 flex flex-col gap-8 h-screen sticky top-0">
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
          Motion Controls
        </h2>
        
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setTool(CanvasTool.SELECT)}
            className={`flex-1 py-2 px-3 rounded flex flex-col items-center gap-1 border transition-all ${tool === CanvasTool.SELECT ? 'bg-zinc-800 border-zinc-600 text-blue-400' : 'border-transparent text-zinc-400 hover:bg-zinc-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] uppercase font-bold">Select</span>
          </button>
          <button 
            onClick={() => setTool(CanvasTool.ARROW)}
            className={`flex-1 py-2 px-3 rounded flex flex-col items-center gap-1 border transition-all ${tool === CanvasTool.ARROW ? 'bg-zinc-800 border-zinc-600 text-blue-400' : 'border-transparent text-zinc-400 hover:bg-zinc-900'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M17 7l-10 10M17 7H7M17 7v10" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] uppercase font-bold">Path</span>
          </button>
          <button 
            disabled
            className="flex-1 py-2 px-3 rounded flex flex-col items-center gap-1 opacity-40 cursor-not-allowed border border-transparent text-zinc-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[10px] uppercase font-bold">Brush</span>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Motion Intensity ({settings.intensity})</label>
            <input 
              type="range" min="1" max="10" step="1"
              value={settings.intensity}
              onChange={(e) => setSettings({...settings, intensity: parseInt(e.target.value)})}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Visual Prompt</label>
            <textarea 
              rows={4}
              value={settings.prompt}
              onChange={(e) => setSettings({...settings, prompt: e.target.value})}
              placeholder="Describe the desired motion (e.g., 'A peaceful river flowing through the forest')"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none placeholder-zinc-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Res</label>
              <select 
                value={settings.resolution}
                onChange={(e) => setSettings({...settings, resolution: e.target.value as any})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Ratio</label>
              <select 
                value={settings.aspectRatio}
                onChange={(e) => setSettings({...settings, aspectRatio: e.target.value as any})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs focus:outline-none"
              >
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto space-y-4">
        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            <strong className="text-zinc-400">Pro Tip:</strong> Draw arrows in the direction you want specific elements to move. Longer arrows indicate faster movement.
          </p>
        </div>
        
        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full py-4 rounded-xl font-bold text-sm transition-all shadow-lg ${isGenerating ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-95 shadow-blue-900/20'}`}
        >
          {isGenerating ? 'PROCESSING...' : 'GENERATE VIDEO'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
