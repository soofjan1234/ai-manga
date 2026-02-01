# AI 漫剧 (AI-Manga)

![AI Manga Logo](public/favicon.ico)

AI 漫剧是一个基于 Google Gemini 3.0 模型驱动的**互动式全彩漫画创作平台**。通过结合文本生成与图像生成能力，用户可以仅通过文字描述，从零开始构建世界观、设定角色，并创作出具有连贯叙事的长篇漫画。

## 🌟 核心特性

- **🚀 全流程创作引导**：从背景设定、角色创建到分镜生成，直观的步骤导引式创作。
- **🧠 智能剧情生成**：
  - **世界观润色**：AI 自动丰富你的故事背景。
  - **首话智能策划**：一键生成具有视觉冲击力的开篇脚本。
  - **剧情分歧建议**：实时生成后续剧情选项，体验互动式创作。
- **🎨 角色一致性控制**：通过生成包含 6 个视角的手绘风格角色参考表，确保在后续漫画页中角色形象保持高度一致。
- **🖌️ 复古漫画美学**：精心设计的 Retro 漫画 UI 风格，提供极佳的创作仪式感。
- **💾 离线持久化存储**：基于 IndexedDB 的本地存储，确保你的创作进度永不丢失，并支持长图导出。
- **🔒 作品完结保护**：支持故事一键完结，完结后锁定创作流程进入“只读/展示模式”。

## 🛠️ 技术栈

- **框架**: [Next.js](https://nextjs.org/) (App Router)
- **模型**: [Google Gemini 3.0 Flash] (Text & Image)
- **状态管理**: React Context + Custom Hooks
- **持久化**: IndexedDB (LocalForage)
- **样式**: Tailwind CSS + Custom Retro Component System
- **图标**: Emoji & Custom SVG

## 📦 快速开始

### 1. 克隆项目
```bash
git clone <your-repository-url>
cd ai-manga
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
在项目根目录创建 `.env.local` 文件，并添加你的 Google AI API Key：
```env
GOOGLE_API_KEY=你的_GEMINI_API_KEY
TEXT_MODEL=gemini-3-flash-preview
IMAGE_MODEL=gemini-3-pro-image-preview
```

### 4. 运行开发服务器
```bash
npm run dev
```
打开 [http://localhost:3000](http://localhost:3000) 即可开始创作。

## 📖 创作流程说明

1. **STEP 01 - 背景设定**：输入你的故事大纲或使用“随个灵感”功能。AI 会帮你润色出极具画面感的世界观。
2. **STEP 02 - 角色设定**：根据背景 AI 会给出角色建议。生成角色的“参考表”是确保连贯性的关键。
3. **STEP 03 - 漫画创作**：
   - 使用“生成第一页”快速开场。
   - 在每一页创作后，从 AI 给出的三个剧情分歧中选择或自行输入大纲。
   - 支持“重新生成”或“保存并重分叉（Fork）”剧情。
4. **完结与分享**：点击顶部的“✓”完结作品，锁定剧情后可“导出长图”分享。

## 🤝 参与贡献

欢迎提交 Issue 或 Pull Request。对于重大修改，请先开启一个 Issue 进行讨论。

## 📄 开源协议

[MIT](LICENSE)
