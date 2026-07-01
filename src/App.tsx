import React, { useState, useEffect } from 'react';
import { LANGUAGE_DEFAULT_CURRENCY } from './utils/translations';
import Header from './components/Header';
import Footer from './components/Footer';
import SearchForm from './components/SearchForm';
import Filters from './components/Filters';
import StatsDashboard from './components/StatsDashboard';
import LanguageSelectionModal from './components/LanguageSelectionModal';
import FlightCard from './components/FlightCard';
import HotelCard from './components/HotelCard';
import PackageCard from './components/PackageCard';
import CarCard from './components/CarCard';
import DealCard from './components/DealCard';
import CarBookingModal from './components/CarBookingModal';
import BookingModal from './components/BookingModal';
import AuthModal from './components/AuthModal';
import RefundPolicyModal from './components/RefundPolicyModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import TravelpayoutsWidget from './components/TravelpayoutsWidget';
import AISearchDrawer from './components/AISearchDrawer';
import AppDownloadModal from './components/AppDownloadModal';
import { generateFlights, generateHotels, generateCars, DISCOUNT_DEALS, AIRPORTS, CITIES } from './data';
import { Flight, Hotel, CarRental, DiscountDeal, SearchQuery, FilterOptions, BookingDetails, formatPrice } from './types';
import { Plane, Hotel as HotelIcon, Briefcase, Trash2, ShieldCheck, Sparkles, ArrowRight, Compass, Heart, HeartOff, CheckCircle, Car, Tag, Ticket, Gift, Download, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ParsedQuery {
  type: 'flights' | 'hotels' | 'packages';
  toCity: string;
  fromCity: string;
  departureDate: string;
  returnDate: string;
}

const parseAISemanticQuery = (text: string, defaultFromCity: string = 'Seoul'): ParsedQuery => {
  const lowercase = text.toLowerCase().trim();
  
  // Default values
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  
  let type: 'flights' | 'hotels' | 'packages' = 'flights';
  let toCity = 'New York';
  let fromCity = defaultFromCity;
  let departureDate = todayStr;
  let returnDate = nextWeekStr;

  // 1. Parse Search Type
  if (lowercase.includes('호텔') || lowercase.includes('숙소') || lowercase.includes('숙박') || lowercase.includes('리조트') || lowercase.includes('hotel')) {
    type = 'hotels';
  } else if (lowercase.includes('패키지') || lowercase.includes('결합')) {
    type = 'packages';
  } else {
    type = 'flights';
  }

  // 2. Parse Destination City
  const cityMap: { [key: string]: string } = {
    '도쿄': 'Tokyo',
    '오사카': 'Tokyo',
    '뉴욕': 'New York',
    '욕': 'New York',
    '런던': 'London',
    '파리': 'Paris',
    '싱가포르': 'Singapore',
    '시드니': 'Sydney',
    '호놀룰루': 'Honolulu',
    '후쿠오카': 'Tokyo',
    '서울': 'Seoul',
    '부산': 'Busan',
    '베이징': 'Beijing',
    'tokyo': 'Tokyo',
    'osaka': 'Tokyo',
    'new york': 'New York',
    'nyc': 'New York',
    'jfk': 'New York',
    'london': 'London',
    'paris': 'Paris',
    'singapore': 'Singapore',
    'sydney': 'Sydney',
    'honolulu': 'Honolulu',
    'seoul': 'Seoul',
    'busan': 'Busan',
    'beijing': 'Beijing'
  };

  for (const [key, val] of Object.entries(cityMap)) {
    if (lowercase.includes(key)) {
      toCity = val;
      break;
    }
  }

  // Ensure toCity is not same as fromCity for flights and packages
  if ((type === 'flights' || type === 'packages') && toCity === 'Seoul' && fromCity === 'Seoul') {
    toCity = 'Tokyo';
  }

  // 3. Robust Korean/English Date Parsing
  const isoDates = text.match(/(\d{4}-\d{2}-\d{2})/g);
  if (isoDates && isoDates.length >= 2) {
    departureDate = isoDates[0];
    returnDate = isoDates[1];
  } else if (isoDates && isoDates.length === 1) {
    departureDate = isoDates[0];
    const ret = new Date(departureDate);
    ret.setDate(ret.getDate() + 3);
    returnDate = ret.toISOString().split('T')[0];
  } else {
    const koreanDateRegex = /(?:(\d{4})년\s*)?(\d{1,2})월\s*(\d{1,2})일/g;
    const matches = [...text.matchAll(koreanDateRegex)];
    if (matches && matches.length >= 2) {
      const year1 = matches[0][1] ? parseInt(matches[0][1], 10) : today.getFullYear();
      const month1 = parseInt(matches[0][2], 10);
      const day1 = parseInt(matches[0][3], 10);
      
      const year2 = matches[1][1] ? parseInt(matches[1][1], 10) : year1;
      const month2 = parseInt(matches[1][2], 10);
      const day2 = parseInt(matches[1][3], 10);
      
      const formatNum = (num: number) => num.toString().padStart(2, '0');
      departureDate = `${year1}-${formatNum(month1)}-${formatNum(day1)}`;
      returnDate = `${year2}-${formatNum(month2)}-${formatNum(day2)}`;
    } else if (matches && matches.length === 1) {
      const year1 = matches[0][1] ? parseInt(matches[0][1], 10) : today.getFullYear();
      const month1 = parseInt(matches[0][2], 10);
      const day1 = parseInt(matches[0][3], 10);
      const formatNum = (num: number) => num.toString().padStart(2, '0');
      departureDate = `${year1}-${formatNum(month1)}-${formatNum(day1)}`;
      
      const ret = new Date(year1, month1 - 1, day1 + 5);
      returnDate = ret.toISOString().split('T')[0];
    } else {
      if (lowercase.includes('다음 주말') || lowercase.includes('다음주 주말') || lowercase.includes('주말')) {
        const dayOfWeek = today.getDay();
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
        const nextSat = new Date();
        nextSat.setDate(today.getDate() + daysUntilSaturday);
        
        const nextSun = new Date(nextSat);
        nextSun.setDate(nextSat.getDate() + 1);

        departureDate = nextSat.toISOString().split('T')[0];
        returnDate = nextSun.toISOString().split('T')[0];
      } else if (lowercase.includes('내일')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(tomorrow.getDate() + 3);

        departureDate = tomorrow.toISOString().split('T')[0];
        returnDate = dayAfter.toISOString().split('T')[0];
      } else if (lowercase.includes('한달 뒤') || lowercase.includes('한달후') || lowercase.includes('다음 달') || lowercase.includes('다음달')) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthReturn = new Date(nextMonth);
        nextMonthReturn.setDate(nextMonth.getDate() + 5);

        departureDate = nextMonth.toISOString().split('T')[0];
        returnDate = nextMonthReturn.toISOString().split('T')[0];
      } else {
        const monthRegex = /(\d+)월/;
        const mMatch = lowercase.match(monthRegex);
        if (mMatch) {
          const monthNum = parseInt(mMatch[1], 10);
          const year = today.getFullYear();
          let parsedYear = year;
          if (monthNum - 1 < today.getMonth()) {
            parsedYear += 1;
          }
          
          const targetDate = new Date(parsedYear, monthNum - 1, 15);
          const targetReturnDate = new Date(targetDate);
          targetReturnDate.setDate(targetDate.getDate() + 4);

          departureDate = targetDate.toISOString().split('T')[0];
          returnDate = targetReturnDate.toISOString().split('T')[0];
        }
      }
    }
  }

  return { type, toCity, fromCity, departureDate, returnDate };
};

export default function App() {
  // Lock / Maintenance Screen State
  const [isLocked, setIsLocked] = useState(false);
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

  const [activeTab, setActiveTab] = useState<'flights' | 'hotels' | 'bookings' | 'packages' | 'cars' | 'realtime'>('flights');
  const [currency, setCurrency] = useState<string>(() => {
    return localStorage.getItem('yaskytrip_currency') || 'USD';
  });

  const [selectedLanguageCode, setSelectedLanguageCode] = useState<string>(() => {
    return localStorage.getItem('yaskytrip_selected_language_code') || 'ko';
  });
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAppDownloadOpen, setIsAppDownloadOpen] = useState(false);
  const [showAppInstallBanner, setShowAppInstallBanner] = useState(() => {
    return localStorage.getItem('yaskytrip_hide_app_banner') !== 'true';
  });

  const language: 'KO' | 'EN' = selectedLanguageCode === 'ko' ? 'KO' : 'EN';

  const handleCurrencyChange = (cur: string) => {
    setCurrency(cur);
    localStorage.setItem('yaskytrip_currency', cur);
  };

  const handleLanguageChange = (langCode: string) => {
    setSelectedLanguageCode(langCode);
    localStorage.setItem('yaskytrip_selected_language_code', langCode);
    localStorage.setItem('yaskytrip_language', langCode === 'ko' ? 'KO' : 'EN');

    // Automatically set default currency for this language/country
    const defaultCur = LANGUAGE_DEFAULT_CURRENCY[langCode];
    if (defaultCur) {
      setCurrency(defaultCur);
      localStorage.setItem('yaskytrip_currency', defaultCur);
    }
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
  const [cars, setCars] = useState<CarRental[]>([]);
  const [selectedCarToBook, setSelectedCarToBook] = useState<CarRental | null>(null);
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

  // AI Semantic Search States
  const [aiQuery, setAiQuery] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

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

  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

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
    type: 'flight' | 'hotel' | 'package';
    flight?: Flight;
    hotel?: Hotel;
    selectedRoomType?: string;
    hotelPrice?: number;
  }>({
    isOpen: false,
    type: 'flight',
  });

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

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
  }, []);

  // Update localStorage when bookings change
  const saveBookings = (updatedBookings: BookingDetails[]) => {
    setBookings(updatedBookings);
    localStorage.setItem('voyage_bookings', JSON.stringify(updatedBookings));
  };

  const triggerAISample = (sample: string) => {
    setAiQuery(sample);
    handleAISubmit(sample);
  };

  const handleAISubmit = (customQuery?: string) => {
    const queryToParse = customQuery || aiQuery || '다음 주말 오사카행 항공편';
    setAiAnalyzing(true);
    
    setTimeout(() => {
      const parsed = parseAISemanticQuery(queryToParse, searchQuery.fromCity);
      const updatedQuery: SearchQuery = {
        type: parsed.type,
        tripType: 'round-trip',
        fromCity: parsed.fromCity,
        toCity: parsed.toCity,
        departureDate: parsed.departureDate,
        returnDate: parsed.returnDate,
        passengers: { adults: 1, children: 0, infants: 0 },
        cabinClass: 'economy',
        hotelGuests: 2,
        hotelRooms: 1,
      };
      
      handleSearch(updatedQuery);
      setAiAnalyzing(false);
    }, 600);
  };

  const handleSearch = async (query: SearchQuery) => {
    setSearching(true);
    setSearchQuery(query);
    setSearchTriggered(true);

    if (query.type === 'flights') {
      const fromAirport = AIRPORTS.find(a => a.city === query.fromCity)?.code || 'ICN';
      const toAirport = AIRPORTS.find(a => a.city === query.toCity)?.code || 'HND';

      try {
        const response = await fetch(
          `/api/flights/search?origin=${fromAirport}&destination=${toAirport}&departureDate=${query.departureDate}${
            query.returnDate ? '&returnDate=' + query.returnDate : ''
          }&currency=${currency}`
        );
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          console.log('Using real-time Travelpayouts flight search results:', result.data);
          setFlights(result.data);
          const maxPrice = result.data.reduce((max: number, f: any) => f.price > max ? f.price : max, 500);
          setFilters(f => ({ ...f, maxPrice, airlines: [] }));
        } else {
          // Fallback to high-quality mock engine if API returns no data for specific flight routes
          const results = generateFlights(
            fromAirport,
            toAirport,
            query.departureDate,
            query.returnDate,
            query.cabinClass,
            query.passengers.adults + query.passengers.children
          );
          setFlights(results);
          const maxPrice = results.reduce((max, f) => f.price > max ? f.price : max, 500);
          setFilters(f => ({ ...f, maxPrice, airlines: [] }));
        }
      } catch (err) {
        console.error('Failed to load real-time flight search. Falling back to mock engine.', err);
        const results = generateFlights(
          fromAirport,
          toAirport,
          query.departureDate,
          query.returnDate,
          query.cabinClass,
          query.passengers.adults + query.passengers.children
        );
        setFlights(results);
        const maxPrice = results.reduce((max, f) => f.price > max ? f.price : max, 500);
        setFilters(f => ({ ...f, maxPrice, airlines: [] }));
      }
      setActiveSort('best');
      setActiveTab('flights');
      setSearching(false);
    } else if (query.type === 'packages') {
      const fromAirport = AIRPORTS.find(a => a.city === query.fromCity)?.code || 'ICN';
      const toAirport = AIRPORTS.find(a => a.city === query.toCity)?.code || 'HND';

      let flightResults = [];
      try {
        const response = await fetch(
          `/api/flights/search?origin=${fromAirport}&destination=${toAirport}&departureDate=${query.departureDate}${
            query.returnDate ? '&returnDate=' + query.returnDate : ''
          }&currency=${currency}`
        );
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          flightResults = result.data;
        } else {
          flightResults = generateFlights(
            fromAirport,
            toAirport,
            query.departureDate,
            query.returnDate,
            query.cabinClass,
            query.passengers.adults + query.passengers.children
          );
        }
      } catch {
        flightResults = generateFlights(
          fromAirport,
          toAirport,
          query.departureDate,
          query.returnDate,
          query.cabinClass,
          query.passengers.adults + query.passengers.children
        );
      }

      const hotelResults = generateHotels(query.toCity, query.hotelGuests, query.hotelRooms);
      setFlights(flightResults);
      setHotels(hotelResults);

      const dep = new Date(query.departureDate);
      const ret = new Date(query.returnDate || query.departureDate);
      const diffTime = Math.abs(ret.getTime() - dep.getTime());
      const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const totalPass = query.passengers.adults + query.passengers.children + query.passengers.infants;

      const maxFlightPrice = flightResults.reduce((max, f) => f.price > max ? f.price : max, 500);
      const maxHotelPrice = hotelResults.reduce((max, h) => h.pricePerNight > max ? h.pricePerNight : max, 300);
      const maxCombinedPrice = Math.ceil((maxFlightPrice * totalPass + maxHotelPrice * nights * (query.hotelRooms || 1)) * 0.85);

      setFilters(f => ({ ...f, maxPrice: maxCombinedPrice, hotelRating: 0, hotelAmenities: [], airlines: [] }));
      setActiveSort('best');
      setActiveTab('packages');
      setSearching(false);
    } else if (query.type === 'cars') {
      setTimeout(() => {
        const carResults = generateCars(query.toCity);
        setCars(carResults);
        const maxPrice = carResults.reduce((max, c) => c.pricePerDay > max ? c.pricePerDay : max, 100);
        setFilters(f => ({ ...f, maxPrice, airlines: [] }));
        setActiveTab('cars');
        setSearching(false);
      }, 750);
    } else {
      setTimeout(() => {
        const results = generateHotels(query.toCity, query.hotelGuests, query.hotelRooms);
        setHotels(results);
        
        const maxPrice = results.reduce((max, h) => h.pricePerNight > max ? h.pricePerNight : max, 300);
        setFilters(f => ({ ...f, maxPrice, hotelRating: 0, hotelAmenities: [] }));
        setActiveSort('best');
        setActiveTab('hotels');
        setSearching(false);
      }, 750);
    }
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
  const getPackageNights = () => {
    if (!searchQuery.departureDate || !searchQuery.returnDate) return 1;
    const dep = new Date(searchQuery.departureDate);
    const ret = new Date(searchQuery.returnDate);
    const diffTime = Math.abs(ret.getTime() - dep.getTime());
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const maxPriceLimit = searchQuery.type === 'flights' 
    ? flights.reduce((max, f) => f.price > max ? f.price : max, 1000)
    : searchQuery.type === 'packages'
      ? Math.ceil(
          (flights.reduce((max, f) => f.price > max ? f.price : max, 1000) * (searchQuery.passengers.adults + searchQuery.passengers.children + searchQuery.passengers.infants) +
          hotels.reduce((max, h) => h.pricePerNight > max ? h.pricePerNight : max, 500) * getPackageNights() * (searchQuery.hotelRooms || 1)) * 0.85
        )
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

  const handleOpenPackageBooking = (flight: Flight, hotel: Hotel, totalPrice: number) => {
    setBookingModal({
      isOpen: true,
      type: 'package',
      flight,
      hotel,
      selectedRoomType: '디럭스 더블룸 (결합 혜택)',
      hotelPrice: totalPrice,
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
          if (tab === 'flights' || tab === 'hotels' || tab === 'packages' || tab === 'cars') {
            setSearchQuery(q => ({ ...q, type: tab }));
            setSearchTriggered(false);
          }
        }} 
        bookingCount={bookings.length} 
        currency={currency}
        setCurrency={handleCurrencyChange}
        currentUserEmail={currentUserEmail}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        language={language}
        setLanguage={handleLanguageChange}
        selectedLanguageCode={selectedLanguageCode}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenAppDownload={() => setIsAppDownloadOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 md:pb-8 space-y-8" id="main-content">
        
        {/* Search Engine Area */}
        <section className="space-y-4">
          <SearchForm 
            onSearch={handleSearch} 
            initialQuery={searchQuery} 
            language={language} 
            selectedLanguageCode={selectedLanguageCode} 
            onTabChange={(tab) => {
              setActiveTab(tab);
              if (tab !== 'realtime') {
                setSearchQuery(q => ({ ...q, type: tab }));
                setSearchTriggered(false);
              }
            }}
          />
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
                    <span>나의 예약 및 일정 발권 관리</span>
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

                          {/* Car Rental Reservation Detail */}
                          {booking.type === 'car' && booking.car && (
                            <div className="space-y-4">
                              <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between">
                                <span className="text-[10px] font-black text-emerald-700 flex items-center space-x-1">
                                  <Car className="h-3.5 w-3.5" />
                                  <span>실시간 인수 확인 및 공항 셔틀 연결 완료</span>
                                </span>
                              </div>
                              <div>
                                <h3 className="text-base font-bold text-gray-900">{booking.car.name}</h3>
                                <p className="text-[10px] text-gray-400">{booking.car.provider} • {booking.car.transmission === 'auto' ? '오토' : '수동'} • {booking.car.fuelType === 'electric' ? '전기차' : '하이버리드/가솔린'}</p>
                              </div>
                              <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded space-y-1 text-slate-600">
                                <p className="font-semibold text-gray-700 font-sans">계약자: {booking.passengers[0].firstName}</p>
                                <p className="text-[10px]">보험 조건: {booking.selectedRoomType || '완전 자차 보험 포함'}</p>
                                <p className="text-[10px]">운전면허증: {booking.passengers[0].passportNumber}</p>
                              </div>
                            </div>
                          )}

                          {/* Package Reservation Detail */}
                          {booking.type === 'package' && booking.flight && booking.hotel && (
                            <div className="space-y-4">
                              <div className="bg-blue-50/50 border border-blue-100 p-2.5 rounded-lg flex items-center justify-between">
                                <span className="text-[10px] font-black text-blue-700 flex items-center space-x-1">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  <span>결합 패키지 특별 혜택가 적용</span>
                                </span>
                              </div>
                              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                <div>
                                  <span className="text-xl font-black text-gray-900 font-sans">{booking.flight.outbound[0].departureAirport.code}</span>
                                  <span className="block text-[10px] text-gray-400 font-medium">{booking.flight.outbound[0].departureAirport.city}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                  <Plane className="h-4 w-4 text-blue-600 rotate-45 transform" />
                                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Seat 14A</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-xl font-black text-slate-900 font-sans">{booking.flight.outbound[booking.flight.outbound.length - 1].arrivalAirport.code}</span>
                                  <span className="block text-[10px] text-slate-400 font-medium">{booking.flight.outbound[booking.flight.outbound.length - 1].arrivalAirport.city}</span>
                                </div>
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-gray-900">{booking.hotel.name}</h3>
                                <p className="text-[10px] text-gray-400">{booking.hotel.address.split(',')[0]}</p>
                              </div>
                              <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded space-y-1 text-slate-600">
                                <p className="font-semibold text-gray-700">예약대표자: {booking.passengers[0].lastName}/{booking.passengers[0].firstName}</p>
                                <p className="text-[10px]">객실타입: {booking.selectedRoomType || '디럭스 룸 (패키지 할인가)'}</p>
                                <p className="text-[10px]">발권일자: {booking.bookingDate}</p>
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
            ) : activeTab === 'realtime' ? (
              <div className="lg:col-span-12 space-y-6" id="realtime-panel">
                <TravelpayoutsWidget selectedLanguageCode={selectedLanguageCode} type="calendar" />
              </div>
            ) : !searchTriggered ? (
              <div className="lg:col-span-12 space-y-6" id="initial-widget-panel">
                <TravelpayoutsWidget selectedLanguageCode={selectedLanguageCode} type="map" />
              </div>
            ) : (
              // FLIGHTS & HOTELS LISTINGS PANEL
              <>
                {/* Left side Filter column (4/12 width on LG) */}
                {(searchQuery.type === 'flights' || searchQuery.type === 'hotels' || searchQuery.type === 'packages') && (
                  <aside className="lg:col-span-3 lg:sticky lg:top-20 space-y-6">
                    <Filters 
                      type={searchQuery.type} 
                      filters={filters} 
                      setFilters={setFilters} 
                      availableAirlines={availableAirlines}
                      maxPriceLimit={maxPriceLimit}
                      currency={currency}
                      language={language}
                      selectedLanguageCode={selectedLanguageCode}
                    />
                  </aside>
                )}

                {/* Right side Results listings (9/12 width on LG, or full width) */}
                <section className={`${(searchQuery.type === 'flights' || searchQuery.type === 'hotels' || searchQuery.type === 'packages') ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6`} id="results-panel">
                  
                  {/* Results Top bar, Stats tabs & Sorting info */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-base font-bold text-gray-900">
                          {searchQuery.type === 'flights' 
                            ? (selectedLanguageCode === 'ko' 
                                ? `${searchQuery.fromCity} ➔ ${searchQuery.toCity} 항공권 검색 결과` 
                                : `${searchQuery.fromCity} ➔ ${searchQuery.toCity} Flight Search Results`)
                            : searchQuery.type === 'packages'
                              ? (selectedLanguageCode === 'ko'
                                  ? `${searchQuery.fromCity} ➔ ${searchQuery.toCity} 항공+호텔 패키지 결합 특가`
                                  : `${searchQuery.fromCity} ➔ ${searchQuery.toCity} Flight + Hotel Package Deals`)
                              : (selectedLanguageCode === 'ko'
                                  ? `${searchQuery.toCity} 주변 추천 명소 호텔 검색 결과`
                                  : `Recommended Hotels near ${searchQuery.toCity}`)
                          }
                        </h2>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {searchQuery.type === 'flights' 
                            ? (selectedLanguageCode === 'ko'
                                ? `필터 통과한 항공편 ${sortedFlights.length}개 (전체 ${flights.length}개 중)`
                                : `Filtered ${sortedFlights.length} flights (out of ${flights.length})`)
                            : searchQuery.type === 'packages'
                              ? (selectedLanguageCode === 'ko'
                                  ? `결합 가능한 단독 혜택 패키지 ${Math.min(sortedFlights.length, sortedHotels.length)}개`
                                  : `Available Bundle Packages: ${Math.min(sortedFlights.length, sortedHotels.length)}`)
                              : (selectedLanguageCode === 'ko'
                                  ? `필터 통과한 호텔 ${sortedHotels.length}개 (전체 ${hotels.length}개 중)`
                                  : `Filtered ${sortedHotels.length} hotels (out of ${hotels.length})`)
                          }
                        </span>
                      </div>

                      {/* Display Class Badge if flight */}
                      {searchQuery.type === 'flights' && (
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded border border-blue-100">
                          {searchQuery.cabinClass === 'economy' 
                            ? (selectedLanguageCode === 'ko' ? '일반석' : 'Economy') 
                            : searchQuery.cabinClass === 'premium' 
                              ? (selectedLanguageCode === 'ko' ? '프리미엄 일반석' : 'Premium Economy') 
                              : searchQuery.cabinClass === 'business' 
                                ? (selectedLanguageCode === 'ko' ? '비즈니스석' : 'Business') 
                                : (selectedLanguageCode === 'ko' ? '일등석' : 'First Class')}
                        </span>
                      )}
                    </div>

                    {(searchQuery.type === 'flights' || searchQuery.type === 'hotels' || searchQuery.type === 'packages') && (
                      <StatsDashboard 
                        type={searchQuery.type} 
                        flights={flights} 
                        hotels={hotels} 
                        activeSort={activeSort} 
                        setActiveSort={(sort) => setActiveSort(sort)} 
                        currency={currency}
                      />
                    )}
                  </div>

                  {/* Listings Render Loop */}
                  <div className="space-y-4">
                    
                    {/* FLIGHT CARDS */}
                    {searchQuery.type === 'flights' && (
                      sortedFlights.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-700">
                            {selectedLanguageCode === 'ko' ? '지정하신 조건에 일치하는 항공권이 없습니다.' : 'No flights matching your criteria were found.'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {selectedLanguageCode === 'ko' 
                              ? '최대 예산 필터를 높이거나, 경유 횟수 선택 조건을 초기화해 보세요.' 
                              : 'Try raising your max budget or resetting the stops filter.'}
                          </p>
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
                              selectedLanguageCode={selectedLanguageCode}
                            />
                          );
                        })
                      )
                    )}

                    {/* HOTEL CARDS */}
                    {searchQuery.type === 'hotels' && (
                      sortedHotels.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-700">
                            {selectedLanguageCode === 'ko' ? '지정하신 조건에 일치하는 호텔이 없습니다.' : 'No hotels matching your criteria were found.'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {selectedLanguageCode === 'ko' 
                              ? '최대 가격 슬라이더를 높이거나, 편의시설 필터를 완화해 보세요.' 
                              : 'Try raising the price slider or selecting fewer amenities.'}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full space-y-4">
                          {sortedHotels.map((hotel) => (
                            <HotelCard 
                              key={hotel.id}
                              hotel={hotel} 
                              onBook={handleOpenHotelBooking}
                              searchQuery={searchQuery}
                              currency={currency}
                              selectedLanguageCode={selectedLanguageCode}
                            />
                          ))}

                        </div>
                      )
                    )}

                    {/* PACKAGE CARDS */}
                    {searchQuery.type === 'packages' && (
                      Math.min(sortedFlights.length, sortedHotels.length) === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-700">
                            {selectedLanguageCode === 'ko' ? '지정하신 조건에 일치하는 항공+호텔 결합 패키지가 없습니다.' : 'No packages matching your criteria were found.'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {selectedLanguageCode === 'ko' 
                              ? '최대 가격 필터를 높이거나, 항공/호텔 상세 필터를 완화해 보세요.' 
                              : 'Try raising the max price limit or relaxing your flight/hotel detail filters.'}
                          </p>
                        </div>
                      ) : (
                        Array.from({ length: Math.min(sortedFlights.length, sortedHotels.length) }).map((_, index) => {
                          const flight = sortedFlights[index];
                          const hotel = sortedHotels[index];
                          return (
                            <PackageCard 
                              key={`${flight.id}-${hotel.id}`}
                              flight={flight}
                              hotel={hotel}
                              searchQuery={searchQuery}
                              currency={currency}
                              onBook={handleOpenPackageBooking}
                              selectedLanguageCode={selectedLanguageCode}
                            />
                          );
                        })
                      )
                    )}

                    {/* CAR RENTAL CARDS */}
                    {searchQuery.type === 'cars' && (
                      cars.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
                          <p className="text-xs font-bold text-slate-700">
                            {selectedLanguageCode === 'ko' ? '지정하신 조건에 일치하는 렌터카 상품이 없습니다.' : 'No rental cars matching your criteria were found.'}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {selectedLanguageCode === 'ko' 
                              ? '검색 도시가 올바른지 확인해 보세요. (기본: Tokyo, Seoul 등)' 
                              : 'Check if you searched for a valid city. (e.g. Tokyo, Seoul)'}
                          </p>
                        </div>
                      ) : (
                        <div className="w-full space-y-4 font-sans">
                          {cars.map((car) => (
                            <CarCard 
                              key={car.id}
                              car={car}
                              onBook={(c) => setSelectedCarToBook(c)}
                              currency={currency}
                              selectedLanguageCode={selectedLanguageCode}
                            />
                          ))}
                        </div>
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
      <Footer 
        onShowRefundPolicy={() => setIsRefundModalOpen(true)} 
        onShowPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        selectedLanguageCode={selectedLanguageCode}
      />

      {/* Mobile Bottom Navigation Bar (md:hidden) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 flex justify-around items-center h-16 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe" id="mobile-bottom-nav">
        <button
          onClick={() => {
            setActiveTab('flights');
            setSearchQuery(q => ({ ...q, type: 'flights' }));
          }}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition-all ${
            activeTab !== 'bookings' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'
          }`}
          id="mobile-nav-search"
        >
          <Search className={`h-5 w-5 ${activeTab !== 'bookings' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            {selectedLanguageCode === 'ko' ? '검색' : 'Search'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center cursor-pointer transition-all relative ${
            activeTab === 'bookings' ? 'text-blue-600' : 'text-slate-500 hover:text-blue-500'
          }`}
          id="mobile-nav-bookings"
        >
          <Briefcase className={`h-5 w-5 ${activeTab === 'bookings' ? 'text-blue-600' : 'text-slate-400'}`} />
          <span className="text-[10px] font-bold mt-1 tracking-tight">
            {selectedLanguageCode === 'ko' ? '나의 예약' : 'My Bookings'}
          </span>
          {bookings.length > 0 && (
            <span className="absolute top-1 right-8 bg-blue-600 text-white text-[8px] font-bold h-3.5 w-3.5 flex items-center justify-center rounded-full">
              {bookings.length}
            </span>
          )}
        </button>
      </div>

      {/* Refund & Cancellation Policy Modal */}
      <RefundPolicyModal 
        isOpen={isRefundModalOpen} 
        onClose={() => setIsRefundModalOpen(false)} 
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />

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
            selectedLanguageCode={selectedLanguageCode}
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

      {/* AI Smart Search Drawer */}
      <AISearchDrawer 
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        onSearchSubmit={handleAISubmit}
      />

      {/* Language Selection Modal */}
      <LanguageSelectionModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguageCode={selectedLanguageCode}
        onSelectLanguage={handleLanguageChange}
        language={language}
      />

      {/* Car Booking Modal */}
      <CarBookingModal 
        isOpen={!!selectedCarToBook}
        car={selectedCarToBook}
        onClose={() => setSelectedCarToBook(null)}
        onConfirmBooking={handleConfirmBooking}
        currency={currency}
        selectedLanguageCode={selectedLanguageCode}
      />

      {/* App Download/Installation Modal */}
      <AnimatePresence>
        {isAppDownloadOpen && (
          <AppDownloadModal
            isOpen={isAppDownloadOpen}
            onClose={() => setIsAppDownloadOpen(false)}
            language={language}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
