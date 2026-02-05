/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net data:; connect-src 'self' https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://cas-bridge.xethub.hf.co https://xethub.hf.co data: blob:;",
          },
        ],
      },
    ]
  },
}

export default nextConfig