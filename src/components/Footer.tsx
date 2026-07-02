import React from 'react';
import { Plane, HelpCircle, Shield, Phone, Mail, Award, CheckCircle } from 'lucide-react';

interface FooterProps {
  onShowRefundPolicy?: () => void;
  onShowPrivacyPolicy?: () => void;
  selectedLanguageCode?: string;
}

export default function Footer({ onShowRefundPolicy, onShowPrivacyPolicy, selectedLanguageCode = 'ko' }: FooterProps) {
  const isKo = selectedLanguageCode === 'ko';

  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 text-white text-xl">
              <img
                src="/sharp_favicon_1782905090836.jpg"
                alt="YASKYTRIP Logo"
                className="h-8 w-8 rounded-lg object-cover shadow-sm border border-slate-800"
                referrerPolicy="no-referrer"
              />
              <span className="logo-custom text-lg tracking-[0.08em] bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 uppercase font-bold select-none">YASKYTRIP</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isKo 
                ? 'YASKYTRIP은 전 세계 수백 개의 여행 사이트를 단번에 검색하여 가장 저렴한 비행기 표와 완벽한 호텔을 찾아드립니다. 완벽한 계획을 보다 합리적으로 즐겨보세요.'
                : 'YASKYTRIP compares thousands of routes and rooms in an instant to find the absolute best rates for your next adventure.'}
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>{isKo ? '안전 결제 & 개인정보 보호 표준 준수' : 'Secure Payments & Encrypted Privacy'}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">{isKo ? '서비스 링크' : 'Navigation'}</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">{isKo ? '항공권 검색' : 'Search Flights'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isKo ? '호텔 예약' : 'Book Hotels'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isKo ? '최저가 보장제' : 'Best Rate Guarantee'}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{isKo ? '추천 여행지' : 'Top Destinations'}</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-sans">{isKo ? '고객 지원' : 'Support'}</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors flex items-center space-x-1"><HelpCircle className="h-3 w-3" /> <span>{isKo ? '자주 묻는 질문 (FAQ)' : 'FAQ & Support'}</span></a></li>
              <li>
                <button 
                  onClick={onShowRefundPolicy} 
                  className="hover:text-white transition-colors cursor-pointer text-left focus:outline-hidden"
                  id="footer-refund-policy-btn"
                >
                  {isKo ? '취소 및 환불 안내' : 'Cancellations & Refunds'}
                </button>
              </li>
              <li>
                <button 
                  onClick={onShowPrivacyPolicy} 
                  className="hover:text-white transition-colors cursor-pointer text-left focus:outline-hidden"
                  id="footer-privacy-policy-btn"
                >
                  {isKo ? '개인정보보호정책' : 'Privacy Policy'}
                </button>
              </li>
            </ul>
          </div>

          {/* Trust badges */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">{isKo ? '안전 & 신뢰 가치' : 'Trust & Reliability'}</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900 p-2.5 rounded border border-gray-800 flex flex-col items-center justify-center text-center">
                <Award className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-[10px] text-gray-300 font-medium">{isKo ? '최저가 보장' : 'Best Price'}</span>
              </div>
              <div className="bg-gray-900 p-2.5 rounded border border-gray-800 flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-5 w-5 text-emerald-400 mb-1" />
                <span className="text-[10px] text-gray-300 font-medium">{isKo ? '실시간 확정' : 'Instant Confirmation'}</span>
              </div>
            </div>
          </div>
          
        </div>



        <div className="mt-8 pt-8 border-t border-gray-900 flex justify-center text-xs text-gray-600 select-none">
          <p className="font-sans text-[10px] leading-normal text-slate-600 text-center">
            © 2026 YASKYTRIP Inc.
          </p>
        </div>
      </div>
    </footer>
  );
}
