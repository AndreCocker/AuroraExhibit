import Link from "next/link";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen">
          {/* 全新顶部导航 - 扁平现代风格 */}
          <header className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/50">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <nav className="flex items-center justify-between">
                {/* 品牌标识 */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg animate-glow">
                    <span className="text-white font-black text-xl">🔥</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-flame tracking-tight">FlameGallery</h1>
                    <p className="text-xs text-gray-400 font-medium">Blockchain Art Platform</p>
                  </div>
                </div>
                
                {/* 导航菜单 */}
                <div className="flex items-center gap-2">
                  <Link href="/" className="nav-item">🎨 Gallery</Link>
                  <Link href="/upload" className="nav-item">⚡ Create</Link>
                  <Link href="/rank" className="nav-item">🏆 Rankings</Link>
                  <Link href="/me" className="nav-item">👨‍🎨 Profile</Link>
                </div>
              </nav>
            </div>
          </header>

          {/* 主内容区 */}
          <main className="max-w-7xl mx-auto px-6 py-12">
            {children}
          </main>

          {/* 页脚 */}
          <footer className="border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-8 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔥</span>
                </div>
                <span className="text-flame font-bold text-lg">FlameGallery</span>
              </div>
              <p className="text-gray-400 text-sm">
                Powered by FHEVM Homomorphic Encryption · Deployed on Sepolia Testnet
              </p>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-500">
                <span>🔒 Privacy Protected</span>
                <span>⛓️ On-Chain Storage</span>
                <span>🚀 Decentralized</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

