import React, { useState } from 'react';
import { Flight, FlightSegment, SearchQuery, formatPrice } from '../types';
import { Plane, ChevronDown, ChevronUp, Clock, AlertCircle, Luggage, Coffee, ShieldAlert, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FlightCardProps {
  flight: Flight;
  onBook: (flight: Flight) => void;
  tag?: 'cheapest' | 'fastest' | 'best';
  searchQuery?: SearchQuery;
  currency?: string;
  selectedLanguageCode?: string;
}

const FlightCard: React.FC<FlightCardProps> = ({ 
  flight, 
  onBook, 
  tag, 
  searchQuery, 
  currency = 'USD',
  selectedLanguageCode = 'ko'
}) => {
  const [expanded, setExpanded] = useState(false);
  const isKo = selectedLanguageCode === 'ko';

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
    return isKo ? `${hours}시간 ${remainingMins}분` : `${hours}h ${remainingMins}m`;
  };

  const getCabinClassLabel = (cls: string) => {
    switch (cls) {
      case 'economy': return isKo ? '일반석' : 'Economy';
      case 'premium': return isKo ? '프리미엄 일반석' : 'Premium Economy';
      case 'business': return isKo ? '비즈니스석' : 'Business';
      case 'first': return isKo ? '일등석' : 'First Class';
      default: return isKo ? '일반석' : 'Economy';
    }
  };

  const formatKoreanDateString = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      if (isKo) {
        return `${d.getMonth() + 1}월 ${d.getDate()}일`;
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  const renderAirlineLogo = (code: string, originalLogo: string, name: string) => {
    // High-fidelity local inline SVGs for major airlines to guarantee instant, beautiful rendering
    if (code === 'KE') { // Korean Air
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none bg-white rounded-xl p-0.5 border border-slate-100 group" title={name}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Korean_Air_emblem.svg"
            alt={name}
            className="w-11 h-11 object-contain select-none transition-transform duration-200 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== 'https://images.kiwi.com/airlines/128/KE.png') {
                target.src = 'https://images.kiwi.com/airlines/128/KE.png';
              } else {
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-black text-xs shadow-xs';
                  fallback.innerText = 'KE';
                  parent.appendChild(fallback);
                }
              }
            }}
          />
        </div>
      );
    }

    if (code === 'SQ') { // Singapore Airlines
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 100" className="w-11 h-11 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Stylized Singapore Airlines Golden Kris Bird */}
            <path 
              d="M10 25 L90 25 L75 35 L90 35 L65 47 L80 47 L35 73 C37 60 41 45 41 38 C35 38 28 35 25 31 C22 27 25 25 35 25 Z" 
              fill="#e2a425" 
            />
          </svg>
        </div>
      );
    }

    if (code === 'OZ') { // Asiana Airlines
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 65" className="w-11 h-7 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    }

    if (code === 'YP') { // Air Premia
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 20 44" className="w-4 h-9 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="16" height="40" rx="8" fill="#ff5a19" />
          </svg>
        </div>
      );
    }

    if (code === '7C') { // Jeju Air
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none bg-white rounded-xl p-0.5 border border-slate-100 group" title={name}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Jeju_Air_Logo.svg"
            alt={name}
            className="w-11 h-11 object-contain select-none transition-transform duration-200 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== 'https://images.kiwi.com/airlines/128/7C.png') {
                target.src = 'https://images.kiwi.com/airlines/128/7C.png';
              } else {
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-black text-xs shadow-xs';
                  fallback.innerText = '7C';
                  parent.appendChild(fallback);
                }
              }
            }}
          />
        </div>
      );
    }

    if (code === 'MM') { // Peach Aviation
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 100" className="w-10 h-10 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#d0006f" />
            <path d="M 30,50 C 30,35 42,28 55,35 C 68,42 68,58 55,65 C 42,72 30,65 30,50 Z" fill="#ffffff" />
            <circle cx="50" cy="50" r="10" fill="#d0006f" />
          </svg>
        </div>
      );
    }

    if (code === 'JL') { // Japan Airlines
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 100" className="w-10 h-10 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="#e10613" />
            <path d="M 50,20 C 33,20 20,33 20,50 C 20,62 27,72 38,77 L 50,50 L 62,77 C 73,72 80,62 80,50 C 80,33 67,20 50,20 Z" fill="#ffffff" />
            <circle cx="50" cy="50" r="12" fill="#e10613" />
            <path d="M 45,50 L 55,50 L 50,25 Z" fill="#ffffff" />
          </svg>
        </div>
      );
    }

    if (code === 'NH') { // All Nippon Airways
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 100" className="w-10 h-10 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15,80 L 45,20 L 65,20 L 35,80 Z" fill="#002d72" />
            <path d="M 40,80 L 70,20 L 80,20 L 50,80 Z" fill="#00a0e9" />
          </svg>
        </div>
      );
    }

    if (code === 'DL') { // Delta Air Lines
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 100" className="w-10 h-10 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15,80 L 50,15 L 85,80 L 50,65 Z" fill="#e01933" />
            <path d="M 50,15 L 85,80 L 50,65 Z" fill="#9e1224" />
          </svg>
        </div>
      );
    }

    if (code === 'BA') { // British Airways
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 50" className="w-11 h-6 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10,40 L 45,10 L 90,10 L 55,40 Z" fill="#00247d" />
            <path d="M 40,25 L 55,10 L 90,10 L 75,25 Z" fill="#cf142b" />
          </svg>
        </div>
      );
    }

    if (code === 'AF') { // Air France
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 50" className="w-11 h-6 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15,40 C 35,40 65,30 85,10 L 75,10 C 60,25 35,30 15,30 Z" fill="#ed2939" />
          </svg>
        </div>
      );
    }

    if (code === 'UA') { // United Airlines
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none group" title={name}>
          <svg viewBox="0 0 100 100" className="w-10 h-10 transition-transform duration-200 group-hover:scale-105" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    }

    if (code === 'EK') { // Emirates
      return (
        <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none bg-white rounded-xl p-0.5 border border-slate-100 group" title={name}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/d/db/Emirates_logo.svg"
            alt={name}
            className="w-11 h-11 object-contain select-none transition-transform duration-200 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== 'https://images.kiwi.com/airlines/128/EK.png') {
                target.src = 'https://images.kiwi.com/airlines/128/EK.png';
              } else {
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-xs shadow-xs';
                  fallback.innerText = 'EK';
                  parent.appendChild(fallback);
                }
              }
            }}
          />
        </div>
      );
    }

    // High-resolution Kiwi.com fallback CDN (does not block referer / hotlinking)
    const logoUrl = `https://images.kiwi.com/airlines/128/${code}.png`;

    return (
      <div className="flex items-center justify-center w-12 h-12 shrink-0 select-none bg-slate-50 border border-slate-100 rounded-xl p-1" title={name}>
        <img
          src={logoUrl}
          alt={name}
          className="w-10 h-10 object-contain select-none transition-transform duration-200 hover:scale-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs';
              fallback.innerText = code.slice(0, 2);
              parent.appendChild(fallback);
            }
          }}
        />
      </div>
    );
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
            {isKo ? '최저가 요금 💸' : 'Cheapest Rate 💸'}
          </span>
        )}
        {tag === 'fastest' && (
          <span className="bg-amber-50 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-amber-100 uppercase tracking-wider">
            {isKo ? '최단 비행시간 ⚡' : 'Fastest Flight ⚡'}
          </span>
        )}
        {tag === 'best' && (
          <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wider">
            {isKo ? '최적 추천 일정 ⭐' : 'Best Value ⭐'}
          </span>
        )}
        <span className="bg-teal-50/60 text-teal-700 text-[10px] font-black px-2.5 py-1 rounded-md border border-teal-100/50">
          {isKo ? '플렉시블 티켓으로 업그레이드 가능' : 'Flexible ticket upgrade available'}
        </span>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Left Panel: Flight Schedules */}
          <div className="md:col-span-8 lg:col-span-9 space-y-5">
            
            {/* OUTBOUND SECTION */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {renderAirlineLogo(firstOutbound.airline.code, firstOutbound.airline.logo, firstOutbound.airline.name)}
              <div className="flex-1 grid grid-cols-3 gap-1 sm:gap-4 items-center min-w-0">
                {/* Departure Time */}
                <div className="text-left min-w-0">
                  <span className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{firstOutbound.departureTime}</span>
                  <span className="block text-[10px] sm:text-[11px] text-slate-400 font-bold font-sans mt-0.5 truncate">
                    {firstOutbound.departureAirport.code}<span className="hidden sm:inline"> · {outDateFormatted || (isKo ? '가는 날' : 'Departure')}</span>
                  </span>
                </div>

                {/* Timeline Vector */}
                <div className="flex flex-col items-center justify-center relative px-0.5 sm:px-4 min-w-0">
                  {/* Stops Badge */}
                  <div className="z-10 bg-white px-1 sm:px-2">
                    {flight.stopsOutbound === 0 ? (
                      <span className="text-[9px] sm:text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full font-black">
                        {isKo ? '직항' : 'Non-stop'}
                      </span>
                    ) : (
                      <span className="text-[9px] sm:text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full font-black">
                        {isKo ? `경유 ${flight.stopsOutbound}회` : `${flight.stopsOutbound} Stop${flight.stopsOutbound > 1 ? 's' : ''}`}
                      </span>
                    )}
                  </div>

                  {/* Horizontal Timeline Line */}
                  <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-between -mt-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                    
                    {/* Centered Highly Visible Blue Plane */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-white px-1">
                        <Plane className="h-4.5 w-4.5 text-blue-600 rotate-90 transform" />
                      </div>
                    </div>

                    {flight.stopsOutbound > 0 && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 border border-white z-10"></span>
                    )}
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                  </div>

                  {/* Duration Text */}
                  <span className="text-[9px] sm:text-[11px] text-slate-500 font-bold mt-1 whitespace-nowrap">
                    {formatDuration(flight.totalDurationOutbound)}
                  </span>
                  
                  {flight.stopsOutbound > 0 && (
                    <span className="text-[8px] sm:text-[9px] text-rose-500 font-bold mt-0.5">
                      {outboundSegments.map((s, idx) => idx < outboundSegments.length - 1 ? s.arrivalAirport.code : '').filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>

                {/* Arrival Time */}
                <div className="text-right min-w-0">
                  <span className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{lastOutbound.arrivalTime}</span>
                  <span className="block text-[10px] sm:text-[11px] text-slate-400 font-bold mt-0.5 truncate">
                    {lastOutbound.arrivalAirport.code}<span className="hidden sm:inline"> · {outDateFormatted || (isKo ? '가는 날' : 'Departure')}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* INBOUND SECTION */}
            {inboundSegments && firstInbound && lastInbound && (
              <div className="flex items-center space-x-3 sm:space-x-4 pt-4 border-t border-slate-100">
                {renderAirlineLogo(firstInbound.airline.code, firstInbound.airline.logo, firstInbound.airline.name)}
                <div className="flex-1 grid grid-cols-3 gap-1 sm:gap-4 items-center min-w-0">
                  {/* Departure */}
                  <div className="text-left min-w-0">
                    <span className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{firstInbound.departureTime}</span>
                    <span className="block text-[10px] sm:text-[11px] text-slate-400 font-bold mt-0.5 truncate">
                      {firstInbound.departureAirport.code}<span className="hidden sm:inline"> · {inDateFormatted || (isKo ? '오는 날' : 'Return')}</span>
                    </span>
                  </div>

                  {/* Timeline Vector */}
                  <div className="flex flex-col items-center justify-center relative px-0.5 sm:px-4 min-w-0">
                    {/* Stops Badge */}
                    <div className="z-10 bg-white px-1 sm:px-2">
                      {flight.stopsInbound === 0 ? (
                        <span className="text-[9px] sm:text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full font-black">
                          {isKo ? '직항' : 'Non-stop'}
                        </span>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-full font-black">
                          {isKo ? `경유 ${flight.stopsInbound}회` : `${flight.stopsInbound} Stop${flight.stopsInbound > 1 ? 's' : ''}`}
                        </span>
                      )}
                    </div>

                    {/* Timeline Line */}
                    <div className="w-full h-[2px] bg-slate-200 relative flex items-center justify-between -mt-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                      
                      {/* Centered Highly Visible Blue Plane */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-white px-1">
                          <Plane className="h-4.5 w-4.5 text-blue-600 rotate-90 transform" />
                        </div>
                      </div>

                      {flight.stopsInbound && flight.stopsInbound > 0 && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 border border-white z-10"></span>
                      )}
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 border border-white"></span>
                    </div>

                    {/* Duration */}
                    <span className="text-[9px] sm:text-[11px] text-slate-500 font-bold mt-1 whitespace-nowrap">
                      {formatDuration(flight.totalDurationInbound || 0)}
                    </span>

                    {flight.stopsInbound && flight.stopsInbound > 0 && (
                      <span className="text-[8px] sm:text-[9px] text-rose-500 font-bold mt-0.5">
                        {inboundSegments.map((s, idx) => idx < inboundSegments.length - 1 ? s.arrivalAirport.code : '').filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>

                  {/* Arrival */}
                  <div className="text-right min-w-0">
                    <span className="block text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{lastInbound.arrivalTime}</span>
                    <span className="block text-[10px] sm:text-[11px] text-slate-400 font-bold mt-0.5 truncate">
                      {lastInbound.arrivalAirport.code}<span className="hidden sm:inline"> · {inDateFormatted || (isKo ? '오는 날' : 'Return')}</span>
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
          <div className="md:col-span-4 lg:col-span-3 border-t md:border-t-0 md:border-l border-slate-100 p-4 sm:p-6 flex flex-col justify-between items-stretch text-right bg-slate-50/30 md:bg-transparent rounded-b-2xl md:rounded-r-2xl h-full min-h-0 md:min-h-[160px]">
            
            {/* Baggage & Cabin Class Indicators */}
            <div className="flex flex-col items-end space-y-1.5 mb-2">
              <span className="text-[11px] text-slate-400 font-bold">
                {getCabinClassLabel(firstOutbound.cabinClass)}
              </span>
              
              {/* Luxury-style Baggage Check Icons */}
              <div className="flex items-center space-x-2">
                <div className="relative group p-1.5 bg-slate-50 border border-slate-100 rounded-lg shadow-3xs" title={isKo ? "기내 수하물 포함" : "Cabin baggage included"}>
                  <Luggage className="h-4 w-4 text-slate-500" />
                  <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✓</span>
                </div>
                <div className="relative group p-1.5 bg-slate-50 border border-slate-100 rounded-lg shadow-3xs" title={isKo ? "위탁 수하물 포함 여부" : "Checked baggage included"}>
                  <Luggage className="h-4 w-4 text-slate-500" />
                  {flight.baggageIncluded ? (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✓</span>
                  ) : (
                    <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-slate-300 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✕</span>
                  )}
                </div>
                <div className="relative group p-1.5 bg-slate-50 border border-slate-100 rounded-lg shadow-3xs" title={isKo ? "모바일 탑승권 지원" : "Mobile boarding pass supported"}>
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="absolute -top-1.5 -right-1.5 h-3.5 w-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[7px] text-white font-extrabold">✓</span>
                </div>
              </div>
            </div>

            {/* Price section */}
            <div className="my-3">
              <div className="flex items-center justify-end space-x-1">
                <span className="text-3xl font-black text-slate-900 font-sans tracking-tight">
                  {formatPrice(flight.price, currency)}
                </span>
                <button 
                  type="button" 
                  className="p-0.5 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
                  title={isKo ? "세금 및 유류할증료 포함 총액" : "Total price including taxes & surcharges"}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                {isKo 
                  ? '왕복·성인 1인 기준 총액' 
                  : (searchQuery?.tripType === 'one-way' ? 'One way · Total per adult' : 'Round trip · Total per adult')
                }
              </span>
            </div>

            {/* Structured Buttons */}
            <div className="space-y-2 mt-2">
              <button
                type="button"
                onClick={() => onBook(flight)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center space-x-1"
                id={`book-flight-btn-${flight.id}`}
              >
                <span>{isKo ? '일정 선택 및 예약' : 'Select & Book'}</span>
              </button>

              <a
                href={`https://tp.media/r?marker=744042&p=4180&u=${encodeURIComponent('https://kr.trip.com/')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-bold text-[10px] py-1.5 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span className="text-sky-500 font-black">Trip.com</span>
                <span className="text-slate-300">|</span>
                <span>{isKo ? '공식 제휴 즉시 예약' : 'Official Partner Booking'}</span>
              </a>

              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="h-9 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 font-extrabold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <span>
                  {isKo 
                    ? (expanded ? '비행 정보 접기' : '비행 정보 보기') 
                    : (expanded ? 'Hide Flight Details' : 'Show Flight Details')
                  }
                </span>
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                )}
              </button>
            </div>

          </div>

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
                  <span>
                    {isKo 
                      ? `가는 날 여정 상세 정보 (${firstOutbound.departureAirport.city} ➔ ${lastOutbound.arrivalAirport.city})`
                      : `Departure Flight Details (${firstOutbound.departureAirport.city} ➔ ${lastOutbound.arrivalAirport.city})`
                    }
                  </span>
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
                          <span>
                            {isKo 
                              ? `공항 내 대기 시간 (대기 시간 약 2시간) - ${segment.arrivalAirport.city} (${segment.arrivalAirport.code}) 경유`
                              : `Layover at ${segment.arrivalAirport.city} (${segment.arrivalAirport.code}) · Approx. 2h`
                            }
                          </span>
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
                    <span>
                      {isKo 
                        ? `오는 날 여정 상세 정보 (${firstInbound.departureAirport.city} ➔ ${lastInbound.arrivalAirport.city})`
                        : `Return Flight Details (${firstInbound.departureAirport.city} ➔ ${lastInbound.arrivalAirport.city})`
                      }
                    </span>
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
                            <span>
                              {isKo 
                                ? `공항 내 대기 시간 (대기 시간 약 2시간) - ${segment.arrivalAirport.city} (${segment.arrivalAirport.code}) 경유`
                                : `Layover at ${segment.arrivalAirport.city} (${segment.arrivalAirport.code}) · Approx. 2h`
                              }
                            </span>
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
