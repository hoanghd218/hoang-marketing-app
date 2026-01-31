import React, { useState, useRef, useEffect } from 'react';
import { X, Check, ZoomIn, Move } from 'lucide-react';
import { Button } from './Button';

interface ImageCropperProps {
  src: string;
  onCrop: (base64: string) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ src, onCrop, onCancel }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    const size = 512; // Output size (square for faces)
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    if (!ctx || !imageRef.current) return;

    // Draw white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const img = imageRef.current;
    
    // Calculate the drawing parameters based on current visual transform
    // The visual container is 300x300. We map that to 512x512 output.
    const visualSize = 300;
    const canvasRatio = size / visualSize;

    // Calculate how the image is fitted visually (object-contain logic)
    const fitScale = Math.min(
      visualSize / img.naturalWidth,
      visualSize / img.naturalHeight
    );

    // Center of the canvas
    ctx.translate(size / 2, size / 2);
    
    // Apply User Position (scaled to canvas space)
    // Note: Translate applies before Scale in the context, matching the visual concept
    // where we move the "center" of the image.
    ctx.translate(position.x * canvasRatio, position.y * canvasRatio);
    
    // Apply User Scale
    ctx.scale(scale, scale);
    
    // Apply Fit Scale (to match object-contain) * Canvas Mapping
    const finalDrawScale = fitScale * canvasRatio;
    ctx.scale(finalDrawScale, finalDrawScale);
    
    // Draw image centered
    ctx.drawImage(
      img, 
      -img.naturalWidth / 2, 
      -img.naturalHeight / 2
    );

    onCrop(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Move size={16} className="text-blue-600" /> Adjust Face
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 bg-slate-50 flex flex-col items-center justify-center gap-4">
          <p className="text-xs text-slate-500 mb-2">Drag to position • Scroll/Slider to Zoom</p>
          
          {/* Crop Area / Viewport */}
          <div 
            className="relative w-[300px] h-[300px] bg-slate-200 rounded-lg overflow-hidden shadow-inner border-2 border-blue-500 cursor-move"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
             {/* The Image */}
             <div 
               className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none select-none"
               style={{
                 transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                 transformOrigin: 'center'
               }}
             >
                <img 
                  ref={imageRef} 
                  src={src} 
                  alt="Crop Source" 
                  className="w-full h-full object-contain pointer-events-none" 
                  draggable={false}
                />
             </div>

             {/* Grid Overlay (Rule of Thirds) */}
             <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="w-full h-full border border-white/50 flex flex-col">
                   <div className="flex-1 border-b border-white/50"></div>
                   <div className="flex-1 border-b border-white/50"></div>
                   <div className="flex-1"></div>
                </div>
                <div className="absolute inset-0 flex">
                   <div className="flex-1 border-r border-white/50"></div>
                   <div className="flex-1 border-r border-white/50"></div>
                   <div className="flex-1"></div>
                </div>
             </div>
          </div>

          {/* Controls */}
          <div className="w-[300px] flex items-center gap-4 mt-2">
             <ZoomIn size={16} className="text-slate-400" />
             <input 
               type="range" 
               min="0.5" 
               max="3" 
               step="0.1" 
               value={scale} 
               onChange={(e) => setScale(parseFloat(e.target.value))}
               className="flex-1 accent-blue-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
             />
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={handleCrop} className="flex-1" icon={<Check size={18} />}>Confirm Crop</Button>
        </div>
      </div>
    </div>
  );
};
