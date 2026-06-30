import React, { useState } from 'react';
import { CarRental, formatPrice, BookingDetails } from '../types';
import { X, CheckCircle, Mail, Phone, CreditCard, ShieldCheck, FileText, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarBookingModalProps {
  isOpen: boolean;
  car: CarRental | null;
  onClose: () => void;
  onConfirmBooking: (booking: BookingDetails) => void;
  currency: string;
  selectedLanguageCode?: string;
  rentalDays?: number;
}

export default function CarBookingModal({
  isOpen,
  car,
  onClose,
  onConfirmBooking,
  currency = 'USD',
  selectedLanguageCode = 'ko',
  rentalDays = 3,
}: CarBookingModalProps) {
  const [step, setStep] = useState(1);
  const [driverName, setDriverName] = useState('백선엽');
  const [phone, setPhone] = useState('010-1234-5678');
  const [licenseNumber, setLicenseNumber] = useState('11-12-345678-90');
  const [email, setEmail] = useState('koreapaik@gmail.com');

  // Payment State
  const [cardNumber, setCardNumber] = useState('4532 7182 9301 8475');
  const [cardExpiry, setCardExpiry] = useState('09/28');
  const [cardCvc, setCardCvc] = useState('384');

  const isKo = selectedLanguageCode === 'ko';

  if (!isOpen || !car) return null;

  const insurancePrice = car.type === 'luxury' || car.type === 'electric' ? 25 : 15;
  const subtotal = car.pricePerDay * rentalDays;
  const taxesAndFees = Math.ceil(subtotal * 0.1);
  const total = subtotal + taxesAndFees + (insurancePrice * rentalDays);

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Confirm booking
      const newBooking: BookingDetails = {
        id: `bk-car-${Date.now()}`,
        type: 'car',
        totalPrice: total,
        bookingDate: new Date().toLocaleDateString(),
        selectedRoomType: 'Full Coverage Insurance Included',
        passengers: [{
          firstName: driverName,
          lastName: '',
          passportNumber: licenseNumber,
          email: email,
          phone: phone,
        }],
        car: car, // Custom field supported by types!
      };
      onConfirmBooking(newBooking);
      setStep(4); // Success step
    }
  };

  const bookingRef = `YTR-CAR-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black">{isKo ? '렌터카 실시간 예약하기' : 'Book Rental Car'}</h3>
            <p className="text-[10px] text-blue-100 font-bold tracking-wide uppercase mt-0.5">{car.provider} • {car.name}</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {step < 4 && (
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>1</span>
                <span className="text-xs font-extrabold text-slate-700">{isKo ? '운전자 정보' : 'Driver'}</span>
              </div>
              <span className="text-slate-300">/</span>
              <div className="flex items-center space-x-2">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
                <span className="text-xs font-extrabold text-slate-700">{isKo ? '결제 수단' : 'Payment'}</span>
              </div>
              <span className="text-slate-300">/</span>
              <div className="flex items-center space-x-2">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
                <span className="text-xs font-extrabold text-slate-700">{isKo ? '최종 확인' : 'Confirm'}</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Step {step} of 3</span>
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
                <p className="text-xs text-slate-600 font-bold leading-relaxed">
                  {isKo 
                    ? '면허증 정보가 정확하지 않을 경우 현장에서 차량 인수가 거부될 수 있습니다. 반드시 유효한 운전면허 소지자의 정보를 입력해 주세요.' 
                    : 'A valid driver license matching the entered driver name must be presented at the rental counter.'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 font-extrabold uppercase mb-1.5">{isKo ? '운전자 본명' : 'Full Name'}</label>
                  <input 
                    type="text" 
                    value={driverName} 
                    onChange={e => setDriverName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-extrabold uppercase mb-1.5">{isKo ? '휴대전화 번호' : 'Phone Number'}</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-extrabold uppercase mb-1.5">{isKo ? '이메일 주소' : 'Email Address'}</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-extrabold uppercase mb-1.5">{isKo ? '운전면허증 번호' : 'Drivers License Number'}</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={licenseNumber} 
                    onChange={e => setLicenseNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-indigo-600" />
                  <div>
                    <span className="text-xs font-black text-slate-700 block">{isKo ? '신용/체크카드 간편 결제' : 'Credit / Debit Card'}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{isKo ? '안전한 PG사 토스페이먼츠 연동' : 'Secured via standard PG'}</span>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 font-extrabold uppercase mb-1.5">{isKo ? '카드 번호' : 'Card Number'}</label>
                <input 
                  type="text" 
                  value={cardNumber} 
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-slate-400 font-extrabold uppercase mb-1.5">{isKo ? '유효 기간' : 'Expiry Date'}</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    value={cardExpiry} 
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 font-extrabold uppercase mb-1.5">CVC (3자리)</label>
                  <input 
                    type="password" 
                    maxLength={3} 
                    value={cardCvc} 
                    onChange={e => setCardCvc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-extrabold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-hidden text-center"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200/60 p-5 space-y-4">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider border-b border-slate-200 pb-2">{isKo ? '상세 요금 내역' : 'Pricing Summary'}</h4>
                
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>{car.name} ({isKo ? `${rentalDays}일 대여` : `${rentalDays} days`})</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>{isKo ? '완전 자차 보험료 (인공지능 사고 케어)' : 'Full Coverage Insurance'}</span>
                  <span>{formatPrice(insurancePrice * rentalDays, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>{isKo ? '세금 및 영수 수수료' : 'Taxes & Fees'}</span>
                  <span>{formatPrice(taxesAndFees, currency)}</span>
                </div>

                <div className="flex justify-between items-center text-sm font-black text-slate-800 border-t border-slate-200 pt-3">
                  <span>{isKo ? '총 결제 금액' : 'Grand Total'}</span>
                  <span className="text-blue-600 text-lg">{formatPrice(total, currency)}</span>
                </div>
              </div>

              {/* Driver info confirmation */}
              <div className="bg-blue-50/30 rounded-2xl border border-blue-100/60 p-5 space-y-3">
                <h4 className="text-xs font-black text-blue-800 uppercase tracking-wider">{isKo ? '계약 운전자 확인' : 'Driver Registration'}</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold">{isKo ? '운전자 성명' : 'Driver Name'}</span>
                    <span className="text-slate-800 font-extrabold mt-0.5 block">{driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">{isKo ? '운전면허증 번호' : 'License Number'}</span>
                    <span className="text-slate-800 font-extrabold mt-0.5 block">{licenseNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="py-12 text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-xs">
                <CheckCircle className="h-10 w-10" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-xl font-black text-slate-800">{isKo ? '렌터카 예약 확정 완료' : 'Rental Confirmed!'}</h4>
                <p className="text-xs text-slate-400 font-bold">{isKo ? '입력하신 이메일로 바우처 및 안내서가 발송되었습니다.' : 'Voucher and location details have been sent to your email.'}</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 max-w-sm mx-auto border border-slate-200/50 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-500">
                  <span>{isKo ? '예약 번호' : 'Booking Ref'}</span>
                  <span className="text-slate-800 font-black tracking-wide">{bookingRef}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-500">
                  <span>{isKo ? '인수 차량' : 'Vehicle'}</span>
                  <span className="text-slate-800 font-black">{car.name}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-500">
                  <span>{isKo ? '제공 업체' : 'Provider'}</span>
                  <span className="text-slate-800 font-black">{car.provider}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-between items-center shrink-0">
          {step < 4 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  if (step > 1) {
                    setStep(step - 1);
                  } else {
                    onClose();
                  }
                }}
                className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
              >
                {step === 1 ? (isKo ? '취소' : 'Cancel') : (isKo ? '이전' : 'Back')}
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-[#1E60FF] hover:bg-[#004EE0] text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {step === 3 
                  ? (isKo ? `${formatPrice(total, currency)} 결제 및 예약 확정` : 'Confirm Payment')
                  : (isKo ? '다음 단계' : 'Continue')
                }
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer text-center"
            >
              {isKo ? '닫기 및 마이페이지 내역 보기' : 'Close and view itinerary'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
