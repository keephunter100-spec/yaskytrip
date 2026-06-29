import React, { useState } from 'react';
import { Hotel, SearchQuery, formatPrice } from '../types';
import { Star, MapPin, Check, Wifi, Award, ChevronDown, ChevronUp, User, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HotelCardProps {
  hotel: Hotel;
  onBook: (hotel: Hotel, roomName: string, price: number) => void;
  searchQuery?: SearchQuery;
  currency?: string;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, onBook, searchQuery, currency = 'USD' }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(hotel.roomTypes[0]?.name || '');

  const getRealBookingUrl = () => {
    const location = hotel.city;
    const checkIn = searchQuery?.departureDate || new Date().toISOString().split('T')[0];
    
    // Calculate checkout date
    let checkOut = searchQuery?.returnDate;
    if (!checkOut) {
      const nextDay = new Date(checkIn);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOut = nextDay.toISOString().split('T')[0];
    }
    
    return `https://hotellook.com/search?location=${encodeURIComponent(location)}&checkIn=${checkIn}&checkOut=${checkOut}&marker=744042&language=ko`;
  };

  const getAmenityLabel = (am: string) => {
    switch (am) {
      case 'Free WiFi': return '무료 와이파이';
      case 'Infinity Pool': return '인피니티 풀';
      case 'Luxury Spa': return '럭셔리 스파';
      case 'Fitness Center': return '피트니스';
      case 'Michelin Restaurant': return '미쉐린 레스토랑';
      case '24h Room Service': return '24시간 룸서비스';
      case 'Rooftop Bar': return '루프탑 바';
      case 'Pet Friendly': return '반려동물 동반';
      case 'Free Breakfast': return '무료 조식';
      case 'Free Parking': return '무료 주차';
      default: return am;
    }
  };

  const getReviewWord = (score: number) => {
    if (score >= 9.5) return '최고 수준';
    if (score >= 9.0) return '매우 훌륭함';
    if (score >= 8.5) return '훌륭함';
    if (score >= 8.0) return '좋음';
    return '만족스러움';
  };

  const currentRoomPrice = hotel.roomTypes.find(r => r.name === selectedRoom)?.price || hotel.pricePerNight;

  return (
    <div 
      className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 shadow-sm flex flex-col ${
        expanded ? 'border-blue-600 shadow-md ring-1 ring-blue-600/10' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
      id={`hotel-card-${hotel.id}`}
    >
      {/* Top Section: Image and Info Details */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Hotel Image Section */}
        <div className="w-full md:w-72 h-48 md:h-auto relative overflow-hidden shrink-0">
          <img 
            src={hotel.imageUrl} 
            alt={hotel.name} 
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          {hotel.rating === 5 && (
            <span className="absolute top-3 left-3 bg-gray-900/90 text-yellow-400 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider backdrop-blur-xs">
              <Award className="h-3.5 w-3.5" />
              <span>최고의 럭셔리</span>
            </span>
          )}
        </div>

        {/* Main Details Section */}
        <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
          <div>
            {/* Header row (Title and Stars) */}
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{hotel.name}</h3>
                <div className="flex items-center space-x-1.5 mt-1 text-gray-500 text-xs">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <span>{hotel.address}</span>
                </div>
              </div>

              <div className="flex space-x-0.5 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                {Array.from({ length: hotel.rating }).map((_, idx) => (
                  <Star key={idx} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                ))}
              </div>
            </div>

            {/* Amenities Row */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {hotel.amenities.slice(0, 4).map((am) => (
                <span 
                  key={am} 
                  className="text-[10px] bg-slate-50 border border-slate-250 px-2 py-0.5 rounded font-medium text-slate-600 flex items-center"
                >
                  <Check className="h-2.5 w-2.5 text-blue-600 mr-1 shrink-0" />
                  {getAmenityLabel(am)}
                </span>
              ))}
              {hotel.amenities.length > 4 && (
                <span className="text-[10px] text-gray-400 font-semibold px-1.5 py-1">
                  +{hotel.amenities.length - 4}개 편의시설 더보기
                </span>
              )}
            </div>
          </div>

          {/* Bottom row (Price, Reviews, Expand toggler) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end mt-6 pt-6 border-t border-gray-100">
            
            {/* Reviews Score */}
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 bg-blue-600 text-white font-sans font-black flex items-center justify-center rounded text-sm shrink-0">
                {hotel.reviewScore.toFixed(1)}
              </div>
              <div>
                <span className="block text-xs font-black text-slate-800 leading-none">{getReviewWord(hotel.reviewScore)}</span>
                <span className="block text-[10px] text-slate-400 font-bold mt-0.5">최근 후기 {hotel.reviewCount}개</span>
              </div>
            </div>

            {/* Price details and Action buttons */}
            <div className="text-right flex justify-between sm:flex-col items-center sm:items-end gap-2">
              <div>
                <span className="text-[10px] text-gray-400 block font-medium">객실 최저가 / 1박 기준</span>
                <div className="text-2xl font-black text-gray-900 font-sans">
                  {formatPrice(currentRoomPrice, currency)}
                </div>
                <span className="text-[9px] text-gray-400 font-semibold block">소계: 세금 & 봉사료 별도</span>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setExpanded(!expanded)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 font-bold text-xs px-4 py-1.5 rounded transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  {expanded ? '상세 숨기기' : '객실 및 후기 선택'}
                </button>

                <button
                  type="button"
                  onClick={() => onBook(hotel, selectedRoom, currentRoomPrice)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-1.5 rounded transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  id={`book-hotel-btn-${hotel.id}`}
                >
                  일정 선택 및 예약
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Expanded Accordion: Rooms & Reviews */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Rooms Selector Column */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">원하시는 객실을 골라주세요</h4>
                <div className="space-y-2">
                  {hotel.roomTypes.map((room) => (
                    <div 
                      key={room.name}
                      onClick={() => setSelectedRoom(room.name)}
                      className={`p-3 border rounded cursor-pointer transition-all ${
                        selectedRoom === room.name 
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800">{room.name}</span>
                        <span className="text-sm font-black text-blue-600 font-sans">{formatPrice(room.price, currency)}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed mt-1">{room.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guest Reviews Column */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">실제 고객 이용 후기</h4>
                <div className="space-y-3">
                  {hotel.reviews.map((rev, idx) => (
                    <div key={idx} className="bg-white p-3 rounded border border-slate-200">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-1.5">
                          <div className="h-5 w-5 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {rev.author[0]}
                          </div>
                          <span className="text-[10px] font-bold text-slate-700">{rev.author}</span>
                        </div>
                        <span className="bg-blue-50 border border-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          ★ {rev.score.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 italic leading-relaxed">"{rev.comment}"</p>
                      <span className="text-[8px] text-gray-400 block mt-1.5 text-right">{rev.date}</span>
                    </div>
                  ))}
                  
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-[9px] text-emerald-800 leading-normal">
                      최근 투숙객 중 <b>94%</b>가 이 호텔의 위생 상태와 조식을 매우 좋음으로 평가했습니다.
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelCard;
