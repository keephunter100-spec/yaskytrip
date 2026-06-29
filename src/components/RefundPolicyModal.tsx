import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, CheckCircle, RefreshCcw, HelpCircle, ExternalLink } from 'lucide-react';

interface RefundPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RefundPolicyModal({ isOpen, onClose }: RefundPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs" 
        id="refund-policy-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-100"
          id="refund-policy-modal-card"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking card inside
        >
          {/* Accent Header Line */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50 cursor-pointer"
            id="refund-policy-close-btn"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="p-8 pt-10">
            {/* Title Block */}
            <div className="text-center mb-8">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-wider mb-2 uppercase">
                YASKYTRIP POLICIES
              </span>
              <h3 className="text-xl font-black text-slate-800" id="refund-policy-title">
                취소 및 환불 정책 안내
              </h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-medium">
                야스카이트립 이용 및 연동 파트너사 예약에 관한 취소·변경·환불 정책입니다.
              </p>
            </div>

            {/* Core Notification Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-xs text-blue-800 font-medium leading-relaxed flex space-x-3">
              <ShieldAlert className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-blue-900 mb-0.5">꼭 확인해 주세요!</p>
                야스카이트립은 실시간 최저가 정보를 비교 분석하는 <b>메타서치 플랫폼</b>입니다. 결제 및 발권은 이동하신 개별 제휴 공식 파트너사에서 완료되므로, 변경 및 취소 역시 해당 사이트의 규정에 따릅니다.
              </div>
            </div>

            {/* Structured Guidelines */}
            <div className="space-y-6 text-xs leading-relaxed text-slate-600 font-medium">
              
              {/* Section 1 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  <span>1. 공식 파트너사 예약 건 취소 및 변경</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  트립닷컴, 아고다, 부킹닷컴 등 파트너사를 통해 결제하신 상품은 <b>해당 사이트의 고객센터</b>를 통해 직접 취소 또는 환불 절차를 진행하셔야 합니다.
                </p>
                <ul className="pl-6 list-disc space-y-1 text-slate-400 text-[11px]">
                  <li>각 결제처의 메일 영수증이나 예약 확인서에 명시된 연락처로 문의하시면 빠르게 처리할 수 있습니다.</li>
                  <li>특가 항공권이나 환불 불가형 객실은 예약 확정 후 취소 수수료가 100% 부과될 수 있습니다.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  <span>2. 야스카이트립 일정 보관 및 등록 취소</span>
                </h4>
                <p className="pl-3 text-slate-500">
                  메타서치 안내 후 <b>'나의 예약'</b>에 등록하신 가상 일정은 메인 화면의 우측 상단 '나의 예약' 탭에서 언제든지 자유롭게 삭제 및 취소 등록할 수 있습니다.
                </p>
                <ul className="pl-6 list-disc space-y-1 text-slate-400 text-[11px]">
                  <li>야스카이트립 일정 관리함에서의 취소는 시스템 보관 내역만 제거하는 것이며, 실제 항공사/호텔의 실제 발권 계약을 파기하지는 않습니다.</li>
                  <li>모의 예약 과정에서 모의로 등록된 임시 예약 건은 취소 시 즉시 100% 환불 처리로 가상 복구됩니다.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h4 className="text-sm font-black text-slate-800 flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
                  <span>3. 주요 상품별 환불 규정 안내</span>
                </h4>
                <div className="pl-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-2">
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 text-[11px] block">✈️ 실시간 항공권</span>
                    <p className="text-[10px] text-slate-500 font-medium">
                      출발 24시간 전 국토교통부 표준 약관에 의거하여 결제 당일 내 취소 시 전액 환불 처리가 보장되는 플랫폼이 많습니다. 이후에는 항공사별 자체 취소 위약금이 차등 부과됩니다.
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-800 text-[11px] block">🏨 호텔 및 숙박</span>
                    <p className="text-[10px] text-slate-500 font-medium">
                      '무료 취소 기한' 표시가 있는 예약의 경우, 기한 이내에 취소하시면 수수료 없이 전액 환불 가능합니다. '환불 불가' 요금제는 기한에 상관없이 환불되지 않습니다.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Support Information */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-500">
              <div className="flex items-center space-x-1.5 mb-4 sm:mb-0">
                <HelpCircle className="h-4 w-4 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-700">추가적인 문의사항은 자주 묻는 질문을 이용해 주세요.</span>
              </div>
            </div>

            {/* Confirmation Action Button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-xs py-3 rounded-xl transition-all cursor-pointer shadow-sm text-center"
              >
                규정 확인 완료 및 창 닫기
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
