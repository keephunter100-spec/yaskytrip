import React from 'react';
import { Plane, HelpCircle, Shield, Phone, Mail, Award, CheckCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 py-12 border-t border-gray-900" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Slogan */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white text-xl font-bold">
              <span className="bg-blue-600 text-white p-1 rounded flex items-center justify-center">
                <Plane className="h-4 w-4 rotate-45 transform" />
              </span>
              <span className="text-blue-500">YASKYTRIP</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              YASKYTRIP은 전 세계 수백 개의 여행 사이트를 단번에 검색하여 가장 저렴한 비행기 표와 완벽한 호텔을 찾아드립니다. 완벽한 계획을 보다 합리적으로 즐겨보세요.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-500">
              <Shield className="h-3.5 w-3.5 text-blue-600" />
              <span>안전 결제 & 개인정보 보호 표준 준수</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">서비스 링크</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">항공권 검색</a></li>
              <li><a href="#" className="hover:text-white transition-colors">호텔 예약</a></li>
              <li><a href="#" className="hover:text-white transition-colors">최저가 보장제</a></li>
              <li><a href="#" className="hover:text-white transition-colors">추천 여행지</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4 font-sans">고객 지원</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors flex items-center space-x-1"><HelpCircle className="h-3 w-3" /> <span>자주 묻는 질문 (FAQ)</span></a></li>
              <li><span className="flex items-center space-x-1"><Phone className="h-3 w-3 text-blue-600" /> <span>고객센터: 1544-0000</span></span></li>
              <li><span className="flex items-center space-x-1"><Mail className="h-3 w-3 text-blue-600" /> <span>support@yaskytrip.com</span></span></li>
              <li><a href="#" className="hover:text-white transition-colors">취소 및 환불 안내</a></li>
            </ul>
          </div>

          {/* Trust badges */}
          <div className="space-y-4">
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider">안전 & 신뢰 가치</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-900 p-2.5 rounded border border-gray-800 flex flex-col items-center justify-center text-center">
                <Award className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-[10px] text-gray-300 font-medium">최저가 보장</span>
              </div>
              <div className="bg-gray-900 p-2.5 rounded border border-gray-800 flex flex-col items-center justify-center text-center">
                <CheckCircle className="h-5 w-5 text-emerald-400 mb-1" />
                <span className="text-[10px] text-gray-300 font-medium">실시간 확정</span>
              </div>
            </div>
            <p className="text-[10px] text-gray-600 leading-normal">
              © 2026 YASKYTRIP Inc. This application is a flight and hotel search engine designed with Swiss-Modern high-density typography guidelines. All flights and hotels are simulated assets.
            </p>
          </div>
          
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-900 text-center text-xs text-gray-600">
          <p>Made with 💙 using React, Tailwind CSS and Motion</p>
        </div>
      </div>
    </footer>
  );
}
