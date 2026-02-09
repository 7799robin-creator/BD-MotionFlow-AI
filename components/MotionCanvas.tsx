
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasTool, MotionPath } from '../types';

interface Props {
  imageUrl: string | null;
  tool: CanvasTool;
  onPathsChange: (paths: MotionPath[]) => void;
}

const MotionCanvas: React.FC<Props> = ({ imageUrl, tool, onPathsChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const currentArrow = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    fabricRef.current = new window.fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 450,
      backgroundColor: '#18181b',
    });

    const handleMouseDown = (o: any) => {
      if (tool !== CanvasTool.ARROW) return;
      isDrawing.current = true;
      const pointer = fabricRef.current.getPointer(o.e);
      const points = [pointer.x, pointer.y, pointer.x, pointer.y];
      
      currentArrow.current = new window.fabric.Line(points, {
        strokeWidth: 3,
        fill: '#3b82f6',
        stroke: '#3b82f6',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      fabricRef.current.add(currentArrow.current);
    };

    const handleMouseMove = (o: any) => {
      if (!isDrawing.current || tool !== CanvasTool.ARROW) return;
      const pointer = fabricRef.current.getPointer(o.e);
      currentArrow.current.set({ x2: pointer.x, y2: pointer.y });
      fabricRef.current.renderAll();
    };

    const handleMouseUp = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      updatePaths();
    };

    fabricRef.current.on('mouse:down', handleMouseDown);
    fabricRef.current.on('mouse:move', handleMouseMove);
    fabricRef.current.on('mouse:up', handleMouseUp);

    return () => {
      fabricRef.current.dispose();
    };
  }, [tool]);

  useEffect(() => {
    if (!fabricRef.current || !imageUrl) return;

    window.fabric.Image.fromURL(imageUrl, (img: any) => {
      const canvas = fabricRef.current;
      const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
      img.set({
        scaleX: scale,
        scaleY: scale,
        selectable: false,
        evented: false,
      });
      canvas.centerObject(img);
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
    });
  }, [imageUrl]);

  const updatePaths = useCallback(() => {
    const objects = fabricRef.current.getObjects('line');
    const newPaths: MotionPath[] = objects.map((obj: any, index: number) => ({
      id: `path-${index}`,
      startX: obj.x1,
      startY: obj.y1,
      endX: obj.x2,
      endY: obj.y2,
    }));
    onPathsChange(newPaths);
  }, [onPathsChange]);

  const clearCanvas = () => {
    const objects = fabricRef.current.getObjects('line');
    objects.forEach((obj: any) => fabricRef.current.remove(obj));
    onPathsChange([]);
  };

  return (
    <div className="relative border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900 group">
      <div className="absolute top-4 left-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={clearCanvas}
          className="bg-zinc-800/80 hover:bg-zinc-700 text-xs px-3 py-1.5 rounded border border-zinc-700 backdrop-blur-sm"
        >
          Clear Paths
        </button>
      </div>
      <canvas ref={canvasRef} />
      {!imageUrl && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <svg className="w-12 h-12 text-zinc-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-zinc-500 font-medium">Upload an image to start animating</p>
        </div>
      )}
    </div>
  );
};

export default MotionCanvas;
