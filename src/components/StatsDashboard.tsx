import React from 'react';
import { DollarSign, Zap, Sparkles, Star, Award, Compass } from 'lucide-react';
import { Flight, Hotel, formatPrice } from '../types';

interface StatsDashboardProps {
  type: 'flights' | 'hotels' | 'packages';
  flights?: Flight[];
  hotels?: Hotel[];
  activeSort: 'best' | 'cheapest' | 'fastest' | 'rating';
  setActiveSort: (sort: any) => void;
  currency?: string;
}

export default function StatsDashboard({ type, flights = [], hotels = [], activeSort, setActiveSort, currency = 'USD' }: StatsDashboardProps) {
  
  if (type === 'flights') {
    // Calculate best, cheapest, fastest from the list
    if (flights.length === 0) return null;

    const sortedByPrice = [...flights].sort((a, b) => a.price - b.price);
    const cheapest = sortedByPrice[0];

    const sortedByDuration = [...flights].sort((a, b) => {
      const aDur = a.totalDurationOutbound + (a.totalDurationInbound || 0);
      const bDur = b.totalDurationOutbound + (b.totalDurationInbound || 0);
      return aDur - bDur;
    });
    const fastest = sortedByDuration[0];

    const sortedByScore = [...flights].sort((a, b) => b.score - a.score);
    const best = sortedByScore[0];

    const formatDuration = (mins: number) => {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}시간 ${remainingMins}분`;
    };

    return (
      <div className="grid grid-cols-3 gap-2.5" id="stats-dashboard-flights">
        {/* Best */}
        <button
          type="button"
          onClick={() => setActiveSort('best')}
          className={`p-3 border rounded-lg text-left transition-all cursor-pointer ${
            activeSort === 'best'
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Sparkles className={`h-3.5 w-3.5 ${activeSort === 'best' ? 'text-white' : 'text-blue-600'}`} />
            <span className="text-[10px] font-bold tracking-tight opacity-90 block uppercase">추천 항공편</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-base font-black font-sans">{formatPrice(best.price, currency)}</span>
            <span className="text-[9px] opacity-75 font-semibold">평균 {formatDuration(best.totalDurationOutbound)}</span>
          </div>
        </button>

        {/* Cheapest */}
        <button
          type="button"
          onClick={() => setActiveSort('cheapest')}
          className={`p-3 border rounded-lg text-left transition-all cursor-pointer ${
            activeSort === 'cheapest'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <DollarSign className={`h-3.5 w-3.5 ${activeSort === 'cheapest' ? 'text-white' : 'text-emerald-600'}`} />
            <span className="text-[10px] font-bold tracking-tight opacity-90 block uppercase">최저가</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-base font-black font-sans">{formatPrice(cheapest.price, currency)}</span>
            <span className="text-[9px] opacity-75 font-semibold">평균 {formatDuration(cheapest.totalDurationOutbound)}</span>
          </div>
        </button>

        {/* Fastest */}
        <button
          type="button"
          onClick={() => setActiveSort('fastest')}
          className={`p-3 border rounded-lg text-left transition-all cursor-pointer ${
            activeSort === 'fastest'
              ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Zap className={`h-3.5 w-3.5 ${activeSort === 'fastest' ? 'text-white' : 'text-orange-500'}`} />
            <span className="text-[10px] font-bold tracking-tight opacity-90 block uppercase">가장 빠름</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-base font-black font-sans">{formatPrice(fastest.price, currency)}</span>
            <span className="text-[9px] opacity-75 font-semibold">평균 {formatDuration(fastest.totalDurationOutbound)}</span>
          </div>
        </button>
      </div>
    );
  } else {
    // Hotel Stats triggers
    if (hotels.length === 0) return null;

    const sortedByPrice = [...hotels].sort((a, b) => a.pricePerNight - b.pricePerNight);
    const cheapest = sortedByPrice[0];

    const sortedByRating = [...hotels].sort((a, b) => b.reviewScore - a.reviewScore);
    const highlyRated = sortedByRating[0];

    const sortedByReviewsCount = [...hotels].sort((a, b) => b.reviewCount - a.reviewCount);
    const popular = sortedByReviewsCount[0];

    return (
      <div className="grid grid-cols-3 gap-2.5" id="stats-dashboard-hotels">
        {/* Best Rated */}
        <button
          type="button"
          onClick={() => setActiveSort('rating')}
          className={`p-3 border rounded-lg text-left transition-all cursor-pointer ${
            activeSort === 'rating'
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Award className={`h-3.5 w-3.5 ${activeSort === 'rating' ? 'text-white' : 'text-blue-600'}`} />
            <span className="text-[10px] font-bold tracking-tight opacity-90 block uppercase">최고 평점</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-base font-black font-sans">{formatPrice(highlyRated.pricePerNight, currency)}</span>
            <span className="text-[9px] opacity-75 font-semibold">평점 ★{highlyRated.reviewScore}</span>
          </div>
        </button>

        {/* Cheapest Hotel */}
        <button
          type="button"
          onClick={() => setActiveSort('cheapest')}
          className={`p-3 border rounded-lg text-left transition-all cursor-pointer ${
            activeSort === 'cheapest'
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <DollarSign className={`h-3.5 w-3.5 ${activeSort === 'cheapest' ? 'text-white' : 'text-emerald-600'}`} />
            <span className="text-[10px] font-bold tracking-tight opacity-90 block uppercase">최저가</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-base font-black font-sans">{formatPrice(cheapest.pricePerNight, currency)}</span>
            <span className="text-[9px] opacity-75 font-semibold">최저가 보장</span>
          </div>
        </button>

        {/* Most Popular */}
        <button
          type="button"
          onClick={() => setActiveSort('best')}
          className={`p-3 border rounded-lg text-left transition-all cursor-pointer ${
            activeSort === 'best'
              ? 'bg-violet-600 border-violet-600 text-white shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
          }`}
        >
          <div className="flex items-center space-x-1.5">
            <Compass className={`h-3.5 w-3.5 ${activeSort === 'best' ? 'text-white' : 'text-violet-600'}`} />
            <span className="text-[10px] font-bold tracking-tight opacity-90 block uppercase font-sans">최다 후기</span>
          </div>
          <div className="mt-1 flex items-baseline space-x-1.5">
            <span className="text-base font-black font-sans">{formatPrice(popular.pricePerNight, currency)}</span>
            <span className="text-[9px] opacity-75 font-semibold">{popular.reviewCount}개 후기</span>
          </div>
        </button>
      </div>
    );
  }
}
