import React, { useState, useEffect, useRef } from 'react';
import { Layout, Sidebar, Monitor, Grid, LogOut, Wand2, RefreshCcw, Layers, Image as ImageIcon, Cloud, Check, Download, FileImage, FileText, Copy, Youtube, Sparkles, Upload, X, Type, BrainCircuit, Palette, LayoutTemplate, User as UserIcon, AlertCircle, Plus, Trash, Crop } from 'lucide-react';
import { Button } from './components/Button';
import { Input, Select, TextArea } from './components/Input';
import { Gallery } from './components/Gallery';
import { ImageCropper } from './components/ImageCropper';
import { GeneratedImage, ThumbnailConfig, User, ViewMode, GeminiModel } from './types';
import { AUDIENCES, EMOTIONS, VISUAL_STUN_GUN, LAYOUTS, EXPRESSIONS, TEXT_STYLES, TEXT_GOALS, STYLES, ASPECT_RATIOS, MOCK_USER } from './constants';
import { generateThumbnail, editThumbnail, generateVideoMetadata, generateOptimizedPrompt, generateFormSuggestions } from './services/geminiService';
import { saveImageToDrive } from './services/googleDriveService';
import { compressImage, sanitizeFilename } from './utils/imageUtils';

const App: React.FC = () => {
  // State
  const [user, setUser] = useState<User | null>(MOCK_USER);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.GENERATE);

  // Cropper State
  const [showCropper, setShowCropper] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  // Character Library State - Start empty for user upload
  const [characterLibrary, setCharacterLibrary] = useState<string[]>([]);

  // New Psychology Flow Configuration
  const [config, setConfig] = useState<ThumbnailConfig>({
    // 1. Core
    topic: 'YouTube Growth',
    mainTitle: 'How to Create Irresistible Thumbnails (and blow up your content)',
    audience: 'Newbie',
    painPoint: 'Low Click Through Rate',
    // 2. Desire Loop
    currentProblem: 'Ignored Content',
    desiredResult: 'Viral Views',
    emotionalState: 'Shock',
    // 3. Visual Stun Gun
    visualElements: ['Big Face + Expression', 'High Contrast Colors'],
    // 4. Layout
    layout: ['Rule of Thirds'],
    // 5. Character
    hasCharacter: true,
    characterImage: null,
    characterExpression: 'Shocked',
    // 6. Text
    thumbnailText: 'STOP DOING THIS',
    textStyle: 'Big Bold',
    textGoal: 'Curiosity',
    // 7. Colors
    primaryColor: 'Neon Red',
    contrastLevel: 'High',
    hasShadow: true,
    // 8. Style
    style: 'YouTube Viral',
    // 9. Version
    versionCount: '1',
    // Misc
    uploadedLogo: null,
    aspectRatio: '16:9',
    signature: ''
  });

  const [prompt, setPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [activeImage, setActiveImage] = useState<GeneratedImage | null>(null);

  // Split Loading States
  const [isGenThumbnail, setIsGenThumbnail] = useState(false);
  const [isGenMetadata, setIsGenMetadata] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);

  const [editPrompt, setEditPrompt] = useState('');

  // Description State
  const [descTopic, setDescTopic] = useState('');
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState(
    `🚀 Tham gia cộng đồng / Join Community ➡ https://www.skool.com/bimspeed-ai-expert-sharing-2563/about

👤 Facebook Cá Nhân / Personal Facebook: https://www.facebook.com/hoanghd218/

🏢 Fanpage: https://www.facebook.com/tonyhoangaixaydung/

💼 Linkedin: https://www.linkedin.com/in/hoanghd218/

📧 Email: hoang.tran@bimspeed.net`
  );

  // Drive State
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);

  // Compression state
  const [compressingId, setCompressingId] = useState<string | null>(null);

  // Refs for scrolling
  const metadataRef = useRef<HTMLDivElement>(null);

  // Reset save success message when active image changes (optional, but handling per image now)
  useEffect(() => {
    if (saveSuccessId) {
      const timer = setTimeout(() => setSaveSuccessId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccessId]);

  // AI INTERNAL LOGIC: Construct Prompt based on Psychology Flow
  useEffect(() => {
    // 1. Analyze Psychology Flow
    const psychologyContext = `Target Audience: ${config.audience}. Pain Point: ${config.painPoint}. Desire Loop: Moving from '${config.currentProblem}' to '${config.desiredResult}'. Emotion: ${config.emotionalState}.`;

    // 2. Visual Stun Gun Integration
    const stunGunInstructions = config.visualElements.length > 0
      ? `Visual Elements (MUST INCLUDE): ${config.visualElements.join(', ')}.`
      : '';

    // 3. Layout Specifics
    const layoutInstructions = config.layout.map(l => {
      if (l === 'A/B Split') {
        return 'Layout Option (A/B Split): Split screen composition. Left side represents the "Before/Problem" (darker/desaturated tones). Right side represents the "After/Result" (bright/vibrant tones). High contrast divider.';
      } else if (l === 'Symmetric') {
        return 'Layout Option (Symmetric): Perfectly centered composition. Main subject in the middle. Symmetrical background elements leading the eye to the center.';
      } else {
        return 'Layout Option (Rule of Thirds): Rule of thirds composition. Main subject placed on the dominant intersection line. Negative space used for text.';
      }
    }).join('\n');

    // 4. Character Logic
    let characterInstruction = 'No human characters. Focus entirely on the object/concept.';
    if (config.hasCharacter) {
      if (config.characterImage) {
        characterInstruction = `Foreground Character: Use the FIRST provided image as the main character reference. 
        CRITICAL: You MUST PRESERVE the EXACT POSE, GESTURE, and FACE of the character from the reference image. 
        Do not change the head angle, body position, or hand gestures. 
        Maintain the person's identity and key facial features perfectly. 
        Apply a ${config.characterExpression} expression to this character ONLY if it does not conflict with the pose, otherwise prioritize the original pose. 
        The character should be large, high clarity, and engaging.`;
      } else {
        characterInstruction = `Foreground Character: Generic human showing ${config.characterExpression} expression. (Warning: No specific character reference selected).`;
      }
    }

    // 5. Text Logic
    const textInstruction = config.thumbnailText
      ? `Overlay Text: "${config.thumbnailText.toUpperCase()}". Style: ${config.textStyle}. Goal: ${config.textGoal}. Text must be huge, readable, ensuring NO text in the bottom right corner (time stamp area).`
      : 'No overlay text.';

    // 6. Style & Color
    const styleInstruction = `Art Style: ${config.style}. Primary Color: ${config.primaryColor}. Contrast: High. ${config.hasShadow ? 'Deep drop shadows behind subject to separate from background.' : ''}`;

    // 7. Logo
    const logoInstruction = config.uploadedLogo ? 'Integrate the SECOND provided image (Logo) subtly in a corner (top left or top right), ensuring it looks like a watermark or brand element.' : '';

    // CONSTRUCT FINAL PROMPT
    const newPrompt = `
    [ROLE]: Professional YouTube Thumbnail Designer & Strategist.
    [OBJECTIVE]: Create a high-CTR (Click Through Rate) thumbnail.
    
    [SCENE DESCRIPTION]:
    ${layoutInstructions}
    ${psychologyContext}
    
    [SUBJECT]:
    ${characterInstruction}
    ${stunGunInstructions}

    [TEXT & GRAPHICS]:
    ${textInstruction}
    ${styleInstruction}
    ${logoInstruction}
    
    [TECHNICAL RULES]:
    - Aspect Ratio: ${config.aspectRatio}
    - Lighting: Cinematic, dramatic rim lighting.
    - Quality: 8k, ultra-detailed, sharp focus.
    - CRITICAL: Do not put any important visual or text in the bottom right corner.
    `;

    setPrompt(newPrompt.trim());

    // Auto-fill metadata topic
    if (!descTopic && config.mainTitle) {
      setDescTopic(`${config.mainTitle} - ${config.topic}`);
    }
  }, [config]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setConfig(prev => ({ ...prev, uploadedLogo: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setConfig(prev => ({ ...prev, uploadedLogo: null }));
  };

  // Library Interaction Handlers
  const handleCharacterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCharacterLibrary(prev => [base64String, ...prev]); // Add new image to the START
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFromLibrary = (src: string) => {
    setImageToCrop(src);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedBase64: string) => {
    setConfig(prev => ({ ...prev, characterImage: croppedBase64 }));
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageToCrop(null);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = "https://placehold.co/400x400/e2e8f0/64748b?text=Image+Not+Found";
    e.currentTarget.onerror = null; // Prevent infinite loop
  };

  const handleStunGunChange = (element: string) => {
    setConfig(prev => {
      const exists = prev.visualElements.includes(element);
      if (exists) {
        return { ...prev, visualElements: prev.visualElements.filter(e => e !== element) };
      } else {
        if (prev.visualElements.length >= 3) return prev; // Max 3
        return { ...prev, visualElements: [...prev.visualElements, element] };
      }
    });
  };

  const handleGenerateThumbnail = async () => {
    setIsGenThumbnail(true);

    try {
      // Support multiple prompts separated by "--- NEXT PROMPT ---"
      const prompts = prompt.split('--- NEXT PROMPT ---').map(p => p.trim()).filter(p => p);

      for (const p of prompts) {
        // Pass uploaded logo if available
        const base64Image = await generateThumbnail(
          p,
          {
            character: config.hasCharacter ? config.characterImage : undefined,
            logo: config.uploadedLogo
          },
          GeminiModel.PRO_IMAGE,
          config.aspectRatio
        );

        const newImage: GeneratedImage = {
          id: Date.now().toString() + Math.random().toString(), // Ensure unique ID
          url: base64Image,
          prompt: p, // Save specific prompt
          title: config.mainTitle || config.topic,
          createdAt: Date.now(),
          type: 'generated',
          aspectRatio: config.aspectRatio
        };

        setGeneratedImages(prev => [newImage, ...prev]);
        if (prompts.length === 1) setActiveImage(newImage); // Only auto-set active if 1 image
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate thumbnail. Please check your API key and try again.");
    } finally {
      setIsGenThumbnail(false);
    }
  };

  const handleEdit = async () => {
    if (!activeImage || !editPrompt) return;

    setIsEditing(true);
    try {
      // Use Nano/Flash for editing as per instructions
      const base64Image = await editThumbnail(activeImage.url, editPrompt);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: base64Image,
        prompt: `Edit: ${editPrompt}`,
        title: activeImage.title, // Inherit title
        createdAt: Date.now(),
        type: 'edited',
        aspectRatio: activeImage.aspectRatio // Preserve original ratio if possible, or undefined
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setActiveImage(newImage);
      setEditPrompt('');
    } catch (error) {
      alert("Failed to edit thumbnail. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const handleSelectEdit = (img: GeneratedImage) => {
    setActiveImage(img);
    setCurrentView(ViewMode.EDIT);
  };

  const handleDelete = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
    if (activeImage?.id === id) {
      setActiveImage(null);
    }
  };

  const handleDownload = async (img: GeneratedImage, compressed: boolean = false) => {
    if (!img) return;

    // Determine filename
    const safeTitle = sanitizeFilename(img.title || config.mainTitle || 'thumbnail');

    if (compressed) {
      setCompressingId(img.id);
      try {
        const { data, extension } = await compressImage(img.url, 1.95); // Target < 2MB
        const link = document.createElement('a');
        link.href = data;
        link.download = `${safeTitle}.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        alert("Could not compress image.");
      } finally {
        setCompressingId(null);
      }
    } else {
      // Original Download
      const link = document.createElement('a');
      link.href = img.url;
      link.download = `${safeTitle}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveToDrive = async (img: GeneratedImage) => {
    if (!img) return;

    setSavingId(img.id);
    setIsSavingToDrive(true);
    try {
      const safeTitle = sanitizeFilename(img.title || config.mainTitle || 'thumbnail');
      const filename = `${safeTitle}.png`;
      await saveImageToDrive(img.url, filename);
      setSaveSuccessId(img.id);
    } catch (error) {
      // Error handled in service (alerts user about missing ID) or console
    } finally {
      setIsSavingToDrive(false);
      setSavingId(null);
    }
  };

  const handleGenerateMetadata = async () => {
    if (!descTopic) return;
    setIsGenMetadata(true);
    try {
      const { description, hashtags, suggestedTitles } = await generateVideoMetadata(config.mainTitle, descTopic);

      setSuggestedTitles(suggestedTitles);
      const fullText = `${socialLinks}\n\n---\n\n🎬 Core Video Description\n\n${description}\n\n${hashtags}`;
      setGeneratedDesc(fullText);

      // Auto-scroll to results
      setTimeout(() => {
        metadataRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      alert("Failed to generate description.");
    } finally {
      setIsGenMetadata(false);
    }
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(generatedDesc);
  };

  const handleCopyTitle = (title: string) => {
    navigator.clipboard.writeText(title);
  };

  const handleOptimizePrompt = async () => {
    setIsOptimizingPrompt(true);
    try {
      const optimizations = await Promise.all(config.layout.map(async (layout: string) => {
        // Create temp config for this specific layout
        const tempConfig = { ...config, layout: layout };
        return await generateOptimizedPrompt(tempConfig);
      }));

      // Join with separator
      setPrompt(optimizations.join('\n\n--- NEXT PROMPT ---\n\n'));
    } catch (e) {
      alert("Failed to optimize prompt.");
    } finally {
      setIsOptimizingPrompt(false);
    }
  };

  const handleGenerateSuggestions = async () => {
    if (!config.topic || !config.mainTitle) {
      alert("Please enter both Topic and Video Title first.");
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      const suggestions = await generateFormSuggestions(config.topic, config.mainTitle);

      // Update config with AI suggestions
      setConfig(prev => ({
        ...prev,
        painPoint: suggestions.painPoint,
        currentProblem: suggestions.currentProblem,
        desiredResult: suggestions.desiredResult,
        emotionalState: suggestions.emotionalState,
        visualElements: suggestions.visualElements,
        thumbnailText: suggestions.thumbnailText,
        primaryColor: suggestions.primaryColor
      }));
    } catch (e) {
      console.error(e);
      alert("Failed to generate suggestions. Please check your API key and try again.");
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Cropper Modal */}
      {showCropper && imageToCrop && (
        <ImageCropper
          src={imageToCrop}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {/* Sidebar Navigation */}
      <div className="w-20 bg-white border-r border-slate-200 flex flex-col items-center py-6 gap-8 z-20 shadow-sm">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Layout className="text-white" />
        </div>

        <nav className="flex flex-col gap-6 w-full px-2">
          <button
            onClick={() => setCurrentView(ViewMode.GENERATE)}
            className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${currentView === ViewMode.GENERATE ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Monitor size={24} />
            <span className="text-[10px] font-medium">Studio</span>
          </button>

          <button
            onClick={() => setCurrentView(ViewMode.EDIT)}
            className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${currentView === ViewMode.EDIT ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Wand2 size={24} />
            <span className="text-[10px] font-medium">Edit</span>
          </button>

          <button
            onClick={() => setCurrentView(ViewMode.GALLERY)}
            className={`p-3 rounded-xl transition-all duration-200 flex flex-col items-center gap-1 ${currentView === ViewMode.GALLERY ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Grid size={24} />
            <span className="text-[10px] font-medium">Gallery</span>
          </button>
        </nav>

        <div className="mt-auto flex flex-col gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px]">
            <img src={user?.avatar || "https://picsum.photos/100/100"} alt="User" className="rounded-full w-full h-full object-cover border-2 border-white" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Background Grid Decoration */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{
          backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Configuration Panel (Left) */}
        {currentView !== ViewMode.GALLERY && (
          <div className="w-96 bg-white/95 backdrop-blur-md border-r border-slate-200 z-10 flex flex-col overflow-y-auto shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
            <div className="p-6 pb-2 sticky top-0 bg-white/95 z-20 border-b border-transparent">
              <h2 className="text-xl font-bold font-mono text-slate-900 flex items-center gap-2">
                {currentView === ViewMode.GENERATE && 'PSYCHOLOGY_FLOW'}
                {currentView === ViewMode.EDIT && 'EDIT_MODE'}
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
              </h2>
            </div>

            <div className="p-6 pt-2 space-y-8">
              {currentView === ViewMode.GENERATE && (
                <>
                  {/* 1. CORE INFO */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <BrainCircuit size={14} /> 1. Core Information
                    </div>
                    <Input
                      label="Video Topic"
                      value={config.topic}
                      onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                      placeholder="E.g. AI Agent Tutorial"
                    />
                    <Input
                      label="Video Title"
                      value={config.mainTitle}
                      onChange={(e) => setConfig({ ...config, mainTitle: e.target.value })}
                      placeholder="E.g. Don't use AI without this..."
                    />

                    {/* AI Auto-Suggest Button */}
                    <Button
                      onClick={handleGenerateSuggestions}
                      disabled={!config.topic || !config.mainTitle}
                      isLoading={isGeneratingSuggestions}
                      className="w-full"
                      variant="secondary"
                      icon={<Sparkles size={16} />}
                    >
                      ✨ AI Auto-Suggest
                    </Button>

                    <Select
                      label="Audience"
                      options={AUDIENCES}
                      value={config.audience}
                      onChange={(e) => setConfig({ ...config, audience: e.target.value as any })}
                    />
                    <Input
                      label="Pain Point"
                      value={config.painPoint}
                      onChange={(e) => setConfig({ ...config, painPoint: e.target.value })}
                      placeholder="E.g. Wasting time on boring tasks"
                    />
                  </section>

                  {/* 2. DESIRE LOOP */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <Sparkles size={14} /> 2. Desire Loop
                    </div>
                    <Input
                      label="Current Problem"
                      value={config.currentProblem}
                      onChange={(e) => setConfig({ ...config, currentProblem: e.target.value })}
                      placeholder="E.g. Confusion"
                    />
                    <Input
                      label="Desired Result"
                      value={config.desiredResult}
                      onChange={(e) => setConfig({ ...config, desiredResult: e.target.value })}
                      placeholder="E.g. Mastery/Success"
                    />
                    <Select
                      label="Emotional State"
                      options={EMOTIONS}
                      value={config.emotionalState}
                      onChange={(e) => setConfig({ ...config, emotionalState: e.target.value })}
                    />
                  </section>

                  {/* 3. VISUAL STUN GUN */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <AlertCircle size={14} /> 3. Visual Stun Gun (Max 3)
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {VISUAL_STUN_GUN.map(el => (
                        <label key={el} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-slate-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={config.visualElements.includes(el)}
                            onChange={() => handleStunGunChange(el)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`${config.visualElements.includes(el) ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>{el}</span>
                        </label>
                      ))}
                    </div>
                    {config.visualElements.length > 3 && (
                      <p className="text-xs text-red-500 font-medium">Please select maximum 3 elements.</p>
                    )}
                  </section>

                  {/* 4. LAYOUT */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <LayoutTemplate size={14} /> 4. Layout
                    </div>
                    <div className="flex flex-col gap-2">
                      {LAYOUTS.map(layout => (
                        <label key={layout} className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={config.layout.includes(layout)}
                            onChange={() => {
                              setConfig(prev => {
                                if (prev.layout.includes(layout)) {
                                  // Don't allow empty
                                  if (prev.layout.length === 1) return prev;
                                  return { ...prev, layout: prev.layout.filter(l => l !== layout) };
                                } else {
                                  return { ...prev, layout: [...prev.layout, layout] };
                                }
                              });
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>{layout}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* 5. CHARACTER (UPDATED FOR LIBRARY) */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <UserIcon size={14} /> 5. Character Library
                    </div>
                    <label className="flex items-center space-x-2 text-sm font-medium mb-2">
                      <input
                        type="checkbox"
                        checked={config.hasCharacter}
                        onChange={(e) => setConfig({ ...config, hasCharacter: e.target.checked })}
                      />
                      <span>Include Human Character?</span>
                    </label>

                    {config.hasCharacter && (
                      <div className="pl-0 space-y-4">
                        <p className="text-xs text-slate-500">Select a photo from your library to crop and use:</p>

                        {/* Library Grid */}
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                          {/* Upload/Add New Tile */}
                          <label className="aspect-square cursor-pointer rounded-md border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50 flex flex-col items-center justify-center transition-all group">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleCharacterUpload}
                            />
                            <Plus size={24} className="text-slate-400 group-hover:text-blue-500 mb-1" />
                            <span className="text-[10px] text-slate-500 group-hover:text-blue-600 font-medium">Add Photo</span>
                          </label>

                          {/* Render Library Items */}
                          {characterLibrary.map((src, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square cursor-pointer rounded-md overflow-hidden border border-slate-200 hover:border-blue-400 hover:ring-2 hover:ring-blue-200 transition-all group bg-slate-100"
                              onClick={() => handleSelectFromLibrary(src)}
                            >
                              <img
                                src={src}
                                className="w-full h-full object-cover"
                                alt={`Library ${idx}`}
                                onError={handleImageError}
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Crop size={16} className="text-white" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {config.characterImage && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3 items-center animate-in fade-in slide-in-from-top-2">
                            <div className="w-12 h-12 rounded overflow-hidden border border-green-300 flex-shrink-0 bg-white">
                              <img src={config.characterImage} className="w-full h-full object-cover" alt="Selected" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs font-bold text-green-700 flex items-center gap-1">
                                <Check size={12} /> Face Selected
                              </p>
                              <button
                                onClick={() => setConfig({ ...config, characterImage: null })}
                                className="text-[10px] text-red-500 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Trash size={10} /> Remove / Reselect
                              </button>
                            </div>
                          </div>
                        )}

                        <Select
                          label="Target Expression (AI Modifier)"
                          options={EXPRESSIONS}
                          value={config.characterExpression || ''}
                          onChange={(e) => setConfig({ ...config, characterExpression: e.target.value })}
                        />
                      </div>
                    )}
                  </section>

                  {/* 6. TEXT */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <Type size={14} /> 6. Text Overlay
                    </div>
                    <Input
                      label="Thumbnail Text (1-5 Words)"
                      value={config.thumbnailText}
                      onChange={(e) => setConfig({ ...config, thumbnailText: e.target.value })}
                      placeholder="E.g. STOP DOING THIS"
                      maxLength={30}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Select
                        label="Style"
                        options={TEXT_STYLES}
                        value={config.textStyle}
                        onChange={(e) => setConfig({ ...config, textStyle: e.target.value as any })}
                      />
                      <Select
                        label="Goal"
                        options={TEXT_GOALS}
                        value={config.textGoal}
                        onChange={(e) => setConfig({ ...config, textGoal: e.target.value as any })}
                      />
                    </div>
                  </section>

                  {/* 7. COLORS */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <Palette size={14} /> 7. Colors & Contrast
                    </div>
                    <Input
                      label="Primary Color"
                      value={config.primaryColor}
                      onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                      placeholder="E.g. Neon Green"
                    />
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={config.hasShadow}
                        onChange={(e) => setConfig({ ...config, hasShadow: e.target.checked })}
                      />
                      <span>Drop Shadow (Subject Separation)</span>
                    </label>
                  </section>

                  {/* 8. STYLE */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <ImageIcon size={14} /> 8. Visual Style
                    </div>
                    <Select
                      options={STYLES}
                      value={config.style}
                      onChange={(e) => setConfig({ ...config, style: e.target.value as any })}
                    />
                  </section>

                  {/* 9. VERSIONS */}
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg">
                      <Layers size={14} /> 9. Versions (Testing)
                    </div>
                    <div className="flex gap-4">
                      {['1', '3', '5'].map(v => (
                        <label key={v} className="flex items-center space-x-2 text-sm">
                          <input
                            type="radio"
                            name="version"
                            value={v}
                            checked={config.versionCount === v}
                            onChange={() => setConfig({ ...config, versionCount: v as any })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span>{v}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  {/* MISC & LOGO */}
                  <section className="space-y-4 border-t border-slate-200 pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-slate-500">Logo (Optional)</label>
                        <label htmlFor="logo-upload" className="cursor-pointer text-xs text-blue-600 hover:underline flex items-center gap-1">
                          <Upload size={12} /> Upload
                        </label>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </div>
                      {config.uploadedLogo && (
                        <div className="relative w-full h-16 bg-slate-100 rounded border border-slate-300 flex items-center justify-center group">
                          <img src={config.uploadedLogo} alt="Logo" className="h-full object-contain" />
                          <button onClick={handleRemoveLogo} className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100"><X size={10} /></button>
                        </div>
                      )}
                    </div>
                    <Select
                      label="Aspect Ratio"
                      options={ASPECT_RATIOS}
                      value={config.aspectRatio}
                      onChange={(e) => setConfig({ ...config, aspectRatio: e.target.value })}
                    />
                  </section>

                  <section className="space-y-4 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 p-2 rounded-lg justify-between">
                      <span className="flex items-center gap-2"><Wand2 size={14} /> AI Prompt Studio</span>
                      <Button
                        variant="ghost"
                        className="!p-1 h-6 text-[10px]"
                        onClick={handleOptimizePrompt}
                        isLoading={isOptimizingPrompt}
                      >
                        <Sparkles size={12} className="mr-1" /> Auto-Optimize
                      </Button>
                    </div>

                    <TextArea
                      label="Generation Prompt (AI or Manual)"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[150px] font-mono text-xs"
                      placeholder="Prompt will appear here..."
                    />
                  </section>

                  <div className="sticky bottom-0 bg-white/95 pt-4 pb-2 border-t border-slate-100">
                    <Button
                      onClick={handleGenerateThumbnail}
                      isLoading={isGenThumbnail}
                      className="w-full h-12 text-lg shadow-lg shadow-blue-500/20"
                      icon={<Wand2 size={20} />}
                    >
                      GENERATE ({config.versionCount})
                    </Button>
                  </div>
                </>
              )}

              {currentView === ViewMode.EDIT && (
                <div className="space-y-6">
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
                    <h3 className="text-sm font-medium text-slate-700 mb-2">Active Image</h3>
                    {activeImage ? (
                      <div className="w-full rounded overflow-hidden bg-slate-200" style={{ aspectRatio: (activeImage.aspectRatio || '16:9').replace(':', '/') }}>
                        <img src={activeImage.url} className="w-full h-full object-cover" alt="Active" />
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded flex flex-col items-center justify-center bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 text-xs">
                        <ImageIcon size={24} className="mb-2 opacity-50" />
                        Select an image from Gallery or Generate new
                      </div>
                    )}
                  </div>

                  <TextArea
                    label="EDIT INSTRUCTION"
                    placeholder="E.g. Add a red neon glow..."
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="min-h-[80px]"
                  />

                  <div className="pt-4">
                    <Button
                      onClick={handleEdit}
                      disabled={!activeImage || !editPrompt}
                      isLoading={isEditing}
                      className="w-full"
                      variant="secondary"
                      icon={<RefreshCcw size={18} />}
                    >
                      APPLY EDIT
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Workspace / Preview Area (Right) */}
        <div className="flex-1 bg-slate-100/50 relative flex flex-col overflow-hidden">
          {currentView === ViewMode.GALLERY ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-8 pb-0">
                <h1 className="text-3xl font-bold font-mono text-slate-900">DESIGN_GALLERY</h1>
              </div>
              <Gallery
                images={generatedImages}
                onSelectEdit={handleSelectEdit}
                onDelete={handleDelete}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col p-8 overflow-y-auto scroll-smooth">

              {/* IMAGE FEED SECTION */}
              <div className="mb-12 flex flex-col items-center justify-center w-full">

                {/* 1. Loading State */}
                {isGenThumbnail && (
                  <div className="mb-12 w-full max-w-5xl flex flex-col gap-4 items-center justify-center min-h-[300px] border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 animate-pulse transition-all">
                    <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-blue-600 font-mono font-bold tracking-widest">ANALYZING PSYCHOLOGY & GENERATING PIXELS...</p>
                  </div>
                )}

                {/* 2. Image Feed */}
                {generatedImages.length > 0 ? (
                  <div className="flex flex-col gap-16 w-full items-center">
                    {generatedImages.map((img) => (
                      <div key={img.id} className={`w-full flex flex-col gap-4 ${img.aspectRatio === '9:16' ? 'max-w-md' : 'max-w-5xl'}`}>
                        {/* Status/Header for Image Card */}
                        <div className="flex items-center justify-between px-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(img.createdAt).toLocaleTimeString()}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-1 rounded-full uppercase font-bold">{img.type}</span>
                        </div>

                        <div
                          className="relative group w-full shadow-xl rounded-xl overflow-hidden border border-slate-200 bg-white transition-all duration-300 hover:shadow-2xl"
                          style={{ aspectRatio: (img.aspectRatio || '16:9').replace(':', '/') }}
                        >
                          <img src={img.url} className="w-full h-full object-contain" alt="Result" />

                          {/* Overlay Actions */}
                          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button
                              variant="secondary"
                              onClick={() => handleSaveToDrive(img)}
                              isLoading={savingId === img.id}
                              className={`!p-2 backdrop-blur shadow-sm ${saveSuccessId === img.id ? 'bg-green-50 border-green-200 text-green-600' : 'bg-white/90'}`}
                            >
                              {saveSuccessId === img.id ? (
                                <><span className="mr-2 text-xs">SAVED</span> <Check size={16} /></>
                              ) : (
                                <><span className="mr-2 text-xs">SAVE TO DRIVE</span> <Cloud size={16} /></>
                              )}
                            </Button>

                            <div className="flex gap-2">
                              <Button variant="secondary" onClick={() => handleDownload(img, false)} className="!p-2 bg-white/90 backdrop-blur shadow-sm flex-1" title="Download Original">
                                <span className="mr-2 text-xs">PNG</span> <Download size={16} />
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => handleDownload(img, true)}
                                isLoading={compressingId === img.id}
                                className="!p-2 bg-white/90 backdrop-blur shadow-sm flex-1"
                                title="Download Compressed (<2MB)"
                              >
                                <span className="mr-2 text-xs">JPG</span> <FileImage size={16} />
                              </Button>
                            </div>

                            <Button
                              variant="secondary"
                              onClick={() => handleSelectEdit(img)}
                              className="!p-2 bg-white/90 backdrop-blur shadow-sm mt-1 text-blue-600 border-blue-100 hover:bg-blue-50"
                              title="Use for Editing"
                            >
                              <span className="mr-2 text-xs">EDIT THIS</span> <Wand2 size={16} />
                            </Button>
                          </div>
                        </div>

                        {/* Prompt/Analysis Display */}
                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                          <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Wand2 size={14} /> AI Creative Brief (Analysis & Prompt)
                          </h3>
                          <div className="text-xs text-slate-600 font-mono leading-relaxed break-words whitespace-pre-wrap select-all bg-slate-50 p-2 rounded border border-slate-100">
                            {img.prompt}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  !isGenThumbnail && (
                    <div className="flex flex-col items-center justify-center text-slate-400 w-full py-20 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <div className="w-24 h-24 mb-6 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center">
                        <Monitor className="text-slate-400 w-10 h-10" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-600">Studio Workspace</h3>
                      <p className="text-sm mt-2 max-w-xs text-center text-slate-500">Fill out the Psychology Flow on the left to generate high-conversion thumbnails.</p>
                    </div>
                  )
                )}
              </div>

              {/* METADATA RESULTS SECTION */}
              <div ref={metadataRef} className="max-w-5xl mx-auto w-full border-t border-slate-200 pt-8 mt-8">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                  <Type size={14} /> Content Metadata (Description & Tags)
                </div>

                {/* Metadata Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <TextArea
                    label="Video Summary (Auto-filled from Topic)"
                    value={descTopic}
                    onChange={(e) => setDescTopic(e.target.value)}
                    placeholder="Summary of video content..."
                    className="min-h-[120px]"
                  />
                  <TextArea
                    label="Social Links"
                    value={socialLinks}
                    onChange={(e) => setSocialLinks(e.target.value)}
                    className="min-h-[120px] text-xs font-mono"
                  />
                </div>

                <div className="mb-8">
                  <Button
                    onClick={handleGenerateMetadata}
                    isLoading={isGenMetadata}
                    variant="secondary"
                    className="w-full md:w-auto min-w-[200px]"
                    icon={<FileText size={18} />}
                  >
                    Generate Text Metadata
                  </Button>
                </div>

                {(suggestedTitles.length > 0 || generatedDesc || isGenMetadata) && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid gap-6">
                      {/* Titles */}
                      {suggestedTitles.length > 0 && (
                        <div className="bg-white border border-blue-200 rounded-xl shadow-sm overflow-hidden">
                          <div className="p-4 border-b border-blue-100 bg-blue-50/50 flex items-center justify-between">
                            <h3 className="font-bold text-blue-700 flex items-center gap-2">
                              <Sparkles size={18} className="text-blue-600" />
                              High-Conversion Title Ideas
                            </h3>
                          </div>
                          <div className="p-4 grid gap-3">
                            {suggestedTitles.map((title, idx) => (
                              <div key={idx} className="flex items-center justify-between group p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                                <span className="text-sm font-medium text-slate-800">{title}</span>
                                <Button
                                  variant="ghost"
                                  onClick={() => handleCopyTitle(title)}
                                  className="!p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Copy Title"
                                >
                                  <Copy size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[400px] relative">
                        {isGenMetadata && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                              <span className="text-xs font-bold text-blue-600 animate-pulse">WRITING METADATA...</span>
                            </div>
                          </div>
                        )}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                          <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <Youtube size={18} className="text-red-600" />
                            Description & Hashtags
                          </h3>
                          <Button
                            variant="secondary"
                            onClick={handleCopyDescription}
                            disabled={!generatedDesc}
                            className="!py-1 !px-3 text-xs"
                            icon={<Copy size={14} />}
                          >
                            Copy All
                          </Button>
                        </div>
                        <div className="flex-1 p-0 overflow-hidden">
                          <textarea
                            className="w-full h-full p-6 resize-none focus:outline-none font-mono text-sm text-slate-800 leading-relaxed"
                            value={generatedDesc}
                            onChange={(e) => setGeneratedDesc(e.target.value)}
                            placeholder={isGenMetadata ? "AI is thinking..." : "Generated description will appear here after you click 'Generate Text'."}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;