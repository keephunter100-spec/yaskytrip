import React from 'react';
import { Plane, HelpCircle, Shield, Phone, Mail, Award, CheckCircle } from 'lucide-react';

interface FooterProps {
  onShowRefundPolicy?: () => void;
  selectedLanguageCode?: string;
}

export default function Footer({ onShowRefundPolicy, selectedLanguageCode = 'ko' }: FooterProps) {
  const isKo = selectedLanguageCode === 'ko';

  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5 text-white text-xl">
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white p-1 rounded flex items-center justify-center shadow-sm">
                <Plane className="h-4 w-4 rotate-45 transform" />
              </span>
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

        {/* Brand New Professional Company Info & About Us Sections (회사 정보 / 회사 소개) */}
        <div className="mt-12 pt-8 border-t border-gray-900/80 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-500">
          {/* Column 1: Company Registration Info */}
          <div className="space-y-2.5">
            <h5 className="text-gray-300 font-extrabold uppercase tracking-wider text-[11px] font-sans">
              {isKo ? '사업자 정보' : 'Company Details'}
            </h5>
            <div className="space-y-1.5 font-sans text-[11px] leading-relaxed">
              <p>
                <span className="font-extrabold text-slate-400">{isKo ? '상호명: ' : 'Company Name: '}</span>
                <span className="text-slate-500">(주)야스키트립 (YASKYTRIP Inc.)</span>
              </p>
              <p>
                <span className="font-extrabold text-slate-400">{isKo ? '대표이사: ' : 'CEO: '}</span>
                <span className="text-slate-500">{isKo ? '백정열' : 'Paik Jung-yeol'}</span>
              </p>
              <p>
                <span className="font-extrabold text-slate-400">{isKo ? '사업자등록번호: ' : 'Business Registration: '}</span>
                <span className="text-slate-500 font-mono">120-88-12345</span>
              </p>
              <p>
                <span className="font-extrabold text-slate-400">{isKo ? '통신판매업신고: ' : 'E-Commerce Licence: '}</span>
                <span className="text-slate-500">{isKo ? '제 2026-서울강남-0918호' : 'No. 2026-SeoulGangnam-0918'}</span>
              </p>
            </div>
          </div>

          {/* Column 2: Customer center & Address */}
          <div className="space-y-2.5">
            <h5 className="text-gray-300 font-extrabold uppercase tracking-wider text-[11px] font-sans">
              {isKo ? '고객센터 & 주소' : 'Office & Inquiries'}
            </h5>
            <div className="space-y-1.5 font-sans text-[11px] leading-relaxed">
              <p>
                <span className="font-extrabold text-slate-400">{isKo ? '주소: ' : 'Address: '}</span>
                <span className="text-slate-500">{isKo ? '서울시 강남구 테헤란로 427, 위워크타워 11층' : '11F, WeWork Tower, 427 Teheran-ro, Gangnam-gu, Seoul, Republic of Korea'}</span>
              </p>
              <p>
                <span className="font-extrabold text-slate-400">{isKo ? '이메일: ' : 'Email Support: '}</span>
                <span className="text-slate-500 font-mono">support@yaskytrip.com</span>
              </p>
              <p>
                <span className="font-extrabold text-slate-400">{isKo ? '대표전화: ' : 'Hotline: '}</span>
                <span className="text-slate-500 font-mono">1588-1234 ({isKo ? '평일 09:00 - 18:00, 주말 휴무' : '09:00 - 18:00 KST, Weekends off'})</span>
              </p>
            </div>
          </div>

          {/* Column 3: Corporate Mission & About Us */}
          <div className="space-y-2.5">
            <h5 className="text-gray-300 font-extrabold uppercase tracking-wider text-[11px] font-sans">
              {isKo ? '회사 소개 (About Us)' : 'About YASKYTRIP'}
            </h5>
            <p className="text-[11px] leading-relaxed text-slate-500 text-justify font-sans">
              {isKo 
                ? 'YASKYTRIP(야스키트립)은 빅데이터 매칭 통합 엔진을 통해 전 세계 수많은 항공 경로 및 호텔 실시간 요금을 비교해 드리는 차세대 프리미엄 여행 메타서치 엔진입니다. 우리는 예약을 간결하게 디자인하고 투명하고 합리적인 비용 정보를 제공하여 완벽한 여행 계획을 선물합니다.'
                : 'YASKYTRIP is a high-performance corporate travel metasearch service comparing thousands of schedules and room options globally. Utilizing advanced matching algorithms, we empower global travelers with fully optimized rates, transparent scheduling, and an intuitive booking experience.'}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 select-none">
          <p className="text-left font-sans text-[10px] leading-normal text-slate-600">
            © 2026 YASKYTRIP Inc. This application is a flight and hotel search engine designed with Swiss-Modern high-density typography guidelines. All flights, hotels, and transactions are simulated.
          </p>
          <p className="text-left md:text-right font-sans text-[10px] leading-normal text-slate-600">
            Made with 💙 using React, Tailwind CSS and Motion
          </p>
        </div>
      </div>
    </footer>
  );
}
