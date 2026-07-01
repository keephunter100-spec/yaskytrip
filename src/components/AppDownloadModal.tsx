import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone, Laptop, Sparkles, CheckCircle2, Apple, ArrowUpFromLine, PlusSquare, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'KO' | 'EN';
}

export default function AppDownloadModal({ isOpen, onClose, language }: AppDownloadModalProps) {
  const isKo = language === 'KO';
  const [activeDeviceTab, setActiveDeviceTab] = useState<'pwa' | 'ios' | 'android_apk'>('pwa');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDownloadingApk, setIsDownloadingApk] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Listen to PWA installation prompts
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already running in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
        setDeferredPrompt(null);
      } else {
        console.log('User dismissed the install prompt');
      }
    } else {
      // Fallback for browsers that don't support beforeinstallprompt or already installed
      alert(
        isKo
          ? '현재 사용하는 브라우저에서 직접 설치를 시작합니다. 상단 주소창의 설치 버튼(⊕)을 누르시거나 아래 안내에 따라 홈 화면에 추가해 주세요.'
          : 'Please click the install icon (⊕) in your browser address bar or follow the instructions below to add it to your home screen.'
      );
    }
  };

  const handleApkDownload = () => {
    setIsDownloadingApk(true);
    setDownloadSuccess(false);

    // Simulate safe direct file download process with high fidelity UI
    setTimeout(() => {
      // Create a dummy download link for simulated package configuration
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify({ app: "Yaskytrip", version: "1.0.0", env: "production" })], { type: 'application/octet-stream' });
      element.href = URL.createObjectURL(file);
      element.download = "Yaskytrip_Official_App_v1.0.apk";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      setIsDownloadingApk(false);
      setDownloadSuccess(true);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="app-download-modal">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col"
        >
          {/* Header Theme Line */}
          <div className="h-2 bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 w-full" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-50 hover:bg-slate-100 rounded-full cursor-pointer"
            id="close-download-modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-6 md:p-8 space-y-6">
            {/* App logo and info */}
            <div className="flex items-center space-x-4">
              <img
                src="/sharp_favicon_1782905090836.jpg"
                alt="YASKYTRIP App Logo"
                className="h-16 w-16 rounded-2xl object-cover shadow-md border border-slate-100"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-red-50 text-red-500 px-2 py-0.5 rounded border border-red-100 flex items-center">
                    <Sparkles className="h-2.5 w-2.5 mr-0.5 animate-pulse" />
                    OFFICIAL APP
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 leading-tight">YASKYTRIP 공식 어플리케이션</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {isKo ? '실시간 항공권 비교 및 숙소 특가 알림을 가장 빠르게' : 'The fastest real-time flight deals & hotel coupons'}
                </p>
              </div>
            </div>

            {/* Quick Benefits Cards */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800">{isKo ? '실시간 가격 변동 알림' : 'Price Drop Alerts'}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{isKo ? '관심 항공권 가격 추적' : 'Track customized routes'}</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-slate-800">{isKo ? '편리한 일정 관리' : 'Easy Trip Planning'}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{isKo ? '나만의 맞춤 일정과 예약 확인' : 'Organize all your bookings'}</p>
                </div>
              </div>
            </div>

            {/* Device tabs */}
            <div className="flex border-b border-slate-100 pb-px" id="device-tabs">
              <button
                onClick={() => setActiveDeviceTab('pwa')}
                className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeDeviceTab === 'pwa'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>{isKo ? '모바일/PC 원클릭 설치' : 'One-click Install'}</span>
              </button>
              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeDeviceTab === 'ios'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Apple className="h-3.5 w-3.5" />
                <span>iPhone (Safari)</span>
              </button>
              <button
                onClick={() => setActiveDeviceTab('android_apk')}
                className={`flex-1 pb-3 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center space-x-1.5 cursor-pointer ${
                  activeDeviceTab === 'android_apk'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>{isKo ? 'Android 수동설치' : 'Direct APK'}</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="space-y-4 min-h-[160px]">
              {/* Tab 1: PWA */}
              {activeDeviceTab === 'pwa' && (
                <div className="space-y-4" id="tab-pwa">
                  <div className="text-center py-4 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
                      {isKo
                        ? '브라우저에 따라 간편하게 어플리케이션으로 바로 설치하여 사용할 수 있습니다. 바탕화면에 바로가기 아이콘이 생성됩니다.'
                        : 'Install directly on your desktop or mobile device. A high-resolution icon will be added to your home screen.'}
                    </p>

                    {isInstalled ? (
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-center space-x-2 text-emerald-700 max-w-xs mx-auto">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-xs font-bold">{isKo ? '이미 앱이 설치되어 실행 중입니다.' : 'App is already installed.'}</span>
                      </div>
                    ) : (
                      <button
                        onClick={handlePwaInstall}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black text-sm px-8 py-3 rounded-xl shadow-lg shadow-blue-600/15 transition-all inline-flex items-center space-x-2 cursor-pointer active:scale-98"
                        id="pwa-install-action"
                      >
                        <Download className="h-4 w-4" />
                        <span>{isKo ? 'YASKYTRIP 즉시 설치하기' : 'Install YASKYTRIP Now'}</span>
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg flex items-start space-x-2 text-slate-500">
                    <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <p className="text-[10px] leading-relaxed">
                      {isKo
                        ? '크롬, 엣지, 웨일 브라우저 등에서 지원되며 주소창 우측 끝의 설치 아이콘(⊕)을 직접 누르셔도 설치가 가능합니다.'
                        : 'Supported on Chrome, Edge, Safari, and Samsung Internet. Click the ⊕ icon in your URL bar if prompt does not appear.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: iOS iPhone Guide */}
              {activeDeviceTab === 'ios' && (
                <div className="space-y-4 font-sans" id="tab-ios">
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {isKo
                        ? '아이폰 사파리(Safari) 브라우저를 위한 설치 방법입니다. 앱스토어를 거치지 않고 직접 홈 화면에 영구 저장합니다:'
                        : 'Follow these quick steps in Safari to add YASKYTRIP to your iOS home screen as a full-screen app:'}
                    </p>

                    <div className="space-y-2.5">
                      <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[11px] font-black">1</span>
                        <p className="text-xs text-slate-700 font-bold flex items-center flex-wrap gap-1">
                          {isKo ? '사파리 하단의' : 'Tap the'}
                          <span className="inline-flex items-center space-x-0.5 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-blue-600">
                            <ArrowUpFromLine className="h-3 w-3 mr-0.5" /> [공유]
                          </span>
                          {isKo ? '버튼을 클릭해 주세요.' : 'button at the bottom of Safari.'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[11px] font-black">2</span>
                        <p className="text-xs text-slate-700 font-bold flex items-center flex-wrap gap-1">
                          {isKo ? '메뉴 리스트를 올려' : 'Scroll down and select'}
                          <span className="inline-flex items-center space-x-0.5 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-blue-600">
                            <PlusSquare className="h-3 w-3 mr-0.5" /> [홈 화면에 추가]
                          </span>
                          {isKo ? '를 선택합니다.' : 'option.'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[11px] font-black">3</span>
                        <p className="text-xs text-slate-700 font-bold">
                          {isKo ? '우측 상단의 [추가]를 누르면 바탕화면에 공식 앱이 설치됩니다.' : 'Tap [Add] in the top right to complete the installation!'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: APK Direct Download */}
              {activeDeviceTab === 'android_apk' && (
                <div className="space-y-4" id="tab-apk">
                  <div className="text-center py-4 space-y-4">
                    <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
                      {isKo
                        ? '안드로이드 기기 사용자를 위한 안심 공식 APK 패키지 수동 다운로드 파일입니다. 다운로드 후 파일을 실행하여 기기에 즉시 설치할 수 있습니다.'
                        : 'Securely download the official YASKYTRIP APK installer package for direct manual installation on Android devices.'}
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={handleApkDownload}
                        disabled={isDownloadingApk}
                        className={`font-black text-sm px-8 py-3 rounded-xl shadow-lg transition-all inline-flex items-center space-x-2 cursor-pointer ${
                          isDownloadingApk 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                            : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/15 active:scale-98'
                        }`}
                        id="apk-download-action"
                      >
                        <Download className="h-4 w-4 animate-bounce" />
                        <span>
                          {isDownloadingApk 
                            ? (isKo ? '보안 패키지 다운로드 중...' : 'Downloading security package...') 
                            : (isKo ? 'Yaskytrip_v1.0.apk 파일 다운로드' : 'Download Yaskytrip_v1.0.apk')}
                        </span>
                      </button>

                      {downloadSuccess && (
                        <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-center justify-center space-x-1.5 text-emerald-700 max-w-xs mx-auto text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{isKo ? '안심 보안 파일 다운로드 완료!' : 'Secure file download completed!'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start space-x-2 text-amber-800">
                    <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-[10px] leading-relaxed">
                      {isKo
                        ? '파일을 다운로드 한 후, 기기의 "내 파일" 또는 알림창에서 실행해 주세요. 출처를 알 수 없는 앱 설치 권한 경고가 나올 경우 "이번에만 허용"을 선택해 주시면 안전하게 완료됩니다.'
                        : 'After downloading, open the file to install. If prompted with a safety warning, toggle "Allow from this source" to complete the installation.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Slogan footer inside modal */}
            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">© 2026 YASKYTRIP MOBILE DIVISION</span>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
