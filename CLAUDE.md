# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a YouTube thumbnail generation application built with React, TypeScript, and Vite. It uses Google Gemini AI (gemini-3-pro-image-preview and gemini-3-pro-preview) to generate high-CTR thumbnails based on a psychological design framework. The app includes thumbnail generation, editing, watermarking, and metadata generation features.

## Development Commands

- **Install dependencies**: `npm install`
- **Run development server**: `npm run dev` (runs on port 3000)
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

## Environment Setup

The app requires a Google Gemini API key:
1. Create a `.env` file in the root directory
2. Add `GEMINI_API_KEY=your_api_key_here`

## Architecture

### Core Application Flow

**Main Entry Point**: `index.tsx` → `App.tsx`

The application uses a **psychology-based thumbnail generation workflow** with 9 key configuration sections:

1. **Core Information** (topic, title, audience, pain point)
2. **Desire Loop** (current problem → desired result + emotional state)
3. **Visual Stun Gun** (max 3 attention-grabbing elements)
4. **Layout** (Symmetric, Rule of Thirds, A/B Split)
5. **Character Library** (user uploads and crops character images)
6. **Text Overlay** (thumbnail text with style/goal)
7. **Colors & Contrast** (primary color, shadow settings)
8. **Visual Style** (Hyper-realistic, Cinematic, YouTube Viral, etc.)
9. **Versions** (generates 1, 3, or 5 variations)

### Key Architectural Patterns

**State Management**: All state is centralized in `App.tsx` using React useState. The main config object (`ThumbnailConfig`) drives prompt generation via a `useEffect` hook that constructs the AI prompt whenever config changes.

**View Modes**: The app has 4 distinct views controlled by `ViewMode` enum:
- `GENERATE`: Main thumbnail creation interface
- `EDIT`: Edit generated images with text instructions
- `GALLERY`: Grid view of all generated images
- `WATERMARK`: Apply watermarks to images

**Image Processing Pipeline**:
1. User fills psychology flow form
2. `useEffect` auto-generates prompt from config
3. User can click "AI Auto-Suggest" to let AI fill form fields
4. User can click "Auto-Optimize" to have AI refine the prompt
5. On generate, `generateThumbnail()` sends prompt + reference images to Gemini
6. Generated images stored in `GeneratedImage[]` array
7. Images can be edited, watermarked, downloaded, or saved to Google Drive

**Character Library System**:
- Users upload character images to a local library
- Clicking a library image opens `ImageCropper` component
- Cropped image stored as base64 in `config.characterImage`
- This base64 reference image is sent to Gemini AI for identity preservation

**Dual Prompt System**:
- Manual prompt editing available in text area
- Support for multiple prompts using `--- NEXT PROMPT ---` separator
- Generates multiple variations in one API call

### Service Layer Architecture

**`services/geminiService.ts`**: Core AI service using `@google/genai` SDK
- `generateThumbnail()`: Main image generation (gemini-3-pro-image-preview)
- `editThumbnail()`: Image editing (gemini-2.5-flash-image)
- `generateVideoMetadata()`: Orchestrator for titles + descriptions/hashtags
- `generateYouTubeTitles()`: Vietnamese title suggestions (gemini-3-pro-preview)
- `generateYouTubeDescription()`: Bilingual description (VN + EN sections)
- `generateOptimizedPrompt()`: AI refines user's thumbnail config into optimized prompt
- `generateFormSuggestions()`: Auto-fills form fields based on topic/title
- `applyWatermark()`: AI-based watermark application (unused - canvas version preferred)

**`services/googleDriveService.ts`**: Google Drive integration
- Uses Google Identity Services (GIS) for OAuth
- Finds or creates "Thumbnail" folder in user's Drive
- Uploads base64 images as multipart/form-data
- Requires `CLIENT_ID` configuration (currently placeholder)

**`utils/imageUtils.ts`**: Client-side image utilities
- `sanitizeFilename()`: Creates safe filenames from titles
- `compressImage()`: Reduces image size under 2MB using canvas quality reduction
- `applyWatermarkCanvas()`: Canvas-based watermarking (pattern, signature, subtle text)

### Component Structure

**Components**:
- `Button`: Reusable button with loading states and variants
- `Input`, `Select`, `TextArea`: Form inputs with consistent styling
- `Gallery`: Grid view of generated images with hover actions
- `ImageCropper`: Modal component for cropping character images
- `AuthModal`: Placeholder for future authentication

### Type System

**Core Types** (`types.ts`):
- `ThumbnailConfig`: Complete configuration object for generation
- `WatermarkConfig`: Watermark settings (type, position, opacity, etc.)
- `GeneratedImage`: Result object with base64 URL, prompt, metadata
- `User`: User profile information
- `ViewMode`: Enum for app views
- `GeminiModel`: Enum for model selection

**Constants** (`constants.ts`):
- Predefined options for audiences, emotions, layouts, styles, etc.
- Watermark presets (personal branding, anti-repost, infographic)
- Default watermark configuration
- Mock user data

## Important Implementation Details

### Gemini API Integration

**Environment Variable**: Vite config maps `GEMINI_API_KEY` from `.env` to `process.env.API_KEY` and `process.env.GEMINI_API_KEY` for browser access.

**Reference Image Handling**: Character images sent as base64 `inlineData` with proper MIME type. Order matters: character image sent first, then logo (if provided).

**Image Generation Config**:
- Uses `imageConfig` with `aspectRatio` and `imageSize` (1K for Pro model)
- Parses response for `inlineData` parts containing generated images

### Prompt Engineering Strategy

The app uses a **multi-stage prompt strategy**:
1. User fills psychology-based form (pain points, emotions, visual elements)
2. `useEffect` constructs detailed prompt from config
3. Optional AI optimization via `generateOptimizedPrompt()`
4. Final prompt includes specific layout instructions, character preservation rules, text overlay requirements, and technical quality specs

**Critical Prompt Requirements**:
- Character identity preservation (1:1 face matching)
- Topic-specific background (no generic aesthetics)
- Layout-specific composition rules (Symmetric/Rule of Thirds/A/B Split)
- Text positioning rules (avoid bottom-right timestamp area)
- Instant clarity through visual cues

### Watermark System

**Dual Implementation**:
1. **AI-based** (`applyWatermark` in geminiService): Not actively used
2. **Canvas-based** (`applyWatermarkCanvas`): Active implementation

**Canvas Watermark Features**:
- Adaptive color sampling (detects background brightness)
- Pattern mode with diagonal repetition
- Signature mode with script font
- Position presets (auto, corners, center, edge)
- Opacity and scale controls

### Google Drive Integration

**Current Status**: Partially implemented. Requires:
1. Valid Google Cloud Client ID in `services/googleDriveService.ts`
2. Google Identity Services script loaded in index.html
3. OAuth 2.0 consent screen configured

**Multipart Upload**: Uses boundary-delimited multipart/form-data for uploading base64 images with metadata.

## Testing & Debugging

**Console Logging**: The app includes debug logs for:
- Reference image detection and processing
- API request composition
- Watermark configuration
- Generation errors

**Error Handling**: Try-catch blocks around all API calls with user-friendly alerts.

## File Upload Handling

**Character Images**:
1. User selects file → FileReader converts to base64
2. Added to `characterLibrary` state array
3. Click to crop → `ImageCropper` modal opens
4. Crop completes → base64 stored in `config.characterImage`

**Logo Images**:
- Direct upload without cropping
- Stored in `config.uploadedLogo`
- Sent to AI as second reference image

## Known Limitations

1. **Google Drive**: Requires OAuth setup (CLIENT_ID is placeholder)
2. **Base64 Memory**: All images stored in memory as base64 (no persistence)
3. **No Backend**: Fully client-side (API keys exposed in browser)
4. **Gemini Quotas**: Subject to API rate limits and quotas
5. **Cropping**: Uses react-easy-crop (assumed, implementation in ImageCropper)

## Development Workflow

1. **Adding New Form Fields**: Update `ThumbnailConfig` type, add to default config, add UI section in App.tsx
2. **Adding New AI Prompts**: Create new function in `geminiService.ts`, call from App.tsx handler
3. **Adding New Watermark Types**: Extend `WatermarkConfig` type and `applyWatermarkCanvas()` logic
4. **Modifying Prompt Template**: Edit the `useEffect` in App.tsx that constructs the prompt

## Styling Approach

- **Tailwind CSS**: Used via CDN (not build step)
- **Lucide React**: Icon library
- **Color System**: Blue/slate color scheme with semantic colors for sections
- **Responsive**: Uses Tailwind responsive classes (md:, lg:)
