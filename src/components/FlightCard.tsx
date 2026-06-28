import React, { useState } from 'react';
import { Flight, FlightSegment, SearchQuery, formatPrice } from '../types';
import { Plane, ChevronDown, ChevronUp, Clock, AlertCircle, Luggage, Coffee, ShieldAlert, Leaf, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
  tag?: 'cheapest' | 'fastest' | 'best';
  searchQuery?: SearchQuery;
  currency?: 'USD' | 'KRW';
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onBook, tag, searchQuery, currency = 'USD' }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDateToDDMM = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const day = parts[2];
    const month = parts[1];
    return `${day}${month}`;
  };

  const getRealBookingUrl = () => {
    const origin = flight.outbound[0].departureAirport.code;
    const destination = flight.outbound[flight.outbound.length - 1].arrivalAirport.code;
    const depDate = searchQuery?.departureDate || new Date().toISOString().split('T')[0];
    const retDate = searchQuery?.tripType === 'round-trip' ? searchQuery?.returnDate : undefined;
    
    const depDDMM = formatDateToDDMM(depDate);
    const retDDMM = retDate ? formatDateToDDMM(retDate) : '';
    
    let path = `${origin}${depDDMM}${destination}`;
    if (retDDMM) {
      path += `${retDDMM}`;
    }
    path += '1'; // 1 passenger
    
    return `https://www.aviasales.com/search/${path}?marker=744042&locale=ko`;
  };

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}시간 ${remainingMins}분`;
  };

  const getCabinClassLabel = (cls: string) => {
    switch (cls) {
      case 'economy': return '일반석';
      case 'premium': return '프리미엄 일반석';
      case 'business': return '비즈니스석';
      case 'first': return '일등석';
      default: return '일반석';
    }
  };

  const outboundSegments = flight.outbound;
  const inboundSegments = flight.inbound;

  const firstOutbound = outboundSegments[0];
  const lastOutbound = outboundSegments[outboundSegments.length - 1];

  const firstInbound = inboundSegments ? inboundSegments[0] : null;
  const lastInbound = inboundSegments ? inboundSegments[inboundSegments.length - 1] : null;

  return (
    <div 
      className={`bg-white border rounded-lg overflow-hidden transition-all duration-200 shadow-sm ${
        expanded ? 'border-blue-600 shadow-md ring-1 ring-blue-600/10' : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
      id={`flight-card-${flight.id}`}
    >
      {/* Flight Tag Indicator */}
      {tag && (
        <div className="flex">
          {tag === 'cheapest' && (
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1 rounded-br-xl uppercase tracking-wider">
              최저가 💸
            </span>
          )}
          {tag === 'fastest' && (
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1 rounded-br-xl uppercase tracking-wider">
              가장 빠른 비행 ⚡
            </span>
          )}
          {tag === 'best' && (
            <span className="bg-blue-50 border-r border-b border-blue-200 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-br-md uppercase tracking-wider">
              추천 항공편 ⭐
            </span>
          )}
        </div>
      )}

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Main Journeys Information */}
          <div className="md:col-span-9 space-y-6">
            
            {/* OUTBOUND */}
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center text-lg shadow-2xs">
                {firstOutbound.airline.logo}
              </div>
              <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-4 items-center">
                {/* Departure / Arrival Time */}
                <div className="col-span-1">
                  <span className="block text-base font-bold text-gray-800">{firstOutbound.departureTime}</span>
                  <span className="block text-[11px] text-gray-500 font-medium font-sans">{firstOutbound.departureAirport.code} ({firstOutbound.departureAirport.city})</span>
                </div>

                {/* Timeline Vector */}
                <div className="col-span-1 flex flex-col items-center justify-center relative px-2">
                  <span className="text-[10px] text-gray-400 font-semibold mb-1">
                    {flight.stopsOutbound === 0 ? '직항' : `경유 ${flight.stopsOutbound}회`}
                  </span>
                  <div className="w-full h-[1px] bg-slate-200 relative flex items-center justify-center">
                    <div className="absolute h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                    {flight.stopsOutbound > 0 && (
                      <div className="absolute h-2 w-2 rounded bg-red-600 border border-white"></div>
                    )}
                  </div>
                  {flight.stopsOutbound > 0 && (
                    <span className="text-[9px] text-red-500 font-medium mt-1">
                      {outboundSegments.map((s, idx) => idx < outboundSegments.length - 1 ? s.arrivalAirport.code : '').filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>

                {/* Arrival Info */}
                <div className="col-span-1">
                  <span className="block text-base font-bold text-gray-800">{lastOutbound.arrivalTime}</span>
                  <span className="block text-[11px] text-gray-500 font-medium">{lastOutbound.arrivalAirport.code} ({lastOutbound.arrivalAirport.city})</span>
                </div>

                {/* Duration & Airline Details */}
                <div className="hidden sm:block col-span-1 text-right">
                  <span className="block text-xs font-semibold text-gray-700 flex items-center justify-end">
                    <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    {formatDuration(flight.totalDurationOutbound)}
                  </span>
                  <span className="block text-[10px] text-gray-400 font-medium">{firstOutbound.airline.name}</span>
                </div>
              </div>
            </div>

            {/* INBOUND (Return flight if applicable) */}
            {inboundSegments && firstInbound && lastInbound && (
              <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-md flex items-center justify-center text-lg shadow-2xs">
                  {firstInbound.airline.logo}
                </div>
                <div className="flex-1 grid grid-cols-3 sm:grid-cols-4 gap-4 items-center">
                  {/* Departure */}
                  <div className="col-span-1">
                    <span className="block text-base font-bold text-gray-800">{firstInbound.departureTime}</span>
                    <span className="block text-[11px] text-gray-500 font-medium">{firstInbound.departureAirport.code} ({firstInbound.departureAirport.city})</span>
                  </div>

                  {/* Visual Timeline */}
                  <div className="col-span-1 flex flex-col items-center justify-center relative px-2">
                    <span className="text-[10px] text-gray-400 font-semibold mb-1">
                      {flight.stopsInbound === 0 ? '직항' : `경유 ${flight.stopsInbound}회`}
                    </span>
                    <div className="w-full h-[1px] bg-slate-200 relative flex items-center justify-center">
                      <div className="absolute h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                      {flight.stopsInbound && flight.stopsInbound > 0 && (
                        <div className="absolute h-2 w-2 rounded bg-red-600 border border-white"></div>
                      )}
                    </div>
                    {flight.stopsInbound && flight.stopsInbound > 0 && (
                      <span className="text-[9px] text-red-500 font-medium mt-1">
                        {inboundSegments.map((s, idx) => idx < inboundSegments.length - 1 ? s.arrivalAirport.code : '').filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Arrival */}
                  <div className="col-span-1">
                    <span className="block text-base font-bold text-gray-800">{lastInbound.arrivalTime}</span>
                    <span className="block text-[11px] text-gray-500 font-medium">{lastInbound.arrivalAirport.code} ({lastInbound.arrivalAirport.city})</span>
                  </div>

                  {/* Duration */}
                  <div className="hidden sm:block col-span-1 text-right">
                    <span className="block text-xs font-semibold text-gray-700 flex items-center justify-end">
                      <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      {formatDuration(flight.totalDurationInbound || 0)}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-medium">{firstInbound.airline.name}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Booking Panel (Price and Action button) */}
          <div className="md:col-span-3 md:border-l md:border-slate-100 md:pl-6 text-center md:text-right flex flex-row md:flex-col justify-between md:justify-center items-center h-full gap-4">
            <div>
              <div className="flex flex-col items-center md:items-end justify-center space-y-1">
                {flight.baggageIncluded ? (
                  <span className="text-[10px] text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded flex items-center font-semibold">
                    <Luggage className="h-3 w-3 mr-0.5" /> 위탁수하물 포함
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded flex items-center font-semibold">
                    <Luggage className="h-3 w-3 mr-0.5" /> 수하물 미포함
                  </span>
                )}
              </div>
              <div className="mt-1 text-2xl font-black text-gray-900 font-sans">
                {formatPrice(flight.price, currency)}
              </div>
              <span className="text-[10px] text-gray-400 font-medium block">세금 포함가</span>
            </div>

            <div className="space-y-1.5 w-full max-w-[120px] sm:max-w-none">
              <button
                type="button"
                onClick={() => onBook(flight)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded transition-all shadow-sm cursor-pointer"
                id={`book-flight-btn-${flight.id}`}
              >
                예약 선택하기
              </button>

              <a
                href={getRealBookingUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] py-1.5 rounded transition-all shadow-sm flex items-center justify-center space-x-1 cursor-pointer"
                id={`real-book-flight-btn-${flight.id}`}
              >
                <span>실제 최저가 예약</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full text-gray-500 hover:text-gray-800 text-[11px] font-semibold flex items-center justify-center space-x-0.5"
              >
                <span>비행 정보</span>
                {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            </div>
          </div>

        </div>

        {/* Dynamic Carbon Emission Badge */}
        <div className="mt-4 flex items-center space-x-2 text-[10px] text-green-700 bg-green-50/50 border border-green-100/50 p-2 rounded-xl">
          <Leaf className="h-3.5 w-3.5 text-green-600 shrink-0" />
          <span>친환경 여정: 이 비행은 다른 경로 대비 이산화탄소 배출량이 약 <b>{flight.carbonEmissionKg}kg</b> 낮습니다.</span>
        </div>
      </div>

      {/* Expanded Details Timeline (Accordion Content) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="border-t border-gray-100 bg-gray-50 overflow-hidden"
          >
            <div className="p-6 space-y-6">
              
              {/* Outbound Detail Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                  <Plane className="h-4 w-4 mr-1.5 text-blue-600 rotate-45 transform" />
                  <span>가는 날 여정 상세 정보 ({firstOutbound.departureAirport.city} ➔ {lastOutbound.arrivalAirport.city})</span>
                </h4>
                
                <div className="relative border-l-2 border-dashed border-gray-300 ml-4 pl-6 space-y-6">
                  {outboundSegments.map((segment, index) => (
                    <div key={index} className="relative">
                      {/* Bullet */}
                      <span className="absolute -left-[31px] top-1.5 bg-blue-600 h-3 w-3 rounded-full border-2 border-white ring-4 ring-blue-50"></span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <span className="text-sm font-bold text-gray-800">{segment.departureTime}</span>
                          <span className="block text-[11px] text-gray-500 font-semibold">{segment.departureAirport.name} ({segment.departureAirport.code})</span>
                        </div>
                        <div>
                          <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                            {segment.flightNumber} · {getCabinClassLabel(segment.cabinClass)}
                          </span>
                          <p className="text-[11px] text-gray-500 font-semibold">{segment.aircraft}</p>
                        </div>
                        <div className="text-right sm:text-left">
                          <span className="text-sm font-bold text-gray-800">{segment.arrivalTime}</span>
                          <span className="block text-[11px] text-gray-500 font-semibold">{segment.arrivalAirport.name} ({segment.arrivalAirport.code})</span>
                        </div>
                      </div>

                      {/* Display layover if there is next segment */}
                      {index < outboundSegments.length - 1 && (
                        <div className="my-3 p-2 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] font-bold flex items-center space-x-1 max-w-sm">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>공항 내 대기 시간 (대기 시간 약 2시간) - {segment.arrivalAirport.city} ({segment.arrivalAirport.code}) 경유</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Inbound Detail Timeline */}
              {inboundSegments && firstInbound && lastInbound && (
                <div className="pt-6 border-t border-gray-200">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                    <Plane className="h-4 w-4 mr-1.5 text-blue-600 -rotate-135 transform" />
                    <span>오는 날 여정 상세 정보 ({firstInbound.departureAirport.city} ➔ {lastInbound.arrivalAirport.city})</span>
                  </h4>
                  
                  <div className="relative border-l-2 border-dashed border-gray-300 ml-4 pl-6 space-y-6">
                    {inboundSegments.map((segment, index) => (
                      <div key={index} className="relative">
                        {/* Bullet */}
                        <span className="absolute -left-[31px] top-1.5 bg-blue-600 h-3 w-3 rounded-full border-2 border-white ring-4 ring-blue-50"></span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <span className="text-sm font-bold text-gray-800">{segment.departureTime}</span>
                            <span className="block text-[11px] text-gray-500 font-semibold">{segment.departureAirport.name} ({segment.departureAirport.code})</span>
                          </div>
                          <div>
                            <span className="inline-block bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded mb-1">
                              {segment.flightNumber} · {getCabinClassLabel(segment.cabinClass)}
                            </span>
                            <p className="text-[11px] text-gray-500 font-semibold">{segment.aircraft}</p>
                          </div>
                          <div className="text-right sm:text-left">
                            <span className="text-sm font-bold text-gray-800">{segment.arrivalTime}</span>
                            <span className="block text-[11px] text-gray-500 font-semibold">{segment.arrivalAirport.name} ({segment.arrivalAirport.code})</span>
                          </div>
                        </div>

                        {/* Display layover if there is next segment */}
                        {index < inboundSegments.length - 1 && (
                          <div className="my-3 p-2 bg-red-50 text-red-700 border border-red-100 rounded-lg text-[10px] font-bold flex items-center space-x-1 max-w-sm">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>공항 내 대기 시간 (대기 시간 약 2시간) - {segment.arrivalAirport.city} ({segment.arrivalAirport.code}) 경유</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FlightCard;
