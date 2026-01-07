"use client";

import React, { useState, useEffect } from "react";

export default function InstallGuide() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    const isInStandaloneMode = () => {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      );
    };

    if (isInStandaloneMode()) {
      setIsStandalone(true);
      return; // No need to show guide if already installed
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // For iOS, we always show the button if not in standalone
      setIsVisible(true);
    }

    // Capture beforeinstallprompt event for Android/Chrome
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsVisible(false);
      }
    }
  };

  if (isStandalone || !isVisible) return null;

  return (
    <>
      {/* Install Button Card */}
      <div className="mb-5 bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-[0_4px_15px_rgba(255,117,140,0.15)] border border-pink-100 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] rounded-xl flex items-center justify-center shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[#333] text-sm">安装到桌面</h3>
            <p className="text-xs text-gray-500">获得原生 App 般的体验</p>
          </div>
        </div>
        <button
          onClick={handleInstallClick}
          className="bg-[#ff758c] text-white text-xs font-bold px-4 py-2 rounded-full shadow-md active:scale-95 transition-transform"
        >
          立即添加
        </button>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#fff8fa] w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 relative">
            <button 
                onClick={() => setShowIOSModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-md flex items-center justify-center mb-4">
                     <img src="/icon.svg" alt="App Icon" className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-[#333] mb-2">添加到主屏幕</h3>
                <p className="text-sm text-gray-500 mb-6">
                    在 iOS Safari 中，请按照以下步骤操作即可拥有原生 App 体验：
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-pink-100">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#ff758c] text-white font-bold rounded-full">1</span>
                    <div className="text-sm text-gray-600">
                        点击底部工具栏的 <span className="font-bold text-[#333] inline-flex items-center mx-1"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg> 分享</span> 按钮
                    </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-pink-100">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#ff758c] text-white font-bold rounded-full">2</span>
                    <div className="text-sm text-gray-600">
                        向上滑动菜单，找到并点击 <span className="font-bold text-[#333]">添加到主屏幕</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-pink-100">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[#ff758c] text-white font-bold rounded-full">3</span>
                    <div className="text-sm text-gray-600">
                        点击右上角的 <span className="font-bold text-[#333]">添加</span> 即可
                    </div>
                </div>
            </div>
            
            <div className="mt-6 flex justify-center">
                 <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                     <div className="h-full bg-[#ff758c] w-1/3 animate-pulse"></div>
                 </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
