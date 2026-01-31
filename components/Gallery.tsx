import React from 'react';
import { GeneratedImage } from '../types';
import { Button } from './Button';
import { Trash2, Download, Edit3 } from 'lucide-react';

interface GalleryProps {
  images: GeneratedImage[];
  onSelectEdit: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onSelectEdit, onDelete }) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-slate-200 flex items-center justify-center">
          <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-lg font-medium text-slate-600">No designs yet</p>
        <p className="text-sm">Generate your first thumbnail to start building your gallery.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 overflow-y-auto h-full pb-24">
      {images.map((img) => (
        <div key={img.id} className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-lg">
          <div className="aspect-video w-full overflow-hidden bg-slate-100">
             <img src={img.url} alt="Generated Thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
             <div className="flex gap-2 justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <Button 
                  variant="secondary" 
                  onClick={() => onSelectEdit(img)}
                  className="!p-2 shadow-sm border-transparent bg-white/90"
                  title="Edit with AI"
                >
                  <Edit3 size={16} />
                </Button>
                <a href={img.url} download={`thumbnail-${img.id}.png`} className="inline-flex items-center justify-center p-2 rounded-lg bg-white/90 text-slate-700 hover:bg-white transition-colors shadow-sm">
                  <Download size={16} />
                </a>
                <Button 
                  variant="danger" 
                  onClick={() => onDelete(img.id)}
                  className="!p-2 shadow-sm bg-red-500/90 text-white border-transparent hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </Button>
             </div>
             <p className="text-xs text-white/90 mt-2 truncate font-medium drop-shadow-md">{img.prompt}</p>
             <span className="text-[10px] uppercase tracking-wider text-blue-300 mt-1 drop-shadow-sm">{img.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
};