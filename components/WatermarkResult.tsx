import React from 'react';
import { Button } from './Button';
import { Check, Cloud, Download, Wand2, Monitor } from 'lucide-react';
import { GeneratedImage } from '../types';

interface WatermarkResultProps {
    previewUrl: string | null;
    selectedImage: GeneratedImage | null;
    isLoading: boolean;
    onSave: () => void;
    isSaving: boolean;
    onClear: () => void;
}

export const WatermarkResult: React.FC<WatermarkResultProps> = ({
    previewUrl,
    selectedImage,
    isLoading,
    onSave,
    isSaving,
    onClear
}) => {
    if (!selectedImage) {
        return (
            <div className="flex flex-col items-center justify-center text-slate-400 w-full h-full py-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                    <Monitor className="text-slate-400 w-10 h-10" />
                </div>
                <h3 className="text-xl font-medium text-slate-600">Watermark Studio</h3>
                <p className="text-sm mt-2 max-w-xs text-center text-slate-500">
                    Upload or select an image to start designing your watermark.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto h-full justify-center">
            <div className="flex items-center justify-between w-full mb-4 px-2">
                <h2 className="text-lg font-bold text-slate-700">Live Preview</h2>
                <Button
                    variant="secondary"
                    onClick={onClear}
                    className="bg-white hover:bg-slate-100 text-slate-500 text-xs"
                >
                    Clear Selection
                </Button>
            </div>

            <div className="relative w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex items-center justify-center bg-[url('https://transparenttextures.com/patterns/cubes.png')]">
                {/* Main Preview Image */}
                <div
                    className="relative w-full flex items-center justify-center bg-slate-100"
                    style={{ minHeight: '400px', maxHeight: '70vh' }}
                >
                    <img
                        src={previewUrl || selectedImage.url}
                        className={`max-w-full max-h-[70vh] object-contain transition-opacity duration-200 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'}`}
                        alt="Watermark Preview"
                    />

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-sm font-bold text-blue-700">Updating...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full mt-6 flex justify-end gap-3 px-2">
                <p className="mr-auto text-xs text-slate-400 italic flex items-center">
                    * Preview is generated instantly on your device.
                </p>

                <Button
                    onClick={onSave}
                    isLoading={isSaving}
                    className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500 shadow-lg shadow-emerald-500/20"
                    icon={<Download size={20} />}
                >
                    SAVE TO GALLERY
                </Button>
            </div>
        </div>
    );
};
