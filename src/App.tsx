import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchForm from './components/SearchForm';
import Filters from './components/Filters';
import StatsDashboard from './components/StatsDashboard';
import FlightCard from './components/FlightCard';
import HotelCard from './components/HotelCard';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import { generateFlights, generateHotels, AIRPORTS, CITIES } from './data';
import { Flight, Hotel, SearchQuery, FilterOptions, BookingDetails, formatPrice } from './types';
import { Plane, Hotel as HotelIcon, Briefcase, Trash2, ShieldCheck, Sparkles, ArrowRight, Compass, Heart, HeartOff, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Lock / Maintenance Screen State
  const [isLocked, setIsLocked] = useState(() => {
    return sessionStorage.getItem('yaskytrip_unlocked') !== 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'yaskytrip') {
      sessionStorage.setItem('yaskytrip_unlocked', 'true');
      setIsLocked(false);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      // Automatically reset error after 2 seconds
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'bookings'>('flights');
  const [currency, setCurrency] = useState<'USD' | 'KRW'>(() => {
    return (localStorage.getItem('yaskytrip_currency') as 'USD' | 'KRW') || 'USD';
  });

  const handleCurrencyChange = (cur: 'USD' | 'KRW') => {
    setCurrency(cur);
    localStorage.setItem('yaskytrip_currency', cur);
  };
  
  // Set default query to Seoul -> Tokyo today
  const today = new Date().toISOString().split('T')[0];
  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeek = nextWeekDate.toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    type: 'flights',
    tripType: 'round-trip',
    fromCity: 'Seoul',
    toCity: 'Tokyo',
    departureDate: today,
    returnDate: nextWeek,
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'economy',
    hotelGuests: 2,
    hotelRooms: 1,
  });

  // Data States
  const [flights, setFlights] = useState<Flight[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  // Sorting & Filtering
  const [activeSort, setActiveSort] = useState<'best' | 'cheapest' | 'fastest' | 'rating'>('best');
  const [filters, setFilters] = useState<FilterOptions>({
    maxPrice: 1500,
    stops: 'any',
    departureTimeRange: [0, 24],
    airlines: [],
    hotelRating: 0,
    hotelAmenities: [],
    onlyHighCommission: false,
  });

  // Persistent Bookings (LocalStorage)
  const [bookings, setBookings] = useState<BookingDetails[]>([]);

  // Authentication states
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    const saved = localStorage.getItem('yaskytrip_user_email');
    if (saved === null) {
      // Default logged in user to provide immediate high-fidelity experience matching metadata
      localStorage.setItem('yaskytrip_user_email', 'koreapaik@gmail.com');
      
      // Seed this user into local simulation db
      const usersKey = 'yaskytrip_registered_users';
      const usersRaw = localStorage.getItem(usersKey);
      const users = usersRaw ? JSON.parse(usersRaw) : [];
      if (!users.some((u: any) => u.email === 'koreapaik@gmail.com')) {
        users.push({ email: 'koreapaik@gmail.com', password: '123456', name: '백코리아' });
        localStorage.setItem(usersKey, JSON.stringify(users));
      }
      return 'koreapaik@gmail.com';
    }
    return saved || null;
  });

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    initialMode: 'login' | 'signup';
  }>({
    isOpen: false,
    initialMode: 'login',
  });

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthModal({
      isOpen: true,
      initialMode: mode,
    });
  };

  const handleAuthSuccess = (email: string) => {
    setCurrentUserEmail(email);
    localStorage.setItem('yaskytrip_user_email', email);
  };

  const handleLogout = () => {
    setCurrentUserEmail(null);
    localStorage.removeItem('yaskytrip_user_email');
  };

  // Modal State
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    type: 'flight' | 'hotel';
    flight?: Flight;
    hotel?: Hotel;
    selectedRoomType?: string;
    hotelPrice?: number;
  }>({
    isOpen: false,
    type: 'flight',
  });

  // Load Bookings from localStorage on Mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('voyage_bookings');
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (e) {
        console.error('Error loading bookings from localStorage', e);
      }
    }

    // Pre-populate initial results on mount so the page is not blank
    handleSearch(searchQuery);
  }, []);

  // Update localStorage when bookings change
  const saveBookings = (updatedBookings: BookingDetails[]) => {
    setBookings(updatedBookings);
    localStorage.setItem('voyage_bookings', JSON.stringify(updatedBookings));
  };

  const handleSearch = (query: SearchQuery) => {
    setSearching(true);
    setSearchQuery(query);
    setSearchTriggered(true);

    // Simulate luxury search loading (750ms for that high-end feeling)
    setTimeout(() => {
      if (query.type === 'flights') {
        const fromAirport = AIRPORTS.find(a => a.city === query.fromCity)?.code || 'ICN';
        const toAirport = AIRPORTS.find(a => a.city === query.toCity)?.code || 'HND';
        const results = generateFlights(
          fromAirport,
          toAirport,
          query.departureDate,
          query.returnDate,
          query.cabinClass,
          query.passengers.adults + query.passengers.children
        );
        setFlights(results);
        
        // Reset dynamic price range filter
        const maxPrice = results.reduce((max, f) => f.price > max ? f.price : max, 500);
        setFilters(f => ({ ...f, maxPrice, airlines: [] }));
        setActiveSort('best');
        setActiveTab('flights');
      } else {
        const results = generateHotels(query.toCity, query.hotelGuests, query.hotelRooms);
        setHotels(results);
        
        const maxPrice = results.reduce((max, h) => h.pricePerNight > max ? h.pricePerNight : max, 300);
        setFilters(f => ({ ...f, maxPrice, hotelRating: 0, hotelAmenities: [] }));
        setActiveSort('best');
        setActiveTab('hotels');
      }
      setSearching(false);
    }, 750);
  };

  // Filter & Sort Logic
  const filteredFlights = flights.filter(flight => {
    // Price Filter
    if (flight.price > filters.maxPrice) return false;

    // Stops Filter
    if (filters.stops !== 'any') {
      if (filters.stops === 'direct' && flight.stopsOutbound > 0) return false;
      if (filters.stops === '1-stop' && flight.stopsOutbound !== 1) return false;
      if (filters.stops === '2-stops' && flight.stopsOutbound < 2) return false;
    }

    // Airline Filter
    if (filters.airlines.length > 0) {
      const carrier = flight.outbound[0].airline.code;
      if (!filters.airlines.includes(carrier)) return false;
    }

    return true;
  });

  const sortedFlights = [...filteredFlights].sort((a, b) => {
    if (activeSort === 'cheapest') return a.price - b.price;
    if (activeSort === 'fastest') {
      const aDur = a.totalDurationOutbound + (a.totalDurationInbound || 0);
      const bDur = b.totalDurationOutbound + (b.totalDurationInbound || 0);
      return aDur - bDur;
    }
    // 'best' is quality score (descending)
    return b.score - a.score;
  });

  const filteredHotels = hotels.filter(hotel => {
    // Price Filter
    if (hotel.pricePerNight > filters.maxPrice) return false;

    // Star Rating
    if (filters.hotelRating > 0 && hotel.rating < filters.hotelRating) return false;

    // Amenities
    if (filters.hotelAmenities.length > 0) {
      const hasAll = filters.hotelAmenities.every(am => hotel.amenities.includes(am));
      if (!hasAll) return false;
    }

    return true;
  });

  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (activeSort === 'cheapest') return a.pricePerNight - b.pricePerNight;
    if (activeSort === 'rating') return b.reviewScore - a.reviewScore;
    // 'best' is reviews count (popularity)
    return b.reviewCount - a.reviewCount;
  });

  // Calculate unique airlines in search results for filter checklist
  const uniqueCodes = Array.from(new Set(flights.map(f => f.outbound[0].airline.code))) as string[];
  const availableAirlines = uniqueCodes.map(code => {
    const name = flights.find(f => f.outbound[0].airline.code === code)?.outbound[0].airline.name || code;
    return { code, name };
  });

  // Max pricing limit for dynamic range filters
  const maxPriceLimit = searchQuery.type === 'flights' 
    ? flights.reduce((max, f) => f.price > max ? f.price : max, 1000)
    : hotels.reduce((max, h) => h.pricePerNight > max ? h.pricePerNight : max, 500);

  // Booking handlers
  const handleOpenFlightBooking = (flight: Flight) => {
    setBookingModal({
      isOpen: true,
      type: 'flight',
      flight,
    });
  };

  const handleOpenHotelBooking = (hotel: Hotel, roomName: string, price: number) => {
    setBookingModal({
      isOpen: true,
      type: 'hotel',
      hotel,
      selectedRoomType: roomName,
      hotelPrice: price,
    });
  };

  const handleConfirmBooking = (newBooking: BookingDetails) => {
    const updated = [newBooking, ...bookings];
    saveBookings(updated);
    setBookingModal({ isOpen: false, type: 'flight' });
    setActiveTab('bookings'); // Go to My Bookings tab to see the ticket
  };

  const handleDeleteBooking = (id: string) => {
    if (confirm('정말로 이 예약을 취소하시겠습니까? 취소 후 100% 환불 처리됩니다.')) {
      const updated = bookings.filter(b => b.id !== id);
      saveBookings(updated);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans" id="lock-screen-root">
        {/* Decorative background elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md relative z-10" id="lock-card">
          <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            
            {/* Header/Brand Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                  <Plane className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <Sparkles className="w-3 h-3 mr-1" />
                SYSTEM LOCK
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                yaskytrip 서비스 준비 중
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                현재 웹사이트 개편 및 시스템 점검이 진행 중입니다.<br />
                더욱 안정적이고 스마트한 여행 검색 서비스로 곧 돌아오겠습니다!
              </p>
            </div>

            {/* Access Code Form */}
            <form onSubmit={handleUnlock} className="space-y-4 pt-2">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 ml-1">
                  관리자 접속 코드
                </label>
                <input
                  type="password"
                  placeholder="접속 코드를 입력하세요"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-center transition-all"
                />
              </div>

              {passwordError && (
                <div className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 rounded-lg text-center">
                  올바르지 않은 접속 코드입니다. 다시 입력해 주세요.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>관리자 미리보기</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-700/30">
              © 2026 yaskytrip. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-500/10 selection:text-blue-600" id="app-root">
      {/* Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          // Sync search query category if tabs clicked
          if (tab === 'flights' || tab === 'hotels') {
            setSearchQuery(q => ({ ...q, type: tab }));
          }
        }} 
        bookingCount={bookings.length} 
        currency={currency}
        setCurrency={handleCurrencyChange}
        currentUserEmail={currentUserEmail}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="main-content">
        
        {/* Search Engine Area */}
        <section className="space-y-4">
          <div className="text-center sm:text-left space-y-1.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start space-x-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>실시간 최저가 여행 검색</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium max-w-xl">
              YASKYTRIP은 전 세계 수많은 항공사와 명품 호텔 데이터를 실시간 분석하여 가장 최적화된 상품을 제안해 드립니다.
            </p>
          </div>

          <SearchForm onSearch={handleSearch} initialQuery={searchQuery} />
        </section>

        {/* Searching Loader Screen */}
        <AnimatePresence>
          {searching && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
              id="search-loader"
            >
              <div className="relative flex items-center justify-center">
                {/* Rotating ring */}
                <div className="h-12 w-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Plane className="h-5 w-5 text-blue-600 absolute rotate-45 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-gray-700">실시간 요금을 분석하고 검색하는 중...</p>
                <p className="text-[10px] text-gray-400">수백 가지 비행 루트와 객실 상태를 확인하고 있습니다.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results / Bookings List Dashboard */}
        {!searching && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* MY BOOKINGS TAB PANEL */}
            {activeTab === 'bookings' ? (
              <div className="lg:col-span-12 space-y-6" id="bookings-panel">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Briefcase className="h-4 w-4 text-blue-600" />
                    <span>나의 예약 및 여정 발권 관리</span>
                  </h2>
                  <span className="text-[11px] font-bold text-gray-400">총 {bookings.length}개의 예정된 일정</span>
                </div>

                {bookings.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-4 max-w-md mx-auto">
                    <div className="h-12 w-12 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800">예정된 여행 일정이 없습니다</h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        항공편이나 호텔 검색을 진행한 뒤 예약 모의 모듈을 실행하면 발권 완료된 내역이 이곳에 표시됩니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('flights')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2 rounded transition-all shadow-sm cursor-pointer"
                    >
                      항공편 검색하러 가기
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookings.map((booking) => (
                      <div 
                        key={booking.id}
                        className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm relative flex flex-col justify-between"
                        id={`booking-item-${booking.id}`}
                      >
                        <div>
                          {/* Top badge line */}
                          <div className="flex justify-between items-center mb-4">
                            <span className="bg-gray-100 text-gray-700 text-[9px] font-mono font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                              Ref: {booking.id}
                            </span>
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-bold">
                              발권 완료 🟢
                            </span>
                          </div>

                          {/* Flight Reservation Detail */}
                          {booking.type === 'flight' && booking.flight && (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-2xl font-black text-gray-900 font-sans">{booking.flight.outbound[0].departureAirport.code}</span>
                                  <span className="block text-[10px] text-gray-400 font-medium">{booking.flight.outbound[0].departureAirport.city}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <Plane className="h-4 w-4 text-blue-600 rotate-45 transform" />
                                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Seat {booking.selectedSeats?.join(', ')}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-2xl font-black text-slate-900 font-sans">{booking.flight.outbound[booking.flight.outbound.length - 1].arrivalAirport.code}</span>
                                  <span className="block text-[10px] text-slate-400 font-medium">{booking.flight.outbound[booking.flight.outbound.length - 1].arrivalAirport.city}</span>
                                </div>
                              </div>
                              <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded space-y-1 text-slate-600">
                                <p className="font-semibold text-gray-700">탑승자: {booking.passengers[0].lastName}/{booking.passengers[0].firstName}</p>
                                <p className="text-[10px]">클래스: {booking.flight.cabinClass.toUpperCase()}</p>
                                <p className="text-[10px]">발권일자: {booking.bookingDate}</p>
                              </div>
                            </div>
                          )}

                          {/* Hotel Reservation Detail */}
                          {booking.type === 'hotel' && booking.hotel && (
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-base font-bold text-gray-900">{booking.hotel.name}</h3>
                                <p className="text-[10px] text-gray-400">{booking.hotel.address}</p>
                              </div>
                              <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded space-y-1 text-slate-600">
                                <p className="font-semibold text-gray-700">예약자: {booking.passengers[0].lastName}/{booking.passengers[0].firstName}</p>
                                <p className="text-[10px]">선택 객실: {booking.selectedRoomType}</p>
                                <p className="text-[10px]">투숙 일정: 결제 완료 당일 체크인</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions and Pricing row */}
                        <div className="mt-6 pt-4 border-t border-gray-150 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] text-gray-400 block font-medium">총 지불 금액</span>
                            <span className="text-base font-black text-gray-900 font-sans">{formatPrice(booking.totalPrice, currency)}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold hover:bg-red-50 p-2 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                            id={`cancel-booking-btn-${booking.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>예약 취소</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // FLIGHTS & HOTELS LISTINGS PANEL
              <>
                {/* Left side Filter column (4/12 width on LG) */}
                <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-6">
                  <Filters 
                    type={searchQuery.type} 
                    filters={filters} 
                    setFilters={setFilters} 
                    availableAirlines={availableAirlines}
                    maxPriceLimit={maxPriceLimit}
                    currency={currency}
                  />
                </aside>

                {/* Right side Results listings (9/12 width on LG) */}
                <section className="lg:col-span-9 space-y-6" id="results-panel">
                  
                  {/* Results Top bar, Stats tabs & Sorting info */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-base font-bold text-gray-900">
                          {searchQuery.type === 'flights' 
                            ? `${searchQuery.fromCity} ➔ ${searchQuery.toCity} 항공권 검색 결과`
                            : `${searchQuery.toCity} 주변 추천 명소 호텔 검색 결과`
                          }
                        </h2>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {searchQuery.type === 'flights' 
                            ? `필터 통과한 항공편 ${sortedFlights.length}개 (전체 ${flights.length}개 중)`
                            : `필터 통과한 호텔 ${sortedHotels.length}개 (전체 ${hotels.length}개 중)`
                          }
                        </span>
                      </div>

                      {/* Display Class Badge if flight */}
                      {searchQuery.type === 'flights' && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded border border-blue-100">
                          {searchQuery.cabinClass === 'economy' ? '일반석' : searchQuery.cabinClass === 'premium' ? '프리미엄 일반석' : searchQuery.cabinClass === 'business' ? '비즈니스석' : '일등석'}
                        </span>
                      )}
                    </div>

                    <StatsDashboard 
                      type={searchQuery.type} 
                      flights={flights} 
                      hotels={hotels} 
                      activeSort={activeSort} 
                      setActiveSort={(sort) => setActiveSort(sort)} 
                      currency={currency}
                    />
                  </div>

                  {/* Listings Render Loop */}
                  <div className="space-y-4">
                    
                    {/* FLIGHT CARDS */}
                    {searchQuery.type === 'flights' && (
                      sortedFlights.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-700">지정하신 조건에 일치하는 항공권이 없습니다.</p>
                          <p className="text-[10px] text-slate-400">최대 예산 필터를 높이거나, 경유 횟수 선택 조건을 초기화해 보세요.</p>
                        </div>
                      ) : (
                        sortedFlights.map((flight, index) => {
                          // Determine best tags
                          let tag: 'cheapest' | 'fastest' | 'best' | undefined = undefined;
                          if (activeSort === 'best' && index === 0) tag = 'best';
                          if (flight.id === [...flights].sort((a,b) => a.price - b.price)[0]?.id) tag = 'cheapest';
                          
                          return (
                            <FlightCard 
                              key={flight.id} 
                              flight={flight} 
                              onBook={handleOpenFlightBooking}
                              tag={tag}
                              searchQuery={searchQuery}
                              currency={currency}
                            />
                          );
                        })
                      )
                    )}

                    {/* HOTEL CARDS */}
                    {searchQuery.type === 'hotels' && (
                      sortedHotels.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-700">지정하신 조건에 일치하는 호텔이 없습니다.</p>
                          <p className="text-[10px] text-slate-400">최대 가격 슬라이더를 높이거나, 편의시설 필터를 완화해 보세요.</p>
                        </div>
                      ) : (
                        sortedHotels.map((hotel) => (
                          <HotelCard 
                            key={hotel.id} 
                            hotel={hotel} 
                            onBook={handleOpenHotelBooking}
                            searchQuery={searchQuery}
                            currency={currency}
                          />
                        ))
                      )
                    )}

                  </div>

                </section>
              </>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* Booking Checkout Multi-step Modal Container */}
      <AnimatePresence>
        {bookingModal.isOpen && (
          <BookingModal 
            type={bookingModal.type}
            flight={bookingModal.flight}
            hotel={bookingModal.hotel}
            selectedRoomType={bookingModal.selectedRoomType}
            hotelPrice={bookingModal.hotelPrice}
            onClose={() => setBookingModal({ isOpen: false, type: 'flight' })}
            onConfirmBooking={handleConfirmBooking}
            searchQuery={searchQuery}
            currency={currency}
          />
        )}
      </AnimatePresence>

      {/* Authentication Modal (Login/Signup) */}
      <AuthModal 
        isOpen={authModal.isOpen}
        initialMode={authModal.initialMode}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
