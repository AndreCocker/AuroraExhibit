"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { useGallery } from "@/hooks/useGallery";

export default function Page() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const forceSepolia = process.env.NEXT_PUBLIC_FORCE_SEPOLIA === "1";
  const autoSwitchTriedRef = useState<{ tried: boolean }>({ tried: false })[0];

  useEffect(() => {
    const detectProvider = () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const eth = (window as any).ethereum as ethers.Eip1193Provider;
        console.log("[Page] MetaMask detected:", !!eth);
        setProvider(eth);
        eth.request({ method: "eth_chainId" }).then((cid) => {
          const chainIdNum = parseInt(cid as string, 16);
          console.log("[Page] Chain ID:", chainIdNum);
          setChainId(chainIdNum);
        });
        return true;
      }
      return false;
    };

    if (!detectProvider()) {
      console.log("[Page] MetaMask not ready, waiting...");
      const timer = setInterval(() => {
        if (detectProvider()) {
          clearInterval(timer);
        }
      }, 100);
      setTimeout(() => clearInterval(timer), 10000);
    }
  }, []);

  const { instance, status, error } = useFhevm({ provider, chainId, initialMockChains: { 31337: "http://localhost:8545" }, enabled: true });
  const gallery = useGallery({ instance, provider, chainId });

  const connect = async () => {
    if (!provider) return;
    await provider.request?.({ method: "eth_requestAccounts" });
  };

  const switchToSepolia = async () => {
    if (!provider) return;
    try {
      await provider.request?.({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (e: any) {
      if (e?.code === 4902) {
        await provider.request?.({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0xaa36a7",
            chainName: "Sepolia",
            nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.sepolia.org"],
            blockExplorerUrls: ["https://sepolia.etherscan.io"],
          }],
        });
        await provider.request?.({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xaa36a7" }] });
      }
    }
    const cid = await provider.request?.({ method: "eth_chainId" });
    if (cid) setChainId(parseInt(cid as string, 16));
  };

  useEffect(() => {
    if (!forceSepolia || !provider || chainId === undefined) return;
    if (chainId !== 11155111 && !autoSwitchTriedRef.tried) {
      autoSwitchTriedRef.tried = true;
      switchToSepolia();
    }
  }, [forceSepolia, provider, chainId]);

  const content = useMemo(() => {
    if (!provider) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="modern-card p-16 max-w-lg text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-2xl animate-bounce-slow">
              <span className="text-4xl">🔗</span>
            </div>
            <h2 className="section-header text-3xl mb-4">Connect Your Wallet</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Connect your MetaMask wallet to explore the FHEVM-powered privacy art world
            </p>
            <button onClick={connect} className="btn-flame w-full">
              🚀 Connect MetaMask
            </button>
          </div>
        </div>
      );
    }
    
    if (status !== "ready") {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="modern-card p-12 text-center max-w-md">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-flame mb-4">Initializing FHEVM</h3>
            <div className="space-y-2 text-gray-300">
              <p>Status: <span className="text-accent-400 font-semibold">{status}</span></p>
              {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error.message}</p>}
            </div>
            {provider && chainId !== undefined && chainId !== 11155111 && (
              <div className="mt-6 p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/30">
                <p className="text-yellow-300 mb-4">Current Network: {chainId}, please switch to Sepolia</p>
                <button onClick={switchToSepolia} className="btn-outline">Switch to Sepolia</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {/* 网络提示 */}
        {provider && chainId !== 11155111 && (
          <div className="modern-card p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between gap-4">
              <p className="text-yellow-300">Current Network: {chainId ?? '-'}, recommend switching to Sepolia testnet</p>
              <button onClick={switchToSepolia} className="btn-outline">Switch Network</button>
            </div>
          </div>
        )}

        {/* Hero 区域 - 侧边栏风格 */}
        <div className="flex items-center justify-between mb-12 p-8 modern-card">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center animate-glow">
              <span className="text-3xl">🔥</span>
            </div>
            <div>
              <h1 className="text-4xl font-black text-flame mb-2">Discover Art</h1>
              <p className="text-gray-300 text-lg">
                Explore privacy-protected blockchain artworks powered by FHEVM encryption
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={gallery.refreshArtworks} 
              disabled={!gallery.canRefresh || gallery.busy}
              className="btn-outline"
            >
              {gallery.busy ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 inline-block"></div>
                  Loading...
                </>
              ) : (
                "🔄 Refresh"
              )}
            </button>
            <button 
              onClick={() => gallery.mockUpload()} 
              className="btn-flame"
            >
              ⚡ Quick Demo
            </button>
          </div>
        </div>

        {/* 消息提示 */}
        {gallery.message && (
          <div className="modern-card p-6 border-l-4 border-primary-500">
            <p className="text-gray-100 text-lg">{gallery.message}</p>
          </div>
        )}

        {/* 网格布局 - 修复文字显示问题 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {gallery.items.length === 0 ? (
            <div className="col-span-full">
              <div className="modern-card p-16 text-center max-w-2xl mx-auto">
                <div className="text-8xl mb-8 animate-bounce-slow">🎨</div>
                <h3 className="text-3xl font-bold text-flame mb-6">No Artworks Yet</h3>
                <p className="text-gray-300 text-lg mb-8">Be the first to mint your masterpiece on the blockchain!</p>
                <a href="/upload" className="btn-flame inline-block text-lg px-8 py-4">
                  🚀 Create Your First Artwork
                </a>
              </div>
            </div>
          ) : (
            gallery.items.map((item, index) => (
              <div key={item.id} className="modern-card overflow-hidden hover:scale-105 transition-all duration-300 group">
                {/* 作品图片区域 */}
                <div className="relative aspect-square bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-navy-500/20 overflow-hidden">
                  <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-float">🖼️</div>
                      <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full text-white font-bold">
                        Artwork #{item.id}
                      </div>
                    </div>
                  </div>
                  
                  {/* 悬浮操作按钮 */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => gallery.decryptLikes(item.id)} 
                      disabled={!gallery.canDecrypt || gallery.busy}
                      className="w-12 h-12 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors text-lg"
                    >
                      🔓
                    </button>
                  </div>
                </div>

                {/* 作品信息 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-flame mb-3">{item.title}</h3>
                  
                  {/* 创作者信息 */}
                  <div className="flex items-center gap-3 mb-4 text-gray-400">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Artist</p>
                      <p className="font-mono text-xs">{item.artist.slice(0, 12)}...{item.artist.slice(-6)}</p>
                    </div>
                  </div>
                  
                  {/* 标签 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag, idx) => (
                      <span key={idx} className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium border border-primary-500/30">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  {/* 类别标签 */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {item.categories.map((cat, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gradient-to-r from-accent-500/20 to-accent-600/20 text-accent-300 rounded-full text-sm font-bold border border-accent-500/40">
                        🏆 {cat === 'best-photography' ? 'Photography' : 
                            cat === 'best-digital' ? 'Digital Art' : 
                            cat === 'best-abstract' ? 'Abstract' : 
                            cat === 'best-contemporary' ? 'Contemporary' : cat}
                      </span>
                    ))}
                  </div>

                  {/* 操作按钮 */}
                  <div className="space-y-3">
                    <button 
                      onClick={() => gallery.like(item.id)} 
                      disabled={!gallery.canLike || gallery.busy || gallery.likedItems.has(item.id)}
                      className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
                        gallery.likedItems.has(item.id) 
                          ? 'bg-green-500/30 border-2 border-green-400 text-green-300 cursor-not-allowed' 
                          : 'bg-primary-500/20 border-2 border-primary-500/30 text-primary-300 hover:bg-primary-500/30 hover:border-primary-400'
                      }`}
                    >
                      {gallery.likedItems.has(item.id) ? '✅ Applauded' : '👏 Applaud This Art'}
                    </button>
                    
                    {/* 背书按钮 */}
                    {item.categories.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {item.categories.map((cat) => (
                          <button 
                            key={cat}
                            onClick={() => gallery.vote(item.id, cat)} 
                            disabled={!gallery.canVote || gallery.busy || gallery.votedItems.has(item.id)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                              gallery.votedItems.has(item.id) 
                                ? 'bg-purple-500/30 border border-purple-400 text-purple-300 cursor-not-allowed' 
                                : 'border-2 border-gray-600 text-gray-300 hover:border-accent-500 hover:text-accent-300 hover:bg-accent-500/10'
                            }`}
                          >
                            {gallery.votedItems.has(item.id) ? '✅ Endorsed' : '🏷️ Endorse'}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 解密结果 */}
                  {gallery.likesClear[item.id] !== undefined && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 text-center">
                      <p className="text-green-300 font-bold">
                        🎉 Total Applause: {String(gallery.likesClear[item.id])}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }, [provider, status, error, gallery]);

  return content;
}

