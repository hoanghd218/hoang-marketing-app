import { GoogleGenAI } from "@google/genai";
import { GeminiModel } from "../types";

// Helper to clean JSON string from Markdown code fences
const cleanJson = (text: string): string => {
  return text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
};

interface ReferenceImages {
  character?: string | null;
  logo?: string | null;
}

export const generateThumbnail = async (
  prompt: string,
  referenceImages: ReferenceImages = {},
  modelName: string = GeminiModel.PRO_IMAGE,
  aspectRatio: string = "16:9"
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const parts: any[] = [{ text: prompt }];

    // DEBUG: Log what reference images we received
    console.log('🔍 generateThumbnail - Reference Images:', {
      hasCharacter: !!referenceImages.character,
      hasLogo: !!referenceImages.logo,
      characterLength: referenceImages.character?.length,
      logoLength: referenceImages.logo?.length
    });

    // Order matters: Prompt text usually references "the first image" or "the character image".
    // We will append Character first, then Logo.

    if (referenceImages.character) {
      const cleanBase64 = referenceImages.character.includes(',')
        ? referenceImages.character.split(',')[1]
        : referenceImages.character;

      console.log('✅ Character image ADDED to parts array');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64
        }
      });
    } else {
      console.warn('⚠️ No character image provided to generateThumbnail');
    }

    if (referenceImages.logo) {
      const cleanBase64 = referenceImages.logo.includes(',')
        ? referenceImages.logo.split(',')[1]
        : referenceImages.logo;

      console.log('✅ Logo image ADDED to parts array');
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64
        }
      });
    }

    console.log('📤 Total parts being sent to API:', parts.length);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: modelName === GeminiModel.PRO_IMAGE ? "1K" : undefined,
        },
      },
    });

    // Parse response for image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated.");
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const editThumbnail = async (
  base64Image: string,
  instruction: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  // Guidelines specify using gemini-2.5-flash-image for editing/general tasks
  const modelName = GeminiModel.FLASH_IMAGE;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const cleanBase64 = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            text: instruction,
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64,
            },
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated from edit.");
  } catch (error) {
    console.error("Gemini Edit Error:", error);
    throw error;
  }
};

/**
 * PROMPT 1: Generate Title Suggestions
 */
const generateYouTubeTitles = async (ai: GoogleGenAI, title: string, topic: string): Promise<string[]> => {
  const modelName = GeminiModel.FLASH_TEXT;

  const prompt = `
    Bạn là một chuyên gia tối ưu hóa YouTube (YouTube Strategist) với thâm niên tăng CTR cho các kênh lớn.
    Nhiệm vụ của bạn là dựa vào chủ đề video tôi cung cấp, hãy tạo ra 5 tiêu đề thu hút theo 4 phong cách sau:

    1. Open a Loop (Mở vòng lặp tò mò): [Hành động cực đoan/Lạ lùng] + [Lý do bí ẩn].
    2. Outlier Structure (Cấu trúc thành công): "Tôi đã thử...", "X ngày...", "Và đây là kết quả".
    3. Power Words (Từ ngữ quyền lực): Sử dụng các tính từ mạnh (Cinematic, Pro, Bí mật, Sai lầm chết người...).
    4. Intake Speed (Ngắn gọn & Trực diện): Dưới 55 ký tự, đẩy từ khóa quan trọng lên đầu.
    5. The Contrast (Sự tương phản): [Điều ai cũng tin] vs [Sự thật phũ phàng].

    Yêu cầu:
    - Tiêu đề phải gợi cảm xúc: Tò mò, Sợ hãi (bỏ lỡ), hoặc Tham vọng (muốn đạt được).
    - Không dùng từ ngữ quá "rẻ tiền" (clickbait lừa dối), phải sát với giá trị video.
    - Ngôn ngữ: Tiếng Việt.

    Chủ đề video của tôi là: "${title} - ${topic}"

    Trả về kết quả dưới dạng JSON Array thuần túy, không có giải thích thêm:
    ["Tiêu đề 1", "Tiêu đề 2", "Tiêu đề 3", "Tiêu đề 4", "Tiêu đề 5"]
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: [{ text: prompt }] },
    config: { responseMimeType: "application/json" }
  });

  try {
    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("Error parsing titles:", e);
    return [];
  }
};

/**
 * PROMPT 2: Generate Description & Hashtags
 */
const generateYouTubeDescription = async (ai: GoogleGenAI, title: string, topic: string): Promise<{ description: string; hashtags: string }> => {
  const modelName = GeminiModel.FLASH_TEXT;

  const prompt = `
    You are a YouTube SEO Expert. 
    Video Title: "${title}"
    Topic/Context: "${topic}"

    Goal: Generate a high-conversion video description in two distinct, non-overlapping language sections.

    Output Requirements:
    
    SECTION 1: VIETNAMESE (Tiếng Việt)
    - Write a detailed, engaging Core Video Description in Vietnamese (approx 100-150 words).
    - Immediately following the description, list 15 high-ranking hashtags in VIETNAMESE (e.g., #tu_khoa).
    
    SECTION 2: ENGLISH (Tiếng Anh)
    - Write a detailed, engaging Core Video Description in English (approx 100-150 words).
    - Immediately following the description, list 15 high-ranking hashtags in ENGLISH (e.g., #keyword).

    CRITICAL INSTRUCTION: 
    - Put ALL Vietnamese content in the 'vietnameseSection' field.
    - Put ALL English content in the 'englishSection' field.
    - Do not mix languages within a section.
    
    Return result in JSON format:
    {
      "vietnameseSection": "Full VN Description \n\n #VNHashtags ...",
      "englishSection": "Full EN Description \n\n #ENHashtags ..."
    }
  `;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: { parts: [{ text: prompt }] },
    config: { responseMimeType: "application/json" }
  });

  try {
    const text = response.text || "{}";
    const json = JSON.parse(text);

    // Combine sections with a separator for the final UI
    const fullDescription = `${json.vietnameseSection}\n\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\n${json.englishSection}`;

    return {
      description: fullDescription,
      hashtags: "" // Tags are already included inside the sections above
    };
  } catch (e) {
    console.error("Error parsing description:", e);
    return { description: "", hashtags: "" };
  }
};

/**
 * Main Orchestrator
 */
export const generateVideoMetadata = async (
  title: string,
  topic: string
): Promise<{ description: string; hashtags: string; suggestedTitles: string[] }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Execute both prompts in parallel for efficiency
    const [titles, descData] = await Promise.all([
      generateYouTubeTitles(ai, title, topic),
      generateYouTubeDescription(ai, title, topic)
    ]);

    return {
      description: descData.description,
      hashtags: descData.hashtags,
      suggestedTitles: titles
    };

  } catch (error) {
    console.error("Gemini Metadata Gen Error:", error);
    throw error;
  }
};

/**
 * PROMPT 3: Generate Optimized Image Prompt
 */
export const generateOptimizedPrompt = async (config: any): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = GeminiModel.FLASH_TEXT;

  let imagePart = null;
  if (config.characterImage) {
    const cleanBase64 = config.characterImage.includes(',')
      ? config.characterImage.split(',')[1]
      : config.characterImage;

    imagePart = {
      inlineData: {
        mimeType: 'image/png',
        data: cleanBase64
      }
    };
  }

  const prompt = `
  You are a World-Class AI Art Director & YouTube Thumbnail Strategist.

GOAL:
Generate ONE single YouTube thumbnail image prompt for Nano Banana Pro that makes the viewer instantly understand what the video is about at a glance (topic + title clarity in 1 second) while maximizing CTR.

INPUTS:
- Topic: "${config.topic}"
- Video Title: "${config.mainTitle}"
- Audience: "${config.audience}"
- Pain Point: "${config.painPoint}"
- Emotion: "${config.emotionalState}"
- Layout: "${config.layout}"
- Style: "${config.style}"
- Primary Color: "${config.primaryColor}"
- Text Overlay: "${config.thumbnailText}"
${config.characterImage ? "- REFERENCE IMAGE PROVIDED: Use the attached image as the ONLY source for the character identity." : ""}

CRITICAL PRIORITY #0 — INSTANT CLARITY (NO GENERIC BACKGROUND):
- The thumbnail MUST visually communicate the video’s Topic + Title clearly.
- Background/props MUST be directly related to the Topic and the exact promise of the Title.
- NO random aesthetics: no generic gradients, random bokeh, random city/space backgrounds unless they are explicitly relevant to Topic/Title.
- Include 2–4 literal, recognizable “TOPIC CUES” that make the viewer understand the subject immediately.
  Examples of topic cues:
  - YouTube growth: YouTube analytics panel, CTR gauge, rising graph arrow, thumbnail grid, video upload UI.
  - Thumbnails: thumbnail before/after comparison, Photoshop-like bounding boxes, bold text overlay examples, click-through meter.
  - SEO: search bar, keyword tags, ranking list.
- Make the cues simple and iconic (big shapes, minimal clutter).

CRITICAL PRIORITY #1 — CHARACTER IDENTITY LOCK (IF REFERENCE IMAGE EXISTS):
${config.characterImage ? `
- Use the reference image as the exact person/character.
- The face MUST match 1:1: same identity, same facial structure, same skin tone, same eyes, same nose, same lips, same jawline, same hairstyle.
- Preserve the body proportions and overall silhouette.
- Preserve the original pose/gesture as much as possible.
- Do NOT change gender, age, ethnicity, face shape, or any defining feature.
- Clothing must remain the same as reference unless user explicitly requested clothing changes (default: keep clothing identical).
- Expression rule:
  ${config.characterExpression ? `You MAY apply expression: "${config.characterExpression}" but identity and face structure must remain identical.` : `Do NOT change facial expression. Keep it identical to the reference.`}

NEGATIVE (ABSOLUTE DO-NOT):
- different person, face swap, new face, altered identity, changed hairstyle, changed outfit, altered facial proportions, plastic skin, over-beautify, age change, gender change, ethnicity change, cartoon face, anime face, mask, deformed hands, extra fingers, blurry face, low-res face, weird eyes, artifacts
` : `
- No reference image provided: Create a character that strongly conveys Emotion "${config.emotionalState}" and matches Audience "${config.audience}".
`}

CRITICAL PRIORITY #2 — VISUAL THESIS (THE “ONE-GLANCE STORY”):
- Convert the Title into one clear visual statement (a literal scene metaphor).
- Show the “problem → consequence → solution hint” using only 2–4 elements maximum.
- The viewer should understand:
  (1) What topic this is (Topic Cues),
  (2) What’s wrong / pain point (Pain Point cue),
  (3) What outcome is promised (Solution cue / contrast / highlight).

THUMBNAIL COMPOSITION RULES:
- Aspect ratio: 16:9 (YouTube thumbnail), ultra sharp, high contrast, readable at small size.
- Main subject must be BIG (close-up head + shoulders), crisp focus on face.
- Keep the scene readable: large shapes, strong separation, minimal clutter.
- Leave CLEAN negative space for text (avoid busy background behind text).
- Depth separation: subject pops from background (rim light / edge light / subtle blur only behind).

LAYOUT LOGIC (MUST FOLLOW EXACTLY):
- If Layout = "Symmetric": centered hero composition; subject in the middle; balanced topic cues left/right.
- If Layout = "Rule of Thirds": subject on left or right third; opposite side reserved for BIG topic cues + text.
- If Layout = "A/B Split": a clear split screen with visible divider line:
  Left = BEFORE/Problem scene that visually shows "${config.painPoint}" (negative cue).
  Right = AFTER/Solution scene that visually shows the promised improvement tied to "${config.mainTitle}" (positive cue).
  Both sides MUST include relevant topic cues (not just color change).

EMOTION CONTROL:
${config.characterImage ? `
- Do NOT change the character’s facial expression if locked.
- Push Emotion "${config.emotionalState}" through background, lighting, color grading, icons, UI elements ONLY.
` : `
- The character’s facial expression AND the scene must strongly convey Emotion "${config.emotionalState}".
`}

STYLE (MATCH "${config.style}"):
- YouTube viral thumbnail: punchy contrast, sharp subject cutout feel, clean background shapes, bold graphic accents, minimal clutter.
- Use Primary Color "${config.primaryColor}" as the strongest accent (glow, strokes, shapes, highlights), but keep clarity first.

TEXT OVERLAY (MUST BE PERFECT):
- Text: "${config.thumbnailText}"
- Position: LOWER CENTER, BELOW the chin, overlaying upper chest/neck area.
- Must be HUGE, BOLD, ultra legible, topmost layer, not covered by any object.
- Add CTR treatment: thick stroke/outline + drop shadow + high contrast vs background.

OUTPUT REQUIREMENTS:
- Return ONLY the final raw image prompt text (no explanations, no headings, no bullet points).
- Must be a single cohesive prompt that Nano Banana Pro can render.

  `;

  try {
    const parts: any[] = [{ text: prompt }];
    if (imagePart) {
      parts.push(imagePart);
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts }
    });

    return response.text || "Failed to generate prompt.";
  } catch (error) {
    console.error("Gemini Prompt Gen Error:", error);
    return "Failed to generate prompt due to error.";
  }
};

/**
 * PROMPT 4: Generate Form Suggestions based on Topic and Title
 */
export const generateFormSuggestions = async (
  topic: string,
  mainTitle: string
): Promise<{
  painPoint: string;
  currentProblem: string;
  desiredResult: string;
  emotionalState: string;
  visualElements: string[];
  thumbnailText: string;
  primaryColor: string;
}> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = GeminiModel.FLASH_TEXT;

  const prompt = `
You are a YouTube Thumbnail Psychology Expert and Content Strategist.

TASK: Analyze the following video topic and title, then generate optimal form field suggestions for creating a high-CTR YouTube thumbnail.

INPUT:
- Topic: "${topic}"
- Video Title: "${mainTitle}"

ANALYSIS REQUIREMENTS:
1. Understand the core message and audience intent
2. Identify the main pain point viewers face related to this topic
3. Determine the emotional hook that will drive clicks
4. Select visual elements that maximize attention
5. Craft punchy thumbnail text (1-5 words max, under 30 chars)

OUTPUT FORMAT (JSON):
{
  "painPoint": "A concise pain point (e.g., 'Low Click Through Rate', 'Wasting Time', 'No Results')",
  "currentProblem": "Current state/problem (1-2 words, e.g., 'Ignored Content', 'Confusion', 'Slow Growth')",
  "desiredResult": "Desired outcome (1-2 words, e.g., 'Viral Views', 'Mastery', 'Freedom')",
  "emotionalState": "Primary emotion - MUST be one of: Shock, Surprise, Hope, Anger, Excitement",
  "visualElements": ["Element1", "Element2", "Element3"],
  "thumbnailText": "PUNCHY TEXT HERE (1-5 words, under 30 chars, ALL CAPS)",
  "primaryColor": "Color name (e.g., 'Neon Red', 'Electric Blue', 'Vibrant Purple', 'Neon Green')"
}

VISUAL ELEMENTS - Choose exactly 3 from this list that best fit the topic/title:
- "High Contrast Colors"
- "Big Face + Expression"
- "Curiosity Graph/Illusion"
- "Giant Text/Numbers"
- "Red Arrows/Circles"
- "Cinematic Aesthetic"
- "Collage Elements"

RULES:
- thumbnailText: Must be attention-grabbing, create curiosity or urgency
- emotionalState: Must match the title's tone (tutorial = Surprise/Hope, warning = Shock/Anger, achievement = Excitement)
- visualElements: Exactly 3 elements
- primaryColor: Choose vivid, high-energy colors that match the emotional state
- All responses must be in English

Return ONLY valid JSON, no explanations.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: "application/json" }
    });

    const text = response.text || "{}";
    const suggestions = JSON.parse(text);

    // Validate and ensure correct format
    return {
      painPoint: suggestions.painPoint || "Low Engagement",
      currentProblem: suggestions.currentProblem || "Struggling",
      desiredResult: suggestions.desiredResult || "Success",
      emotionalState: suggestions.emotionalState || "Excitement",
      visualElements: Array.isArray(suggestions.visualElements)
        ? suggestions.visualElements.slice(0, 3)
        : ["High Contrast Colors", "Big Face + Expression", "Giant Text/Numbers"],
      thumbnailText: suggestions.thumbnailText || "WATCH THIS",
      primaryColor: suggestions.primaryColor || "Neon Red"
    };
  } catch (error) {
    console.error("Gemini Form Suggestions Error:", error);
    throw error;
  }
};