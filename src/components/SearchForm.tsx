import React, { useState, useRef, useEffect } from 'react';
import { Plane, Hotel, Calendar, Users, ArrowLeftRight, Search, MapPin, ChevronDown, Minus, Plus, Check } from 'lucide-react';
import { CITIES } from '../data';
import { SearchQuery } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SearchFormProps {
  onSearch: (query: SearchQuery) => void;
  initialQuery?: SearchQuery;
}

// Mapped helper for English to Korean City Name Translation
const getKoreanCityName = (cityName: string) => {
  const nameMap: { [key: string]: string } = {
    'Seoul': '서울',
    'Tokyo': '도쿄',
    'New York': '뉴욕',
    'London': '런던',
    'Paris': '파리',
    'Singapore': '싱가포르',
    'Sydney': '시드니',
    'Honolulu': '호놀룰루',
    'Fukuoka': '후쿠오카',
  };
  return nameMap[cityName] || cityName;
};

// Retrieve first airport code dynamically
const getAirportCodeForCity = (cityName: string) => {
  const cityObj = CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  if (cityObj && cityObj.airports.length > 0) {
    return cityObj.airports[0].code;
  }
  return '';
};

// Robust date formatting with no timezone shift
const formatKoreanDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month - 1, day);
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = days[date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
  }
  return dateStr;
};

export default function SearchForm({ onSearch, initialQuery }: SearchFormProps) {
  const [activeType, setActiveType] = useState<'flights' | 'hotels'>(initialQuery?.type || 'flights');
  const [tripType, setTripType] = useState<'round-trip' | 'one-way'>(initialQuery?.tripType || 'round-trip');
  const [cabinClass, setCabinClass] = useState<'economy' | 'premium' | 'business' | 'first'>(initialQuery?.cabinClass || 'economy');

  const [fromCity, setFromCity] = useState(initialQuery?.fromCity || 'Seoul');
  const [toCity, setToCity] = useState(initialQuery?.toCity || 'Tokyo');
  
  // Format dates cleanly
  const today = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeek = nextWeekDate.toISOString().split('T')[0];

  const [departureDate, setDepartureDate] = useState(initialQuery?.departureDate || today);
  const [returnDate, setReturnDate] = useState(initialQuery?.returnDate || nextWeek);

  // Passenger counts
  const [passengers, setPassengers] = useState(initialQuery?.passengers || { adults: 1, children: 0, infants: 0 });
  const [hotelGuests, setHotelGuests] = useState(initialQuery?.hotelGuests || 2);
  const [hotelRooms, setHotelRooms] = useState(initialQuery?.hotelRooms || 1);

  // Dropdown states
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false);
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Focus simulation
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);

  // For accommodations search in flight tab (aesthetic checkbox)
  const [searchHotelTogether, setSearchHotelTogether] = useState(true);

  // Click outside to close suggestion dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
        setIsFromFocused(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
        setIsToFocused(false);
      }
      if (passengerRef.current && !passengerRef.current.contains(event.target as Node)) {
        setShowPassengerDropdown(false);
      }
      if (classRef.current && !classRef.current.contains(event.target as Node)) {
        setShowClassDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwap = () => {
    if (activeType === 'flights') {
      const temp = fromCity;
      setFromCity(toCity);
      setToCity(temp);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      type: activeType,
      tripType,
      fromCity,
      toCity,
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      passengers,
      cabinClass,
      hotelGuests,
      hotelRooms,
    });
  };

  const filteredFromCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(fromCity.toLowerCase()) ||
    city.country.toLowerCase().includes(fromCity.toLowerCase()) ||
    city.airports.some(a => a.code.toLowerCase().includes(fromCity.toLowerCase()))
  );

  const filteredToCities = CITIES.filter(city =>
    city.name.toLowerCase().includes(toCity.toLowerCase()) ||
    city.country.toLowerCase().includes(toCity.toLowerCase()) ||
    city.airports.some(a => a.code.toLowerCase().includes(toCity.toLowerCase()))
  );

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const getCabinClassLabel = (cls: string) => {
    switch (cls) {
      case 'economy': return '일반석';
      case 'premium': return '프리미엄 일반석';
      case 'business': return '비즈니스석';
      case 'first': return '일등석';
      default: return '일반석';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 text-white rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 shrink-0 relative overflow-hidden" id="search-container">
      
      {/* Decorative ambient background lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Search Type Selectors & Settings Row */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-5 mb-6 gap-4">
        
        {/* Main Tab Triggers */}
        <div className="flex space-x-1 bg-white/10 p-1 rounded-xl backdrop-blur-md">
          <button
            type="button"
            onClick={() => setActiveType('flights')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeType === 'flights'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            id="type-select-flights"
          >
            <Plane className="h-4 w-4" />
            <span>항공권</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('hotels')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeType === 'hotels'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            id="type-select-hotels"
          >
            <Hotel className="h-4 w-4" />
            <span>호텔</span>
          </button>
        </div>

        {/* Flight specific class & way filters */}
        {activeType === 'flights' && (
          <div className="flex space-x-3 w-full sm:w-auto justify-end">
            {/* Trip Type Select */}
            <div className="relative">
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as any)}
                className="appearance-none bg-white/10 border border-white/10 rounded-xl text-xs font-extrabold text-white pl-4 pr-10 py-2.5 hover:bg-white/15 cursor-pointer focus:outline-hidden backdrop-blur-md"
              >
                <option value="round-trip" className="text-slate-900 font-bold">왕복</option>
                <option value="one-way" className="text-slate-900 font-bold">편도</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-white/70 pointer-events-none" />
            </div>

            {/* Cabin Class Dropdown */}
            <div className="relative" ref={classRef}>
              <button
                type="button"
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="flex items-center space-x-2 bg-white/10 border border-white/10 rounded-xl text-xs font-extrabold text-white px-4 py-2.5 hover:bg-white/15 cursor-pointer backdrop-blur-md"
              >
                <span>{getCabinClassLabel(cabinClass)}</span>
                <ChevronDown className="h-3.5 w-3.5 text-white/70" />
              </button>

              <AnimatePresence>
                {showClassDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-44 bg-white border border-slate-100 rounded-xl shadow-2xl z-50 p-1"
                  >
                    {(['economy', 'premium', 'business', 'first'] as const).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          setCabinClass(cls);
                          setShowClassDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          cabinClass === cls ? 'bg-blue-50 text-blue-700 font-black' : 'text-slate-700 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        {getCabinClassLabel(cls)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10" id="search-form">
        
        {/* Row 1: Core Flight Search Blocks (Departure, Destination, Unified Date Card) */}
        {activeType === 'flights' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Departure & Destination (Merged horizontal layout with floating swap) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
              
              {/* Departure Input Card */}
              <div 
                ref={fromRef}
                onClick={() => {
                  setIsFromFocused(true);
                  setShowFromSuggestions(true);
                }}
                className="flex items-center space-x-3.5 bg-white rounded-2xl p-4 border border-slate-200 cursor-pointer h-[76px] shadow-sm hover:border-blue-400 transition-all group relative"
              >
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Plane className="h-5 w-5 text-blue-600 shrink-0" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">도시/공항명</span>
                  {isFromFocused ? (
                    <input
                      type="text"
                      value={fromCity}
                      onChange={(e) => setFromCity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsFromFocused(false);
                        }
                      }}
                      className="w-full bg-transparent border-0 p-0 text-base font-black text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                      placeholder="출발지 도시 입력"
                      autoFocus
                    />
                  ) : (
                    <span className="text-base sm:text-lg font-black text-slate-800 block truncate leading-none mt-1">
                      {getKoreanCityName(fromCity)} {getAirportCodeForCity(fromCity) ? `(${getAirportCodeForCity(fromCity)})` : ''}
                    </span>
                  )}
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showFromSuggestions && filteredFromCities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5"
                    >
                      {filteredFromCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFromCity(city.name);
                            setShowFromSuggestions(false);
                            setIsFromFocused(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <div>
                              <span className="text-xs font-extrabold text-slate-800">{getKoreanCityName(city.name)} ({city.name})</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">{city.country}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end text-right">
                            {city.airports.map(a => (
                              <span key={a.code} className="text-[9px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 mb-0.5">{a.code}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Float Swap Button */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden sm:flex">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSwap();
                  }}
                  className="h-9 w-9 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-lg text-slate-600 hover:text-blue-600 hover:scale-115 active:scale-90 transition-all cursor-pointer"
                  title="출발지 목적지 전환"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </button>
              </div>

              {/* Destination Input Card */}
              <div 
                ref={toRef}
                onClick={() => {
                  setIsToFocused(true);
                  setShowToSuggestions(true);
                }}
                className="flex items-center space-x-3.5 bg-white rounded-2xl p-4 border border-slate-200 cursor-pointer h-[76px] shadow-sm hover:border-blue-400 transition-all group relative"
              >
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <MapPin className="h-5 w-5 text-blue-600 shrink-0" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">도시/공항명</span>
                  {isToFocused ? (
                    <input
                      type="text"
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsToFocused(false);
                        }
                      }}
                      className="w-full bg-transparent border-0 p-0 text-base font-black text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                      placeholder="목적지 도시 입력"
                      autoFocus
                    />
                  ) : (
                    <span className="text-base sm:text-lg font-black text-slate-800 block truncate leading-none mt-1">
                      {getKoreanCityName(toCity)} {getAirportCodeForCity(toCity) ? `(${getAirportCodeForCity(toCity)})` : ''}
                    </span>
                  )}
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showToSuggestions && filteredToCities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5"
                    >
                      {filteredToCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setToCity(city.name);
                            setShowToSuggestions(false);
                            setIsToFocused(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <div>
                              <span className="text-xs font-extrabold text-slate-800">{getKoreanCityName(city.name)} ({city.name})</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">{city.country}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end text-right">
                            {city.airports.map(a => (
                              <span key={a.code} className="text-[9px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 mb-0.5">{a.code}</span>
                            ))}
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>

            {/* Unified Spacious Date Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 divide-x divide-slate-150 overflow-hidden h-[76px]">
              
              {/* Left Column: 가는 날 */}
              <div className="relative p-4 flex items-center space-x-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input
                  type="date"
                  min={today}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">가는 날</span>
                  <span className="block text-xs sm:text-sm font-black text-slate-800 truncate mt-0.5 leading-none">
                    {formatKoreanDate(departureDate)}
                  </span>
                </div>
              </div>

              {/* Right Column: 오는 날 */}
              <div className={`relative p-4 flex items-center space-x-3 hover:bg-slate-50 transition-colors cursor-pointer group ${
                tripType === 'one-way' ? 'opacity-35 pointer-events-none' : ''
              }`}>
                <input
                  type="date"
                  min={departureDate || today}
                  disabled={tripType === 'one-way'}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">오는 날</span>
                  <span className="block text-xs sm:text-sm font-black text-slate-800 truncate mt-0.5 leading-none">
                    {tripType === 'one-way' ? '편도 여정' : formatKoreanDate(returnDate)}
                  </span>
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* Hotels Search Blocks Row */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            
            {/* Accommodation City Input Card */}
            <div className="lg:col-span-7">
              <div 
                ref={toRef}
                onClick={() => {
                  setIsToFocused(true);
                  setShowToSuggestions(true);
                }}
                className="flex items-center space-x-3.5 bg-white rounded-2xl p-4 border border-slate-200 cursor-pointer h-[76px] shadow-sm hover:border-blue-400 transition-all group relative w-full"
              >
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors">
                  <Hotel className="h-5 w-5 text-blue-600 shrink-0" />
                </div>
                <div className="flex-1 text-left">
                  <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">숙박할 도시</span>
                  {isToFocused ? (
                    <input
                      type="text"
                      value={toCity}
                      onChange={(e) => setToCity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setIsToFocused(false);
                        }
                      }}
                      className="w-full bg-transparent border-0 p-0 text-base font-black text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                      placeholder="목적지 도시 입력"
                      autoFocus
                    />
                  ) : (
                    <span className="text-base sm:text-lg font-black text-slate-800 block truncate leading-none mt-1">
                      {getKoreanCityName(toCity)} {getAirportCodeForCity(toCity) ? `(${getAirportCodeForCity(toCity)})` : ''}
                    </span>
                  )}
                </div>

                {/* Suggestions dropdown */}
                <AnimatePresence>
                  {showToSuggestions && filteredToCities.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5"
                    >
                      {filteredToCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setToCity(city.name);
                            setShowToSuggestions(false);
                            setIsToFocused(false);
                          }}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-blue-50/70 rounded-xl transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <div>
                              <span className="text-xs font-extrabold text-slate-800">{getKoreanCityName(city.name)} ({city.name})</span>
                              <span className="text-[10px] text-slate-400 block font-semibold">{city.country}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Unified Hotel Date Card (체크인 & 체크아웃) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 divide-x divide-slate-150 overflow-hidden h-[76px]">
              
              {/* Checkin Column */}
              <div className="relative p-4 flex items-center space-x-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input
                  type="date"
                  min={today}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">체크인</span>
                  <span className="block text-xs sm:text-sm font-black text-slate-800 truncate mt-0.5 leading-none">
                    {formatKoreanDate(departureDate)}
                  </span>
                </div>
              </div>

              {/* Checkout Column */}
              <div className="relative p-4 flex items-center space-x-3 hover:bg-slate-50 transition-colors cursor-pointer group">
                <input
                  type="date"
                  min={departureDate || today}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                />
                <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                </div>
                <div className="text-left min-w-0">
                  <span className="block text-[10px] text-slate-400 font-black uppercase tracking-wider">체크아웃</span>
                  <span className="block text-xs sm:text-sm font-black text-slate-800 truncate mt-0.5 leading-none">
                    {formatKoreanDate(returnDate)}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Row 2: Secondary Settings Block (Passengers/Rooms, Option Checkbox) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          
          {/* Passenger/Guest Selection Dropdown Card */}
          <div className="md:col-span-6 lg:col-span-5 relative" ref={passengerRef}>
            {activeType === 'flights' ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-left hover:border-blue-400 transition-all cursor-pointer h-[72px]"
                  id="passenger-dropdown-trigger"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">인원</span>
                      <span className="block text-sm sm:text-base font-black text-slate-800">승객 {totalPassengers}명</span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                </button>

                <AnimatePresence>
                  {showPassengerDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-2 w-68 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4"
                    >
                      {/* Adults */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-black text-slate-800 block">성인</span>
                          <span className="text-[10px] text-slate-400 font-medium">만 12세 이상</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5 font-bold" />
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">{passengers.adults}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5 font-bold" />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-xs font-black text-slate-800 block">소아</span>
                          <span className="text-[10px] text-slate-400 font-medium">만 2세 - 11세</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">{passengers.children}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: p.children + 1 }))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-xs font-black text-slate-800 block">유아</span>
                          <span className="text-[10px] text-slate-400 font-medium">만 2세 미만</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">{passengers.infants}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, infants: p.infants + 1 }))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              /* Hotel Guest Selector trigger */
              <>
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-left hover:border-blue-400 transition-all cursor-pointer h-[72px]"
                  id="hotel-guest-dropdown-trigger"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                      <Users className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-black text-slate-400 tracking-wider">인원 / 객실</span>
                      <span className="block text-sm sm:text-base font-black text-slate-800">{hotelGuests}명, {hotelRooms}객실</span>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                </button>

                <AnimatePresence>
                  {showPassengerDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 mt-2 w-68 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4"
                    >
                      {/* Hotel Guests */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-black text-slate-800 block">투숙 인원</span>
                          <span className="text-[10px] text-slate-400 font-medium">전체 투숙객 수</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setHotelGuests(g => Math.max(1, g - 1))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">{hotelGuests}</span>
                          <button
                            type="button"
                            onClick={() => setHotelGuests(g => g + 1)}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Hotel Rooms */}
                      <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-xs font-black text-slate-800 block">객실 수</span>
                          <span className="text-[10px] text-slate-400 font-medium">필요한 객실 수</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setHotelRooms(r => Math.max(1, r - 1))}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-black text-slate-800 w-4 text-center">{hotelRooms}</span>
                          <button
                            type="button"
                            onClick={() => setHotelRooms(r => r + 1)}
                            className="h-7 w-7 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

          {/* Optional Checkbox Block (다른 도시나 날짜의 숙소 검색하기) */}
          <div className="md:col-span-6 lg:col-span-7">
            <label 
              onClick={() => setSearchHotelTogether(!searchHotelTogether)}
              className="flex items-center space-x-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-4 cursor-pointer h-[72px] transition-all"
            >
              <div className={`h-5 w-5 rounded-md flex items-center justify-center border transition-all ${
                searchHotelTogether 
                  ? 'bg-blue-600 border-blue-500 text-white' 
                  : 'bg-transparent border-white/40 text-transparent'
              }`}>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-white">다른 도시나 날짜의 숙소 검색하기</span>
                <span className="block text-[9px] text-white/60 font-semibold mt-0.5">선택된 여정에 맞는 명품 추천 호텔 요금을 실시간 병합 정렬합니다.</span>
              </div>
            </label>
          </div>

        </div>

        {/* Dynamic warning alert block */}
        {fromCity === toCity && activeType === 'flights' && (
          <div className="bg-red-500/20 text-red-100 border border-red-500/30 text-xs font-extrabold rounded-xl p-3 text-center">
            ⚠️ 출발지와 목적지는 서로 달라야 합니다. 새로운 도시를 입력해 주세요!
          </div>
        )}

        {/* Bottom Submission Action: Centered Blue Pill Button */}
        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={fromCity === toCity && activeType === 'flights'}
            className="w-full sm:w-auto min-w-[280px] bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm py-4 px-12 rounded-full transition-all shadow-xl hover:shadow-blue-500/20 hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2"
            id="search-submit-btn"
          >
            <Search className="h-4 w-4" />
            <span>
              {activeType === 'flights' ? '항공권+숙소 검색하기' : '호텔 최저가 검색하기'}
            </span>
          </button>
        </div>

      </form>
    </div>
  );
}
