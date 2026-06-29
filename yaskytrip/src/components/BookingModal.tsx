import React, { useState } from 'react';
import { Flight, Hotel, BookingDetails, SearchQuery, formatPrice } from '../types';
import { X, CheckCircle, Mail, Phone, CreditCard, Ticket, ShieldCheck, Award, AlertCircle, Sparkles, Sofa, Plane, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookingModalProps {
  type: 'flight' | 'hotel' | 'package';
  flight?: Flight;
  hotel?: Hotel;
  selectedRoomType?: string;
  hotelPrice?: number;
  onClose: () => void;
  onConfirmBooking: (booking: BookingDetails) => void;
  searchQuery?: SearchQuery;
  currency?: string;
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

  const totalPrice = type === 'package'
    ? (hotelPrice || 0)
    : type === 'flight' 
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
      setStep(2); // Instantly move to direct affiliate booking selection
    } else if (step === 2) {
      // Complete booking locally so it appears in "My Bookings"
      const randomRef = 'YASKY' + Math.floor(Math.random() * 900000 + 100000);
      setBookingRef(randomRef);
      setStep(3);
    }
  };

  const handleCompleteBooking = () => {
    const finalBooking: BookingDetails = {
      id: bookingRef || 'YASKY' + Math.floor(Math.random() * 900000 + 100000),
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
      selectedSeats: type === 'flight' ? ['14A'] : undefined, // Assign a clean standard seat automatically
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
                {type === 'package' ? '실시간 결합 패키지 예약' : type === 'flight' ? '실시간 항공권 예약' : '실시간 호텔 예약'}
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
          {step < 3 && (
            <div className="px-6 py-4 bg-white border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>1</span>
                <span className="text-[11px] font-bold text-slate-700">정보 입력</span>
              </div>
              <div className="h-[2px] flex-1 bg-slate-100 mx-4">
                <div className={`h-full bg-blue-600 transition-all duration-300 ${
                  step === 1 ? 'w-1/3' : 'w-full'
                }`}></div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}>2</span>
                <span className="text-[11px] font-bold text-slate-700">실시간 예약</span>
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
                    공식 실시간 최저가 조회/예약하기
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Real Direct Booking Partners */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center justify-center space-x-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                    <span className="text-base font-black">실시간 공식 파트너사 비교 및 예약</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    야스카이트립은 전 세계 가장 검증된 오피셜 플랫폼들과 제휴하고 있습니다.<br />
                    원하시는 제휴 플랫폼을 선택하시면, <b>선택하신 일정 조건 그대로</b> 실시간 예약 사이트로 즉시 이동합니다!
                  </p>
                </div>

                {/* Summary Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-2xs">
                  <div className="text-left">
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 font-bold px-2 py-0.5 rounded uppercase">
                      선택한 일정 요약
                    </span>
                    <h5 className="text-sm font-black text-gray-800 mt-2 leading-none">
                      {type === 'package' && flight && hotel
                        ? `결합 패키지: [항공] ${flight.outbound[0].departureAirport.city} ➔ ${flight.outbound[flight.outbound.length - 1].arrivalAirport.city} + [호텔] ${hotel.name}`
                        : type === 'flight' && flight
                          ? `${flight.outbound[0].departureAirport.city} (${flight.outbound[0].departureAirport.code}) ➔ ${flight.outbound[flight.outbound.length - 1].arrivalAirport.city} (${flight.outbound[flight.outbound.length - 1].arrivalAirport.code})`
                          : hotel?.name
                      }
                    </h5>
                    {(type === 'hotel' || type === 'package') && (
                      <p className="text-[10px] text-gray-500 font-bold mt-1">
                        선택 객실: {selectedRoomType || '디럭스 룸 (결합 혜택)'}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 font-medium mt-1">예약 예정자: {lastName}/{firstName} ({phone})</p>
                  </div>
                  <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 min-w-[100px]">
                    <span className="text-[10px] text-slate-400 font-bold block">총 결제 가격</span>
                    <span className="text-lg font-black text-blue-600 font-sans">{formatPrice(totalPrice, currency)}</span>
                  </div>
                </div>

                {/* Affiliate Link list */}
                <div className="grid grid-cols-1 gap-2.5 mt-2">
                  {(type === 'package' 
                    ? [...getFlightRealUrls().slice(0, 2), ...getHotelRealUrls().slice(0, 2)]
                    : (type === 'flight' ? getFlightRealUrls() : getHotelRealUrls())
                  ).map((site, index) => (
                    <a
                      key={index}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md hover:ring-1 hover:ring-blue-500/10 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl shrink-0 select-none bg-slate-50 h-10 w-10 flex items-center justify-center rounded-lg border border-slate-100">{site.logo}</span>
                        <div className="text-left">
                          <span className="font-bold text-slate-800 text-xs block group-hover:text-blue-600 transition-colors">
                            {site.name}
                          </span>
                          <span className="text-[10px] text-gray-400 block font-medium mt-0.5">{site.desc}</span>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 ${site.color} text-white font-black rounded-lg text-[10px] flex items-center space-x-1.5 transition-all shadow-xs`}>
                        <span>예약하러 가기</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </div>
                    </a>
                  ))}
                </div>

                <div className="bg-emerald-50 text-emerald-850 border border-emerald-100 rounded-xl p-3 flex space-x-2 text-[10px] font-medium leading-relaxed">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    파트너사 이동 완료 후 발권을 진행하시면 실제 예약 및 전자 항공권/바우처가 안전하게 발급됩니다.<br />
                    이동을 완료하셨다면 아래 완료 버튼을 눌러 <b>야스카이트립 나의 예약 일정</b>에 정식 등록해 주세요!
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleNextStep()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded transition-all shadow-sm cursor-pointer"
                  >
                    공식 파트너사 이동 완료 및 야스카이트립 일정 등록하기
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Success Ticket Boarding Pass Display */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 bg-emerald-100 text-emerald-600 items-center justify-center rounded-full">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-black text-gray-800">공식 예약 연동 및 일정 등록 완료!</h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                    실시간 공식 파트너사를 통한 예약 절차로 안전하게 안내해 드렸습니다.<br />
                    아래 생성된 일정 전용 보딩 패스는 <b>나의 예약</b> 메뉴에서 언제든지 보실 수 있습니다.
                  </p>
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
                        <span className="font-bold">
                          {type === 'package' ? 'Flight + Hotel Package' : type === 'flight' ? 'Flight Passage' : 'Hotel Lodging'}
                        </span>
                      </div>
                    </div>

                    {/* Flight Detail Segment Row */}
                    {(type === 'flight' || type === 'package') && flight && (
                      <div className="flex justify-between items-center py-4 border-y border-white/10">
                        <div>
                          <span className="text-2xl font-black font-sans">{flight.outbound[0].departureAirport.code}</span>
                          <span className="block text-[10px] text-blue-100">{flight.outbound[0].departureAirport.city}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Plane className="h-5 w-5 rotate-45 transform" />
                          <span className="text-[9px] text-blue-100 mt-1 font-mono">Seat 14A</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black font-sans">{flight.outbound[flight.outbound.length - 1].arrivalAirport.code}</span>
                          <span className="block text-[10px] text-blue-100">{flight.outbound[flight.outbound.length - 1].arrivalAirport.city}</span>
                        </div>
                      </div>
                    )}

                    {/* Hotel Detail Segment Row */}
                    {(type === 'hotel' || type === 'package') && hotel && (
                      <div className="py-4 border-b border-white/10 text-center">
                        <span className="text-lg font-black block">{hotel.name}</span>
                        <span className="text-xs text-blue-100 font-semibold block mt-1">{hotel.address.split(',')[0]}</span>
                        <span className="text-[10px] text-blue-100 block mt-0.5">객실 유형: {selectedRoomType || '디럭스 룸 (결합 혜택)'}</span>
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
                    <span className="text-[8px] font-mono tracking-widest text-slate-400 mt-1.5">{bookingRef}-REAL-SECURE-2026</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleCompleteBooking}
                    className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-xs py-3 rounded transition-all cursor-pointer"
                  >
                    확인 완료 & 일정 저장하기
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
