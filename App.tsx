
import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MotionCanvas from './components/MotionCanvas';
import Login from './components/Login';
import BrandLogo from './components/BrandLogo';
import { CanvasTool, VideoSettings, MotionPath, GenerationStatus } from './types';
import { VideoService } from './services/videoService';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [tool, setTool] = useState<CanvasTool>(CanvasTool.ARROW);
  const [paths, setPaths] = useState<MotionPath[]>([]);
  const [settings, setSettings] = useState<VideoSettings>({
    intensity: 5,
    resolution: '720p',
    aspectRatio: '16:9',
    prompt: 'Cinematic video with subtle realistic motion'
  });
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    progress: 0,
    message: ''
  });

  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImageUrl(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imageUrl) {
      alert("Please upload an image first.");
      return;
    }

    if (!hasApiKey && window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }

    setStatus({ isGenerating: true, progress: 10, message: 'Preparing assets...', error: undefined });
    
    try {
      const videoUrl = await VideoService.generateMotionVideo(
        imageUrl,
        paths,
        settings,
        (msg) => setStatus(prev => ({ ...prev, message: msg }))
      );
      setStatus({ isGenerating: false, progress: 100, message: 'Done!', videoUrl });
    } catch (err: any) {
      console.error(err);
      if (err.message === "AUTH_REQUIRED") {
        setHasApiKey(false);
        await window.aistudio?.openSelectKey();
        setStatus({ isGenerating: false, progress: 0, message: '', error: 'API Key selection required.' });
      } else {
        setStatus({ isGenerating: false, progress: 0, message: '', error: err.message || 'Generation failed.' });
      }
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Sidebar 
        settings={settings}
        setSettings={setSettings}
        tool={tool}
        setTool={setTool}
        onGenerate={handleGenerate}
        isGenerating={status.isGenerating}
      />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <BrandLogo size="sm" />
            <div className="h-10 w-px bg-zinc-800 hidden md:block"></div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">
                <span className="text-emerald-500">BD</span> MotionFlow <span className="text-red-500">AI</span>
              </h1>
              <p className="text-zinc-500 text-xs font-medium">Professional AI Video Motion Control</p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <button 
              onClick={() => setIsLoggedIn(false)}
              className="text-zinc-500 hover:text-red-400 text-[10px] font-bold uppercase tracking-widest transition-colors mr-4"
            >
              Sign Out
            </button>
            <input 
              type="file" 
              id="image-upload" 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />
            <label 
              htmlFor="image-upload"
              className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs px-5 py-2.5 rounded-lg border border-zinc-700 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Upload Image
            </label>
            {!hasApiKey && window.aistudio && (
              <button 
                onClick={() => window.aistudio?.openSelectKey()}
                className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs px-3 py-1.5 rounded border border-blue-600/30 transition-all"
              >
                Set API Key
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Workspace / Motion Canvas</span>
              <span className="text-[10px] text-zinc-700 font-mono">800x450 CANVAS</span>
            </div>
            <MotionCanvas 
              imageUrl={imageUrl} 
              tool={tool} 
              onPathsChange={setPaths}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Live Output / Preview</span>
              {status.isGenerating && (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  <span className="text-[9px] text-red-500 font-black tracking-tighter">RENDERING</span>
                </div>
              )}
            </div>
            
            <div className="aspect-video bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden group shadow-inner">
              {status.videoUrl ? (
                <video 
                  src={status.videoUrl} 
                  controls 
                  autoPlay 
                  loop 
                  className="w-full h-full object-contain"
                />
              ) : status.isGenerating ? (
                <div className="text-center p-8">
                  <div className="w-16 h-16 border-2 border-red-600/10 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-zinc-300 font-bold mb-1 uppercase tracking-widest text-[10px]">{status.message}</p>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest">Powered by Gemini Veo 3.1</p>
                </div>
              ) : status.error ? (
                <div className="text-center p-8">
                  <svg className="w-10 h-10 text-red-500/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-xs font-bold">{status.error}</p>
                  <button onClick={handleGenerate} className="mt-4 text-[10px] text-zinc-500 hover:text-white underline uppercase tracking-widest">Force Retry</button>
                </div>
              ) : (
                <div className="text-center p-8 opacity-20 transition-opacity group-hover:opacity-40 duration-700">
                  <svg className="w-14 h-14 text-zinc-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-zinc-500 uppercase text-[10px] tracking-[0.2em]">Ready for Generation</p>
                </div>
              )}
            </div>

            {status.videoUrl && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <a 
                  href={status.videoUrl} 
                  download="bd-motionflow-ai.mp4"
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white text-center py-3 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/20"
                >
                  Export MP4 Video
                </a>
                <button 
                  onClick={() => setStatus({ ...status, videoUrl: undefined })}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-zinc-700 transition-all"
                >
                  Discard
                </button>
              </div>
            )}
          </div>
        </div>

        <section className="mt-12">
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6 border-b border-zinc-900 pb-2">Active Motion Vectors ({paths.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paths.map((path) => (
              <div key={path.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col gap-2 transition-all hover:border-red-500/30 group">
                <span className="text-[9px] text-zinc-700 font-mono tracking-tighter group-hover:text-red-500/50 transition-colors">VEC_{path.id.split('-')[1]}</span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full group-hover:animate-pulse"></div>
                  <span className="text-[10px] font-black text-zinc-400 tracking-tighter">
                    {Math.round(path.startX)},{Math.round(path.startY)} → {Math.round(path.endX)},{Math.round(path.endY)}
                  </span>
                </div>
              </div>
            ))}
            {paths.length === 0 && (
              <div className="col-span-full py-10 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
                <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.2em]">No motion vectors detected</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
