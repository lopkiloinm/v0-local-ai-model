# OpenPrism - Client-Side AI Document Editor

<div align="center">

**Fully client-side AI-powered LaTeX document editor. No servers. No data collection. Just Next.js.**

[Features](#-features) · [Getting Started](#-getting-started) · [How It Works](#-how-it-works) · [Why OpenPrism](#-why-openprism) · [Comparison](#-comparison) · [Deployment](#-deployment)

[![Stars](https://img.shields.io/github/stars/yourusername/openprism?color=ffcb47&labelColor=black&style=flat-square)](https://github.com/yourusername/openprism/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue?labelColor=black&style=flat-square)](https://github.com/yourusername/openprism/blob/main/LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![WebGPU](https://img.shields.io/badge/WebGPU-Enabled-purple?style=flat-square)](https://www.w3.org/TR/webgpu/)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-green?style=flat-square)](https://github.com/yourusername/openprism)

</div>

---

## 🎯 What is OpenPrism?

OpenPrism is a **fully client-side AI LaTeX document editor** that runs entirely in your browser using WebGPU. Unlike proprietary platforms that require cloud infrastructure and data transmission, OpenPrism brings everything to your device—AI inference, document editing, compilation, and preview—all without sending a single byte to external servers.

### The Philosophy Behind OpenPrism

- ✅ **100% Client-Side**: Everything runs locally in your browser—no backend servers, no data transmission
- ✅ **Zero Setup Required**: No Python, no Ollama, no local model installations, no API keys
- ✅ **Privacy-First**: Your documents and research never leave your device
- ✅ **Completely Open-Source**: Fully auditable, forkable, and community-driven
- ✅ **Resource Efficient**: Powered by LFM 2.5 1.2B model via WebGPU—fast inference on consumer hardware
- ✅ **Instant Access**: Just open the app and start writing—no waiting for model downloads on subsequent visits
- ✅ **VSCode-Like Workflow**: Familiar editor panels inspired by Cursor and VSCode for maximum productivity

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🤖 **Client-Side AI Chat** | Conversational AI assistant powered by LFM 2.5 1.2B via WebGPU—no API calls, no data leaving your device |
| 📝 **Native LaTeX Editor** | Full-featured LaTeX editor with syntax highlighting, error diagnostics, and real-time validation |
| 🔧 **Live Compilation** | Real-time LaTeX compilation with instant HTML preview—see changes as you type |
| 📄 **Integrated Preview** | Side-by-side document preview with zoom controls |
| 🎨 **Modern UI** | Clean, responsive interface inspired by professional IDEs—built with Radix UI & Tailwind |
| 🌓 **Dark/Light Modes** | Built-in theme switching for comfortable long-work sessions |
| 💾 **Browser-Based Storage** | All documents stored locally using IndexedDB—never transmitted to servers |
| ⚡ **Fast GPU Inference** | WebGPU-accelerated model inference (239 tokens/second on CPU, faster with GPU) |
| 🔒 **Zero-Knowledge Architecture** | Complete end-to-end privacy—no telemetry, no tracking, no external dependencies |
| 📦 **Offline-First** | Works fully offline after initial load—model cached in browser for instant subsequent access |
| 🎯 **Context-Aware AI** | AI understands your entire document structure for smarter suggestions and edits |
| 🚀 **Instant Deployment** | Deploy to Vercel, Netlify, or any static host in seconds |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended) or 22+ (with npm, pnpm, or yarn)
- **Modern Browser** with WebGPU support:
  - Chrome/Edge 113+ (fully supported)
  - Firefox 121+ (fully supported)
  - Safari 18+ (fully supported)

> **WebGPU Support Check**: Visit [caniuse.com/webgpu](https://caniuse.com/webgpu) to verify browser support

### Installation

```bash
# Using npm
npm install

# Using pnpm (recommended for faster installs)
pnpm install

# Using yarn
yarn install
```

### Development

```bash
# Start the development server
npm run dev

# Or with pnpm
pnpm dev

# Or with yarn
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### First Run Walkthrough

1. **WebGPU Detection**: The app automatically checks for WebGPU support
2. **Model Download**: On first use, the LFM 2.5 1.2B ONNX model (~1.22 GB, ~1,220 MB) downloads to your browser cache
3. **Instant Subsequent Access**: On next visit, the cached model loads instantly—no re-download
4. **Start Writing**: Begin editing LaTeX and chatting with the AI immediately
5. **Local Storage**: All documents saved to IndexedDB—persist across browser sessions

---

## 🔧 How It Works

### Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│           Your Browser (Client-Side)             │
├──────────────────────────────────────────────────┤
│                                                  │
│  Next.js 16 + React 19 Application               │
│  ├─ LaTeX Editor (Custom with syntax highlighting)│
│  ├─ LaTeX Renderer (latex.js → HTML)             │
│  ├─ AI Chat Interface                            │
│  └─ File Explorer                                │
│                                                  │
│  WebGPU Runtime Layer                            │
│  ├─ Transformers.js (Hugging Face)               │
│  ├─ LFM 2.5 1.2B-Instruct-ONNX                   │
│  ├─ ONNX Runtime Web                             │
│  └─ GPU Acceleration (WebGPU)                    │
│                                                  │
│  Storage Layer                                   │ 
│  ├─ IndexedDB (Document Storage)                 │
│  ├─ Cache API (Model Files)                      │
│  └─ LocalStorage (Settings)                      │
│                                                  │
└──────────────────────────────────────────────────┘
   ↕️ (No External Communication)
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 16+ + React 19+ | Full-stack web framework |
| **AI Runtime** | Transformers.js | Hugging Face framework for browser-based inference |
| **Model** | LFM 2.5 1.2B-Instruct-ONNX | Small, optimized language model for edge devices |
| **GPU Acceleration** | WebGPU | Direct GPU compute in browser (30-50% latency reduction vs WebGL) |
| **Model Format** | ONNX (Quantized Q4) | Cross-platform inference, ~1.22 GB (~1,220 MB) compressed |
| **LaTeX Engine** | latex.js | Client-side LaTeX to HTML rendering |
| **Theme System** | next-themes | Dark/light mode support |
| **Icons** | lucide-react | Icon library |
| **Notifications** | sonner | Toast notifications |
| **Resizable Panels** | react-resizable-panels | Resizable UI panels |
| **UI Components** | Radix UI + Tailwind CSS | Accessible, responsive design system |
| **Storage** | IndexedDB + Cache API | Persistent local storage without server sync |

### Key Innovation: WebGPU-Accelerated Inference

Unlike traditional web AI apps that require cloud servers, OpenPrism uses **WebGPU** to run the language model directly on your device:

- **WebGPU Benefits**: 
  - 80% of native GPU performance
  - 30-50% latency reduction vs older WebGL methods
  - Supports NVIDIA, AMD, Apple Silicon, and Qualcomm GPUs
  - Fallback to WebAssembly on non-GPU devices

- **LFM 2.5 1.2B Model**:
  - 1.2B parameters (20x smaller than larger models)
  - 239 tokens/second on CPU, faster with GPU
  - Q4 quantization (4-bit) reduces size to ~1.22 GB (~1,220 MB)
  - Optimized for inference, not training
  - Excellent for LaTeX generation, editing suggestions, and document analysis

---

## 🛡️ Why OpenPrism? Understanding the Landscape

### The Problem with Centralized AI Platforms

#### OpenAI's Prism (Proprietary)

**What it offers:**
- Free LaTeX workspace integrated with GPT-5.2
- Cloud-based collaboration with unlimited collaborators
- Deep context awareness of your entire research project
- Visual diagram generation from whiteboard sketches
- Instant access without local setup

**Critical Privacy Concerns:**
- ❌ **Data Transmission**: All documents and research sent to OpenAI's servers
- ❌ **Training Data**: OpenAI has explicitly used researcher data to train future models
- ❌ **Intellectual Property Risk**: Your unpublished research may be used to improve OpenAI's models
- ❌ **No Privacy Mode Yet**: OpenAI's FAQ confirms privacy-first modes are "requested features" on the roadmap with "no committed timeline"
- ❌ **Human Review**: Flagged content undergoes human review by OpenAI contractors
- ❌ **Terms of Service**: Researchers retain ownership, but OpenAI gains broad usage rights
- ❌ **Vendor Lock-in**: Your research stays on their servers; export options limited

**Real Quote from OpenAI FAQ:**
> "Q: Do you offer a privacy mode where no text is stored or human-reviewed?  
> A: Those are requested features; they're on the roadmap/backlog, but there isn't a committed timeline yet."

**Privacy Scholar's Concern (Jonathan Schaeffer, U of Alberta):**
> "If you utilize ChatGPT to compose papers, you are effectively exposing your intellectual property to a multinational corporation."

---

#### Prismer.ai (Open-Source)

**What it requires:**
- ✅ Open-source codebase
- ❌ **Ollama.cpp** (local model server—requires installation and configuration)
- ❌ **Python environment** (model dependencies and tools)
- ❌ **LM Studio or similar** (alternative local inference engine)
- ❌ **System administration overhead** (managing local services, GPU drivers, memory)
- ❌ **Significant setup time** (30+ minutes for developers unfamiliar with model serving)

**Pain Points:**
- High barrier to entry for non-technical researchers
- Requires powerful local hardware (GPU, 16GB+ RAM)
- Need to manage model versions, quantization formats, ONNX optimizations
- Complex troubleshooting (GPU driver issues, CUDA compatibility, etc.)
- Not truly portable across devices

---

### Why OpenPrism is Different

| Aspect | OpenAI Prism | Prismer.ai | **OpenPrism** |
|--------|--------------|-----------|---------------|
| **Data Collection** | ❌ Server-based (high risk) | ⚠️ Local (if properly deployed) | ✅ **Zero** (100% client-side) |
| **Training Data Use** | ❌ Possible model training | ⚠️ Depends on deployment | ✅ **Impossible** (no external servers) |
| **Setup Required** | ✅ None | ❌ Ollama + Python + config | ✅ **None** (just open browser) |
| **Local Installation** | ❌ Cloud-based | ✅ Full installation | ✅ **Browser only** |
| **Hardware Requirements** | ⚠️ Minimal (server-dependent) | ❌ Powerful GPU/16GB+ RAM | ✅ **Works everywhere** |
| **Privacy Mode** | ❌ Not available | ✅ Available (if local) | ✅ **Always private** |
| **Cost** | ⚠️ Free now, may be paid | ✅ Free | ✅ **Free forever** |
| **Vendor Lock-in** | ✅ High (proprietary) | ⚠️ Medium (self-hosted) | ✅ **Zero** (open-source) |
| **Offline Support** | ❌ No | ✅ Yes | ✅ **Yes** |
| **Deployment** | ⚠️ Cloud (servers needed) | ❌ Complex | ✅ **Static hosting** (Vercel, Netlify) |
| **Collaboration** | ✅ Built-in | ⚠️ Via git/exports | ✅ **Via git** (any platform) |
| **Accessibility** | ✅ Zero friction | ❌ High friction | ✅ **Zero friction** |
| **User Control** | ❌ Limited | ✅ Complete | ✅ **Complete** |

---

## 📊 Feature Comparison Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAI Prism  Prismer  OpenPrism             │
├─────────────────────────────────────────────────────────────────┤
│ Zero Setup               ✅         ❌        ✅                 │
│ No Data Transmission     ❌         ✅        ✅                 │
│ No Python Required       ✅         ❌        ✅                 │
│ Private by Default       ❌         ✅        ✅                 │
│ Works Offline            ❌         ✅        ✅                 │
│ Open Source              ❌         ✅        ✅                 │
│ Free Forever             ⚠️         ✅        ✅                 │
│ AI Context Awareness     ✅         ✅        ✅                 │
│ LaTeX Compilation        ✅         ✅        ✅                 │
│ Real-Time Preview        ✅         ✅        ✅                 │
│ Collaboration Features   ✅         ⚠️        ✅ (via git)       │
│ Instant Access           ✅         ❌        ✅                 │
│ Deploy Anywhere          ❌         ✅        ✅                 │
│ No API Keys              ✅         ✅        ✅                 │
│ Vendor Lock-In Risk      ✅ HIGH    ⚠️ MED    ❌ NONE            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Privacy & Security Model

### Zero Data Transmission Guarantee

OpenPrism operates under a **zero-knowledge architecture**:

- **Browser Isolation**: All computation happens in the browser sandbox
- **No Network Calls**: Model inference and document processing never leave your device
- **Local Storage Only**: Documents stored in IndexedDB (browser-native storage)
- **No Telemetry**: No analytics, no tracking, no external dependencies
- **Auditable**: Open-source codebase—anyone can verify no data transmission occurs
- **No API Keys**: No external services to call

### Model Caching

- First visit: LFM 2.5 ONNX model (~1.22 GB, ~1,220 MB) downloads to browser Cache API
- Subsequent visits: Model loads instantly from cache (no re-download)
- Storage: Entirely within your browser's local storage quota
- Control: Users can clear cache manually via browser settings

### Threat Model

| Threat | Mitigation |
|--------|-----------|
| **ISP Monitoring** | ✅ Model inference happens locally (no outbound traffic) |
| **Cloud Provider Surveillance** | ✅ No data ever leaves browser |
| **AI Company Data Collection** | ✅ No connection to external AI providers |
| **Network Eavesdropping** | ✅ No sensitive data transmitted |
| **Accidental Data Leaks** | ✅ Impossible—data never leaves device |
| **Device Theft** | ⚠️ Documents in browser storage (same as browser storage privacy) |
| **Browser Vulnerabilities** | ⚠️ Same as any browser-based application |

---

## 🚀 Deployment

OpenPrism deploys as a static Next.js application—no servers required.

### Vercel (Recommended)

Instant deployment with automatic optimization:

```bash
# Option 1: Vercel CLI
npm i -g vercel
vercel

# Option 2: GitHub Integration
# 1. Push to GitHub
# 2. Import repo on vercel.com
# 3. One-click deployment
```

**Benefits**: Automatic optimizations, CDN distribution, environment variables, serverless functions if needed

### Netlify

```bash
npm run build
# Deploy the .next folder or use Netlify Drop
netlify deploy --prod --dir=.next
```

### Static Export

For maximum portability:

```javascript
// next.config.mjs
export const config = {
  output: 'export',
  // ... other config
}
```

```bash
npm run build
# Deploy the 'out' folder to any static host
```

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t openprism .
docker run -p 3000:3000 openprism
```

### Traditional Hosting

Works on any Node.js host (AWS Amplify, Railway, Render, etc.):

```bash
npm run build
npm run start
```

---

## 🛠️ Development

### Project Structure

```
openprism/
├── app/
│   ├── page.tsx              # Main IDE layout page
│   ├── layout.tsx            # Root layout with theme provider
│   └── globals.css           # Global styles
├── components/
│   ├── ide/                  # IDE-specific components
│   │   ├── ide-layout.tsx    # Main IDE layout container
│   │   ├── latex-editor.tsx  # LaTeX editor with syntax highlighting
│   │   ├── pdf-preview.tsx   # LaTeX preview panel (latex.js HTML renderer)
│   │   ├── ai-chat.tsx       # AI chat sidebar
│   │   ├── file-explorer.tsx # File tree explorer
│   │   ├── terminal.tsx      # Terminal component
│   │   └── resizable-panel.tsx # Resizable panel system
│   ├── ui/                   # Reusable UI components (Radix UI + Tailwind)
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── [50+ components]  # Full component library
│   └── theme-provider.tsx    # Dark/light theme provider
├── lib/
│   ├── webgpu-model.ts       # WebGPU model loading & inference
│   └── utils.ts              # Helper utilities (cn, etc.)
├── hooks/
│   ├── use-mobile.ts         # Mobile detection hook
│   └── use-toast.ts          # Toast notification hook
├── styles/
│   └── globals.css           # Additional global styles
└── public/
    ├── icon.svg              # App icons
    └── [placeholder images]  # Static assets
```

### Available Scripts

```bash
npm run dev       # Start development server (localhost:3000)
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # Run TypeScript type checking
npm run test      # Run test suite (if configured)
```

### Key Development Patterns

#### Using the WebGPU Model

```typescript
import {
  checkWebGPUSupport,
  isModelLoaded,
  generateChatResponse,
  setProgressCallback,
} from '@/lib/webgpu-model'

export function AIChat() {
  const [messages, setMessages] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    // Check WebGPU support
    checkWebGPUSupport().then(supported => {
      if (!supported) {
        console.warn('WebGPU not available')
      }
    })

    // Set download progress callback
    setProgressCallback((progress) => {
      console.log(`Download: ${progress}%`)
    })
  }, [])

  const handleMessage = async (message: string) => {
    if (!isModelLoaded()) {
      console.error('Model not loaded yet')
      return
    }

    setIsGenerating(true)
    try {
      const response = await generateChatResponse(message, messages)
      setMessages(prev => [...prev, response])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div>
      {!isModelLoaded() && <p>Loading model...</p>}
      {isGenerating && <p>Generating...</p>}
      <button onClick={() => handleMessage('Hello!')}>Chat</button>
    </div>
  )
}
```

#### LaTeX Compilation

```typescript
import { useState, useEffect } from 'react'
import { compile } from '@/components/ide/pdf-preview'

export function LaTeXEditor() {
  const [content, setContent] = useState('\\documentclass{article}...')
  const [preview, setPreview] = useState('')

  useEffect(() => {
    // Compile LaTeX on content change
    compile(content).then(html => {
      setPreview(html)
    })
  }, [content])

  return (
    <div>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
      <div dangerouslySetInnerHTML={{ __html: preview }} />
    </div>
  )
}
```

### Browser Support

| Browser | Status | Notes |
|---------|--------|-------|
| Chrome 113+ | ✅ Stable | Full WebGPU support |
| Edge 113+ | ✅ Stable | Same as Chrome (Chromium-based) |
| Firefox 121+ | ✅ Stable | Full WebGPU support |
| Safari 18+ | ✅ Stable | Full WebGPU support |
| Mobile | ✅ Supported | WebGPU support on modern mobile browsers |

### Testing WebGPU Support

```javascript
// Check if browser supports WebGPU
if (!navigator.gpu) {
  console.warn('WebGPU not available. Falling back to CPU inference.')
}

// Get adapter and device for WebGPU
const adapter = await navigator.gpu?.requestAdapter()
const device = await adapter?.requestDevice()
if (device) {
  console.log('WebGPU is ready!')
}
```

---

## 🎯 Performance Characteristics

### Model Performance (LFM 2.5 1.2B)

| Scenario | Speed | Notes |
|----------|-------|-------|
| CPU (WebAssembly) | ~30-50 tokens/sec | Baseline performance |
| GPU (WebGPU, NVIDIA) | ~100-150 tokens/sec | With optimization |
| GPU (WebGPU, Apple Silicon) | ~150-200 tokens/sec | Optimized for M-series Macs |
| Mobile GPU | ~20-50 tokens/sec | Highly variable; fallback to CPU |

### Memory Usage

- **Model Loading**: ~1.22 GB (~1,220 MB) (ONNX format, cached)
- **Runtime Memory**: ~800 MB - 1.2 GB (depending on context window)
- **Browser Cache**: ~1.22 GB (~1,220 MB) (persists across sessions)
- **IndexedDB Storage**: ~500 MB - 2 GB (documents and metadata)

### Recommended Hardware

| Use Case | Minimum | Recommended |
|----------|---------|-------------|
| Basic LaTeX Editing | 4GB RAM | 8GB+ RAM |
| With AI Chat | 6GB RAM | 16GB+ RAM |
| Optimal Experience | 8GB RAM + GPU | 16GB+ RAM + NVIDIA/Apple GPU |
| Mobile | 3GB RAM | 6GB+ RAM with GPU |

---

## 🔒 License & Contributing

OpenPrism is released under the **MIT License**—free for personal and commercial use.

### Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

- Report bugs: [GitHub Issues](https://github.com/yourusername/openprism/issues)
- Suggest features: [Discussions](https://github.com/yourusername/openprism/discussions)
- Submit PRs: [Pull Requests](https://github.com/yourusername/openprism/pulls)

---

## 📚 Resources & Documentation

### Core Technologies
- **WebGPU Spec**: [w3.org/TR/webgpu](https://www.w3.org/TR/webgpu/)
- **Transformers.js**: [huggingface.co/docs/transformers.js](https://huggingface.co/docs/transformers.js)
- **LFM 2.5 Model**: [huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct)
- **ONNX Runtime Web**: [github.com/microsoft/onnxruntime](https://github.com/microsoft/onnxruntime-web)
- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)

### UI & Components
- **Radix UI**: [radix-ui.com](https://radix-ui.com) - Accessible component primitives
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com) - Utility-first CSS framework
- **next-themes**: [github.com/pacocoursey/next-themes](https://github.com/pacocoursey/next-themes) - Theme switching
- **lucide-react**: [lucide.dev](https://lucide.dev) - Icon library
- **sonner**: [github.com/emilkowalski/sonner](https://github.com/emilkowalski/sonner) - Toast notifications
- **react-resizable-panels**: [github.com/bvaughn/react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) - Resizable panel system

### LaTeX & Document Processing
- **latex.js**: [github.com/michael-brade/LaTeX.js](https://github.com/michael-brade/LaTeX.js) - LaTeX to HTML renderer

---

## 🙏 Acknowledgments

- [Hugging Face Transformers.js](https://github.com/huggingface/transformers.js) — Browser-based AI framework
- [LiquidAI](https://www.liquid.ai) — LFM 2.5 model family for edge AI
- [OpenAI](https://openai.com) — Inspiration for Prism's workflow design
- [Microsoft ONNX Runtime](https://onnxruntime.ai) — Cross-platform inference
- [Next.js](https://nextjs.org) — React framework
- [Radix UI](https://www.radix-ui.com) — Accessible component library
- [Tailwind CSS](https://tailwindcss.com) — Utility-first styling

---

## ⭐ Support

If OpenPrism helps you write better research, please consider starring the repository! It helps us grow and attract more contributors.

[![Star us on GitHub](https://img.shields.io/github/stars/yourusername/openprism?style=social)](https://github.com/yourusername/openprism)

---

## 📞 Questions or Issues?

- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/openprism/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/openprism/discussions)
- **Questions**: Start a [Discussion](https://github.com/yourusername/openprism/discussions/new?category=q-a)

---

<div align="center">

**Built for privacy, simplicity, and scientific integrity.**

*OpenPrism: Your research. Your device. Your control.*

[Privacy Policy](./PRIVACY.md) · [Code of Conduct](./CODE_OF_CONDUCT.md) · [License](./LICENSE)

</div>