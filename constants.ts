export const AUDIENCES = ['Newbie', 'Experienced', 'Urgent Problem'];

export const EMOTIONS = ['Shock', 'Surprise', 'Hope', 'Anger', 'Excitement'];

export const VISUAL_STUN_GUN = [
  'High Contrast Colors',
  'Big Face + Expression',
  'Curiosity Graph/Illusion',
  'Giant Text/Numbers',
  'Red Arrows/Circles',
  'Cinematic Aesthetic',
  'Collage Elements'
];

export const LAYOUTS = ['Symmetric', 'Rule of Thirds', 'A/B Split'];

export const EXPRESSIONS = ['Shocked', 'Surprised', 'Angry', 'Joyful', 'Worried', "Same with character reference image"];

export const TEXT_STYLES = ['Big Bold', 'Numbers/Symbols'];

export const TEXT_GOALS = ['Shock', 'Curiosity', 'Highlight Result', 'Highlight Mistake'];

export const STYLES = [
  'Hyper-realistic',
  'Cinematic',
  'YouTube Viral',
  'Clean Minimal',
  'Dramatic'
];

export const ASPECT_RATIOS = [
  '16:9',
  '9:16'
];

// Watermark Constants
export const WATERMARK_TYPES = [
  { value: 'subtle_text', label: 'Subtle Text' },
  { value: 'signature', label: 'Signature' },
  { value: 'logo_text', label: 'Logo + Text' },
  { value: 'edge', label: 'Edge' },
  { value: 'pattern', label: 'Pattern' },
  { value: 'hidden', label: 'Hidden' }
];

export const BRAND_TONES = [
  { value: 'personal', label: 'Personal' },
  { value: 'professional', label: 'Professional' },
  { value: 'premium', label: 'Premium' }
];

export const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'website', label: 'Website' }
];

export const IMAGE_STYLES = [
  { value: 'portrait_ai', label: 'Portrait AI' },
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'infographic', label: 'Infographic' },
  { value: 'thumbnail', label: 'Thumbnail' },
  { value: 'product', label: 'Product' }
];

export const WATERMARK_POSITIONS = [
  { value: 'auto', label: 'Auto (Smart Placement)' },
  { value: 'bottom_right', label: 'Bottom Right' },
  { value: 'bottom_left', label: 'Bottom Left' },
  { value: 'top_right', label: 'Top Right' },
  { value: 'top_left', label: 'Top Left' },
  { value: 'center', label: 'Center' },
  { value: 'edge', label: 'Edge' },
  { value: 'tile_grid', label: 'Tile Grid (Lưới)' },
  { value: 'tile_brick', label: 'Tile Brick (Sole)' }
];

export const COLOR_MODES = [
  { value: 'adaptive', label: 'Adaptive' },
  { value: 'white', label: 'White' },
  { value: 'black', label: 'Black' },
  { value: 'brand_color', label: 'Brand Color' }
];

export const DEFAULT_WATERMARK_CONFIG = {
  watermarkText: '@tranvanhoang.com',
  watermarkType: 'subtle_text' as const,
  brandTone: 'personal' as const,
  platform: 'instagram' as const,
  imageStyle: 'portrait_ai' as const,
  position: 'auto' as const,
  opacity: 0.08,
  fontSize: 40,
  rotation: 0,
  colorMode: 'adaptive' as const,
  repeatPattern: false,
  avoidFaces: true
};

export const WATERMARK_PRESETS = {
  personal_branding: {
    name: '🎯 Personal Branding (Instagram)',
    config: {
      watermarkType: 'subtle_text' as const,
      opacity: 0.07,
      fontSize: 30,
      position: 'bottom_right' as const,
      colorMode: 'adaptive' as const,
      avoidFaces: true
    }
  },
  anti_repost: {
    name: '🎯 AI Image – Anti Repost',
    config: {
      watermarkType: 'hidden' as const,
      opacity: 0.05,
      repeatPattern: false,
      brandTone: 'premium' as const
    }
  },
  infographic: {
    name: '🎯 Infographic / Educational',
    config: {
      watermarkType: 'edge' as const,
      opacity: 0.1,
      fontSize: 50
    }
  }
};

export const MOCK_USER = {
  id: 'usr_123456',
  name: 'Demo User',
  email: 'demo@manus.ai',
  avatar: 'https://picsum.photos/100/100'
};

// Assuming the user has these files in their public/images folder
export const PRELOADED_CHARACTERS = [
  '/images/char1.jpg',
  '/images/char2.jpg',
  '/images/char3.jpg',
  '/images/char4.jpg',
  '/images/char5.jpg',
  '/images/char6.jpg',
  '/images/char7.jpg',
  '/images/char8.jpg'
];