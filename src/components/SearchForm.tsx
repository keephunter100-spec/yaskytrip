import React, { useState, useRef, useEffect } from 'react';
import { Plane, Hotel, Calendar, Users, ArrowLeftRight, Search, MapPin, ChevronDown, Minus, Plus, Check, DoorOpen, Car, Tag } from 'lucide-react';
import { CITIES } from '../data';
import { SearchQuery } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { getTranslation } from '../utils/translations';

interface SearchFormProps {
  onSearch: (query: SearchQuery) => void;
  initialQuery?: SearchQuery;
  language?: 'KO' | 'EN';
  selectedLanguageCode?: string;
  onTabChange?: (tab: 'flights' | 'hotels' | 'packages' | 'cars' | 'realtime') => void;
}

// Mapped helper for English to Local City Name Translation
const getKoreanCityName = (cityName: string, selectedLanguageCode: string = 'ko') => {
  const nameMap: { [lang: string]: { [key: string]: string } } = {
    ko: {
      'Seoul': '서울',
      'Tokyo': '도쿄',
      'New York': '뉴욕',
      'London': '런던',
      'Paris': '파리',
      'Singapore': '싱가포르',
      'Sydney': '시드니',
      'Honolulu': '호놀룰루',
      'Fukuoka': '후쿠오카',
    },
    ja: {
      'Seoul': 'ソウル',
      'Tokyo': '東京',
      'New York': 'ニューヨーク',
      'London': 'ロンドン',
      'Paris': 'パリ',
      'Singapore': 'シンガポール',
      'Sydney': 'シドニー',
      'Honolulu': 'ホノルル',
      'Fukuoka': '福岡',
    },
    'zh-CN': {
      'Seoul': '首尔',
      'Tokyo': '东京',
      'New York': '纽约',
      'London': '伦敦',
      'Paris': '巴黎',
      'Singapore': '新加坡',
      'Sydney': '悉尼',
      'Honolulu': '檀香山',
      'Fukuoka': '福冈',
    },
    'zh-TW': {
      'Seoul': '首爾',
      'Tokyo': '東京',
      'New York': '紐約',
      'London': '倫敦',
      'Paris': '巴黎',
      'Singapore': '新加坡',
      'Sydney': '雪梨',
      'Honolulu': '檀香山',
      'Fukuoka': '福岡',
    }
  };
  const langKey = selectedLanguageCode === 'ko' ? 'ko' :
                  selectedLanguageCode === 'ja' ? 'ja' :
                  selectedLanguageCode === 'zh-CN' ? 'zh-CN' :
                  selectedLanguageCode === 'zh-TW' ? 'zh-TW' : 'en';
  if (langKey === 'en') return cityName;
  return nameMap[langKey]?.[cityName] || cityName;
};

// Retrieve first airport code dynamically
const getAirportCodeForCity = (cityName: string) => {
  const cityObj = CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  if (cityObj && cityObj.airports.length > 0) {
    return cityObj.airports[0].code;
  }
  return '';
};

// Robust date formatting supporting multiple locales
const formatKoreanDate = (dateStr: string, selectedLanguageCode: string = 'ko') => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month - 1, day);
    if (selectedLanguageCode === 'ko') {
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      const dayOfWeek = days[date.getDay()];
      return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
    } else if (selectedLanguageCode === 'ja') {
      const days = ['日', '月', '火', '水', '木', '金', '土'];
      const dayOfWeek = days[date.getDay()];
      return `${year}年 ${month}月 ${day}日 (${dayOfWeek})`;
    } else if (selectedLanguageCode.startsWith('zh')) {
      const days = ['日', '一', '二', '三', '四', '五', '六'];
      const dayOfWeek = days[date.getDay()];
      return `${year}年 ${month}月 ${day}日 (周${dayOfWeek})`;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayOfWeek = days[date.getDay()];
      return `${months[month - 1]} ${day}, ${year} (${dayOfWeek})`;
    }
  }
  return dateStr;
};

export default function SearchForm({ onSearch, initialQuery, language = 'KO', selectedLanguageCode = 'ko', onTabChange }: SearchFormProps) {
  const [activeType, setActiveType] = useState<'flights' | 'hotels' | 'packages' | 'cars' | 'realtime'>(initialQuery?.type || 'flights');

  const handleTypeChange = (type: 'flights' | 'hotels' | 'packages' | 'cars' | 'realtime') => {
    setActiveType(type);
    if (onTabChange) {
      onTabChange(type);
    }
  };
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
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  // Focus simulation
  const [isFromFocused, setIsFromFocused] = useState(false);
  const [isToFocused, setIsToFocused] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const passengerRef = useRef<HTMLDivElement>(null);
  const classRef = useRef<HTMLDivElement>(null);
  const departureInputRef = useRef<HTMLInputElement>(null);
  const returnInputRef = useRef<HTMLInputElement>(null);

  // For accommodations search in flight tab (aesthetic checkbox)
  const [searchHotelTogether, setSearchHotelTogether] = useState(true);

  // Sync internal state when initialQuery updates from external triggers (like AI Semantic Search)
  useEffect(() => {
    if (initialQuery) {
      setActiveType(initialQuery.type || 'flights');
      setTripType(initialQuery.tripType || 'round-trip');
      setCabinClass(initialQuery.cabinClass || 'economy');
      setFromCity(initialQuery.fromCity || 'Seoul');
      setToCity(initialQuery.toCity || 'Tokyo');
      setDepartureDate(initialQuery.departureDate || today);
      setReturnDate(initialQuery.returnDate || nextWeek);
    }
  }, [
    initialQuery?.type, 
    initialQuery?.tripType, 
    initialQuery?.cabinClass, 
    initialQuery?.fromCity, 
    initialQuery?.toCity, 
    initialQuery?.departureDate, 
    initialQuery?.returnDate
  ]);

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
        setShowRoomDropdown(false);
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
    if (activeType === 'realtime') return;

    onSearch({
      type: activeType as 'flights' | 'hotels' | 'packages' | 'cars',
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
      case 'economy':
        return selectedLanguageCode === 'ko' ? '일반석' :
               selectedLanguageCode === 'ja' ? 'エコノミー' :
               selectedLanguageCode.startsWith('zh') ? '经济舱' : 'Economy';
      case 'premium':
        return selectedLanguageCode === 'ko' ? '프리미엄 일반석' :
               selectedLanguageCode === 'ja' ? 'プレミアムエコノミー' :
               selectedLanguageCode.startsWith('zh') ? '超级经济舱' : 'Premium Economy';
      case 'business':
        return selectedLanguageCode === 'ko' ? '비즈니스석' :
               selectedLanguageCode === 'ja' ? 'ビジネス' :
               selectedLanguageCode.startsWith('zh') ? '公务舱' : 'Business';
      case 'first':
        return selectedLanguageCode === 'ko' ? '일등석' :
               selectedLanguageCode === 'ja' ? 'ファースト' :
               selectedLanguageCode.startsWith('zh') ? '头等舱' : 'First';
      default:
        return 'Economy';
    }
  };

  const isEn = selectedLanguageCode !== 'ko';
  const t = {
    flights: getTranslation('flights', selectedLanguageCode),
    hotels: getTranslation('hotels', selectedLanguageCode),
    packages: getTranslation('packages', selectedLanguageCode),
    cars: selectedLanguageCode === 'ko' ? '렌터카' : 'Car Rental',
    deals: selectedLanguageCode === 'ko' ? '할인 혜택' : 'Deals & Coupons',
    searchCars: selectedLanguageCode === 'ko' ? '렌터카 검색하기' : 'Search Car Rentals',
    searchDeals: selectedLanguageCode === 'ko' ? '할인 혜택 조회하기' : 'Search Deals & Coupons',
    roundTrip: getTranslation('roundTrip', selectedLanguageCode),
    oneWay: getTranslation('oneWay', selectedLanguageCode),
    departure: getTranslation('departure', selectedLanguageCode),
    arrival: getTranslation('destination', selectedLanguageCode),
    destinationCity: selectedLanguageCode === 'ko' ? '숙박할 도시' : 'Destination',
    enterDestination: selectedLanguageCode === 'ko' ? '도시 또는 호텔명 입력' : 'Search city or hotel...',
    departureDate: getTranslation('departureDate', selectedLanguageCode),
    returnDate: getTranslation('returnDate', selectedLanguageCode),
    checkInDate: selectedLanguageCode === 'ko' ? '체크인' : 'Check-in',
    checkOutDate: selectedLanguageCode === 'ko' ? '체크아웃' : 'Check-out',
    passengers: getTranslation('travelers', selectedLanguageCode),
    roomAndGuests: selectedLanguageCode === 'ko' ? '객실 및 투숙객' : 'Rooms & Guests',
    searchFlights: selectedLanguageCode === 'ko' ? '항공권 검색하기' :
                   selectedLanguageCode === 'ja' ? '航空券を検索' :
                   selectedLanguageCode.startsWith('zh') ? '搜索机票' : 'Search Flights',
    searchHotels: selectedLanguageCode === 'ko' ? '호텔 검색하기' :
                  selectedLanguageCode === 'ja' ? 'ホテルを検索' :
                  selectedLanguageCode.startsWith('zh') ? '搜索酒店' : 'Search Hotels',
    searchPackages: selectedLanguageCode === 'ko' ? '항공권+숙소 검색하기' :
                    selectedLanguageCode === 'ja' ? '航空券+ホテルを検索' :
                    selectedLanguageCode.startsWith('zh') ? '搜索机票+酒店' : 'Search Flight+Hotel',
    adults: selectedLanguageCode === 'ko' ? '성인' : 'Adults',
    children: selectedLanguageCode === 'ko' ? '소아' : 'Children',
    infants: selectedLanguageCode === 'ko' ? '유아' : 'Infants',
    adultsDesc: selectedLanguageCode === 'ko' ? '만 12세 이상' : 'Age 12 or above',
    childrenDesc: selectedLanguageCode === 'ko' ? '만 2세 ~ 11세' : 'Age 2 to 11',
    infantsDesc: selectedLanguageCode === 'ko' ? '만 2세 미만' : 'Under age 2',
    rooms: selectedLanguageCode === 'ko' ? '객실' : 'Rooms',
    guests: getTranslation('guests', selectedLanguageCode),
    done: selectedLanguageCode === 'ko' ? '선택 완료' : 'Done',
  };

  return (
    <div className="bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-950 text-white rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-8 shrink-0 relative overflow-visible z-30" id="search-container">
      
      {/* Decorative ambient background lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Search Type Selectors & Settings Row */}
      <div className="relative z-30 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-5 mb-6 gap-4">
        
        {/* Main Tab Triggers */}
        <div className="flex overflow-x-auto no-scrollbar max-w-full space-x-1 bg-white/10 p-1 rounded-xl backdrop-blur-md flex-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => handleTypeChange('flights')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeType === 'flights'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            id="type-select-flights"
          >
            <Plane className="h-4 w-4 shrink-0" />
            <span>{t.flights}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('hotels')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeType === 'hotels'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            id="type-select-hotels"
          >
            <Hotel className="h-4 w-4 shrink-0" />
            <span>{t.hotels}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('packages')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeType === 'packages'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            id="type-select-packages"
          >
            <span className="flex items-center -space-x-1 mr-1 shrink-0">
              <Plane className="h-3.5 w-3.5 shrink-0" />
              <span className="text-[9px] font-bold text-current/70 shrink-0 self-center">+</span>
              <Hotel className="h-3.5 w-3.5 shrink-0" />
            </span>
            <span>{t.packages}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('cars')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeType === 'cars'
                ? 'bg-white text-blue-900 shadow-lg'
                : 'text-white/80 hover:text-white hover:bg-white/5'
            }`}
            id="type-select-cars"
          >
            <Car className="h-4 w-4 shrink-0" />
            <span>{t.cars}</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('realtime')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeType === 'realtime'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-white/5 font-bold border border-emerald-500/20'
            }`}
            id="type-select-realtime"
          >
            <span className="relative flex h-2 w-2 mr-0.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{selectedLanguageCode === 'ko' ? '실시간 특가 ⚡' : 'Live Deals ⚡'}</span>
          </button>
        </div>

        {/* Flight specific class & way filters */}
        {(activeType === 'flights' || activeType === 'packages') && (
          <div className="flex space-x-3 w-full sm:w-auto justify-end">
            {/* Trip Type Select */}
            <div className="relative">
              <select
                value={tripType}
                onChange={(e) => setTripType(e.target.value as any)}
                className="appearance-none bg-white/10 border border-white/10 rounded-xl text-xs font-extrabold text-white pl-4 pr-10 py-2.5 hover:bg-white/15 cursor-pointer focus:outline-hidden backdrop-blur-md"
              >
                <option value="round-trip" className="text-slate-900 font-bold">{t.roundTrip}</option>
                <option value="one-way" className="text-slate-900 font-bold">{t.oneWay}</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-3.5 h-3.5 w-3.5 text-white/70 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSearchSubmit} className="space-y-4 relative z-10" id="search-form">
         
         {activeType === 'realtime' ? null : false ? (
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
             {/* Promo search card - spans 9 cols */}
             <div className="md:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center p-4 hover:bg-slate-50/70 h-[76px] transition-all relative group">
               <div className="text-indigo-600 shrink-0 mr-3">
                 <Tag className="h-6 w-6" />
               </div>
               <div className="flex-1 text-left min-w-0">
                 <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                   {selectedLanguageCode === 'ko' ? '카드사 또는 검색어 입력 (실시간 검색)' : 'Search credit cards, coupons or keyword...'}
                 </span>
                 <input
                   type="text"
                   value={toCity === 'Tokyo' ? '' : toCity}
                   onChange={(e) => setToCity(e.target.value)}
                   className="w-full bg-transparent border-0 p-0 text-sm sm:text-base font-extrabold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden mt-1"
                   placeholder={selectedLanguageCode === 'ko' ? '예: KB국민카드, 신한카드, 호캉스, 렌터카...' : 'e.g. KB card, Shinhan, hotel, car...'}
                 />
               </div>
             </div>
             {/* Search button - spans 3 cols */}
             <div className="md:col-span-3">
               <button
                 type="submit"
                 className="h-[76px] w-full bg-[#1E60FF] hover:bg-[#004EE0] text-white font-black text-sm sm:text-base rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                 id="search-submit-btn-deals"
               >
                 <Search className="h-5 w-5 stroke-[2.5]" />
                 <span>{t.searchDeals}</span>
               </button>
             </div>
           </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
             
             {/* Row 1, Column 1 (Left top): 출발지 / 도착지 or 숙박할 도시 */}
             {(activeType === 'flights' || activeType === 'packages') ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 divide-x divide-slate-150 overflow-visible h-[76px] relative">
              {/* Departure */}
              <div 
                ref={fromRef}
                onClick={() => {
                  setIsFromFocused(true);
                  setShowFromSuggestions(true);
                }}
                className="relative p-4 flex items-center space-x-3 hover:bg-slate-50/70 transition-colors cursor-pointer group rounded-l-2xl"
              >
                <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
                  <Plane className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">{t.departure}</span>
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
                      className="w-full bg-transparent border-0 p-0 text-sm font-extrabold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                      placeholder={t.departure}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm sm:text-base font-extrabold text-slate-800 block truncate leading-tight mt-1">
                      {getKoreanCityName(fromCity, selectedLanguageCode)} {getAirportCodeForCity(fromCity) ? `(${getAirportCodeForCity(fromCity)})` : ''}
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
                      className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5"
                      style={{ top: '100%' }}
                      onClick={(e) => e.stopPropagation()}
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
                              <span className="text-xs font-extrabold text-slate-800">{getKoreanCityName(city.name, selectedLanguageCode)} ({city.name})</span>
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

              {/* Destination */}
              <div 
                ref={toRef}
                onClick={() => {
                  setIsToFocused(true);
                  setShowToSuggestions(true);
                }}
                className="relative p-4 flex items-center space-x-3 hover:bg-slate-50/70 transition-colors cursor-pointer group rounded-r-2xl"
              >
                <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">{t.arrival}</span>
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
                      className="w-full bg-transparent border-0 p-0 text-sm font-extrabold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                      placeholder={t.arrival}
                      autoFocus
                    />
                  ) : (
                    <span className="text-sm sm:text-base font-extrabold text-slate-800 block truncate leading-tight mt-1">
                      {getKoreanCityName(toCity, selectedLanguageCode)} {getAirportCodeForCity(toCity) ? `(${getAirportCodeForCity(toCity)})` : ''}
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
                      className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5"
                      style={{ top: '100%' }}
                      onClick={(e) => e.stopPropagation()}
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
                              <span className="text-xs font-extrabold text-slate-800">{getKoreanCityName(city.name, selectedLanguageCode)} ({city.name})</span>
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
          ) : (
            /* Hotel & Car Search Left Card (Accommodation City / Rental Place) */
            <div 
              ref={toRef}
              onClick={() => {
                setIsToFocused(true);
                setShowToSuggestions(true);
              }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center p-4 hover:bg-slate-50/70 cursor-pointer h-[76px] transition-all relative w-full group"
            >
              <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 mr-3">
                {activeType === 'cars' ? (
                  <Car className="h-6 w-6 text-emerald-600 animate-pulse" />
                ) : (
                  <Hotel className="h-6 w-6" />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  {activeType === 'cars'
                    ? (selectedLanguageCode === 'ko' ? '차량 대여 인수 도시' : 'Rental Pickup City')
                    : t.destinationCity
                  }
                </span>
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
                    className="w-full bg-transparent border-0 p-0 text-sm font-extrabold text-slate-800 placeholder-slate-400 focus:ring-0 focus:outline-hidden"
                    placeholder={activeType === 'cars'
                      ? (selectedLanguageCode === 'ko' ? '도시 입력...' : 'Enter City...')
                      : t.destinationCity
                    }
                    autoFocus
                  />
                ) : (
                  <span className="text-sm sm:text-base font-extrabold text-slate-800 block truncate leading-tight mt-1">
                    {getKoreanCityName(toCity, selectedLanguageCode)} {getAirportCodeForCity(toCity) ? `(${getAirportCodeForCity(toCity)})` : ''}
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
                    className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5"
                    style={{ top: '100%' }}
                    onClick={(e) => e.stopPropagation()}
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
                            <span className="text-xs font-extrabold text-slate-800">{getKoreanCityName(city.name, selectedLanguageCode)} ({city.name})</span>
                            <span className="text-[10px] text-slate-400 block font-semibold">{city.country}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Row 1, Column 2 (Right top): 가는 날 / 오는 날 or 체크인 / 체크아웃 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 divide-x divide-slate-150 overflow-hidden h-[76px]">
            {/* Left side: Departure/Check-in Date */}
            <div 
              onClick={() => {
                try {
                  departureInputRef.current?.showPicker();
                } catch (err) {
                  console.warn("showPicker failed:", err);
                }
              }}
              className="relative p-4 flex items-center space-x-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
            >
              <input
                ref={departureInputRef}
                type="date"
                min={today}
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {
                    console.warn("showPicker is not supported:", err);
                  }
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="text-left min-w-0">
                <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  {(activeType === 'flights' || activeType === 'packages') ? t.departureDate : t.checkInDate}
                </span>
                <span className="block text-sm sm:text-base font-extrabold text-slate-800 truncate mt-1 leading-tight">
                  {formatKoreanDate(departureDate, selectedLanguageCode)}
                </span>
              </div>
            </div>

            {/* Right side: Return/Check-out Date */}
            <div 
              onClick={() => {
                if (activeType === 'flights' && tripType === 'one-way') return;
                try {
                  returnInputRef.current?.showPicker();
                } catch (err) {
                  console.warn("showPicker failed:", err);
                }
              }}
              className={`relative p-4 flex items-center space-x-3 hover:bg-slate-50/70 transition-colors cursor-pointer group ${
                activeType === 'flights' && tripType === 'one-way' ? 'opacity-35 pointer-events-none' : ''
              }`}
            >
              <input
                ref={returnInputRef}
                type="date"
                min={departureDate || today}
                disabled={activeType === 'flights' && tripType === 'one-way'}
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  try {
                    e.currentTarget.showPicker();
                  } catch (err) {
                    console.warn("showPicker is not supported:", err);
                  }
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="text-left min-w-0">
                <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  {(activeType === 'flights' || activeType === 'packages') ? t.returnDate : t.checkOutDate}
                </span>
                <span className="block text-sm sm:text-base font-extrabold text-slate-800 truncate mt-1 leading-tight">
                  {activeType === 'flights' && tripType === 'one-way' ? (selectedLanguageCode === 'ko' ? '편도 여정' : 'One Way') : formatKoreanDate(returnDate, selectedLanguageCode)}
                </span>
              </div>
            </div>
          </div>

          {/* Row 2, Column 1 (Left bottom): 인원 / 객실 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm grid grid-cols-2 divide-x divide-slate-150 overflow-visible h-[76px] relative">
            
            {/* Passengers selection */}
            <div 
              ref={passengerRef}
              onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
              className="relative p-4 flex items-center space-x-3 hover:bg-slate-50/70 transition-colors cursor-pointer group rounded-l-2xl"
            >
              <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
                {activeType === 'cars' ? <Car className="h-6 w-6 text-slate-500" /> : <Users className="h-6 w-6" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  {activeType === 'cars' 
                    ? (selectedLanguageCode === 'ko' ? '대여 탑승 인원' : 'Rental Occupants') 
                    : t.passengers
                  }
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-800 block truncate mt-1">
                  {activeType === 'cars'
                    ? (language === 'EN' ? `${totalPassengers} passenger${totalPassengers > 1 ? 's' : ''}` : `${totalPassengers}명`)
                    : (activeType === 'flights' || activeType === 'packages') 
                      ? (language === 'EN' ? `${totalPassengers} Traveler${totalPassengers > 1 ? 's' : ''}` : `${totalPassengers}명`) 
                      : (language === 'EN' ? `${hotelGuests} Guest${hotelGuests > 1 ? 's' : ''}` : `${hotelGuests}명`)
                  }
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />

              <AnimatePresence>
                {showPassengerDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 mt-2 w-68 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4"
                    style={{ top: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(activeType === 'flights' || activeType === 'packages') ? (
                      <>
                        {/* Adults */}
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-black text-slate-800 block">{t.adults}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{t.adultsDesc}</span>
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
                            <span className="text-xs font-black text-slate-800 block">{t.children}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{t.childrenDesc}</span>
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
                            <span className="text-xs font-black text-slate-800 block">{t.infants}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{t.infantsDesc}</span>
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
                      </>
                    ) : (
                      <>
                        {/* Hotel Guests */}
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-xs font-black text-slate-800 block">{t.guests}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{isEn ? 'Total guests' : '전체 투숙객 수'}</span>
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
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cabin Class or Rooms selection */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (activeType === 'flights') {
                  setShowClassDropdown(!showClassDropdown);
                } else if (activeType === 'hotels' || activeType === 'packages') {
                  setShowRoomDropdown(!showRoomDropdown);
                }
              }}
              className="relative p-4 flex items-center space-x-3 hover:bg-slate-50/70 transition-colors cursor-pointer group rounded-r-2xl"
            >
              <div className="text-slate-400 group-hover:text-slate-600 transition-colors shrink-0">
                {activeType === 'cars' ? <Car className="h-6 w-6 text-slate-500" /> : <DoorOpen className="h-6 w-6" />}
              </div>
              <div className="flex-1 text-left min-w-0" ref={classRef}>
                <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                  {activeType === 'cars'
                    ? (isEn ? 'Car Class' : '선호 차량 등급')
                    : activeType === 'flights' ? (isEn ? 'Cabin Class' : '좌석 등급') : t.rooms
                  }
                </span>
                <span className="text-sm sm:text-base font-extrabold text-slate-800 block truncate mt-1">
                  {activeType === 'cars'
                    ? (selectedLanguageCode === 'ko' ? '전체 등급 (컴팩트~SUV)' : 'All Classes (Compact to SUV)')
                    : activeType === 'flights' 
                      ? getCabinClassLabel(cabinClass)
                      : activeType === 'packages'
                        ? (isEn ? `${hotelRooms} Room${hotelRooms > 1 ? 's' : ''} / ${hotelGuests} Guest${hotelGuests > 1 ? 's' : ''}` : `${hotelRooms} 객실 / 투숙 ${hotelGuests}명`)
                        : (isEn ? `${hotelRooms} Room${hotelRooms > 1 ? 's' : ''}` : `${hotelRooms} 객실`)
                  }
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />

              {/* Class options dropdown if activeType is flights */}
              <AnimatePresence>
                {activeType === 'flights' && showClassDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-1.5"
                    style={{ top: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(['economy', 'premium', 'business', 'first'] as const).map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => {
                          setCabinClass(cls);
                          setShowClassDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs rounded-xl transition-colors cursor-pointer ${
                          cabinClass === cls ? 'bg-blue-50 text-blue-700 font-black' : 'text-slate-700 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        {getCabinClassLabel(cls)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Room & Guest modifier dropdown for hotels & packages */}
              <AnimatePresence>
                {(activeType === 'hotels' || activeType === 'packages') && showRoomDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-4 space-y-4"
                    style={{ top: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{isEn ? 'Rooms' : '객실 수'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{isEn ? 'Number of rooms needed' : '필요한 객실 수'}</span>
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

                    <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                      <div>
                        <span className="text-xs font-black text-slate-800 block">{t.guests}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{isEn ? 'Total guests' : '전체 투숙객 수'}</span>
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Row 2, Column 2 (Right bottom): Blue Search Action Button */}
          <div>
            <button
              type="submit"
              disabled={fromCity === toCity && (activeType === 'flights' || activeType === 'packages')}
              className="h-[76px] w-full bg-[#1E60FF] hover:bg-[#004EE0] text-white font-black text-lg sm:text-xl rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer flex items-center justify-center space-x-2.5"
              id="search-submit-btn"
            >
              <Search className="h-5.5 w-5.5 stroke-[2.5]" />
              <span>
                {activeType === 'flights' 
                  ? t.searchFlights 
                  : activeType === 'packages'
                    ? t.searchPackages
                    : activeType === 'cars'
                      ? t.searchCars
                      : t.searchHotels
                }
              </span>
            </button>
          </div>

        </div>
         )}

        {/* Dynamic warning alert block */}
        {fromCity === toCity && (activeType === 'flights' || activeType === 'packages') && (
          <div className="bg-red-500/20 text-red-100 border border-red-500/30 text-xs font-extrabold rounded-xl p-3 text-center">
            {isEn ? '⚠️ Departure and Destination cities must be different. Please select a different city!' : '⚠️ 출발지와 목적지는 서로 달라야 합니다. 새로운 도시를 입력해 주세요!'}
          </div>
        )}

      </form>
    </div>
  );
}
