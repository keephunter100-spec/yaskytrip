import React from 'react';
import { SlidersHorizontal, DollarSign, Clock, ShieldCheck, Star, RefreshCw } from 'lucide-react';
import { FilterOptions, formatPrice } from '../types';

interface FiltersProps {
  type: 'flights' | 'hotels';
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  availableAirlines?: { code: string; name: string }[];
  maxPriceLimit: number;
  currency?: 'USD' | 'KRW';
}

export default function Filters({ type, filters, setFilters, availableAirlines = [], maxPriceLimit, currency = 'USD' }: FiltersProps) {
  
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

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-5" id="filters-container">
      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
        <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center space-x-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
          <span>필터 상세설정</span>
        </h3>
        <button
          type="button"
          onClick={resetFilters}
          className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center space-x-1 cursor-pointer"
          id="reset-filters-btn"
        >
          <RefreshCw className="h-2.5 w-2.5" />
          <span>초기화</span>
        </button>
      </div>

      {/* Price Filter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-700">
          <span>최대 예산</span>
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

      {/* FLIGHT ONLY FILTERS */}
      {type === 'flights' ? (
        <>
          {/* Stops Filter */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-700">경유 횟수</span>
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
                  {opt === 'any' ? '전체' : opt === 'direct' ? '직항' : opt === '1-stop' ? '1회' : '2회+'}
                </button>
              ))}
            </div>
          </div>

          {/* Airlines Filter */}
          {availableAirlines.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="block text-xs font-bold text-slate-700">항공사 선택</span>
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
        </>
      ) : (
        /* HOTEL ONLY FILTERS */
        <>
          {/* Hotel Rating Stars */}
          <div className="space-y-1.5">
            <span className="block text-xs font-bold text-slate-700">호텔 성급</span>
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
                  <span>{star}성급</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hotel Amenities */}
          <div className="space-y-1.5 pt-1">
            <span className="block text-xs font-bold text-slate-700">인기 편의시설</span>
            <div className="space-y-1.5">
              {hotelAmenitiesList.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900 font-medium">
                  <input
                    type="checkbox"
                    checked={filters.hotelAmenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-3.5 w-3.5 accent-blue-600"
                  />
                  <span>
                    {amenity === 'Free WiFi' ? '무료 와이파이' :
                     amenity === 'Infinity Pool' ? '야외/인피니티 풀' :
                     amenity === 'Luxury Spa' ? '스파 & 마사지' :
                     amenity === 'Fitness Center' ? '피트니스 센터' :
                     amenity === 'Free Breakfast' ? '무료 조식' :
                     amenity === 'Rooftop Bar' ? '루프탑 바' : amenity}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Sustainable badge info */}
      <div className="bg-blue-50/50 border border-blue-100 rounded p-2.5 flex space-x-2">
        <ShieldCheck className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-[10px] text-blue-800 leading-relaxed font-semibold">
          <span className="font-bold block text-blue-900">이산화탄소 저감 표기</span>
          YASKYTRIP은 평균 배출량 대비 탄소 배출이 더 적은 비행편에 그린 배지를 표기합니다.
        </div>
      </div>
    </div>
  );
}
