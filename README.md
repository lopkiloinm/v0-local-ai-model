<h1 align="center">OpenPrism - Client-Side AI Document Editor</h1>

<p align="center">
  <strong>Fully client-side AI-powered document editor. No servers. No Python. Just Next.js.</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> ·
  <a href="#-getting-started">Getting Started</a> ·
  <a href="#-how-it-works">How It Works</a> ·
  <a href="#-comparison">Comparison</a> ·
  <a href="#-deployment">Deployment</a>
</p>

<p align="center">
  <a href="https://github.com/yourusername/openprism/stargazers"><img src="https://img.shields.io/github/stars/yourusername/openprism?color=ffcb47&labelColor=black&style=flat-square" alt="Stars"></a>
  <a href="https://github.com/yourusername/openprism/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?labelColor=black&style=flat-square" alt="License"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js"></a>
  <a href="https://webgpu.io"><img src="https://img.shields.io/badge/WebGPU-Enabled-purple?style=flat-square&logo=webgpu&logoColor=white" alt="WebGPU"></a>
</p>

---

## 🎯 What is OpenPrism?

OpenPrism is a **fully client-side AI document editor** that runs entirely in your browser. Unlike traditional AI applications that require servers, Python environments, or local model installations, OpenPrism brings everything to the client using WebGPU and modern browser APIs.

### Key Philosophy

- ✅ **100% Client-Side**: Everything runs in your browser - no backend servers
- ✅ **Zero Setup**: No Python, no ONNX servers, no ollama.cpp installation
- ✅ **Privacy-First**: Your documents never leave your device
- ✅ **Resource Efficient**: Powered by LFM 2.5 1.2B model - small size, fast inference
- ✅ **User-Friendly**: Just open the app and start writing

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Chat Assistant** | Client-side AI powered by LFM 2.5 1.2B model via WebGPU |
| 📝 **LaTeX Editor** | Real-time LaTeX editing with live preview |
| 📄 **PDF Preview** | Integrated PDF viewer for document preview |
| 🎨 **Modern UI** | Beautiful, responsive interface built with Radix UI |
| 🌓 **Dark Mode** | Built-in theme switching |
| 💾 **Local Storage** | All documents stored locally in your browser |
| ⚡ **Fast Inference** | Optimized WebGPU inference for quick responses |
| 🔒 **Privacy** | Zero data transmission - everything stays local |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (or use pnpm/yarn)
- **Modern Browser** with WebGPU support:
  - Chrome/Edge 113+
  - Firefox 110+ (experimental)
  - Safari 18+ (experimental)

### Installation

Choose your preferred package manager:

**Using npm:**
```bash
npm install
```

**Using pnpm:**
```bash
pnpm install
```

**Using yarn:**
```bash
yarn install
```

### Development

Start the development server:

**With npm:**
```bash
npm run dev
```

**With pnpm:**
```bash
pnpm dev
```

**With yarn:**
```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Run

1. The app will automatically detect WebGPU support
2. On first use, the AI model (~1.2GB) will download to your browser cache
3. Subsequent visits use the cached model - no re-download needed
4. Start writing and chatting with the AI assistant!

---

## 🔧 How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│         Your Browser (Client)           │
├─────────────────────────────────────────┤
│  Next.js App (React)                    │
│  ├── LaTeX Editor                       │
│  ├── PDF Preview                        │
│  └── AI Chat Interface                  │
│                                         │
│  WebGPU Runtime                         │
│  ├── LFM 2.5 1.2B Model (ONNX)         │
│  └── Hugging Face Transformers.js       │
│                                         │
│  Browser Cache API                      │
│  └── Model files cached locally         │
└─────────────────────────────────────────┘
```

### Technology Stack

- **Framework**: Next.js 16 with React 19
- **AI Runtime**: Hugging Face Transformers.js
- **Model**: LFM 2.5 1.2B-Instruct-ONNX (Q4 quantized)
- **Acceleration**: WebGPU for GPU-accelerated inference
- **Document Rendering**: Typst & LaTeX.js
- **UI Components**: Radix UI + Tailwind CSS

### Model Details

- **Model**: LiquidAI/LFM2.5-1.2B-Instruct-ONNX
- **Size**: ~1.2GB (Q4 quantized)
- **Format**: ONNX for browser compatibility
- **Inference**: WebGPU-accelerated
- **Caching**: Browser Cache API + IndexedDB

---

## 📊 Comparison

### vs. Prismer.AI

| Feature | OpenPrism | Prismer.AI |
|---------|:---------:|:----------:|
| **Setup Required** | ❌ None - just open browser | ✅ ollama.cpp, Python, local installation |
| **Server Required** | ❌ No servers needed | ✅ Backend servers for some features |
| **Python Required** | ❌ Pure JavaScript/TypeScript | ✅ Python for model execution |
| **Local Installation** | ❌ Runs in browser | ✅ Requires local model setup |
| **Privacy** | ✅ 100% local - zero data leaves device | ⚠️ May require cloud services |
| **Resource Usage** | ✅ Optimized 1.2B model | ⚠️ Larger models, more resources |
| **Deployment** | ✅ Static hosting (Vercel, Netlify) | ⚠️ Requires server infrastructure |
| **User Experience** | ✅ Zero configuration | ⚠️ Setup and configuration needed |

### vs. Traditional AI Apps

| Feature | OpenPrism | Traditional AI Apps |
|---------|:---------:|:------------------:|
| **Backend Servers** | ❌ None | ✅ Required |
| **API Keys** | ❌ Not needed | ✅ Required |
| **Data Privacy** | ✅ Complete privacy | ⚠️ Data sent to servers |
| **Offline Support** | ✅ Works offline (after first load) | ❌ Requires internet |
| **Cost** | ✅ Free - no API costs | ⚠️ Pay-per-use or subscription |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Vercel will auto-detect Next.js
4. Deploy with one click!

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel
```

### Other Platforms

**Netlify:**
```bash
npm run build
# Deploy the .next folder
```

**Static Export:**
```bash
# Add to next.config.mjs:
output: 'export'

npm run build
# Deploy the 'out' folder
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🛠️ Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ide/              # IDE components
│   │   ├── ai-chat.tsx   # AI chat interface
│   │   ├── latex-editor.tsx
│   │   └── pdf-preview.tsx
│   └── ui/               # UI components
├── lib/                   # Utilities
│   └── webgpu-model.ts   # AI model loading & inference
└── public/               # Static assets
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### WebGPU Support

The app requires WebGPU for AI inference. Check support:

```javascript
if (navigator.gpu) {
  console.log('WebGPU supported!');
} else {
  console.log('WebGPU not available');
}
```

---

## 🔒 Privacy & Security

- **Zero Data Transmission**: All AI processing happens locally
- **No Tracking**: No analytics or user tracking
- **Local Storage**: Documents stored in browser only
- **No API Keys**: No external services required
- **Open Source**: Fully auditable codebase

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## ⭐ Star Us

If you find OpenPrism helpful, please consider giving us a star! It helps us grow and improve.

---

## 🙏 Acknowledgments

- [Hugging Face Transformers.js](https://github.com/huggingface/transformers.js) for browser-based AI
- [LiquidAI](https://huggingface.co/LiquidAI) for the LFM 2.5 model
- [Next.js](https://nextjs.org) for the amazing framework
- [Radix UI](https://www.radix-ui.com) for accessible components

---

<p align="center">
  <sub>Built for privacy, simplicity, and performance.</sub>
</p>
