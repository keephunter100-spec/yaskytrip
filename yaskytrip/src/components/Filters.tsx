import React from 'react';
import { SlidersHorizontal, ShieldCheck, Star, RefreshCw } from 'lucide-react';
import { FilterOptions, formatPrice } from '../types';
import { getTranslation } from '../utils/translations';

interface FiltersProps {
  type: 'flights' | 'hotels' | 'packages';
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableAirlines?: { code: string; name: string }[];
  maxPriceLimit: number;
  currency?: string;
  language?: 'KO' | 'EN';
  selectedLanguageCode?: string;
}

export default function Filters({
  type,
  filters,
  setFilters,
  availableAirlines = [],
  maxPriceLimit,
  currency = 'USD',
  language = 'KO',
  selectedLanguageCode = 'ko',
}: FiltersProps) {
  
  const handleStopsChange = (stops: any) => {
    setFilters(f => ({ ...f, stops }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(f => ({ ...f, maxPrice: Number(e.target.value) }));
  };

  const handleAirlineToggle = (code: string) => {
    setFilters(f => {
      const exists = f.airlines.includes(code);
      if (exists) {
        return { ...f, airlines: f.airlines.filter(c => c !== code) };
      } else {
        return { ...f, airlines: [...f.airlines, code] };
      }
    });
  };

  const handleRatingChange = (rating: number) => {
    setFilters(f => ({ ...f, hotelRating: rating === f.hotelRating ? 0 : rating }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(f => {
      const exists = f.hotelAmenities.includes(amenity);
      if (exists) {
        return { ...f, hotelAmenities: f.hotelAmenities.filter(a => a !== amenity) };
      } else {
        return { ...f, hotelAmenities: [...f.hotelAmenities, amenity] };
      }
    });
  };

  const resetFilters = () => {
    setFilters({
      maxPrice: maxPriceLimit,
      stops: 'any',
      departureTimeRange: [0, 24],
      airlines: [],
      hotelRating: 0,
      hotelAmenities: [],
      onlyHighCommission: false,
    });
  };

  const hotelAmenitiesList = [
    'Free WiFi',
    'Infinity Pool',
    'Luxury Spa',
    'Fitness Center',
    'Free Breakfast',
    'Rooftop Bar',
  ];

  const getAmenityLabel = (amenity: string) => {
    switch (amenity) {
      case 'Free WiFi':
        return selectedLanguageCode === 'ko' ? '무료 와이파이' :
               selectedLanguageCode === 'ja' ? '無料Wi-Fi' :
               selectedLanguageCode.startsWith('zh') ? '免费WiFi' :
               selectedLanguageCode === 'es' || selectedLanguageCode.startsWith('es') ? 'Wi-Fi gratis' :
               selectedLanguageCode === 'fr' ? 'Wi-Fi gratuit' :
               selectedLanguageCode === 'de' ? 'Kostenloses WLAN' :
               selectedLanguageCode === 'id' ? 'WiFi Gratis' :
               selectedLanguageCode === 'vi' ? 'WiFi miễn phí' :
               selectedLanguageCode === 'th' ? 'ฟรี Wi-Fi' : 'Free WiFi';
      case 'Infinity Pool':
        return selectedLanguageCode === 'ko' ? '야외/인피니提 풀' :
               selectedLanguageCode === 'ja' ? 'インフィニティプール' :
               selectedLanguageCode.startsWith('zh') ? '无边泳池' :
               selectedLanguageCode === 'es' || selectedLanguageCode.startsWith('es') ? 'Alberca infinita' :
               selectedLanguageCode === 'fr' ? 'Piscine à débordement' :
               selectedLanguageCode === 'de' ? 'Infinity-Pool' :
               selectedLanguageCode === 'id' ? 'Kolam Renang' :
               selectedLanguageCode === 'vi' ? 'Bể bơi vô cực' :
               selectedLanguageCode === 'th' ? 'สระว่ายน้ำอินฟินิตี้' : 'Infinity Pool';
      case 'Luxury Spa':
        return selectedLanguageCode === 'ko' ? '스파 & 마사지' :
               selectedLanguageCode === 'ja' ? '高級スパ' :
               selectedLanguageCode.startsWith('zh') ? '豪华水疗' :
               selectedLanguageCode === 'es' || selectedLanguageCode.startsWith('es') ? 'Spa de lujo' :
               selectedLanguageCode === 'fr' ? 'Spa de luxe' :
               selectedLanguageCode === 'de' ? 'Luxus-Spa' :
               selectedLanguageCode === 'id' ? 'Spa Mewah' :
               selectedLanguageCode === 'vi' ? 'Spa sang trọng' :
               selectedLanguageCode === 'th' ? 'สปาสุดหรู' : 'Luxury Spa';
      case 'Fitness Center':
        return selectedLanguageCode === 'ko' ? '피트니스 센터' :
               selectedLanguageCode === 'ja' ? 'フィットネスセンター' :
               selectedLanguageCode.startsWith('zh') ? '健身中心' :
               selectedLanguageCode === 'es' || selectedLanguageCode.startsWith('es') ? 'Gimnasio' :
               selectedLanguageCode === 'fr' ? 'Salle de sport' :
               selectedLanguageCode === 'de' ? 'Fitnesscenter' :
               selectedLanguageCode === 'id' ? 'Pusat Kebugaran' :
               selectedLanguageCode === 'vi' ? 'Trung tâm thể dục' :
               selectedLanguageCode === 'th' ? 'ฟิตเนสเซ็นเตอร์' : 'Fitness Center';
      case 'Free Breakfast':
        return selectedLanguageCode === 'ko' ? '무료 조식' :
               selectedLanguageCode === 'ja' ? '無料朝食' :
               selectedLanguageCode.startsWith('zh') ? '免费早餐' :
               selectedLanguageCode === 'es' || selectedLanguageCode.startsWith('es') ? 'Desayuno gratis' :
               selectedLanguageCode === 'fr' ? 'Petit-déjeuner gratuit' :
               selectedLanguageCode === 'de' ? 'Kostenloses Frühstück' :
               selectedLanguageCode === 'id' ? 'Sarapan Gratis' :
               selectedLanguageCode === 'vi' ? 'Bữa sáng miễn phí' :
               selectedLanguageCode === 'th' ? 'ฟรีอาหารเช้า' : 'Free Breakfast';
      case 'Rooftop Bar':
        return selectedLanguageCode === 'ko' ? '루프탑 바' :
               selectedLanguageCode === 'ja' ? 'ルーフトップバー' :
               selectedLanguageCode.startsWith('zh') ? '屋顶酒吧' :
               selectedLanguageCode === 'es' || selectedLanguageCode.startsWith('es') ? 'Bar en la azotea' :
               selectedLanguageCode === 'fr' ? 'Bar sur le toit' :
               selectedLanguageCode === 'de' ? 'Rooftop-Bar' :
               selectedLanguageCode === 'id' ? 'Bar Atap' :
               selectedLanguageCode === 'vi' ? 'Quầy bar tầng thượng' :
               selectedLanguageCode === 'th' ? 'รูฟท็อปบาร์' : 'Rooftop Bar';
      default:
        return amenity;
    }
  };

  const getStarLabel = (star: number) => {
    switch (selectedLanguageCode) {
      case 'ko': return `${star}성급`;
      case 'ja': return `${star}星`;
      case 'zh-CN': return `${star}星级`;
      case 'zh-TW': return `${star}星級`;
      case 'es': case 'es-AR': case 'es-MX': return `${star} estrellas`;
      case 'fr': return `${star} étoiles`;
      case 'de': return `${star} Sterne`;
      case 'id': return `Bintang ${star}`;
      case 'vi': return `${star} sao`;
      case 'th': return `${star} ดาว`;
      default: return `${star} Star`;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-5" id="filters-container">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center space-x-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
          <span>{getTranslation('filtersDetailedSetting', selectedLanguageCode)}</span>
        </h3>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
          id="reset-filters-btn"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>{getTranslation('reset', selectedLanguageCode)}</span>
        </button>
      </div>

      {/* Price Filter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>{getTranslation('maxBudget', selectedLanguageCode)}</span>
          <span className="text-blue-600 font-mono font-black">{formatPrice(filters.maxPrice, currency)}</span>
        </div>
        <input
          type="range"
          min={50}
          max={maxPriceLimit || 1000}
          step={10}
          value={filters.maxPrice}
          onChange={handlePriceChange}
          className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-blue-600"
          id="price-range-input"
        />
        <div className="flex justify-between text-[9px] text-slate-400 font-bold font-mono">
          <span>{formatPrice(50, currency)}</span>
          <span>{formatPrice(maxPriceLimit || 1000, currency)}</span>
        </div>
      </div>

      {/* FLIGHT FILTERS (for flights or packages) */}
      {(type === 'flights' || type === 'packages') && (
        <div className="space-y-4 border-t border-slate-100 pt-3">
          {type === 'packages' && (
            <span className="block text-[10px] font-black text-blue-600 uppercase tracking-wider">
              {getTranslation('flightOptions', selectedLanguageCode)}
            </span>
          )}
          {/* Stops Filter */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-700">
              {getTranslation('stops', selectedLanguageCode)}
            </span>
            <div className="grid grid-cols-4 gap-1 bg-slate-50 p-0.5 rounded">
              {(['any', 'direct', '1-stop', '2-stops'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleStopsChange(opt)}
                  className={`py-1 text-[10px] font-bold rounded transition-all ${
                    filters.stops === opt
                      ? 'bg-white text-blue-600 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {opt === 'any' ? getTranslation('all', selectedLanguageCode) :
                   opt === 'direct' ? getTranslation('direct', selectedLanguageCode) :
                   opt === '1-stop' ? getTranslation('oneStop', selectedLanguageCode) :
                   getTranslation('twoStops', selectedLanguageCode)}
                </button>
              ))}
            </div>
          </div>

          {/* Airlines Filter */}
          {availableAirlines.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="block text-xs font-bold text-slate-700">
                {getTranslation('selectAirlines', selectedLanguageCode)}
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {availableAirlines.map((airline) => (
                  <label key={airline.code} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900 font-medium">
                    <input
                      type="checkbox"
                      checked={filters.airlines.includes(airline.code)}
                      onChange={() => handleAirlineToggle(airline.code)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-3.5 w-3.5 accent-blue-600"
                    />
                    <span>{airline.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HOTEL FILTERS (for hotels or packages) */}
      {(type === 'hotels' || type === 'packages') && (
        <div className="space-y-4 border-t border-slate-100 pt-3">
          {type === 'packages' && (
            <span className="block text-[10px] font-black text-blue-600 uppercase tracking-wider">
              {getTranslation('hotelOptions', selectedLanguageCode) || '호텔 옵션'}
            </span>
          )}
          {/* Hotel Rating Stars */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-700">
              {getTranslation('hotelRating', selectedLanguageCode)}
            </span>
            <div className="flex space-x-1">
              {[3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className={`flex-1 flex items-center justify-center space-x-1 py-1.5 border rounded transition-all cursor-pointer text-[11px] font-bold ${
                    filters.hotelRating === star
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Star className={`h-3 w-3 ${filters.hotelRating === star ? 'fill-blue-600 text-blue-600' : 'text-slate-400'}`} />
                  <span>{getStarLabel(star)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hotel Amenities */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-xs font-bold text-slate-700">
              {getTranslation('amenities', selectedLanguageCode)}
            </span>
            <div className="space-y-1.5">
              {hotelAmenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900 font-medium">
                  <input
                    type="checkbox"
                    checked={filters.hotelAmenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-3.5 w-3.5 accent-blue-600"
                  />
                  <span>{getAmenityLabel(amenity)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sustainable badge info */}
      <div className="bg-blue-50/50 border border-blue-100 rounded p-2.5 flex space-x-2">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[10px] text-blue-800 leading-relaxed font-semibold">
          <span className="font-bold block text-blue-900">
            {getTranslation('co2Labeling', selectedLanguageCode)}
          </span>
          {getTranslation('co2LabelingDesc', selectedLanguageCode)}
        </div>
      </div>
    </div>
  );
}
