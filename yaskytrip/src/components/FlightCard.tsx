import React, { useState } from 'react';
import { Flight, FlightSegment, SearchQuery, formatPrice } from '../types';
import { Plane, ChevronDown, ChevronUp, Clock, AlertCircle, Luggage, Coffee, ShieldAlert, Leaf, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
  tag?: 'cheapest' | 'fastest' | 'best';
  searchQuery?: SearchQuery;
  currency?: string;
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

  const formatKoreanDateString = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return `${d.getMonth() + 1}월 ${d.getDate()}일`;
    } catch (e) {
      return '';
    }
  };

  const renderAirlineLogo = (code: string, originalLogo: string, name: string) => {
    switch (code) {
      case 'KE': // Korean Air
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g transform="rotate(-15 50 50)">
                {/* Blue bottom half */}
                <path d="M 15,50 A 35,35 0 0,0 85,50 C 85,67.5 67.5,67.5 50,50 C 32.5,32.5 15,32.5 15,50 Z" fill="#00529b" />
                {/* Red top half */}
                <path d="M 15,50 A 35,35 0 0,1 85,50 C 85,32.5 67.5,32.5 50,50 C 32.5,67.5 15,67.5 15,50 Z" fill="#c8102e" />
                {/* White divider curve */}
                <path d="M 15,50 C 32.5,67.5 50,32.5 85,50" stroke="#ffffff" strokeWidth="5.5" fill="none" />
              </g>
            </svg>
          </div>
        );
      case 'OZ': // Asiana Airlines
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 65" className="w-11 h-7 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Red stripe */}
              <path d="M 15 55 L 55 15 L 63 15 L 23 55 Z" fill="#d12640" />
              {/* Yellow stripe */}
              <path d="M 23 55 L 63 15 L 71 15 L 31 55 Z" fill="#f3b924" />
              {/* Blue stripe */}
              <path d="M 31 55 L 71 15 L 79 15 L 39 55 Z" fill="#2c3d8f" />
              {/* Gray body */}
              <path d="M 39 55 L 79 15 L 95 15 L 55 55 Z" fill="#899197" />
            </svg>
          </div>
        );
      case 'YP': // Air Premia
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 20 44" className="w-4 h-9 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="16" height="40" rx="8" fill="#ff5a19" />
            </svg>
          </div>
        );
      case '7C': // Jeju Air
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#ff6f00" />
              <path d="M 25,50 Q 50,75 75,50 Q 50,60 25,50 Z" fill="#ffffff" />
              <circle cx="50" cy="40" r="8" fill="#ffffff" />
            </svg>
          </div>
        );
      case 'MM': // Peach Aviation
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#d0006f" />
              <path d="M 30,50 C 30,35 42,28 55,35 C 68,42 68,58 55,65 C 42,72 30,65 30,50 Z" fill="#ffffff" />
              <circle cx="50" cy="50" r="10" fill="#d0006f" />
            </svg>
          </div>
        );
      case 'JL': // Japan Airlines
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#e10613" />
              <path d="M 50,20 C 33,20 20,33 20,50 C 20,62 27,72 38,77 L 50,50 L 62,77 C 73,72 80,62 80,50 C 80,33 67,20 50,20 Z" fill="#ffffff" />
              <circle cx="50" cy="50" r="12" fill="#e10613" />
              <path d="M 45,50 L 55,50 L 50,25 Z" fill="#ffffff" />
            </svg>
          </div>
        );
      case 'NH': // All Nippon Airways
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 15,80 L 45,20 L 65,20 L 35,80 Z" fill="#002d72" />
              <path d="M 40,80 L 70,20 L 80,20 L 50,80 Z" fill="#00a0e9" />
            </svg>
          </div>
        );
      case 'DL': // Delta Air Lines
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 15,80 L 50,15 L 85,80 L 50,65 Z" fill="#e01933" />
              <path d="M 50,15 L 85,80 L 50,65 Z" fill="#9e1224" />
            </svg>
          </div>
        );
      case 'BA': // British Airways
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 50" className="w-11 h-6 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 10,40 L 45,10 L 90,10 L 55,40 Z" fill="#00247d" />
              <path d="M 40,25 L 55,10 L 90,10 L 75,25 Z" fill="#cf142b" />
            </svg>
          </div>
        );
      case 'AF': // Air France
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 50" className="w-11 h-6 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 15,40 C 35,40 65,30 85,10 L 75,10 C 60,25 35,30 15,30 Z" fill="#ed2939" />
            </svg>
          </div>
        );
      case 'SQ': // Singapore Airlines
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 80" className="w-11 h-9 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 15,55 C 30,55 45,45 75,20 L 65,15 C 45,30 30,35 15,35 Z" fill="#e2a425" />
              <path d="M 30,35 L 45,20 L 80,20 L 65,35 Z" fill="#e2a425" />
              <circle cx="25" cy="25" r="4" fill="#e2a425" />
            </svg>
          </div>
        );
      case 'UA': // United Airlines
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="45" fill="#005da1" />
              <circle cx="50" cy="50" r="45" stroke="#b1965a" strokeWidth="3" fill="none" />
              <ellipse cx="50" cy="50" rx="30" ry="45" stroke="#ffffff" strokeWidth="2" fill="none" />
              <ellipse cx="50" cy="50" rx="15" ry="45" stroke="#ffffff" strokeWidth="2" fill="none" />
              <line x1="5" y1="50" x2="95" y2="50" stroke="#ffffff" strokeWidth="2" />
              <path d="M 13,25 Q 50,40 87,25" stroke="#ffffff" strokeWidth="2" fill="none" />
              <path d="M 13,75 Q 50,60 87,75" stroke="#ffffff" strokeWidth="2" fill="none" />
            </svg>
          </div>
        );
      case 'EK': // Emirates
        return (
          <div className="flex items-center justify-center w-12 h-12 shrink-0 group hover:scale-105 transition-transform duration-200">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="10" y="10" width="80" height="80" rx="10" fill="#d71920" />
              <path d="M 30,35 Q 50,20 70,35 T 50,75 Z" stroke="#ffd700" strokeWidth="4.5" fill="none" />
              <line x1="50" y1="30" x2="50" y2="70" stroke="#ffd700" strokeWidth="4.5" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 border border-blue-100 shadow-2xs shrink-0 font-sans group hover:scale-105 transition-transform duration-200">
            <div className="absolute inset-0.5 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <Plane className="h-6 w-6 text-white rotate-45 transform" />
            </div>
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[8px] text-white font-extrabold border border-white shadow-sm">
              {code.slice(0, 2)}
            </div>
          </div>
        );
    }
  };

  const outboundSegments = flight.outbound;
  const inboundSegments = flight.inbound;

  const firstOutbound = outboundSegments[0];
  const lastOutbound = outboundSegments[outboundSegments.length - 1];

  const firstInbound = inboundSegments ? inboundSegments[0] : null;
  const lastInbound = inboundSegments ? inboundSegments[inboundSegments.length - 1] : null;

  const outDateFormatted = formatKoreanDateString(searchQuery?.departureDate);
  const inDateFormatted = searchQuery?.tripType === 'round-trip' ? formatKoreanDateString(searchQuery?.returnDate) : '';

  return (
    <div 
      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-xs hover:shadow-lg ${
        expanded ? 'border-blue-600 shadow-md ring-1 ring-blue-600/5' : 'border-slate-200/80 hover:border-slate-300'
      }`}
      id={`flight-card-${flight.id}`}
    >
      {/* Flight Tags Row */}
      <div className="flex flex-wrap items-center gap-1.5 px-6 pt-5">
        {tag === 'cheapest' && (
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-emerald-100 uppercase tracking-wider">
            최저가 요금 💸
          </span>
        )}
        {tag === 'fastest' && (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-amber-100 uppercase tracking-wider">
            최단 비행시간 ⚡
          </span>
        )}
        {tag === 'best' && (
          <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
            최적 추천 일정 ⭐
          </span>
        )}
        <span className="bg-teal-50/60 text-teal-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-teal-100/50">
          플렉시블 티켓으로 업그레이드 가능
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Panel: Flight Schedules */}
          <div className="md:col-span-8 lg:col-span-9 space-y-5">
            
            {/* OUTBOUND SECTION */}
            <div className="flex items-center space-x-4">
              {renderAirlineLogo(firstOutbound.airline.code, firstOutbound.airline.logo, firstOutbound.airline.name)}
              <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 items-center">
                {/* Departure Time */}
                <div className="text-left">
                  <span className="block text-lg font-extrabold text-slate-800 tracking-tight">{firstOutbound.departureTime}</span>
                  <span className="block text-[11px] text-slate-400 font-bold font-sans mt-0.5">
                    {firstOutbound.departureAirport.code} · {outDateFormatted || '가는 날'}
                  </span>
                </div>

                {/* Timeline Vector */}
                <div className="flex flex-col items-center justify-center relative px-1 sm:px-4">
                  {/* Stops Badge */}
                  <div className="z-10 bg-white px-2">
                    {flight.stopsOutbound === 0 ? (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-black">
                        직항
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-black">
                        경유 {flight.stopsOutbound}회
                      </span>
                    )}
                  </div>

                  {/* Horizontal Timeline Line */}
                  <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-between -mt-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                    
                    {/* Centered Highly Visible Blue Plane */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white px-1.5">
                        <Plane className="h-4 w-4 text-blue-600 rotate-90 transform" />
                      </div>
                    </div>

                    {flight.stopsOutbound > 0 && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 border border-white z-10"></span>
                    )}
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                  </div>

                  {/* Duration Text */}
                  <span className="text-[11px] text-slate-500 font-bold mt-1">
                    {formatDuration(flight.totalDurationOutbound)}
                  </span>
                  
                  {flight.stopsOutbound > 0 && (
                    <span className="text-[9px] text-rose-500 font-bold mt-0.5">
                      {outboundSegments.map((s, idx) => idx < outboundSegments.length - 1 ? s.arrivalAirport.code : '').filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>

                {/* Arrival Time */}
                <div className="text-right sm:text-center">
                  <span className="block text-lg font-extrabold text-slate-800 tracking-tight">{lastOutbound.arrivalTime}</span>
                  <span className="block text-[11px] text-slate-400 font-bold mt-0.5">
                    {lastOutbound.arrivalAirport.code} · {outDateFormatted || '가는 날'}
                  </span>
                </div>
              </div>
            </div>

            {/* INBOUND SECTION */}
            {inboundSegments && firstInbound && lastInbound && (
              <div className="flex items-center space-x-4 pt-4 border-t border-slate-100">
                {renderAirlineLogo(firstInbound.airline.code, firstInbound.airline.logo, firstInbound.airline.name)}
                <div className="flex-1 grid grid-cols-3 gap-2 sm:gap-4 items-center">
                  {/* Departure */}
                  <div className="text-left">
                    <span className="block text-lg font-extrabold text-slate-800 tracking-tight">{firstInbound.departureTime}</span>
                    <span className="block text-[11px] text-slate-400 font-bold mt-0.5">
                      {firstInbound.departureAirport.code} · {inDateFormatted || '오는 날'}
                    </span>
                  </div>

                  {/* Timeline Vector */}
                  <div className="flex flex-col items-center justify-center relative px-1 sm:px-4">
                    {/* Stops Badge */}
                    <div className="z-10 bg-white px-2">
                      {flight.stopsInbound === 0 ? (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-black">
                          직항
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full font-black">
                          경유 {flight.stopsInbound}회
                        </span>
                      )}
                    </div>

                    {/* Timeline Line */}
                    <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-between -mt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                      
                      {/* Centered Highly Visible Blue Plane */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white px-1.5">
                          <Plane className="h-4 w-4 text-blue-600 rotate-90 transform" />
                        </div>
                      </div>

                      {flight.stopsInbound && flight.stopsInbound > 0 && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 border border-white z-10"></span>
                      )}
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                    </div>

                    {/* Duration */}
                    <span className="text-[11px] text-slate-500 font-bold mt-1">
                      {formatDuration(flight.totalDurationInbound || 0)}
                    </span>

                    {flight.stopsInbound && flight.stopsInbound > 0 && (
                      <span className="text-[9px] text-rose-500 font-bold mt-0.5">
                        {inboundSegments.map((s, idx) => idx < inboundSegments.length - 1 ? s.arrivalAirport.code : '').filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Arrival */}
                  <div className="text-right sm:text-center">
                    <span className="block text-lg font-extrabold text-slate-800 tracking-tight">{lastInbound.arrivalTime}</span>
                    <span className="block text-[11px] text-slate-400 font-bold mt-0.5">
                      {lastInbound.arrivalAirport.code} · {inDateFormatted || '오는 날'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Carrier Name */}
            <div className="pt-2 text-xs sm:text-[13px] text-slate-700 font-extrabold flex items-center gap-1.5">
              <span className="inline-block w-1 h-3 bg-blue-500 rounded-full"></span>
              <span>{firstOutbound.airline.name}</span>
              {inboundSegments && firstInbound && firstInbound.airline.name !== firstOutbound.airline.name && (
                <>
                  <span className="text-slate-300">/</span>
                  <span>{firstInbound.airline.name}</span>
                </>
              )}
            </div>

          </div>

          {/* Right Panel: Pricing & Booking Actions */}
          <div className="md:col-span-4 lg:col-span-3 border-t md:border-t-0 md:border-l border-slate-100 p-6 flex flex-col justify-between items-stretch text-right bg-slate-50/30 md:bg-transparent rounded-b-2xl md:rounded-r-2xl h-full min-h-[160px]">
            
            {/* Baggage & Cabin Class Indicators */}
            <div className="flex flex-col items-end space-y-1.5 mb-2">
              <span className="text-[11px] text-slate-400 font-bold">
                {getCabinClassLabel(firstOutbound.cabinClass)}
              </span>
              
              {/* Luxury-style Baggage Check Icons */}
              <div className="flex items-center space-x-2">
                <div className="relative group p-1.5 bg-slate-50 border border-slate-100 rounded-lg shadow-3xs" title="기내 수하물 포함">
                  <Luggage className="h-4 w-4 text-slate-500" />
                  <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✓</span>
                </div>
                <div className="relative group p-1.5 bg-slate-50 border border-slate-100 rounded-lg shadow-3xs" title="위탁 수하물 포함 여부">
                  <Luggage className="h-4 w-4 text-slate-500" />
                  {flight.baggageIncluded ? (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✓</span>
                  ) : (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-slate-300 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✕</span>
                  )}
                </div>
                <div className="relative group p-1.5 bg-slate-50 border border-slate-100 rounded-lg shadow-3xs" title="모바일 탑승권 지원">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✓</span>
                </div>
              </div>
            </div>

            {/* Price section */}
            <div className="my-3">
              <div className="flex items-center justify-end space-x-1">
                <span className="text-2xl font-black text-slate-900 font-sans tracking-tight">
                  {formatPrice(flight.price, currency)}
                </span>
                <button 
                  type="button" 
                  className="p-0.5 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                  title="세금 및 유류할증료 포함 총액"
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">왕복·성인 1인 기준 총액</span>
            </div>

            {/* Structured Buttons */}
            <div className="space-y-2 mt-2">
              <button
                type="button"
                onClick={() => onBook(flight)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center space-x-1"
                id={`book-flight-btn-${flight.id}`}
              >
                <span>일정 선택 및 예약</span>
              </button>

              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="h-9 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-extrabold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <span>비행 정보 보기</span>
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Dynamic Carbon Emission Badge */}
        <div className="mt-4 flex items-center space-x-2 text-[10px] text-emerald-700 bg-emerald-50/50 border border-emerald-100/50 p-2.5 rounded-xl font-medium">
          <Leaf className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>친환경 일정: 이 비행은 다른 경로 대비 이산화탄소 배출량이 약 <b>{flight.carbonEmissionKg}kg</b> 낮습니다.</span>
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
