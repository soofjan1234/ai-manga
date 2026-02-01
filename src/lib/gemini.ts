import { GoogleGenAI, Modality } from "@google/genai";

// 获取 API Key
function getApiKey(): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_API_KEY 未设置，请在 .env 文件中配置");
  }
  return key;
}

// 获取模型名称
function getImageModel(): string {
  return process.env.CHARACTERS_MODEL || process.env.IMAGE_MODEL || "gemini-2.0-flash-exp";
}

function getTextModel(): string {
  return process.env.TEXT_MODEL || "gemini-2.0-flash";
}

// 获取 AI 客户端
function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

// Base64 转 Gemini Part
function base64ToGeminiPart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.includes(",") ? base64.split(",")[1] : base64,
      mimeType,
    },
  };
}

/**
 * 根据描述生成角色表（6姿势：3头像+3全身）
 */
export async function generateCharacterImage(
  characterName: string,
  description: string
): Promise<string> {
  const prompt = `
你是一位专业的漫画艺术家。你的任务是为名为"${characterName}"的角色创建角色参考表。

**角色描述：**
${description}

**指示：**
1. **风格：** 以干净的全彩漫画风格生成表，适合艺术家参考。
2. **内容和布局：** 角色表必须包含恰好六个姿势，排列成两行：
   - **顶行（头像）：** 三个头像，显示不同视角和表情（例如：侧视、正视中性表情、正视微笑）。
   - **底行（全身）：** 三个全身视角（正面、侧面、背面）。
3. **角色一致性：** 所有六个姿势必须是同一个角色，保持外观特征（发型、服装、体型等）完全一致。
4. **背景：** 使用简洁的纯色或透明背景，突出角色本身。
5. **输出：** 仅生成最终角色表作为单一图像。不要在图像中包含任何文字、标签、名称、描述或解释。输出必须是纯图像。
  `.trim();

  const response = await getAiClient().models.generateContent({
    model: getImageModel(),
    contents: prompt,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (!response.candidates?.length) {
    throw new Error("AI 未返回有效响应");
  }

  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  );

  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }

  const textPart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.text
  );
  if (textPart?.text) {
    throw new Error(`AI 返回了文本而非图像: "${textPart.text}"`);
  }

  throw new Error("AI 未返回角色图像");
}

/**
 * 根据参考图像生成角色表
 */
export async function generateCharacterSheet(
  referenceImagesBase64: string[],
  characterName: string
): Promise<string> {
  const imageParts = referenceImagesBase64.map((base64) => {
    const mimeType =
      base64.match(/data:(image\/.*?);/)?.[1] || "image/png";
    return base64ToGeminiPart(base64, mimeType);
  });

  const prompt = `
    你是一位专业的漫画艺术家。你的任务是为名为"${characterName}"的角色创建角色参考表。

    **指示：**
    1.  **参考图像：**你获得了多个参考图像。综合所有图像的关键特征来创建单一、连贯的角色设计。例如，如果一张图像显示疤痕，另一张显示角色发型，最终设计中要包含两者。
    2.  **风格：**以干净的全彩漫画风格生成表，适合艺术家参考。
    3.  **内容和布局：**角色表必须包含恰好六个姿势，排列成两行：
        - **顶行（头像）：**三个头像，显示不同视角和表情（例如侧视、正视中性表情、正视微笑）。
        - **底行（全身）：**三个全身视角（正面、侧面和背面）。
    4.  **输出：**仅生成最终角色表作为单一图像。不要在回应中包含任何文字、标签、名称、描述或解释。输出必须是图像，别无其他。
  `.trim();

  const contents = {
    parts: [{ text: prompt }, ...imageParts],
  };

  const response = await getAiClient().models.generateContent({
    model: getImageModel(),
    contents,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (!response.candidates?.length) {
    throw new Error("AI 未返回有效响应");
  }

  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  );

  if (imagePart?.inlineData) {
    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }

  throw new Error("AI 未返回角色表图像");
}

/**
 * 编辑角色图像
 */
export async function editCharacterImage(
  imageBase64: string,
  characterName: string,
  editPrompt: string
): Promise<string> {
  const mimeType =
    imageBase64.match(/data:(image\/.*?);/)?.[1] || "image/png";
  const imagePart = base64ToGeminiPart(imageBase64, mimeType);

  const prompt = `
你是一位专业的漫画艺术家。请编辑名为"${characterName}"的角色图像。

**编辑请求：** ${editPrompt}

**指示：**
1. 在原图基础上进行修改
2. 保持角色的整体风格和设计
3. 仅应用用户请求的更改

**输出：** 仅生成修改后的图像，无文字。
  `.trim();

  const contents = {
    parts: [{ text: prompt }, imagePart],
  };

  const response = await getAiClient().models.generateContent({
    model: getImageModel(),
    contents,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (!response.candidates?.length) {
    throw new Error("AI 未返回有效响应");
  }

  const responseImagePart = response.candidates?.[0]?.content?.parts?.find(
    (part) => part.inlineData
  );

  if (responseImagePart?.inlineData) {
    return `data:${responseImagePart.inlineData.mimeType};base64,${responseImagePart.inlineData.data}`;
  }

  throw new Error("AI 未返回编辑后的图像");
}

/**
 * 根据故事背景自动生成角色建议
 */
export async function suggestCharacters(
  background: string,
  style: string
): Promise<{ name: string; description: string }[]> {
  const prompt = `
你是一位创意漫画编剧。根据以下故事背景，建议2-3个适合的角色。

**故事背景：**
${background}

**风格：** ${style || "通用"}

**要求：**
为每个角色提供：
1. 名字（简短易记）
2. 外观描述（包括年龄、性别、发型、服装等视觉特征）
3. 性格简述

以 JSON 数组格式返回，例如：
[
  {"name": "小明", "description": "16岁少年，黑色短发，穿着蓝色校服，性格开朗乐观"},
  {"name": "小雪", "description": "15岁少女，长发及腰，穿着白色连衣裙，聪明冷静"}
]
  `.trim();

  const response = await getAiClient().models.generateContent({
    model: getTextModel(),
    contents: prompt,
  });

  try {
    const text = response.text || '';
    // 提取 JSON 部分
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("未找到有效的 JSON");
  } catch (e) {
    console.error("解析角色建议失败:", e);
    // 返回默认角色
    return [];
  }
}

// 角色类型定义
export interface Character {
  name: string;
  sheetImage: string; // base64 格式的角色参考表
  description?: string;
}

// 上一页数据类型
export interface PreviousPageData {
  generatedImage: string;
  sceneDescription: string;
}

/**
 * 生成单页漫画
 */
export async function generateMangaPage(
  sceneDescription: string,
  characters?: Character[],
  previousPage?: PreviousPageData,
  generateEmptyBubbles: boolean = false,
  style: string = ""
): Promise<string> {
  // 调试日志
  console.log("--- 漫画生成请求 ---");
  console.log("场景描述:", sceneDescription);
  console.log("风格:", style || "未指定");
  console.log("角色数量:", characters?.length || 0);
  console.log("是否有上一页:", !!previousPage);
  console.log("生成空气泡:", generateEmptyBubbles);

  const charactersInScene = characters || [];

  // 准备角色参考图像
  const characterParts = charactersInScene.map(char => {
    const mimeType = char.sheetImage.match(/data:(image\/.*?);/)?.[1] || 'image/png';
    return base64ToGeminiPart(char.sheetImage, mimeType);
  });

  // 生成角色参考提示词
  const characterReferencePrompt = charactersInScene.map((char, index) =>
    `- **${char.name}:** 使用提供的角色参考表 ${index + 1}。`
  ).join('\n');

  const hasPreviousPage = previousPage && previousPage.generatedImage;

  // 上一页连续性指示
  const continuationInstruction = hasPreviousPage
    ? `
**关键背景 - 故事连续性：**
此页面必须是提供的上一页的直接延续。分析"上一页图像"及其脚本，以确保无缝的叙事和艺术连续性。保持角色外观、服装、位置和整体氛围与上一页一致。

**上一页脚本：**
---
${previousPage.sceneDescription}
---
`
    : '';

  // 素材列表
  const assetsPrompt = charactersInScene.length > 0
    ? `1.  **角色参考表：** 每个出现的角色都有对应的参考表。
    2.  **场景脚本：** 详细的分镜描述，包括动作、表情和构图。`
    : `1.  **场景脚本：** 详细的分镜描述，包括动作、表情和构图。`;

  const prompt = `
    你是一位专业的漫画艺术家。你的任务是基于提供的素材和详细脚本来创建单页漫画。

    **提供的素材：**
    ${hasPreviousPage ? '1.  **上一页图像：** 前一页的内容，用于故事背景。' : ''}
    ${hasPreviousPage ? assetsPrompt.replace(/^(\d+)/gm, (match, n) => `${parseInt(n) + 1}`) : assetsPrompt}

    ${charactersInScene.length > 0 ? `**角色参考：**
    ${characterReferencePrompt}` : ''}
    
    ${continuationInstruction}

    **新页面的指示：**
    1.  **关键 - 将姿势匹配到角色：** ${charactersInScene.length > 0 ? '你必须为每个角色使用正确的角色参考表，并根据脚本描述绘制他们的姿势和表情。' : '你必须根据脚本描述创建合适的角色姿势和表情。'}如果脚本中提到特定动作或表情，精确地绘制它们。
    2.  **严格遵循脚本：** 场景脚本是表情、镜头构图和叙事背景的指导。精确执行这些细节。如果脚本描述没有角色的场景（例如风景、物体特写），你必须绘制该场景而非角色。
    3.  **角色一致性和数量：** ${charactersInScene.length > 0 ? '严格按照角色参考表绘制角色外观。' : ''}**关键地，仅绘制脚本中为每个分镜指定的角色数量。不要添加额外角色或省略指定角色。**
    4.  **分镜布局和尺寸：** 你必须自动设计一个动态且视觉上有趣的分镜布局。**较大的分镜应以更多细节、动态构图和焦点描绘关键时刻。** 避免简单、无聊的网格布局。使用专业技术：
        - **动态角度：** 使用对角线切割的分镜来表现动作或不安。
        - **重叠和插入分镜：** 重叠分镜以显示同时发生的动作，或使用插入分镜来聚焦。
        - **变化的尺寸和形状：** 混合使用大分镜和小分镜。使用非矩形形状来匹配场景氛围。
        - **分镜突破：** 为了高冲击力，让角色或效果超出分镜边界。
    5.  **颜色和风格：** 以全彩创建漫画。${style ? `**艺术风格：${style}。**` : ''}**所有文字和对话气泡必须有粗体、清晰和厚实的黑色轮廓。**
    6.  **对话气泡：** ${generateEmptyBubbles ? '如果脚本包含对话，创建适当的对话气泡。你必须绘制这些对话气泡，但让它们完全空白。不要在内部添加任何文字、对话或音效。' : '如果脚本包含对话，创建适当的气泡并将对话文字放入其中。'}
    7.  **最终输出：** 仅生成最终漫画页作为单一图像。不要包含任何文字、描述或解释。

    **新页面的场景脚本：**
    ---
    ${sceneDescription}
    ---
  `.trim();

  // 构建 parts 数组
  const parts: ({ text: string; } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: prompt }];

  // 添加上一页图像
  if (hasPreviousPage) {
    const prevPageMimeType = previousPage.generatedImage.match(/data:(image\/.*?);/)?.[1] || 'image/png';
    parts.push(base64ToGeminiPart(previousPage.generatedImage, prevPageMimeType));
  }

  // 添加角色参考表
  parts.push(...characterParts);

  console.log("发送给 Gemini 的部件总数:", parts.length);

  const contents = { parts };

  const response = await getAiClient().models.generateContent({
    model: getImageModel(),
    contents,
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  if (!response.candidates?.length) {
    throw new Error("AI 未返回有效响应。可能被阻止。" + (response.text || ""));
  }


  let resultImage: string | null = null;
  let resultText: string | null = null;

  for (const part of response.candidates[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data || '';
      const mimeType = part.inlineData.mimeType || 'image/png';
      resultImage = `data:${mimeType};base64,${base64ImageBytes}`;
    } else if (part.text) {
      resultText = part.text;
    }
  }


  if (!resultImage) {
    throw new Error("AI 未返回图像。可能拒绝了请求。" + (resultText || ""));
  }

  return resultImage;
}

/**
 * 润色故事背景
 */
export async function polishBackground(
  background: string,
  style: string = ""
): Promise<string> {
  const prompt = `
你是一位专业的漫画编辑和编剧。你的任务是润色和丰富用户提供的漫画故事背景设定。

**原始背景：**
${background}

**风格：** ${style || "通用"}

**润色要求：**
1. **增强画面感：** 使用更具描述性的语言，让读者能脑补出画面。
2. **完善世界观：** 如果背景较简单，适当增加一些关于环境、氛围或冲突的细节。
3. **保持核心：** 不要改变用户原有的核心创意和情节。
4. **简洁有力：** 保持在 100 字左右，适合作为漫画的开篇设定。
5. **直接输出：** 只输出润色后的背景内容，不要包含任何多余的解释、回复或标题。

**润色后的背景设定：**
  `.trim();

  const response = await getAiClient().models.generateContent({
    model: getTextModel(),
    contents: prompt,
  });

  return response.text || background;
}

/**
 * 随机生成一个故事背景
 */
export async function generateBackground(style: string = ""): Promise<string> {
  const prompt = `
你是一位极其富有想象力的漫画编剧。请根据用户选择的风格，随机生成一个引人入胜、极具画面感的漫画故事背景设定。

**要求的风格：** ${style || "通用"}

**生成要求：**
1. **创意独特：** 避免陈词滥调，给出一个让人眼前一亮的世界观设定或开篇冲突。
2. **画面感极强：** 描述环境、氛围、关键符号或角色的初次登场状态。
3. **字数控制：** 保持在 100-150 字左右。
4. **适合展开：** 背景中应当埋下可以继续发展的钩子（Hook）。
5. **直接输出：** 只输出生成的背景内容，不要包含任何多余的解释、回复或标题。

**生成的故事背景设定：**
  `.trim();

  const response = await getAiClient().models.generateContent({
    model: getTextModel(),
    contents: prompt,
  });

  return response.text || "";
}

/**
 * 润色漫画大纲/分镜脚本
 */
export async function polishOutline(
  outline: string,
  style: string = ""
): Promise<string> {
  const prompt = `
你是一位专业的漫画编剧。你的任务是润色用户提供的单页漫画分镜大纲，使其描述更丰富、画面感更强，并更适合 AI 图像模型生成。

**原始大纲：**
${outline}

**整体风格：** ${style || "通用"}

**润色要求：**
1. **分镜化描述：** 如果大纲太笼统，将其拆解为更有画面感的动作描述（如：特写、全景、动态手势）。
2. **增强视觉细节：** 加入光影、构图或氛围相关的关键词。
3. **保持简短：** 保持在 50-100 字左右。
4. **直接输出：** 只输出润色后的大纲，不要包含任何分镜编号或多余的解释。

**润色后的内容：**
  `.trim();

  const response = await getAiClient().models.generateContent({
    model: getTextModel(),
    contents: prompt,
  });

  return response.text || outline;
}

/**
 * 根据故事背景和当前进度建议后续剧情选项
 */
export async function suggestStoryOptions(
  background: string,
  style: string = "",
  lastEpisodeOutline?: string,
  characters?: { name: string; description?: string }[]
): Promise<string[]> {
  const prompt = `
你是一位专业的互动漫剧编剧。请根据以下背景和故事进度，为用户提供 3 个简短的后续剧情发展选项。

**背景设定：**
${background}

**艺术风格：** ${style || "通用"}

${lastEpisodeOutline ? `**当前进度（上一话内容）：**\n${lastEpisodeOutline}` : "**当前进度：** 故事刚刚开始。"}

${characters && characters.length > 0 ? `**主要角色：**\n${characters.map(c => `- ${c.name}: ${c.description || "无详细描述"}`).join("\n")}` : ""}

**要求：**
1. **氛围一致性：** 必须严密契合当前章节的氛围（如治愈、悬疑、热血等），避免出现画风突变的跳跃感。
2. **逻辑自然：** 选项应是当前场景的自然延续，基于角色性格和物理环境做出合理反应。
3. **路径差异：** 3 个分支应提供不同的剧情侧重（例如：一个侧重于角色间的细腻互动，一个侧重于探索周围环境细节，一个侧重于推进核心事件进度）。
4. **简短有力：** 每个选项控制在 20 字以内，清晰描述下一步的动作或场景。
5. **直接输出：** 仅输出一个 JSON 字符串数组，不要包含任何编号、解释或引号外的文字。

**输出格式示例：**
["主角小心翼翼地走进山洞，发现洞壁闪烁着晶石的光芒。","主角在山洞口犹豫片刻，决定先在附近寻找求生工具。","主角正要进入山洞，远处传来一阵空灵而熟悉的呼唤声。"]

**建议选项：**
  `.trim();

  const response = await getAiClient().models.generateContent({
    model: getTextModel(),
    contents: prompt,
  });

  try {
    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (e) {
    console.error("解析剧情建议失败:", e);
    return [];
  }
}
