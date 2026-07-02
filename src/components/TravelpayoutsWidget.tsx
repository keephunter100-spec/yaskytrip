import React, { useEffect, useRef, useState } from 'react';
import { Shield, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';

interface TravelpayoutsWidgetProps {
  selectedLanguageCode?: string;
  type?: 'map' | 'calendar';
}

export default function TravelpayoutsWidget({ selectedLanguageCode = 'ko', type = 'map' }: TravelpayoutsWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget elements to avoid duplicate renderings
    containerRef.current.innerHTML = '';
    setLoading(true);

    const script = document.createElement('script');
    
    // Choose appropriate locale parameter based on user's language setting
    const locale = selectedLanguageCode === 'ko' ? 'ko' : 'en';
    
    // Build the script source dynamically based on widget type
    if (type === 'calendar') {
      script.src = `https://tpemd.com/content?currency=usd&trs=544123&shmarker=744042&searchUrl=www.aviasales.com%2Fsearch&locale=${locale}&powered_by=true&origin=LON&destination=BKK&one_way=false&only_direct=false&period=year&range=7%2C14&primary=%230C73FE&color_background=%23FFFFFF&dark=%23000000&light=%23FFFFFF&achieve=%2345AD35&promo_id=4041&campaign_id=100`;
    } else {
      // Map Widget
      script.src = `https://tpemd.com/content?currency=usd&trs=544123&shmarker=744042&lat=51.51&lng=0.06&powered_by=true&search_host=www.aviasales.com%2Fsearch&locale=${locale}&origin=LON&value_min=0&value_max=1000000&round_trip=true&only_direct=false&radius=1&draggable=true&disable_zoom=false&show_logo=false&scrollwheel=false&primary=%2300AE98&secondary=%2300AE98&light=%23ffffff&width=1500&height=500&zoom=2&promo_id=4054&campaign_id=100`;
    }
    
    script.async = true;
    script.charset = "utf-8";

    script.onload = () => {
      setLoading(false);
    };

    script.onerror = () => {
      setLoading(false);
    };

    containerRef.current.appendChild(script);

    // Fallback loading remover to ensure UI is active
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [selectedLanguageCode, refreshKey, type]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const isKo = selectedLanguageCode === 'ko';

  // Dynamic titles and subtitles depending on type
  const title = type === 'calendar' 
    ? (isKo ? '실시간 글로벌 최저가 항공권 캘린더' : 'Live Global Low-Cost Flight Calendar')
    : (isKo ? '실시간 글로벌 최저가 항공 노선 지도' : 'Live Global Low-Cost Flight Route Map');

  const subtitle = type === 'calendar'
    ? (isKo 
        ? '가장 저렴한 비행 날짜와 연중 실시간 특가 노선을 한눈에 비교하고 스마트한 예약을 시작해 보세요.' 
        : 'Compare the cheapest flight dates and live dynamic low-cost routes throughout the year in real-time.')
    : (isKo 
        ? '지도 위의 핀 또는 출발 노선을 드래그하여 전 세계 도시의 실시간 최저가 비행 요금을 시각적으로 확인해 보세요.' 
        : 'Drag pins or browse route highlights directly on the interactive map to discover global flight deals visually.');

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6" id="travelpayouts-widget-root">
      
      {/* Dynamic CSS Overrides to ensure maximum width, grid-compatibility, and clear horizontal styling */}
      <style>{`
        /* Avoid any wrapping container width limitations from Travelpayouts styles */
        #travelpayouts-widget-root div,
        #travelpayouts-widget-root section,
        #travelpayouts-widget-root form {
          max-width: 100% !important;
        }

        #tp-widget-inject-target {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 100% !important;
          display: block !important;
          clear: both !important;
        }
        
        /* Force Travelpayouts internal frame or wrapper elements to take full width */
        #tp-widget-inject-target iframe,
        #travelpayouts-widget-root iframe {
          width: 100% !important;
          min-width: 100% !important;
          max-width: 100% !important;
          height: 550px !important; /* Elegant standard height for map widgets */
          min-height: 550px !important;
          display: block !important;
          border: none !important;
          box-sizing: border-box !important;
        }

        /* Ensure parent container is a block layout with full width expansion */
        .tp-widget-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          display: block !important;
        }
      `}</style>

      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase rounded-full tracking-wider flex items-center space-x-1">
              <Sparkles className="h-3 w-3 animate-pulse" />
              <span>{isKo ? '실시간 연동 완료' : 'Live Integration'}</span>
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-800 mt-2">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold border border-slate-200 transition-all cursor-pointer"
            title={isKo ? '새로고침' : 'Refresh Widget'}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{isKo ? '재로드' : 'Reload'}</span>
          </button>
        </div>
      </div>

      {/* Widget Container - Fully Block with full viewport expansion capability */}
      <div className="relative min-h-[400px] bg-slate-50/30 rounded-2xl border border-slate-200/60 p-4 sm:p-6 block w-full overflow-hidden">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 space-y-3 rounded-2xl">
            <div className="h-8 w-8 border-3 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-[11px] text-slate-400 font-bold">
              {isKo ? '실시간 데이터를 받아오고 있습니다...' : 'Loading live data...'}
            </p>
          </div>
        )}
        
        {/* Render fully-fluid container with block display to allow full horizontal layout */}
        <div 
          ref={containerRef} 
          className="w-full block tp-widget-wrapper clear-both" 
          id="tp-widget-inject-target"
        ></div>
      </div>
    </div>
  );
}
