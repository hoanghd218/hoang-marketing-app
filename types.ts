export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  title?: string;
  createdAt: number;
  type: 'generated' | 'edited';
  aspectRatio?: string;
}

export interface ThumbnailConfig {
  // 1. Core Info
  topic: string;
  mainTitle: string; // Title
  audience: 'Newbie' | 'Experienced' | 'Urgent Problem';
  painPoint: string;

  // 2. Desire Loop
  currentProblem: string;
  desiredResult: string;
  emotionalState: string; // Shock, Surprise, Hope, Anger, Excitement

  // 3. Visual Stun Gun (Max 3)
  visualElements: string[];

  // 4. Layout
  // 4. Layout
  layout: string[];

  // 5. Character
  hasCharacter: boolean;
  characterImage?: string | null; // Base64 of selected character
  characterExpression?: string;

  // 6. Text
  thumbnailText: string; // 1-5 words
  textStyle: 'Big Bold' | 'Numbers/Symbols';
  textGoal: string; // Shock, Curiosity, Result, Mistake

  // 7. Colors
  primaryColor: string;
  contrastLevel: 'High';
  hasShadow: boolean;

  // 8. Style
  style: 'Hyper-realistic' | 'Cinematic' | 'YouTube Viral' | 'Clean Minimal' | 'Dramatic';

  // 9. Versions
  versionCount: '1' | '3' | '5';

  // Legacy/Misc
  uploadedLogo?: string | null;
  aspectRatio: string;
  signature: string;
}

export interface WatermarkConfig {
  watermarkText: string;
  watermarkType: 'subtle_text' | 'signature' | 'logo_text' | 'edge' | 'pattern' | 'hidden';
  brandTone: 'personal' | 'professional' | 'premium';
  platform: 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'website';
  imageStyle: 'portrait_ai' | 'lifestyle' | 'infographic' | 'thumbnail' | 'product';
  position: 'auto' | 'bottom_right' | 'bottom_left' | 'top_right' | 'top_left' | 'center' | 'edge' | 'tile_grid' | 'tile_brick';
  opacity: number;
  fontSize: number;
  rotation: number;
  colorMode: 'adaptive' | 'white' | 'black' | 'brand_color';
  repeatPattern: boolean;
  avoidFaces: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export enum ViewMode {
  GENERATE = 'GENERATE',
  EDIT = 'EDIT',
  GALLERY = 'GALLERY',
  WATERMARK = 'WATERMARK',
}

export enum GeminiModel {
  FLASH_IMAGE = 'gemini-3-pro-image-preview',
  PRO_IMAGE = 'gemini-3-pro-image-preview',
  FLASH_TEXT = 'gemini-3-pro-preview',
}