import React, { useState } from 'react';
import { Hotel, formatPrice } from '../types';
import { X, ChevronLeft, ChevronRight, Sparkles, Check, Heart, Share2, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHotelImageCategories, HotelImageCategory } from '../utils/hotelImages';

interface HotelGalleryModalProps {
  isOpen: boolean;
  hotel: Hotel | null;
  onClose: () => void;
  onBook: () => void;
  currency: string;
  selectedLanguageCode?: string;
}

export default function HotelGalleryModal({
  isOpen,
  hotel,
  onClose,
  onBook,
  currency = 'USD',
  selectedLanguageCode = 'ko',
}: HotelGalleryModalProps) {
  const isKo = selectedLanguageCode === 'ko';

  if (!isOpen || !hotel) return null;

  const categories = getHotelImageCategories(hotel);
  
  // State for active view: either 'all' (showing a grid of all images) or the index of the selected category
  const [activeCategoryId, setActiveCategoryId] = useState<string>('lobby');

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];
  const activeIndex = categories.findIndex(c => c.id === activeCategoryId);

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % categories.length;
    setActiveCategoryId(categories[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + categories.length) % categories.length;
    setActiveCategoryId(categories[prevIdx].id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col overflow-hidden font-sans">
      {/* 1. Header (닫기, 호텔 이름, 가격 & 예약 버튼) */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs sm:text-sm rounded-lg transition-all cursor-pointer border border-slate-250"
          >
            <X className="h-4.5 w-4.5" />
            <span>{isKo ? '닫기' : 'Close'}</span>
          </button>
          
          <h2 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-xs md:max-w-lg hidden sm:block">
            {hotel.name}
          </h2>
        </div>

        {/* Dynamic Hotel title for mobile */}
        <div className="text-center font-bold text-slate-800 text-xs sm:hidden block truncate w-full">
          {hotel.name}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold block">{isKo ? '아고다 최저가' : 'Agoda Best Rate'}</span>
            <span className="text-base sm:text-lg font-black text-slate-950 font-sans">
              {formatPrice(hotel.pricePerNight, currency)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onBook();
              onClose();
            }}
            className="px-6 py-2.5 bg-[#FF4E1E] hover:bg-[#E03A0F] text-white font-black text-xs sm:text-sm rounded-lg transition-all shadow-md cursor-pointer whitespace-nowrap active:scale-95"
          >
            {isKo ? '바로 예약' : 'Book Now'}
          </button>
        </div>
      </header>

      {/* 2. Horizontal Scrollable Thumbnail Navigation */}
      <div className="bg-slate-50 border-b border-slate-200/60 py-4 px-6 overflow-x-auto select-none shrink-0 scrollbar-thin scrollbar-thumb-slate-200">
        <div className="flex space-x-4 min-w-max mx-auto max-w-7xl justify-start lg:justify-center">
          
          {/* "모든 사진" (All Photos) Thumbnail Collage */}
          <button
            type="button"
            onClick={() => setActiveCategoryId('lobby')}
            className={`flex flex-col items-center space-y-1.5 focus:outline-hidden group cursor-pointer`}
          >
            <div 
              className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                activeCategoryId === 'lobby' 
                  ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20' 
                  : 'border-slate-200 group-hover:border-slate-400'
              } grid grid-cols-2 grid-rows-2 gap-[1px] bg-slate-300`}
            >
              <img src={categories[0].imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              <img src={categories[1].imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              <img src={categories[2].imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              <img src={categories[4].imageUrl} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
            </div>
            <span className={`text-[10px] font-black tracking-tight ${activeCategoryId === 'lobby' ? 'text-indigo-600' : 'text-slate-500'}`}>
              {isKo ? '모든 사진' : 'All Photos'}
            </span>
          </button>

          {/* Individual Category Thumbnails */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryId(cat.id)}
              className="flex flex-col items-center space-y-1.5 focus:outline-hidden group cursor-pointer"
            >
              <div 
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all relative ${
                  activeCategoryId === cat.id 
                    ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20 scale-[1.03]' 
                    : 'border-slate-200 group-hover:border-slate-400'
                }`}
              >
                <img 
                  src={cat.imageUrl} 
                  alt={isKo ? cat.nameKo : cat.nameEn}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className={`text-[10px] font-bold tracking-tight ${activeCategoryId === cat.id ? 'text-indigo-600 font-black' : 'text-slate-500'}`}>
                {isKo ? cat.nameKo : cat.nameEn}
              </span>
            </button>
          ))}

        </div>
      </div>

      {/* 3. Main Detailed Layout */}
      <div className="flex-1 bg-white flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Column: Category Info & Descriptive details */}
        <div className="w-full md:w-80 bg-slate-50/50 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 shrink-0 select-none">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                <Sparkles className="h-3 w-3" />
                <span>{isKo ? '상세 둘러보기' : 'Visual Tour'}</span>
              </span>
              
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                {isKo ? activeCategory.nameKo : activeCategory.nameEn}
              </h1>
            </div>

            <p className="text-xs text-slate-600 font-bold leading-relaxed">
              {isKo ? activeCategory.descriptionKo : activeCategory.descriptionEn}
            </p>

            {/* Nice little checklist badge for hotel specs */}
            <div className="border-t border-slate-200/80 pt-6 space-y-3">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">{isKo ? '호텔 기본 서비스' : 'Hotel Inclusions'}</span>
              <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isKo ? '무료 초고속 와이파이 기본 제공' : 'Complimentary High-speed WiFi'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isKo ? '매일 친환경 객실 정돈 서비스' : 'Daily eco-friendly housekeeping'}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{isKo ? '피트니스 센터 및 비즈니스 룸 24시간 개방' : '24h Fitness Center access'}</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-bold hidden md:block pt-6 border-t border-slate-100">
            {hotel.address}
          </div>
        </div>

        {/* Right Column / Center: Large detailed image container with navigation overlays */}
        <div className="flex-1 bg-slate-900 flex items-center justify-center p-4 relative group overflow-hidden select-none">
          
          {/* Large main image with fade animation on change */}
          <AnimatePresence mode="wait">
            <motion.img
              key={activeCategory.id}
              src={activeCategory.imageUrl}
              alt={isKo ? activeCategory.nameKo : activeCategory.nameEn}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="max-h-full max-w-full object-contain rounded-2xl shadow-2xl z-10"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          {/* Ambient Blurred Background for visual depth */}
          <div 
            className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-25 scale-105 pointer-events-none transition-all duration-700"
            style={{ backgroundImage: `url(${activeCategory.imageUrl})` }}
          />

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-white/10 hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all cursor-pointer z-20 border border-white/10 hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Index indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-black/50 text-white text-[11px] font-black tracking-wide z-20 border border-white/10 backdrop-blur-xs">
            {activeIndex + 1} / {categories.length}
          </div>

        </div>

      </div>
    </div>
  );
}
