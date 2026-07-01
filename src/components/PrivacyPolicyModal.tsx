import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Lock, FileText, CheckCircle, HelpCircle, Eye } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" 
        id="privacy-policy-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100"
          id="privacy-policy-modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Accent Header Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50 cursor-pointer"
            id="privacy-policy-close-btn"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 pt-10">
            {/* Title Block */}
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold tracking-wider mb-2 uppercase">
                YASKYTRIP PRIVACY
              </span>
              <h3 className="text-xl font-black text-slate-800" id="privacy-policy-title">
                개인정보처리방침 (Privacy Policy)
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                야스카이트립은 이용자의 소중한 개인정보를 안전하게 보호하며 법적 고지 의무를 준수합니다.
              </p>
            </div>

            {/* Core Notification Box */}
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mb-6 text-xs text-emerald-800 font-medium leading-relaxed flex space-x-3">
              <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900 mb-0.5">이용자 안심 고지</p>
                야스카이트립(YASKYTRIP)은 모의 항공 및 호텔 최저가 비교 검색 엔진 서비스입니다. 본 사이트의 예약 및 개인정보 입력 과정은 실제 결제가 이루어지지 않는 시뮬레이션 환경이지만, 개인정보보호법 제30조에 따라 이용자의 권익 보호 및 정보 보호를 성실히 수행하기 위해 개인정보처리방침을 적용 및 공개하고 있습니다.
              </div>
            </div>

            {/* Detailed sections */}
            <div className="space-y-6 text-xs leading-relaxed text-slate-600 font-medium">
              
              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>1. 개인정보 수집 항목 및 방법</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  야스카이트립은 회원 가입, 신속한 항공권/호텔 일정 조회, 예약 관리 및 맞춤형 고객 관리를 위해 최소한의 필요 개인정보를 수집하고 있습니다.
                </p>
                <div className="pl-3 bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1">
                  <p className="text-[11px] text-slate-700 font-bold">수집 항목:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px]">
                    <li>가입 및 본인확인: 이메일 주소, 비밀번호, 닉네임 (소셜 간편 가입 포함)</li>
                    <li>예약 및 발권 서비스(모의): 출발지/목적지, 여행 일정, 탑승객/투숙객 정보(이름, 이메일, 휴대전화 번호)</li>
                    <li>자동 수집 항목: IP 주소, 접속 로그, 쿠키(Cookie), 서비스 이용 기록 및 브라우저 정보</li>
                  </ul>
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>2. 개인정보 수집 및 이용 목적</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  당사는 수집된 개인정보를 다음 목적 외에는 활용하지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법에 따라 사전에 동의를 구하는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <ul className="pl-6 list-disc space-y-1 text-slate-400 text-[11px]">
                  <li><b>서비스 제공:</b> 항공권 및 호텔 실시간 비교 검색, '나의 예약' 보관함 기능 및 여행 상품 추천</li>
                  <li><b>이용자 관리:</b> 본인 식별 확인, 불량 이용자의 부정 이용 방지 및 비인가 접근 예방</li>
                  <li><b>고객 커뮤니케이션:</b> 예약 상태 변경 고지, 긴급 알림 메시지 발송, 문의사항 피드백 및 고객지원</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>3. 개인정보의 보유 및 이용 기간</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  이용자의 개인정보는 원칙적으로 개인정보 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 단, 관계법령 규정에 의하여 일정 기간 보존할 필요가 있는 경우 다음과 같이 보관합니다.
                </p>
                <ul className="pl-6 list-disc space-y-1 text-slate-400 text-[11px]">
                  <li><b>회원 탈퇴 시:</b> 부정 가입 및 도용 재방지를 위해 탈퇴 완료 시점으로부터 최대 30일간 보관 후 즉시 완전 영구 삭제</li>
                  <li><b>계약 또는 청약철회 등에 관한 기록:</b> 5년 (전자상거래등에서의 소비자보호에 관한 법률)</li>
                  <li><b>소비자의 불만 또는 분쟁처리에 관한 기록:</b> 3년 (전자상거래등에서의 소비자보호에 관한 법률)</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>4. 개인정보의 제3자 제공 및 위탁에 관한 안내</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  야스카이트립은 원칙적으로 이용자의 개인정보를 동의 없이 제3자에게 외부에 제공하거나 위탁하지 않습니다. 단, 이용자가 직접 검색 결과에서 외부 파트너 여행 사이트(예: Trip.com, Agoda 등)로 이동하여 상품을 최종 구매하는 경우, 원활한 서비스 연계를 위해 각 플랫폼이 규정한 개인정보 처리방침에 따라 정보가 관리되며 본 서비스가 해당 정보를 중개 보관하지 않습니다.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>5. 정보주체의 권리·의무 및 행사방법</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  정보주체(이용자)는 야스카이트립에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있으며, 회원 프로필 수정 메뉴 또는 이메일 접수를 통해 상시 처리하실 수 있습니다.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>6. 개인정보 보호책임자 및 상담부서</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  야스카이트립은 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
                </p>
                <div className="pl-3 bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1 text-[11px] text-slate-700">
                  <p><b>개인정보 보호책임 부서:</b> 야스카이트립 정보보안 규제대응팀 (Security & Privacy Compliance)</p>
                  <p><b>책임자 연락 이메일:</b> <a href="mailto:privacy@yaskytrip.com" className="text-emerald-600 font-bold hover:underline">privacy@yaskytrip.com</a></p>
                  <p><b>시행일자:</b> 2026년 7월 1일 개정</p>
                </div>
              </div>

            </div>

            {/* Bottom Support Information */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-500">
              <div className="flex items-center space-x-1.5 mb-4 sm:mb-0">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span className="text-[11px] font-bold text-slate-700">모든 통신 구간은 SSL 보안 암호화로 한 번 더 안전하게 보호됩니다.</span>
              </div>
            </div>

            {/* Confirmation Action Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm text-center focus:outline-hidden"
              >
                개인정보보호정책 내용 확인 및 확인완료
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
