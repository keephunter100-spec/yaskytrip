import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Maximize2, Minimize2, Sparkles, ChevronDown, Plus, Mic, ArrowRight, Plane, Hotel, Car, Check } from 'lucide-react';

interface AISearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSubmit: (query: string) => void;
}

export default function AISearchDrawer({ isOpen, onClose, onSearchSubmit }: AISearchDrawerProps) {
  const [query, setQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentAirport, setCurrentAirport] = useState('서울 모든 공항 (SEL)');
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);
  
  const [searchHistory, setSearchHistory] = useState<string[]>([
    '다음 주말 오사카행 항공편',
    '내일 도쿄 3성급 호텔',
    '7월 파리 럭셔리 패키지',
  ]);

  const airports = [
    '서울 모든 공항 (SEL)',
    '인천국제공항 (ICN)',
    '김포국제공항 (GMP)',
    '도쿄 하네다공항 (HND)',
    '도쿄 나리타공항 (NRT)',
  ];

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleSubmit = (textToSubmit?: string) => {
    const finalQuery = textToSubmit || query;
    if (!finalQuery.trim()) return;

    // Add to history if not exists
    if (!searchHistory.includes(finalQuery)) {
      setSearchHistory(prev => [finalQuery, ...prev.slice(0, 9)]);
    }

    onSearchSubmit(finalQuery);
    onClose();
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            id="ai-search-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed right-0 top-0 bottom-0 bg-white z-50 shadow-2xl border-l border-slate-200/80 flex flex-col justify-between transition-all duration-300 ${
              isMaximized ? 'w-full md:w-[70%]' : 'w-full md:w-[460px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-1">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">AI에게 물어보세요</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 transform translate-y-[-4px]" />
              </div>

              <div className="flex items-center space-x-3.5 text-slate-500">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer ${showHistory ? 'text-orange-500 bg-orange-50' : ''}`}
                  title="검색 기록"
                >
                  <History className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                  title={isMaximized ? '축소하기' : '확대하기'}
                >
                  {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                  title="닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[350px]">
              {showHistory ? (
                /* History View */
                <div className="w-full h-full flex flex-col justify-start">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">최근 검색 기록</span>
                    {searchHistory.length > 0 && (
                      <button 
                        onClick={handleClearHistory}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-all cursor-pointer"
                      >
                        전체 삭제
                      </button>
                    )}
                  </div>
                  {searchHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      최근 검색 기록이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchHistory.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setQuery(item);
                            setShowHistory(false);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                        >
                          <span className="text-sm font-semibold text-slate-700">{item}</span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Main AI Ask View */
                <div className="w-full flex flex-col items-center text-center space-y-6 my-auto">
                  {/* Big Sparkle Star */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full transform scale-150 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-orange-400 to-red-500 p-5 rounded-3xl text-white shadow-lg">
                      <svg className="h-8 w-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                      </svg>
                    </div>
                  </div>

                  {/* 물어보기 Title */}
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">물어보기</h2>
                    
                    {/* Airport Dropdown Selector */}
                    <div className="relative mt-3">
                      <button 
                        onClick={() => setShowAirportDropdown(!showAirportDropdown)}
                        className="inline-flex items-center space-x-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                      >
                        <span>고객님은 <span className="text-orange-500 font-extrabold">{currentAirport.split(' ')[0]}</span> 모든 공항에 있습니다</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAirportDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showAirportDropdown && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl py-1.5 z-10 text-left">
                          {airports.map((ap) => (
                            <button
                              key={ap}
                              onClick={() => {
                                setCurrentAirport(ap);
                                setShowAirportDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                            >
                              <span>{ap}</span>
                              {currentAirport === ap && <Check className="h-3.5 w-3.5 text-orange-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-col items-center gap-2 w-full pt-4">
                    <button
                      onClick={() => handleSuggestionClick('다음 주말 오사카행 직항편')}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer max-w-sm w-full sm:w-auto"
                    >
                      <Plane className="h-3.5 w-3.5 text-slate-500 rotate-45 transform" />
                      <span>직항편</span>
                    </button>
                    
                    <button
                      onClick={() => handleSuggestionClick('숙박료 230,000원 이하인 호텔')}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer max-w-sm w-full sm:w-auto"
                    >
                      <Hotel className="h-3.5 w-3.5 text-slate-500" />
                      <span>숙박료 230,125원 이하인 호텔</span>
                    </button>
                    
                    <button
                      onClick={() => handleSuggestionClick('SUV 차량 렌트')}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer max-w-sm w-full sm:w-auto"
                    >
                      <Car className="h-3.5 w-3.5 text-slate-500" />
                      <span>SUV 차량 렌트</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Input Area */}
            <div className="p-6 border-t border-slate-100 bg-white">
              {/* Thick rounded-2xl border */}
              <div className="border-[2.5px] border-slate-900 rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-slate-900/5 bg-white">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="오사카행 가장 저렴한 직항편"
                  rows={2}
                  className="w-full resize-none border-none outline-none focus:outline-none focus:ring-0 text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent"
                />

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/60">
                  <button 
                    type="button" 
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button 
                      type="button" 
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleSubmit()}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 p-2 rounded-full transition-all cursor-pointer"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed text-center mt-3 max-w-sm mx-auto">
                AI가 답변합니다. AI는 실수를 할 수 있습니다. AI 모드를 사용함으로써 귀하는{' '}
                <a href="#rules" className="underline hover:text-slate-600 font-semibold">이용약관</a>{' '}
                및{' '}
                <a href="#privacy" className="underline hover:text-slate-600 font-semibold">개인정보처리방침</a>
                에 동의하게 됩니다
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
