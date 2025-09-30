"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { useFhevm } from "@/fhevm/useFhevm";
import { AuroraExhibitABI } from "@/abi/AuroraExhibitABI";
import { AuroraExhibitAddresses } from "@/abi/AuroraExhibitAddresses";

export default function UploadPage() {
  const [provider, setProvider] = useState<ethers.Eip1193Provider | undefined>(undefined);
  const [chainId, setChainId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [descHash, setDescHash] = useState("");
  const [fileHash, setFileHash] = useState("");
  const [tags, setTags] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = [
    { id: "best-photography", name: "摄影", icon: "📸" },
    { id: "best-digital", name: "数字艺术", icon: "💻" },
    { id: "best-abstract", name: "抽象艺术", icon: "🎭" },
    { id: "best-contemporary", name: "当代艺术", icon: "🔥" },
  ];

  useEffect(() => {
    const detectProvider = () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const eth = (window as any).ethereum as ethers.Eip1193Provider;
        setProvider(eth);
        eth.request({ method: "eth_chainId" }).then((cid) => setChainId(parseInt(cid as string, 16)));
        return true;
      }
      return false;
    };

    if (!detectProvider()) {
      const timer = setInterval(() => {
        if (detectProvider()) clearInterval(timer);
      }, 100);
      setTimeout(() => clearInterval(timer), 5000);
    }
  }, []);

  const { status } = useFhevm({ provider, chainId, initialMockChains: { 31337: "http://localhost:8545" }, enabled: true });
  const addr = useMemo(() => (chainId ? (AuroraExhibitAddresses as any)[chainId.toString()]?.address : undefined), [chainId]);

  const onUpload = async () => {
    if (!provider || !addr || !title.trim() || selectedCategories.length === 0) return;
    
    setUploading(true);
    setMsg("");
    
    try {
      const bp = new ethers.BrowserProvider(provider);
      const s = await bp.getSigner();
      const contract = new ethers.Contract(addr, AuroraExhibitABI.abi, s);
      const tagArr = tags.trim() ? tags.split(",").map((t) => t.trim()) : [];
      
      setMsg("正在上传到区块链...");
      const tx = await contract.mintPiece(title, descHash, fileHash, tagArr, selectedCategories);
      
      setMsg("等待交易确认...");
      await tx.wait();
      
      setMsg("✅ 作品上传成功！");
      // 清空表单
      setTitle("");
      setDescHash("");
      setFileHash("");
      setTags("");
      setSelectedCategories([]);
    } catch (e: any) {
      setMsg("❌ 上传失败: " + (e?.message ?? String(e)));
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const fillExample = () => {
    setTitle("神秘的月夜");
    setDescHash("ipfs://QmExampleDescriptionHash123");
    setFileHash("ipfs://QmExampleFileHash456");
    setTags("摄影, 黑白, 月亮, 艺术");
    setSelectedCategories(["best-photography"]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 顶部进度条 */}
      <div className="mb-12">
        <div className="text-center mb-8">
          <h1 className="section-header">⚡ 创作发布工作台</h1>
          <p className="text-xl text-gray-300">将你的艺术作品永久铸造到区块链上，享受隐私保护的创作体验</p>
        </div>
        
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${status === 'ready' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
            🔐 FHEVM: {status}
          </div>
        </div>

        {/* 步骤指示器 */}
        <div className="flex justify-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/20 rounded-full border border-primary-500/30">
              <span className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</span>
              <span className="text-primary-300 font-semibold">基本信息</span>
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/20 rounded-full border border-gray-600">
              <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">2</span>
              <span className="text-gray-400 font-semibold">类别选择</span>
            </div>
            <div className="w-8 h-px bg-gray-600"></div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-700/20 rounded-full border border-gray-600">
              <span className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-bold">3</span>
              <span className="text-gray-400 font-semibold">确认发布</span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区 - 左右分栏 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：表单区 */}
        <div className="lg:col-span-2">
          <div className="modern-card p-8">
        <div className="space-y-8">
          <div>
            <label className="block text-gray-200 font-semibold mb-3 text-lg">
              🎨 作品标题 *
            </label>
            <input
              type="text"
              placeholder="为你的杰作起个响亮的名字..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-modern w-full"
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-gray-200 font-semibold mb-3 text-lg">
              📝 作品简介哈希
            </label>
            <input
              type="text"
              placeholder="ipfs://QmYourDescriptionHash..."
              value={descHash}
              onChange={(e) => setDescHash(e.target.value)}
              className="input-modern w-full"
              disabled={uploading}
            />
            <p className="text-sm text-gray-400 mt-2">
              💡 将作品简介上传到 IPFS 后填入哈希值
            </p>
          </div>

          <div>
            <label className="block text-gray-200 font-semibold mb-3 text-lg">
              🖼️ 作品文件哈希
            </label>
            <input
              type="text"
              placeholder="ipfs://QmYourFileHash..."
              value={fileHash}
              onChange={(e) => setFileHash(e.target.value)}
              className="input-modern w-full"
              disabled={uploading}
            />
            <p className="text-sm text-gray-400 mt-2">
              💡 将艺术作品文件上传到 IPFS/Arweave 后填入哈希值
            </p>
          </div>

          <div>
            <label className="block text-gray-200 font-semibold mb-3 text-lg">
              🏷️ 作品标签
            </label>
            <input
              type="text"
              placeholder="摄影, 抽象, 黑白, 现代艺术, NFT"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-modern w-full"
              disabled={uploading}
            />
            <p className="text-sm text-gray-400 mt-2">
              💡 用逗号分隔多个标签，让更多人发现你的杰作
            </p>
          </div>

          <div>
            <label className="block text-gray-200 font-semibold mb-4 text-lg">
              🎯 作品类别 * (可多选)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  disabled={uploading}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-gradient-to-br from-primary-500/30 to-accent-500/30 border-primary-400 text-primary-200 shadow-lg'
                      : 'bg-gray-800/30 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="font-bold text-sm">{cat.name}</div>
                  {selectedCategories.includes(cat.id) && (
                    <div className="text-xs text-primary-300 mt-2 font-semibold">✨ 已选择</div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-400 mt-3">
              💡 选择作品所属的类别，将参与对应的热门排行榜竞争
            </p>
          </div>

            </div>
          </div>
        </div>

        {/* 右侧：预览区 */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* 作品预览 */}
            <div className="modern-card p-6">
              <h3 className="text-xl font-bold text-flame mb-4">📱 预览效果</h3>
              <div className="aspect-square bg-gradient-to-br from-primary-500/20 via-accent-500/20 to-navy-500/20 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh-pattern opacity-20"></div>
                <div className="text-center relative z-10">
                  <div className="text-6xl mb-2 animate-float">🖼️</div>
                  <p className="text-gray-300 font-semibold">{title || '未命名作品'}</p>
                </div>
              </div>
              
              {/* 预览信息 */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>🏷️</span>
                  <span>{tags || '暂无标签'}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedCategories.map((cat) => (
                    <span key={cat} className="px-2 py-1 bg-accent-500/20 text-accent-300 rounded-lg text-xs">
                      {categories.find(c => c.id === cat)?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold text-flame mb-4">🚀 快捷操作</h3>
              <div className="space-y-3">
                <button
                  onClick={fillExample}
                  disabled={uploading}
                  className="w-full btn-outline"
                >
                  📋 填入示例数据
                </button>
                
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={onUpload}
                    disabled={!title.trim() || selectedCategories.length === 0 || uploading || status !== 'ready'}
                    className="w-full btn-flame"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3 inline-block"></div>
                        铸造中...
                      </>
                    ) : (
                      "🚀 立即铸造作品"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 消息提示 */}
      {msg && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-2xl border-l-4 max-w-md shadow-2xl ${
          msg.includes('✅') 
            ? 'bg-green-500/20 border-green-400 text-green-300' 
            : msg.includes('❌')
            ? 'bg-red-500/20 border-red-400 text-red-300'
            : 'bg-blue-500/20 border-blue-400 text-blue-300'
        }`}>
          <p className="font-medium">{msg}</p>
        </div>
      )}

      {/* 底部创作指南 */}
      <div className="mt-16 modern-card p-8">
        <h3 className="text-2xl font-bold text-flame mb-6">💡 创作指南</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-primary-400 text-xl">🔒</span>
              <div>
                <h4 className="font-semibold text-gray-200 mb-1">永久性铸造</h4>
                <p className="text-gray-400 text-sm">作品一旦铸造到区块链将永久保存，无法删除或修改</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-400 text-xl">🌐</span>
              <div>
                <h4 className="font-semibold text-gray-200 mb-1">去中心化存储</h4>
                <p className="text-gray-400 text-sm">建议先将文件上传到 IPFS 或 Arweave 等去中心化存储</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-accent-400 text-xl">🔐</span>
              <div>
                <h4 className="font-semibold text-gray-200 mb-1">隐私保护</h4>
                <p className="text-gray-400 text-sm">鼓掌和背书数据通过 FHEVM 同态加密技术保护隐私</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-400 text-xl">👤</span>
              <div>
                <h4 className="font-semibold text-gray-200 mb-1">匿名身份</h4>
                <p className="text-gray-400 text-sm">你的身份完全匿名，仅通过钱包地址进行识别</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


