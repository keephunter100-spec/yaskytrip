import React, { useState } from 'react';
import { Flight, Hotel, SearchQuery, formatPrice } from '../types';
import { Plane, Hotel as HotelIcon, Star, MapPin, ArrowRight, Sparkles, Percent, Calendar, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface PackageCardProps {
  flight: Flight;
  hotel: Hotel;
  onBook: (flight: Flight, hotel: Hotel, totalPrice: number) => void;
  searchQuery: SearchQuery;
  currency?: string;
  selectedLanguageCode?: string;
}

const PackageCard: React.FC<PackageCardProps> = ({
  flight,
  hotel,
  onBook,
  searchQuery,
  currency = 'USD',
  selectedLanguageCode = 'ko'
}) => {
  const [hovered, setHovered] = useState(false);
  const isKo = selectedLanguageCode === 'ko';

  // Calculate nights
  const getPackageNights = () => {
    if (!searchQuery.departureDate || !searchQuery.returnDate) return 1;
    const dep = new Date(searchQuery.departureDate);
    const ret = new Date(searchQuery.returnDate);
    const diffTime = Math.abs(ret.getTime() - dep.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const nights = getPackageNights();
  const totalPassengers = searchQuery.passengers.adults + searchQuery.passengers.children + searchQuery.passengers.infants;
  const rooms = searchQuery.hotelRooms || 1;

  // Calculate prices
  const flightCostTotal = flight.price * totalPassengers;
  const hotelCostTotal = hotel.pricePerNight * nights * rooms;
  const originalTotal = flightCostTotal + hotelCostTotal;
  const discountRate = 0.15; // 15% combined package bundle discount
  const savingsAmount = Math.ceil(originalTotal * discountRate);
  const bundleTotal = originalTotal - savingsAmount;

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return isKo ? `${hours}시간 ${remainingMins}분` : `${hours}h ${remainingMins}m`;
  };

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm flex flex-col xl:flex-row ${
        hovered ? 'border-blue-500 shadow-xl scale-[1.005]' : 'border-slate-200'
      }`}
      id={`package-card-${flight.id}-${hotel.id}`}
    >
      {/* 1. Hotel Highlight Section */}
      <div className="w-full xl:w-80 h-52 xl:h-auto relative overflow-hidden shrink-0 bg-slate-900">
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover opacity-90 transform hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider shadow-sm">
            <Sparkles className="h-3 w-3" />
            <span>{isKo ? '최저가 결합 패키지' : 'Best Price Package'}</span>
          </span>
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center space-x-1 uppercase tracking-wider shadow-sm self-start">
            <Percent className="h-3 w-3" />
            <span>{isKo ? '15% 결합 할인' : '15% Bundle Discount'}</span>
          </span>
        </div>

        {/* Floating Hotel Details on image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center space-x-1 bg-amber-500/90 text-white text-[9px] font-bold px-2 py-0.5 rounded w-max mb-1.5">
            {Array.from({ length: hotel.rating }).map((_, idx) => (
              <Star key={idx} className="h-2.5 w-2.5 text-white fill-white" />
            ))}
            <span className="ml-1">{isKo ? `${hotel.rating}성급` : `${hotel.rating}-Star`}</span>
          </div>
          <h3 className="text-base font-black truncate leading-tight">{hotel.name}</h3>
          <p className="text-[10px] text-slate-300 truncate mt-0.5 flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{hotel.city} • {hotel.address.split(',')[0]}</span>
          </p>
        </div>
      </div>

      {/* 2. Bundle Travel Details Section (Flights & Amenities) */}
      <div className="flex-1 p-6 flex flex-col justify-between border-b xl:border-b-0 xl:border-r border-slate-100">
        <div className="space-y-5">
          
          {/* Flight Details Row */}
          <div>
            <div className="flex items-center space-x-2 text-xs font-black text-slate-800 mb-3 bg-slate-50 py-1 px-2.5 rounded-lg w-max">
              <Plane className="h-3.5 w-3.5 text-blue-600 rotate-45" />
              <span>
                {isKo 
                  ? `왕복 항공권 정보 (${flight.cabinClass === 'economy' ? '일반석' : '비즈니스석'})`
                  : `Roundtrip Flight Details (${flight.cabinClass === 'economy' ? 'Economy' : 'Business'})`
                }
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              {/* Departure */}
              <div className="text-left">
                <span className="block text-lg font-black text-slate-900 leading-none">{flight.outbound[0].departureTime}</span>
                <span className="block text-xs font-bold text-slate-500 mt-1">{flight.outbound[0].departureAirport.code}</span>
              </div>

              {/* Progress bar */}
              <div className="flex-1 flex flex-col items-center justify-center max-w-[150px]">
                <span className="text-[9px] text-slate-400 font-bold mb-1">{formatDuration(flight.totalDurationOutbound)}</span>
                <div className="w-full flex items-center justify-between relative">
                  <div className="h-[2px] bg-slate-200 w-full absolute top-1/2 -translate-y-1/2 rounded" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 z-10" />
                  <Plane className="h-3.5 w-3.5 text-blue-600 rotate-90 transform z-10 bg-white px-0.5" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 z-10" />
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1">
                  {flight.stopsOutbound === 0 
                    ? (isKo ? '직항' : 'Non-stop') 
                    : (isKo ? `경유 ${flight.stopsOutbound}회` : `${flight.stopsOutbound} Stop${flight.stopsOutbound > 1 ? 's' : ''}`)
                  }
                </span>
              </div>

              {/* Arrival */}
              <div className="text-right">
                <span className="block text-lg font-black text-slate-900 leading-none">{flight.outbound[flight.outbound.length - 1].arrivalTime}</span>
                <span className="block text-xs font-bold text-slate-500 mt-1">{flight.outbound[flight.outbound.length - 1].arrivalAirport.code}</span>
              </div>
            </div>
            
            {/* Airline Tag */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span className="font-bold text-slate-600">{isKo ? `항공사: ${flight.outbound[0].airline.name}` : `Airline: ${flight.outbound[0].airline.name}`}</span>
              <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>{isKo ? '무료 위탁수하물 포함' : 'Free Checked Baggage Included'}</span>
              </span>
            </div>
          </div>

          {/* Hotel Highlights / Perks Row */}
          <div className="border-t border-slate-100 pt-4">
            <div className="flex items-center space-x-2 text-xs font-black text-slate-800 mb-2.5 bg-slate-50 py-1 px-2.5 rounded-lg w-max">
              <HotelIcon className="h-3.5 w-3.5 text-blue-600" />
              <span>
                {isKo 
                  ? `호텔 투숙 정보 (${rooms}객실 / {nights}박 / 투숙 {totalPassengers}명)`
                  : `Hotel Details (${rooms} Room${rooms > 1 ? 's' : ''} / ${nights} Night${nights > 1 ? 's' : ''} / ${totalPassengers} Guest${totalPassengers > 1 ? 's' : ''})`
                }
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              {hotel.amenities.slice(0, 4).map((amenity, idx) => (
                <div key={idx} className="flex items-center space-x-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-medium truncate">
                    {amenity === 'Free WiFi' ? (isKo ? '무료 초고속 와이파이' : 'Free High-speed WiFi') :
                     amenity === 'Infinity Pool' ? (isKo ? '야외 인피니티 풀' : 'Outdoor Infinity Pool') :
                     amenity === 'Luxury Spa' ? (isKo ? '럭셔리 스파 서비스' : 'Luxury Spa Service') :
                     amenity === 'Fitness Center' ? (isKo ? '24시 피트니스' : '24h Fitness Center') :
                     amenity === 'Free Breakfast' ? (isKo ? '무료 뷔페 조식' : 'Free Buffet Breakfast') :
                     amenity === 'Rooftop Bar' ? (isKo ? '루프탑 테라스 바' : 'Rooftop Terrace Bar') : amenity}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. Combined Deal Price & Call-to-action */}
      <div className="w-full xl:w-64 p-6 bg-slate-50/50 flex flex-col justify-between shrink-0">
        <div className="space-y-4">
          
          {/* Price details Breakdown */}
          <div className="space-y-1.5">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isKo ? '상세 분할 요금' : 'Itemized Price'}</span>
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>{isKo ? `왕복 항공 (${totalPassengers}명)` : `Roundtrip Flight (${totalPassengers} pax)`}</span>
              <span>{formatPrice(flightCostTotal, currency)}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>{isKo ? `럭셔리 호텔 (${nights}박)` : `Luxury Hotel (${nights} nights)`}</span>
              <span>{formatPrice(hotelCostTotal, currency)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 my-2" />

          {/* Bundle total pricing */}
          <div>
            <div className="flex items-baseline justify-between text-xs font-bold text-slate-400">
              <span>{isKo ? '개별 예약 총가' : 'Regular Total'}</span>
              <span className="line-through">{formatPrice(originalTotal, currency)}</span>
            </div>
            
            <div className="flex items-center justify-between text-emerald-600 font-bold text-xs mt-1 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100/50">
              <span>{isKo ? '패키지 할인 15%' : 'Package Discount 15%'}</span>
              <span>-{formatPrice(savingsAmount, currency)}</span>
            </div>

            <div className="mt-4">
              <span className="block text-[10px] font-black text-blue-600 uppercase tracking-wider">{isKo ? '결합 패키지 특별가' : 'Combined Bundle Price'}</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className="text-2xl font-sans font-black text-slate-900">{formatPrice(bundleTotal, currency)}</span>
                <span className="text-xs text-slate-400 font-bold">{isKo ? '/ 전체 일정' : '/ total stay'}</span>
              </div>
            </div>
          </div>

        </div>

        <button
          type="button"
          onClick={() => onBook(flight, hotel, bundleTotal)}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl transition-all duration-200 mt-6 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
          id={`book-package-btn-${flight.id}`}
        >
          <span>{isKo ? '패키지 예약하기' : 'Book Package Bundle'}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default PackageCard;
