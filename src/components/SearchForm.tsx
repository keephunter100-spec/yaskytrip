import React, { useState, useRef, useEffect } from 'react';
import { Plane, Hotel, Calendar, Users, ArrowLeftRight, Search, MapPin, ChevronDown, User, Minus, Plus } from 'lucide-react';
import { CITIES, AIRPORTS } from '../data';
import { SearchQuery } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SearchFormProps {
  onSearch: (query: SearchQuery) => void;
  initialQuery?: SearchQuery;
}

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

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);

  // Click outside to close suggestion dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
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
    <div className="bg-slate-900 text-white rounded-lg border border-slate-800 shadow-lg p-5 shrink-0" id="search-container">
      {/* Search Type Selectors */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-4 mb-4 gap-4">
        <div className="flex space-x-1 bg-slate-800 p-0.5 rounded-md">
          <button
            type="button"
            onClick={() => setActiveType('flights')}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeType === 'flights'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="type-select-flights"
          >
            <Plane className="h-3.5 w-3.5" />
            <span>항공권</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveType('hotels')}
            className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
              activeType === 'hotels'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            id="type-select-hotels"
          >
            <Hotel className="h-3.5 w-3.5" />
            <span>호텔</span>
          </button>
        </div>

        {/* Flight specific quick controls */}
        {activeType === 'flights' && (
          <div className="flex space-x-3 w-full sm:w-auto justify-end">
            {/* Trip Type Select */}
            <div className="relative">
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as any)}
                className="appearance-none bg-slate-800 border border-slate-700 rounded text-xs font-semibold text-slate-300 px-3 py-1.5 pr-8 hover:bg-slate-700 cursor-pointer focus:outline-hidden"
              >
                <option value="round-trip">왕복</option>
                <option value="one-way">편도</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 h-3 w-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Cabin Class Dropdown */}
            <div className="relative" ref={classRef}>
              <button
                type="button"
                onClick={() => setShowClassDropdown(!showClassDropdown)}
                className="flex items-center space-x-1 bg-slate-800 border border-slate-700 rounded text-xs font-semibold text-slate-300 px-3 py-1.5 hover:bg-slate-700 cursor-pointer"
              >
                <span>{getCabinClassLabel(cabinClass)}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              <AnimatePresence>
                {showClassDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded shadow-lg z-50 p-1"
                  >
                    {(['economy', 'premium', 'business', 'first'] as const).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          setCabinClass(cls);
                          setShowClassDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                          cabinClass === cls ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
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

      <form onSubmit={handleSearchSubmit} className="space-y-4" id="search-form">
        {/* Core Inputs Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
          
          {/* FROM / TO Location Inputs (Merged layout) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-11 gap-1 sm:gap-0 items-center bg-white border border-slate-200 rounded-md p-1 relative">
            
            {/* FROM Input */}
            <div className="sm:col-span-5 relative" ref={fromRef}>
              <label className="block text-[10px] uppercase font-bold text-slate-400 px-3 pt-1">출발지</label>
              <div className="flex items-center px-3 pb-1">
                <MapPin className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => {
                    setFromCity(e.target.value);
                    setShowFromSuggestions(true);
                  }}
                  onFocus={() => setShowFromSuggestions(true)}
                  className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                  placeholder="도시 혹은 공항"
                  id="from-city-input"
                />
              </div>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showFromSuggestions && filteredFromCities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded shadow-xl z-50 max-h-60 overflow-y-auto p-1"
                  >
                    {filteredFromCities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          setFromCity(city.name);
                          setShowFromSuggestions(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50 rounded transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <div>
                            <span className="text-xs font-semibold text-slate-800">{city.name}</span>
                            <span className="text-[10px] text-slate-400 block">{city.country}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-right">
                          {city.airports.map(a => (
                            <span key={a.code} className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 mb-0.5">{a.code}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Swap Button */}
            <div className="sm:col-span-1 flex justify-center z-10">
              <button
                type="button"
                onClick={handleSwap}
                disabled={activeType === 'hotels'}
                className={`h-7 w-7 bg-white border border-slate-200 rounded flex items-center justify-center shadow-xs text-slate-500 hover:text-blue-600 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                  activeType === 'hotels' ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                id="swap-locations"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* TO Input */}
            <div className="sm:col-span-5 relative" ref={toRef}>
              <label className="block text-[10px] uppercase font-bold text-slate-400 px-3 pt-1">목적지</label>
              <div className="flex items-center px-3 pb-1">
                <MapPin className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => {
                    setToCity(e.target.value);
                    setShowToSuggestions(true);
                  }}
                  onFocus={() => setShowToSuggestions(true)}
                  className="w-full bg-transparent border-0 p-0 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                  placeholder="도시 혹은 공항"
                  id="to-city-input"
                />
              </div>

              {/* Suggestions dropdown */}
              <AnimatePresence>
                {showToSuggestions && filteredToCities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded shadow-xl z-50 max-h-60 overflow-y-auto p-1"
                  >
                    {filteredToCities.map((city) => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => {
                          setToCity(city.name);
                          setShowToSuggestions(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50 rounded transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <div>
                            <span className="text-xs font-semibold text-slate-800">{city.name}</span>
                            <span className="text-[10px] text-slate-400 block">{city.country}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end text-right">
                          {city.airports.map(a => (
                            <span key={a.code} className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 mb-0.5">{a.code}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* DATES row */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-1.5 bg-white border border-slate-200 rounded-md p-1">
            <div className="relative">
              <label className="block text-[10px] uppercase font-bold text-slate-400 px-1.5 pt-0.5">가는 날</label>
              <div className="flex items-center px-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
                <input
                  type="date"
                  min={today}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-slate-800 focus:ring-0 focus:outline-hidden"
                  id="departure-date-input"
                />
              </div>
            </div>

            <div className={`relative transition-opacity duration-200 ${tripType === 'one-way' && activeType === 'flights' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <label className="block text-[10px] uppercase font-bold text-slate-400 px-1.5 pt-0.5">오는 날</label>
              <div className="flex items-center px-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0" />
                <input
                  type="date"
                  min={departureDate || today}
                  disabled={tripType === 'one-way' && activeType === 'flights'}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-xs font-semibold text-slate-800 focus:ring-0 focus:outline-hidden"
                  id="return-date-input"
                />
              </div>
            </div>
          </div>

          {/* PASSENGERS AND SEARCH ROW */}
          <div className="lg:col-span-2 relative" ref={passengerRef}>
            {activeType === 'flights' ? (
              // Flights passenger dropdown
              <>
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="w-full h-full min-h-[46px] bg-white border border-slate-200 rounded-md px-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  id="passenger-dropdown-trigger"
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">인원</span>
                      <span className="block text-xs font-bold text-slate-800">승객 {totalPassengers}명</span>
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {showPassengerDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded shadow-xl z-50 p-3 space-y-3"
                    >
                      {/* Adults */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">성인</span>
                          <span className="text-[10px] text-slate-400">만 12세 이상</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">{passengers.adults}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, adults: p.adults + 1 }))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">소아</span>
                          <span className="text-[10px] text-slate-400">만 2세 - 11세</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">{passengers.children}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, children: p.children + 1 }))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Infants */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">유아</span>
                          <span className="text-[10px] text-slate-400">만 2세 미만</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">{passengers.infants}</span>
                          <button
                            type="button"
                            onClick={() => setPassengers(p => ({ ...p, infants: p.infants + 1 }))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              // Hotels guests & rooms selectors
              <>
                <button
                  type="button"
                  onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                  className="w-full h-full min-h-[46px] bg-white border border-slate-200 rounded-md px-3 flex items-center justify-between text-left hover:bg-slate-50 transition-colors cursor-pointer"
                  id="hotel-guest-dropdown-trigger"
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">인원 / 객실</span>
                      <span className="block text-xs font-bold text-slate-800">{hotelGuests}명, {hotelRooms}객실</span>
                    </div>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {showPassengerDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded shadow-xl z-50 p-3 space-y-3"
                    >
                      {/* Guests */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">투숙 인원</span>
                          <span className="text-[10px] text-slate-400">전체 투숙객 수</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setHotelGuests(g => Math.max(1, g - 1))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">{hotelGuests}</span>
                          <button
                            type="button"
                            onClick={() => setHotelGuests(g => g + 1)}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Rooms */}
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">객실 수</span>
                          <span className="text-[10px] text-slate-400">필요한 객실 개수</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setHotelRooms(r => Math.max(1, r - 1))}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-4 text-center">{hotelRooms}</span>
                          <button
                            type="button"
                            onClick={() => setHotelRooms(r => r + 1)}
                            className="h-6 w-6 bg-slate-50 rounded border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>

        </div>

        {/* Validation Info / Submit button */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-1 gap-3">
          <div className="text-xs text-slate-400">
            {fromCity === toCity && activeType === 'flights' && (
              <span className="text-red-400 font-bold">⚠️ 출발지와 목적지는 서로 달라야 합니다.</span>
            )}
            {fromCity !== toCity && (
              <span className="hidden sm:inline">💡 실시간 자동완성 및 최적 경로 항공/호텔 데이터를 스캔합니다.</span>
            )}
          </div>

          <button
            type="submit"
            disabled={fromCity === toCity && activeType === 'flights'}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider text-xs px-8 py-3 rounded transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            id="search-submit-btn"
          >
            <span>{activeType === 'flights' ? '항공권 검색' : '호텔 검색'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
