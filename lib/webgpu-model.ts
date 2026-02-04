// Dynamic import to avoid SSR issues
let AutoModelForCausalLM: any = null;
let AutoTokenizer: any = null;

const MODEL_ID = "LiquidAI/LFM2.5-1.2B-Instruct-ONNX";
const MODEL_DTYPE = "q4"; // Use Q4 for WebGPU (recommended)

// Model files to download
const MODEL_FILES = [
  "onnx/model_q4.onnx", // ~173 KB
  "onnx/model_q4.onnx_data", // ~1.22 GB
];

// Hugging Face CDN base URL
const HF_CDN_BASE = "https://huggingface.co";

// Cache name for Cache API storage (disk cache)
const CACHE_NAME = `openprism-model-${MODEL_ID}`;

// Check if running in v0 preview environment
function isV0Preview(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname.includes("v0.dev") || 
         window.location.hostname.includes("vusercontent.net") ||
         document.querySelector('script[src*="esm.v0.app"]') !== null;
}

// Lazy load the transformers library only in browser
async function loadTransformers() {
  if (typeof window === "undefined") {
    throw new Error("Transformers library can only be loaded in browser");
  }
  
  // v0 preview doesn't support the transformers library due to module proxy issues
  if (isV0Preview()) {
    throw new Error("V0_PREVIEW_UNSUPPORTED");
  }
  
  if (!AutoModelForCausalLM || !AutoTokenizer) {
    const transformers = await import("@huggingface/transformers");
    
    // Disable worker threads for browser compatibility
    transformers.env.useBrowserCache = true;
    transformers.env.allowLocalModels = false;
    transformers.env.backends.onnx.wasm.numThreads = 1;
    
    AutoModelForCausalLM = transformers.AutoModelForCausalLM;
    AutoTokenizer = transformers.AutoTokenizer;
  }
  
  return { AutoModelForCausalLM, AutoTokenizer };
}

export { isV0Preview };

let model: any = null;
let tokenizer: any = null;
let isLoading = false;
let loadPromise: Promise<void> | null = null;
let downloadProgress = 0;
let progressCallback: ((progress: number, stats?: DownloadStats) => void) | null = null;
let isDownloadPhase = true; // Track if we're in download phase or loading phase

// Download statistics
export interface DownloadStats {
  downloadedBytes: number;
  totalBytes: number;
  speedBytesPerSecond: number;
}

let currentStats: DownloadStats = {
  downloadedBytes: 0,
  totalBytes: 0,
  speedBytesPerSecond: 0,
};

// Background download state
let backgroundDownloadScheduled = false;
let backgroundDownloadTimeout: ReturnType<typeof setTimeout> | null = null;
let isBackgroundDownloading = false;



/**
 * Update progress and notify callback
 */
function updateProgress(progress: number, stats?: Partial<DownloadStats>) {
  downloadProgress = Math.max(0, Math.min(100, progress));
  if (stats) {
    currentStats = { ...currentStats, ...stats };
  }
  if (progressCallback) {
    progressCallback(downloadProgress, currentStats);
  }
}

/**
 * Get current download stats
 */
export function getDownloadStats(): DownloadStats {
  return currentStats;
}

/**
 * Check if WebGPU is available
 */
export function checkWebGPUSupport(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined" || !navigator.gpu) {
    return false;
  }
  return true;
}

/**
 * Set callback for download/loading progress updates
 */
export function setProgressCallback(callback: (progress: number, stats?: DownloadStats) => void) {
  progressCallback = callback;
}

/**
 * Get current download/loading progress (0-100)
 */
export function getDownloadProgress(): number {
  return downloadProgress;
}

/**
 * Check if currently downloading (vs loading)
 */
export function isDownloading(): boolean {
  return isLoading && isDownloadPhase;
}

/**
 * Check if model is currently loading
 */
export function isModelLoading(): boolean {
  return isLoading;
}

/**
 * Check if model is loaded
 */
export function isModelLoaded(): boolean {
  return model !== null && tokenizer !== null;
}



/**
 * Download file with progress tracking and speed calculation
 */
async function downloadFileWithProgress(
  url: string,
  onProgress: (loaded: number, total: number, speedBytesPerSecond: number) => void
): Promise<Response> {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;
  const chunks: Uint8Array[] = [];
  
  // Speed calculation
  let lastTime = performance.now();
  let lastLoaded = 0;
  let speedBytesPerSecond = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    
    // Calculate speed every 500ms
    const now = performance.now();
    const timeDiff = now - lastTime;
    if (timeDiff >= 500) {
      const bytesDiff = loaded - lastLoaded;
      speedBytesPerSecond = (bytesDiff / timeDiff) * 1000;
      lastTime = now;
      lastLoaded = loaded;
    }
    
    onProgress(loaded, total, speedBytesPerSecond);
  }

  const blob = new Blob(chunks);
  return new Response(blob, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}

/**
 * Load the local AI model
 * 
 * CACHING: Files are stored in browser's Cache API and persist across sessions.
 * The @huggingface/transformers library also uses IndexedDB for its own caching.
 */
async function loadModel(): Promise<void> {
  if (isLoading) {
    return loadPromise || Promise.resolve();
  }

  isLoading = true;
  loadPromise = (async () => {
    try {
      // Reset stats
      currentStats = { downloadedBytes: 0, totalBytes: 0, speedBytesPerSecond: 0 };
      updateProgress(0);

      const { AutoModelForCausalLM: ModelClass, AutoTokenizer: TokenizerClass } =
        await loadTransformers();

      if (!checkWebGPUSupport()) {
        throw new Error(
          "WebGPU is not available. Please enable WebGPU in your browser settings."
        );
      }
      
      // Load tokenizer (small, fast download)
      const tokenizerPromise = TokenizerClass.from_pretrained(MODEL_ID);
      tokenizer = await tokenizerPromise;
      
      // Check if model files are already cached in Cache API
      let needsDownload = true;
      try {
        const cache = await caches.open(CACHE_NAME);
        let allFilesCached = true;
        
        for (const file of MODEL_FILES) {
          const fileUrl = `${HF_CDN_BASE}/${MODEL_ID}/resolve/main/${file}`;
          const cachedResponse = await cache.match(fileUrl);
          if (!cachedResponse) {
            allFilesCached = false;
            break;
          }
        }
        
        if (allFilesCached) {
          needsDownload = false;
          updateProgress(100);
        }
      } catch (error) {
        needsDownload = true;
      }
      
      if (needsDownload) {
        // Use known file sizes to avoid HEAD request latency
        const fileSizes = [
          173 * 1024, // ~173 KB for model_q4.onnx
          1.22 * 1024 * 1024 * 1024, // ~1.22 GB for model_q4.onnx_data
        ];
        const totalSize = fileSizes[0] + fileSizes[1];
        
        // Update total bytes for stats
        currentStats.totalBytes = totalSize;
        
        // Download phase (0-100%)
        isDownloadPhase = true;
        updateProgress(0, { totalBytes: totalSize, downloadedBytes: 0 });
        
        // Download each file with accurate progress tracking
        const cache = await caches.open(CACHE_NAME);
        let cumulativeDownloaded = 0;
        
        for (let i = 0; i < MODEL_FILES.length; i++) {
          const file = MODEL_FILES[i];
          const fileUrl = `${HF_CDN_BASE}/${MODEL_ID}/resolve/main/${file}`;
          const fileSize = fileSizes[i] || 0;
          
          // Check if file is already in cache
          const cachedResponse = await cache.match(fileUrl);
          if (cachedResponse) {
            
            cumulativeDownloaded += fileSize;
            const percentProgress = (cumulativeDownloaded / totalSize) * 100;
            updateProgress(percentProgress, { downloadedBytes: cumulativeDownloaded });
            continue;
          }
          
          
          // Download with progress tracking
          const response = await downloadFileWithProgress(fileUrl, (loaded, total, speed) => {
            const totalDownloaded = cumulativeDownloaded + loaded;
            const percentProgress = (totalDownloaded / totalSize) * 100;
            
            updateProgress(Math.min(100, percentProgress), {
              downloadedBytes: totalDownloaded,
              speedBytesPerSecond: speed,
            });
          });
          
          // Cache the downloaded file
          await cache.put(fileUrl, response);
          cumulativeDownloaded += fileSize;
        }
        
        updateProgress(100, { downloadedBytes: totalSize }); // Download phase complete
        
        // Loading phase (0-100%)
        isDownloadPhase = false;
        updateProgress(0); // Reset progress for loading phase
      } else {
        // Files are cached, skip to loading phase
        isDownloadPhase = false;
        updateProgress(0); // Reset progress for loading phase
      }
      
      // Now load the model - it should use cached files
      const modelPromise = ModelClass.from_pretrained(MODEL_ID, {
        device: "webgpu",
        dtype: MODEL_DTYPE,
      });
      
      // Model loading: 0-100% for loading phase
      let loadingProgress = 0;
      const loadingInterval = setInterval(() => {
        if (loadingProgress < 99) {
          loadingProgress += 1;
          updateProgress(loadingProgress);
        }
      }, 150);
      
      try {
        model = await modelPromise;
      } finally {
        clearInterval(loadingInterval);
      }

      updateProgress(100);
    } catch (error) {
      console.error("Error loading model:", error);
      updateProgress(0);
      throw error;
    } finally {
      isLoading = false;
    }
  })();

  return loadPromise;
}

/**
 * Schedule background model download during low activity
 * This prevents blocking the main thread during user typing
 */
export function scheduleBackgroundDownload(delayMs: number = 5000): void {
  if (typeof window === "undefined") return;
  if (isModelLoaded() || isLoading || backgroundDownloadScheduled) return;
  
  // Clear any existing timeout
  if (backgroundDownloadTimeout) {
    clearTimeout(backgroundDownloadTimeout);
  }
  
  backgroundDownloadScheduled = true;
  backgroundDownloadTimeout = setTimeout(async () => {
    try {
      isBackgroundDownloading = true;
      console.log("Starting background model download...");
      await loadModel();
      console.log("Background model download completed");
    } catch (error) {
      console.warn("Background model download failed:", error);
    } finally {
      isBackgroundDownloading = false;
      backgroundDownloadScheduled = false;
    }
  }, delayMs);
}

/**
 * Cancel scheduled background download
 */
export function cancelBackgroundDownload(): void {
  if (backgroundDownloadTimeout) {
    clearTimeout(backgroundDownloadTimeout);
    backgroundDownloadTimeout = null;
  }
  backgroundDownloadScheduled = false;
}

/**
 * Initialize the model (call this when the app loads or when user clicks download)
 */
export async function initializeModel(): Promise<boolean> {
  try {
    if (!checkWebGPUSupport()) {
      console.warn("WebGPU not available");
      return false;
    }

    await loadModel();
    return true;
  } catch (error) {
    console.error("Failed to initialize model:", error);
    return false;
  }
}

/**
 * Generate a chat response using the local model
 */
export async function generateChatResponse(
  userMessage: string,
  context?: string
): Promise<string> {
  if (!model || !tokenizer) {
    await loadModel();
  }

  // Simple system prompt - the model already knows LaTeX
  const systemPrompt = `You are a helpful LaTeX assistant for OpenPrism, a private document editor. Help users write and debug LaTeX documents. Be concise.${context ? `\n\nUser's document:\n${context.slice(0, 600)}` : ''}`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userMessage },
  ];

  const input = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,
  });

  const outputs = await model.generate({
    ...input,
    max_new_tokens: 512,
    do_sample: true,
    temperature: 0.7,
    top_p: 0.9,
  });

  const response = tokenizer.decode(outputs[0], {
    skip_special_tokens: true,
  });

  // Extract just the assistant's response
  let result = response.trim();
  
  // Remove system and user prompts from output
  const assistantMarker = result.lastIndexOf("assistant");
  if (assistantMarker !== -1) {
    result = result.substring(assistantMarker + "assistant".length).trim();
  }
  
  // Clean up any remaining artifacts
  result = result.replace(/^:\s*/, '');
  
  return result || "I'm sorry, I couldn't generate a response. Please try again.";
}
