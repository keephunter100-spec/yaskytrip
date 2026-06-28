import React, { useState } from 'react';
import { Flight, Hotel, BookingDetails, SearchQuery, formatPrice } from '../types';
import { X, CheckCircle, Mail, Phone, CreditCard, Ticket, ShieldCheck, Award, AlertCircle, Sparkles, Sofa, Plane, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  type: 'flight' | 'hotel';
  flight?: Flight;
  hotel?: Hotel;
  selectedRoomType?: string;
  hotelPrice?: number;
  onClose: () => void;
  onConfirmBooking: (booking: BookingDetails) => void;
  searchQuery?: SearchQuery;
  currency?: 'USD' | 'KRW';
}

export default function BookingModal({
  type,
  flight,
  hotel,
  selectedRoomType,
  hotelPrice,
  onClose,
  onConfirmBooking,
  searchQuery,
  currency = 'USD',
}: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('koreapaik@gmail.com');
  const [phone, setPhone] = useState('010-1234-5678');
  const [passportNumber, setPassportNumber] = useState('');

  // Seats State for Flight
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Payment State
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Ticket Reference
  const [bookingRef, setBookingRef] = useState('');

  const totalPrice = type === 'flight' 
    ? (flight?.price || 0) 
    : (hotelPrice || hotel?.pricePerNight || 0);

  const formatDateToDDMM = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const day = parts[2];
    const month = parts[1];
    return `${day}${month}`;
  };

  const getFlightRealUrls = () => {
    const defaultList = [
      { name: 'Aviasales', logo: '✈️', url: 'https://www.aviasales.com/?marker=744042', desc: '실시간 전세계 항공 최저가 비교', color: 'bg-amber-500 hover:bg-amber-600' },
      { name: 'Skyscanner', logo: '🌐', url: 'https://www.skyscanner.co.kr/', desc: '글로벌 가격 비교 No.1', color: 'bg-emerald-500 hover:bg-emerald-600' },
      { name: 'Google Flights', logo: '🔍', url: 'https://www.google.com/travel/flights', desc: '구글 공식 항공 노선/가격 검색', color: 'bg-blue-600 hover:bg-blue-700' },
      { name: 'Trip.com', logo: '💳', url: 'https://co.trip.com/flights/', desc: '아시아 노선 및 카드사 특화 할인', color: 'bg-sky-500 hover:bg-sky-600' },
    ];
    if (!flight) return defaultList;

    const firstOutbound = flight.outbound[0];
    const lastOutbound = flight.outbound[flight.outbound.length - 1];
    const origin = firstOutbound.departureAirport.code;
    const destination = lastOutbound.arrivalAirport.code;
    const depDate = searchQuery?.departureDate || new Date().toISOString().split('T')[0];
    const retDate = searchQuery?.tripType === 'round-trip' ? searchQuery?.returnDate : undefined;
    
    const depDDMM = formatDateToDDMM(depDate);
    const retDDMM = retDate ? formatDateToDDMM(retDate) : '';
    
    let path = `${origin}${depDDMM}${destination}`;
    if (retDDMM) {
      path += `${retDDMM}`;
    }
    path += '1'; // 1 passenger
    
    const aviaUrl = `https://www.aviasales.com/search/${path}?marker=744042&locale=ko`;
    
    // Skyscanner path: yyMMdd format
    const ssDep = depDate.replace(/-/g, '').substring(2);
    const ssRet = retDate ? '/' + retDate.replace(/-/g, '').substring(2) : '';
    const skyUrl = `https://www.skyscanner.co.kr/transport/flights/${origin.toLowerCase()}/${destination.toLowerCase()}/${ssDep}${ssRet}/?adultsv2=1&cabinclass=economy&locale=ko-KR&currency=KRW`;

    // Google Flights
    const googleUrl = `https://www.google.com/travel/flights?q=Flights%20to%20${destination}%20from%20${origin}%20on%20${depDate}${retDate ? '%20returning%20' + retDate : ''}`;

    // Trip.com
    const tripUrl = `https://co.trip.com/flights/show-flights-list?dcity=${origin}&acity=${destination}&ddate=${depDate}${retDate ? '&rdate=' + retDate : ''}&flighttype=${retDate ? 'rt' : 'ow'}&adult=1&class=y`;

    return [
      { name: 'Aviasales (추천)', logo: '✈️', url: aviaUrl, desc: '실시간 제휴 직항/경유 비교', color: 'bg-amber-500 hover:bg-amber-600' },
      { name: 'Skyscanner', logo: '🌐', url: skyUrl, desc: '전 세계 인기 항공권 가격 비교', color: 'bg-emerald-500 hover:bg-emerald-600' },
      { name: 'Google Flights', logo: '🔍', url: googleUrl, desc: '간편한 노선도 및 트렌드 예측', color: 'bg-blue-600 hover:bg-blue-700' },
      { name: 'Trip.com', logo: '🟦', url: tripUrl, desc: '원화 간편 결제 및 상시 프로모션', color: 'bg-sky-500 hover:bg-sky-600' },
    ];
  };

  const getHotelRealUrls = () => {
    const location = hotel?.city || 'Seoul';
    const checkIn = searchQuery?.departureDate || new Date().toISOString().split('T')[0];
    
    let checkOut = searchQuery?.returnDate;
    if (!checkOut) {
      const nextDay = new Date(checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOut = nextDay.toISOString().split('T')[0];
    }
    
    const hlUrl = `https://hotellook.com/search?location=${encodeURIComponent(location)}&checkIn=${checkIn}&checkOut=${checkOut}&marker=744042&language=ko`;
    const agodaUrl = `https://www.agoda.com/ko-kr/search?city=${encodeURIComponent(location)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=1`;
    const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(location)}&checkin=${checkIn}&checkout=${checkOut}&group_adults=1`;
    const tripHotelUrl = `https://co.trip.com/hotels/list?city=${encodeURIComponent(location)}&checkIn=${checkIn}&checkOut=${checkOut}&adult=1`;

    return [
      { name: 'Hotellook (추천)', logo: '🏨', url: hlUrl, desc: '전 세계 주요 사이트 최저가 요약', color: 'bg-amber-500 hover:bg-amber-600' },
      { name: 'Agoda', logo: '🅰️', url: agodaUrl, desc: '동남아/일본 아시아 특가 최대 보장', color: 'bg-rose-500 hover:bg-rose-600' },
      { name: 'Booking.com', logo: '🟩', url: bookingUrl, desc: '현지 결제 가능 및 유연한 취소', color: 'bg-emerald-600 hover:bg-emerald-700' },
      { name: 'Trip.com 호텔', logo: '🟦', url: tripHotelUrl, desc: '원화 완벽 대응 및 연중무휴 고객지원', color: 'bg-sky-500 hover:bg-sky-600' },
    ];
  };

  // Seat Configuration
  const rows = [10, 11, 12, 14, 15, 16, 17, 18];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  const occupiedSeats = ['10A', '10B', '12F', '14D', '15C', '16A', '17B', '18F'];

  const handleSeatClick = (seat: string) => {
    if (occupiedSeats.includes(seat)) return;
    if (selectedSeats.includes(seat)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seat));
    } else {
      // Limit to 1 seat for simplicity, or toggle multiple
      setSelectedSeats([seat]);
    }
  };

  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (step === 1) {
      if (!firstName || !lastName || !email || !phone) {
        alert('필수 입력 필드를 모두 작성해 주세요.');
        return;
      }
      setStep(type === 'flight' ? 2 : 3); // Flights go to seat picker, hotels go to payment
    } else if (step === 2) {
      if (type === 'flight' && selectedSeats.length === 0) {
        alert('탑승하실 좌석을 선택해 주세요.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!cardNumber || !cardExpiry || !cardCvc) {
        alert('카드 정보를 입력해 주세요.');
        return;
      }
      // Process simulated payment
      const randomRef = 'VYG' + Math.floor(Math.random() * 900000 + 100000);
      setBookingRef(randomRef);
      setStep(4);
    }
  };

  const handleCompleteBooking = () => {
    const finalBooking: BookingDetails = {
      id: bookingRef,
      type,
      flight,
      hotel,
      selectedRoomType,
      passengers: [{
        firstName,
        lastName,
        passportNumber,
        email,
        phone,
      }],
      selectedSeats: type === 'flight' ? selectedSeats : undefined,
      totalPrice,
      bookingDate: new Date().toLocaleDateString('ko-KR'),
    };
    onConfirmBooking(finalBooking);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="booking-modal-overlay">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-950/60 backdrop-blur-xs transition-opacity"
        onClick={step < 4 ? onClose : undefined}
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative transform overflow-hidden rounded-lg bg-white shadow-2xl transition-all w-full max-w-2xl border border-slate-200 flex flex-col"
          id="booking-modal-content"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <div>
              <h3 className="text-sm font-bold text-gray-800">
                {type === 'flight' ? '실시간 항공권 예약' : '실시간 호텔 예약'}
              </h3>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                안전하게 보호된 SSL 암호화 결제 엔진 적용
              </p>
            </div>
            {step < 4 && (
              <button 
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Stepper Progress */}
          {step < 4 && (
            <div className="px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>1</span>
                <span className="text-[11px] font-bold text-slate-700">정보 입력</span>
              </div>
              <div className="h-[2px] flex-1 bg-slate-100 mx-4">
                <div className={`h-full bg-blue-600 transition-all duration-300 ${
                  step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'
                }`}></div>
              </div>
              {type === 'flight' && (
                <>
                  <div className="flex items-center space-x-2">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>2</span>
                    <span className="text-[11px] font-bold text-slate-700">좌석 선택</span>
                  </div>
                  <div className="h-[2px] flex-1 bg-slate-100 mx-4"></div>
                </>
              )}
              <div className="flex items-center space-x-2">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>3</span>
                <span className="text-[11px] font-bold text-slate-700">모의 결제</span>
              </div>
            </div>
          )}

          {/* Modal Body Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            
            {/* STEP 1: Personal Information */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">성 (영문/한글) *</label>
                    <input
                      type="text"
                      required
                      placeholder="GILDONG"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">이름 (영문/한글) *</label>
                    <input
                      type="text"
                      required
                      placeholder="HONG"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">이메일 주소 *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">휴대폰 번호 *</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {type === 'flight' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">여권 번호 (선택사항)</label>
                    <input
                      type="text"
                      placeholder="M12345678"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                )}

                {/* Pricing Summary Side */}
                <div className="bg-blue-50/50 border border-blue-100 rounded p-4 mt-6">
                  <span className="block text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-2">선택한 요약 내용</span>
                  <div className="flex justify-between items-center text-xs text-slate-700 font-semibold">
                    <span>
                      {type === 'flight' 
                        ? `${flight?.outbound[0].departureAirport.city} ➔ ${flight?.outbound[flight.outbound.length - 1].arrivalAirport.city} 항공권`
                        : `${hotel?.name} - ${selectedRoomType}`
                      }
                    </span>
                    <span className="text-blue-600 font-sans font-black text-sm">{formatPrice(totalPrice, currency)}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded transition-all shadow-sm cursor-pointer"
                  >
                    다음 단계로 이동하기
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Interactive Seat Picker (Flights Only) */}
            {step === 2 && type === 'flight' && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center space-x-1.5">
                    <Sofa className="h-4 w-4 text-blue-600" />
                    <span>원하시는 좌석을 선점해 보세요</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">앞 좌석 혹은 창가 좌석은 조기 마감될 수 있습니다.</p>
                </div>

                {/* Seat Map Layout Container */}
                <div className="max-w-xs mx-auto bg-slate-50 border border-slate-200 rounded-lg p-5 shadow-inner relative overflow-hidden">
                  
                  {/* Cockpit Front simulation */}
                  <div className="w-1/2 h-10 bg-gray-200 mx-auto rounded-t-full border-b border-gray-300 flex items-center justify-center mb-6">
                    <span className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">조종실 (COCKPIT)</span>
                  </div>

                  {/* Seat grid columns label */}
                  <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-gray-400 mb-2">
                    <div></div>
                    {cols.slice(0, 3).map(c => <div key={c}>{c}</div>)}
                    <div>복도</div>
                    {cols.slice(3).map(c => <div key={c}>{c}</div>)}
                  </div>

                  {/* Seat Map rows */}
                  <div className="space-y-2">
                    {rows.map((row) => (
                      <div key={row} className="grid grid-cols-7 gap-2 items-center text-center">
                        {/* Row label */}
                        <div className="text-[10px] font-bold text-gray-400 font-mono">{row}</div>

                        {/* Left column seats (A, B, C) */}
                        {cols.slice(0, 3).map((col) => {
                          const seatCode = `${row}${col}`;
                          const isOccupied = occupiedSeats.includes(seatCode);
                          const isSelected = selectedSeats.includes(seatCode);

                          return (
                            <button
                              key={seatCode}
                              type="button"
                              onClick={() => handleSeatClick(seatCode)}
                              disabled={isOccupied}
                              className={`h-7 rounded text-[9px] font-bold transition-all flex items-center justify-center ${
                                isOccupied 
                                  ? 'bg-slate-150 text-slate-400 cursor-not-allowed' 
                                  : isSelected 
                                    ? 'bg-blue-600 text-white shadow-xs' 
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50/20'
                              }`}
                            >
                              {col}
                            </button>
                          );
                        })}

                        {/* Aisle */}
                        <div className="text-[8px] font-semibold text-slate-300 select-none">||</div>

                        {/* Right column seats (D, E, F) */}
                        {cols.slice(3).map((col) => {
                          const seatCode = `${row}${col}`;
                          const isOccupied = occupiedSeats.includes(seatCode);
                          const isSelected = selectedSeats.includes(seatCode);

                          return (
                            <button
                              key={seatCode}
                              type="button"
                              onClick={() => handleSeatClick(seatCode)}
                              disabled={isOccupied}
                              className={`h-7 rounded text-[9px] font-bold transition-all flex items-center justify-center ${
                                isOccupied 
                                  ? 'bg-slate-150 text-slate-400 cursor-not-allowed' 
                                  : isSelected 
                                    ? 'bg-blue-600 text-white shadow-xs' 
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50/20'
                              }`}
                            >
                              {col}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 flex justify-center space-x-4 text-[10px] font-semibold text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <span className="h-3 w-3 bg-white border border-slate-200 rounded"></span>
                      <span>선택 가능</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-3 w-3 bg-blue-600 rounded"></span>
                      <span>선택됨</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="h-3 w-3 bg-slate-200 rounded"></span>
                      <span>예약 완료</span>
                    </div>
                  </div>

                </div>

                <div className="text-center text-xs font-semibold text-slate-700">
                  선택한 좌석: {selectedSeats.length > 0 ? (
                    <span className="text-blue-700 font-bold bg-blue-50 border border-blue-100 px-2 py-1 rounded ml-1 font-mono">{selectedSeats.join(', ')}</span>
                  ) : (
                    <span className="text-slate-400">선택하지 않음 (선택 필수)</span>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleNextStep()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded transition-all shadow-sm cursor-pointer"
                  >
                    모의 결제 단계로 이동
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Mock Payment Form */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center space-x-1.5">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span>신용카드 / 체크카드 모의 결제</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">실제 금액이 청구되지 않는 모의 테스트 결제 모듈입니다.</p>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-lg max-w-sm mx-auto shadow-xl space-y-6 relative overflow-hidden">
                  {/* Background glowing circle */}
                  <div className="absolute -top-10 -right-10 bg-blue-500/20 h-40 w-40 rounded-full blur-2xl"></div>

                  <div className="flex justify-between items-center relative">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">YASKYTRIP Premium</span>
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                  </div>

                  <div className="space-y-1 relative">
                    <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-widest">Card Number</span>
                    <input
                      type="text"
                      required
                      placeholder="4512 8892 0124 9901"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="bg-transparent border-b border-slate-700 w-full p-0 py-1 font-mono text-base tracking-widest placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative">
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-widest">Expiry Date</span>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="bg-transparent border-b border-slate-700 w-full p-0 py-1 font-mono text-xs tracking-wider placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] text-slate-400 block uppercase font-mono tracking-widest">CVC</span>
                      <input
                        type="password"
                        required
                        maxLength={3}
                        placeholder="•••"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="bg-transparent border-b border-slate-700 w-full p-0 py-1 font-mono text-xs tracking-widest placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 border-t border-slate-100 pt-6">
                  <div className="flex justify-between text-xs text-slate-600 font-semibold">
                    <span>최종 결제 금액</span>
                    <span className="text-slate-900 font-sans font-black text-base">{formatPrice(totalPrice, currency)}</span>
                  </div>
                  
                  <div className="bg-emerald-50 text-emerald-850 border border-emerald-100 rounded p-3 flex space-x-2 text-[10px] font-medium leading-relaxed">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>YASKYTRIP의 모든 가상 거래는 개인 전자금융 감독 기준을 만족하는 Sandbox 안전 환경 하에 가상 보호 처리됩니다.</span>
                  </div>
                </div>

                {/* Travelpayouts & Partners Real Affiliate Booking Links */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3 shadow-sm">
                  <div className="font-bold text-slate-800 flex items-center space-x-1.5 border-b border-slate-200/60 pb-2">
                    <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                    <span className="text-sm font-black">실시간 최저가 예약 플랫폼 선택</span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    이것은 모의 예약 데모입니다. 아래의 공식 검증된 플랫폼을 클릭하여 <b>실제 실시간 최저가</b>를 조회하고 원스톱 안전 발권을 진행하실 수 있습니다!
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2 mt-1">
                    {(type === 'flight' ? getFlightRealUrls() : getHotelRealUrls()).map((site, index) => (
                      <a
                        key={index}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-xl hover:border-blue-500 hover:shadow-sm transition-all duration-250 cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="text-lg shrink-0 select-none">{site.logo}</span>
                          <div className="text-left">
                            <span className="font-bold text-slate-800 text-xs block group-hover:text-blue-600 transition-colors">{site.name}</span>
                            <span className="text-[9px] text-gray-400 block font-medium mt-0.5">{site.desc}</span>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1.5 ${site.color} text-white font-bold rounded-lg text-[10px] flex items-center space-x-1 transition-all shadow-sm`}>
                          <span>이동</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleNextStep()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded transition-all shadow-sm cursor-pointer"
                  >
                    모의 결제 승인하기
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Success Ticket Boarding Pass Display */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 bg-green-100 text-green-600 items-center justify-center rounded-full">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-gray-800">예약 및 모의 결제가 성공적으로 완료되었습니다!</h4>
                  <p className="text-[10px] text-gray-400">발급된 아래 보딩 패스/바우처를 확인하시고 나의 예약 페이지에서 관리해 보세요.</p>
                </div>

                {/* BOARDING PASS DESIGN */}
                <div className="bg-blue-600 text-white rounded-lg overflow-hidden shadow-xl" id="boarding-pass-ticket">
                  <div className="px-6 py-4 border-b border-white/20 border-dashed flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-4 w-4" />
                      <span className="text-xs font-bold tracking-wider uppercase">YASKYTRIP Boarding Pass</span>
                    </div>
                    <span className="text-xs font-mono font-bold tracking-widest bg-white text-blue-600 px-2 py-0.5 rounded">
                      {bookingRef}
                    </span>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Passenger & Class details */}
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block text-[9px] text-blue-100 uppercase tracking-widest font-semibold">Passenger</span>
                        <span className="font-bold">{lastName}/{firstName}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-blue-100 uppercase tracking-widest font-semibold">Service Type</span>
                        <span className="font-bold">{type === 'flight' ? 'Flight Passage' : 'Hotel Lodging'}</span>
                      </div>
                    </div>

                    {/* Flight Detail Segment Row */}
                    {type === 'flight' && flight && (
                      <div className="flex justify-between items-center py-4 border-y border-white/10">
                        <div>
                          <span className="text-2xl font-black font-sans">{flight.outbound[0].departureAirport.code}</span>
                          <span className="block text-[10px] text-blue-100">{flight.outbound[0].departureAirport.city}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Plane className="h-5 w-5 rotate-45 transform" />
                          <span className="text-[9px] text-blue-100 mt-1 font-mono">Seat {selectedSeats.join(', ')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black font-sans">{flight.outbound[flight.outbound.length - 1].arrivalAirport.code}</span>
                          <span className="block text-[10px] text-blue-100">{flight.outbound[flight.outbound.length - 1].arrivalAirport.city}</span>
                        </div>
                      </div>
                    )}

                    {/* Hotel Detail Segment Row */}
                    {type === 'hotel' && hotel && (
                      <div className="py-4 border-y border-white/10 text-center">
                        <span className="text-xl font-black block">{hotel.name}</span>
                        <span className="text-xs text-blue-100 font-semibold block mt-1">{hotel.address}</span>
                        <span className="text-[10px] text-blue-100 block mt-0.5">객실 유형: {selectedRoomType}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="block text-[9px] text-blue-100 uppercase font-semibold">Date</span>
                        <span className="font-bold">{new Date().toLocaleDateString('ko-KR')}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-blue-100 uppercase font-semibold">Total Price</span>
                        <span className="font-bold font-sans text-sm">{formatPrice(totalPrice, currency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barcode Simulation */}
                  <div className="bg-white p-4 flex flex-col items-center justify-center">
                    <div className="h-10 w-2/3 bg-slate-900 flex space-x-[2px] items-center overflow-hidden">
                      {Array.from({ length: 48 }).map((_, idx) => (
                        <div 
                          key={idx} 
                          className="bg-black h-full"
                          style={{ width: `${(idx % 3 === 0 ? 3 : idx % 2 === 0 ? 1 : 2)}px` }}
                        ></div>
                      ))}
                    </div>
                    <span className="text-[8px] font-mono tracking-widest text-slate-400 mt-1.5">{bookingRef}-MOCK-SECURE-2026</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteBooking}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs py-3 rounded transition-all cursor-pointer"
                  >
                    보딩 패스 확인 완료 & 종료
                  </button>
                </div>
              </div>
            )}

          </div>

        </motion.div>
      </div>
    </div>
  );
}
