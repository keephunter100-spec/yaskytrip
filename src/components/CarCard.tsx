import React from 'react';
import { CarRental, formatPrice } from '../types';
import { Car, Fuel, Star, ThumbsUp, Shield, Users } from 'lucide-react';

interface CarCardProps {
  car: CarRental;
  onBook: (car: CarRental) => void;
  currency: string;
  selectedLanguageCode?: string;
}

export default function CarCard({ car, onBook, currency, selectedLanguageCode = 'ko' }: CarCardProps) {
  const isKo = selectedLanguageCode === 'ko';

  const typeLabels: Record<string, string> = {
    compact: isKo ? '소형/준중형' : 'Compact',
    suv: isKo ? 'SUV' : 'SUV',
    sedan: isKo ? '대형 세단' : 'Premium Sedan',
    luxury: isKo ? '럭셔리 슈퍼카' : 'Luxury Sport',
    electric: isKo ? '친환경 전기차' : 'Eco Electric',
  };

  const fuelLabels: Record<string, string> = {
    gasoline: isKo ? '가솔린' : 'Gasoline',
    diesel: isKo ? '디젤' : 'Diesel',
    electric: isKo ? '전기차' : 'Electric',
    hybrid: isKo ? '하이브리드' : 'Hybrid',
  };

  const transmissionLabels: Record<string, string> = {
    auto: isKo ? '오토' : 'Automatic',
    manual: isKo ? '수동' : 'Manual',
  };

  return (
    <div 
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 p-5 sm:p-6 flex flex-col md:flex-row gap-6 relative group overflow-hidden"
      id={`car-card-${car.id}`}
    >
      {/* Dynamic Background subtle glow on hover */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Image container */}
      <div className="w-full md:w-56 h-40 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-3 shrink-0 relative overflow-hidden">
        <img 
          src={car.imageUrl} 
          alt={car.name} 
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to custom placeholder icon on load error
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
          {typeLabels[car.type] || car.type}
        </div>
      </div>

      {/* Car specifications */}
      <div className="flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{car.provider}</span>
            <span className="text-slate-300">•</span>
            <div className="flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-400" />
              <span className="text-xs font-extrabold text-slate-700">{car.rating.toFixed(1)}</span>
              <span className="text-[10px] text-slate-400 font-medium">({car.reviewCount})</span>
            </div>
          </div>
          
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug group-hover:text-blue-600 transition-colors">
            {car.name}
          </h3>

          {/* Core Spec Badges */}
          <div className="flex flex-wrap gap-2.5 mt-3.5">
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-bold">
              <Car className="h-3.5 w-3.5 text-slate-400" />
              <span>{transmissionLabels[car.transmission] || car.transmission}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-bold">
              <Fuel className="h-3.5 w-3.5 text-slate-400" />
              <span>{fuelLabels[car.fuelType] || car.fuelType}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs text-slate-600 font-bold">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span>{isKo ? `${car.seats}인승` : `${car.seats} Seats`}</span>
            </div>
          </div>
        </div>

        {/* Feature inclusions */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium border-t border-slate-100 pt-3">
          {car.features.map((feature, idx) => (
            <span key={idx} className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <span>{feature}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Pricing & Booking column */}
      <div className="w-full md:w-48 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 flex md:flex-col justify-between items-center md:items-end shrink-0 self-stretch">
        <div className="text-left md:text-right">
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {isKo ? '1일 기준 요금' : 'Per Day Rate'}
          </span>
          <div className="flex items-baseline md:justify-end mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {formatPrice(car.pricePerDay, currency)}
            </span>
            <span className="text-xs text-slate-400 font-bold ml-1">/{isKo ? '일' : 'day'}</span>
          </div>
          <span className="block text-[9px] text-emerald-600 font-extrabold mt-1.5 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100 inline-block">
            {isKo ? '✓ 공항 무료 셔틀 포함' : '✓ Free airport shuttle'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onBook(car)}
          className="px-5 py-3 bg-[#1E60FF] hover:bg-[#004EE0] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer text-center"
          id={`book-car-btn-${car.id}`}
        >
          {isKo ? '실시간 예약하기' : 'Book Rental'}
        </button>
      </div>
    </div>
  );
}
