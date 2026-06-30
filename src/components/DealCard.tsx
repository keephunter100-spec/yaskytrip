import React, { useState } from 'react';
import { DiscountDeal } from '../types';
import { Tag, Calendar, Copy, Check, Ticket, Sparkles } from 'lucide-react';

interface DealCardProps {
  deal: DiscountDeal;
  selectedLanguageCode?: string;
}

export default function DealCard({ deal, selectedLanguageCode = 'ko' }: DealCardProps) {
  const [copied, setCopied] = useState(false);
  const isKo = selectedLanguageCode === 'ko';

  const categoryLabels: Record<string, string> = {
    flight: isKo ? '항공권 할인' : 'Flights',
    hotel: isKo ? '호텔 특가' : 'Hotels',
    car: isKo ? '렌터카 쿠폰' : 'Car Rentals',
    card: isKo ? '카드사 혜택' : 'Cards & Banks',
    seasonal: isKo ? '시즌 특별가' : 'Seasonal Deal',
  };

  const handleCopy = () => {
    if (deal.promoCode) {
      navigator.clipboard.writeText(deal.promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col md:flex-row relative group overflow-hidden"
      id={`deal-card-${deal.id}`}
    >
      {/* Left Column: Visual accent & Discount value (Coupon style) */}
      <div className="w-full md:w-56 bg-gradient-to-br from-indigo-600 via-indigo-800 to-slate-900 text-white p-6 flex flex-col justify-between items-center text-center relative shrink-0">
        {/* Subtle decorative circles to mimic punch holes */}
        <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-slate-200/50 z-10"></div>
        
        <div className="w-full">
          <span className="inline-block bg-white/15 backdrop-blur-xs text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">
            {categoryLabels[deal.category] || deal.category}
          </span>
          <div className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-amber-300">
            {deal.discountAmount}
          </div>
        </div>

        <div className="w-full mt-6">
          <span className="block text-[10px] text-indigo-200 font-bold uppercase tracking-wider">{isKo ? '스폰서 파트너' : 'Sponsor'}</span>
          <span className="block text-sm font-extrabold text-white mt-0.5">{deal.sponsor}</span>
        </div>
      </div>

      {/* Right Column: Information & Actions */}
      <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{isKo ? '만료일:' : 'Expires:'} {deal.expiresAt}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
            {deal.title}
          </h3>

          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {deal.description}
          </p>
        </div>

        {/* Terms detail */}
        <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium leading-normal bg-slate-50/50 -mx-6 -mb-6 px-6 pb-6 pt-4 rounded-b-3xl">
          <div className="flex items-start space-x-1.5">
            <Ticket className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-500">{isKo ? '유의사항:' : 'Terms:'}</strong> {deal.terms}
            </p>
          </div>

          {/* Promo Code section */}
          {deal.promoCode && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-100/60">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{isKo ? '프로모션 코드' : 'PROMO CODE'}</span>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-black text-sm px-3 py-1 rounded-lg">
                  {deal.promoCode}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer ${
                  copied 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:scale-[1.02] border border-indigo-100/50'
                }`}
                id={`copy-code-${deal.id}`}
              >
                {copied ? (
                  <>
                    <Check className="h-4.5 w-4.5" />
                    <span>{isKo ? '복사 완료!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>{isKo ? '쿠폰 코드 복사' : 'Copy Code'}</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
