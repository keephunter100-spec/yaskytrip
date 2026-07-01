import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, History, Maximize2, Minimize2, Sparkles, ChevronDown, Plus, Mic, ArrowRight, Plane, Hotel, Car, Check, Smile, Frown, CornerDownRight } from 'lucide-react';

interface AISearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSubmit: (query: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  searchCard?: {
    type: 'flights' | 'hotels' | 'packages';
    fromCity: string;
    toCity: string;
    departureDate: string;
    returnDate: string;
    passengers?: number;
    price: string;
    airlines?: string[];
    count?: number;
  };
}

const renderMiniAirlineLogo = (code: string) => {
  switch (code) {
    case 'OZ':
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
          <svg viewBox="0 0 100 65" className="w-4 h-3.5 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 15 55 L 55 15 L 63 15 L 23 55 Z" fill="#d12640" />
            <path d="M 23 55 L 63 15 L 71 15 L 31 55 Z" fill="#f3b924" />
            <path d="M 31 55 L 71 15 L 79 15 L 39 55 Z" fill="#2c3d8f" />
          </svg>
        </div>
      );
    case 'KE':
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
          <svg viewBox="0 0 100 100" className="w-4 h-4 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="rotate(-15 50 50)">
              <path d="M 15,50 A 35,35 0 0,0 85,50 C 85,67.5 67.5,67.5 50,50 C 32.5,32.5 15,32.5 15,50 Z" fill="#00529b" />
              <path d="M 15,50 A 35,35 0 0,1 85,50 C 85,32.5 67.5,32.5 50,50 C 32.5,67.5 15,67.5 15,50 Z" fill="#c8102e" />
              <path d="M 15,50 C 32.5,67.5 50,32.5 85,50" stroke="#ffffff" strokeWidth="5.5" fill="none" />
            </g>
          </svg>
        </div>
      );
    case 'UA':
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
          <div className="w-3.5 h-3.5 rounded-full border border-blue-600 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 border-r border-l border-blue-400"></div>
            <div className="absolute top-1/2 left-0 right-0 border-t border-blue-400"></div>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 shrink-0">
          {code}
        </div>
      );
  }
};

const formatKoreanDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    return `${month}월 ${day}일`;
  }
  return dateStr;
};

const getKoreanCityName = (city: string) => {
  switch (city) {
    case 'New York': return '뉴욕';
    case 'Tokyo': return '도쿄';
    case 'London': return '런던';
    case 'Paris': return '파리';
    case 'Singapore': return '싱가포르';
    case 'Sydney': return '시드니';
    case 'Honolulu': return '호놀룰루';
    case 'Seoul': return '서울';
    case 'Busan': return '부산';
    case 'Beijing': return '베이징';
    default: return city;
  }
};

const getRealisticPrice = (city: string, type: 'flights' | 'hotels') => {
  if (type === 'flights') {
    switch (city) {
      case 'New York': return '1,998,500원';
      case 'Tokyo': return '345,000원';
      case 'Paris': return '1,420,000원';
      case 'London': return '1,560,000원';
      case 'Singapore': return '680,000원';
      case 'Sydney': return '1,120,000원';
      case 'Honolulu': return '980,000원';
      default: return '450,000원';
    }
  } else {
    switch (city) {
      case 'New York': return '231,236원';
      case 'Tokyo': return '185,000원';
      case 'Paris': return '210,000원';
      case 'London': return '225,000원';
      case 'Singapore': return '150,000원';
      case 'Sydney': return '140,000원';
      case 'Honolulu': return '195,000원';
      default: return '120,000원';
    }
  }
};

function parseQuery(text: string, defaultFromCity: string = 'Seoul') {
  const lowercase = text.toLowerCase().trim();
  
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
  
  if (lowercase.includes('호텔') || lowercase.includes('숙소') || lowercase.includes('숙박') || lowercase.includes('리조트') || lowercase.includes('hotel')) {
    type = 'hotels';
  } else if (lowercase.includes('패키지') || lowercase.includes('결합')) {
    type = 'packages';
  } else {
    type = 'flights';
  }

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
  
  // Ensure toCity is not same as fromCity for flights and packages
  if ((type === 'flights' || type === 'packages') && toCity === 'Seoul' && fromCity === 'Seoul') {
    toCity = 'Tokyo';
  }
  
  return { type, toCity, fromCity, departureDate, returnDate };
}

export default function AISearchDrawer({ isOpen, onClose, onSearchSubmit }: AISearchDrawerProps) {
  const [query, setQuery] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [currentAirport, setCurrentAirport] = useState('서울 모든 공항 (SEL)');
  const [showAirportDropdown, setShowAirportDropdown] = useState(false);
  
  const [searchHistory, setSearchHistory] = useState<string[]>([
    '다음 주말 오사카행 항공편',
    '내일 도쿄 3성급 호텔',
    '7월 파리 럭셔리 패키지',
  ]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [reactions, setReactions] = useState<{ [msgId: string]: 'like' | 'dislike' }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping]);

  const airports = [
    '서울 모든 공항 (SEL)',
    '인천국제공항 (ICN)',
    '김포국제공항 (GMP)',
  ];

  const handleSubmit = async (textToSubmit?: string) => {
    const finalQuery = textToSubmit || query;
    if (!finalQuery.trim()) return;

    // Add to history if not exists
    if (!searchHistory.includes(finalQuery)) {
      setSearchHistory(prev => [finalQuery, ...prev.slice(0, 9)]);
    }

    // Capture history context
    const chatHistory = messages.map(msg => ({
      sender: msg.sender,
      text: msg.text
    }));

    // Add user message to state
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: finalQuery,
    };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsAiTyping(true);

    // Call search submit to update the main page's flights/hotels search instantly!
    onSearchSubmit(finalQuery);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: finalQuery,
          history: chatHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        const aiMsg: Message = {
          id: Math.random().toString(),
          sender: 'ai',
          text: data.text,
          suggestions: data.suggestions || [],
          searchCard: data.searchCard || undefined
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        throw new Error(data.text || "Failed response from server");
      }
    } catch (err) {
      console.error("Failed to fetch real-time AI response, using smart local engine fallback:", err);

      // Smart local engine fallback
      let aiText = '';
      let suggestions: string[] = [];
      let searchCard: Message['searchCard'] = undefined;

      const lowercase = finalQuery.toLowerCase();
      const getCityFromAirport = (airportName: string) => {
        if (airportName.includes('도쿄')) return 'Tokyo';
        return 'Seoul';
      };
      const parsed = parseQuery(finalQuery, getCityFromAirport(currentAirport));

      // Check if the query contains any key from our cityMap
      const cityMapKeys = [
        '도쿄', '오사카', '뉴욕', '욕', '런던', '파리', '싱가포르', '시드니', '호놀룰루', '후쿠오카', '서울', '부산', '베이징',
        'tokyo', 'osaka', 'new york', 'nyc', 'jfk', 'london', 'paris', 'singapore', 'sydney', 'honolulu', 'seoul'
      ];
      const hasCity = cityMapKeys.some(key => lowercase.includes(key));

      if (lowercase.includes('호텔') || lowercase.includes('숙소') || lowercase.includes('숙박') || lowercase.includes('리조트') || lowercase.includes('hotel')) {
        const priceMatch = finalQuery.match(/(\d{1,3}(,\d{3})*|\d+)\s*원/);
        const priceStr = priceMatch ? priceMatch[0] : '231,236원';
        const cleanPriceStr = priceStr.endsWith('이하') ? priceStr : priceStr + ' 이하';

        // Check if the query has specific search elements
        const hasSpecificDateOrCity = lowercase.includes('서울') || lowercase.includes('부산') || lowercase.includes('도쿄') || lowercase.includes('베이징') || lowercase.includes('싱가포르') || lowercase.includes('년') || lowercase.includes('월') || lowercase.includes('일') || hasCity;

        if (hasSpecificDateOrCity) {
          aiText = `네, KAYAK에서 조건에 맞는 여행 특가 상품을 검색해볼게요.\n\n해당 일정(${formatKoreanDate(parsed.departureDate)} 체크인, ${formatKoreanDate(parsed.returnDate)} 체크아웃)의 ${getKoreanCityName(parsed.toCity)} 추천 숙소는 검색 결과가 있습니다. 최저가는 ${getRealisticPrice(parsed.toCity, 'hotels')} 입니다.`;
          
          searchCard = {
            type: 'hotels',
            fromCity: parsed.fromCity,
            toCity: parsed.toCity,
            departureDate: parsed.departureDate,
            returnDate: parsed.returnDate,
            price: getRealisticPrice(parsed.toCity, 'hotels'),
            count: 12
          };
        } else {
          aiText = `어느 도시 또는 지역에서 호텔을 찾으시나요? 체크인과 체크아웃 날짜도 알려주시면 ${cleanPriceStr}의 호텔을 바로 찾아드릴 수 있습니다. 원하시는 호텔 등급이나 특별한 조건이 있으시면 함께 말씀해 주세요.`;
          suggestions = [
            `${cleanPriceStr}의 호텔 검색 in 서울 from 2026-07-01 to 2026-07-07`,
            `${cleanPriceStr}의 호텔 검색 in 부산 from 2026-07-01 to 2026-07-07`
          ];
        }
      } else if (lowercase.includes('항공') || lowercase.includes('비행') || lowercase.includes('flight') || lowercase.includes('직항') || lowercase.includes('편')) {
        const hasSpecificDateOrCity = lowercase.includes('서울') || lowercase.includes('부산') || lowercase.includes('도쿄') || lowercase.includes('베이징') || lowercase.includes('싱가포르') || lowercase.includes('뉴욕') || lowercase.includes('년') || lowercase.includes('월') || lowercase.includes('일') || hasCity;

        if (hasSpecificDateOrCity) {
          aiText = `네, KAYAK에서 조건에 맞는 여행 특가 상품을 검색해볼게요.\n\n해당 일정(${formatKoreanDate(parsed.departureDate)} 출발, ${formatKoreanDate(parsed.returnDate)} 귀국)의 ${getKoreanCityName(parsed.toCity)}행 이코노미 왕복 항공권은 검색 결과가 있습니다. 최저가는 ${getRealisticPrice(parsed.toCity, 'flights')} 입니다.`;
          
          searchCard = {
            type: 'flights',
            fromCity: parsed.fromCity,
            toCity: parsed.toCity,
            departureDate: parsed.departureDate,
            returnDate: parsed.returnDate,
            price: getRealisticPrice(parsed.toCity, 'flights'),
            airlines: ['OZ', 'UA', 'KE'],
            count: 720
          };
        } else {
          aiText = `어느 도시로 떠나시는 항공편을 찾으시나요? 출발지와 원하시는 일정을 함께 알려주시면 실시간 최저가 항공권을 바로 조회해 드리겠습니다.`;
          suggestions = [
            '도쿄행 최저가 항공권 검색',
            '오사카행 이번 주말 직항편 검색'
          ];
        }
      } else {
        aiText = `죄송합니다. AI 서비스 연결 상태가 고르지 않습니다만, KAYAK 검색 및 플래너 일정을 이용하실 수 있습니다. 무엇이든 질문해 주세요!`;
        suggestions = [
          '도쿄행 최저가 항공권 검색',
          '추천 숙소 알아보기'
        ];
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: aiText,
        suggestions,
        searchCard
      };

      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleChatSuggestionClick = (suggestionText: string) => {
    onSearchSubmit(suggestionText);
    onClose();
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  const handleReaction = (msgId: string, type: 'like' | 'dislike') => {
    setReactions(prev => ({
      ...prev,
      [msgId]: prev[msgId] === type ? undefined as any : type
    }));
  };

  const handleSuggestionClick = (text: string) => {
    handleSubmit(text);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50 cursor-pointer"
          />

          {/* Drawer Container */}
          <motion.div
            id="ai-search-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed right-0 top-0 bottom-0 bg-white z-50 shadow-2xl border-l border-slate-200/80 flex flex-col justify-between transition-all duration-300 ${
              isMaximized ? 'w-full md:w-[70%]' : 'w-full md:w-[460px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center space-x-1">
                <span className="text-lg font-extrabold text-slate-900 tracking-tight">AI에게 물어보세요</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500 transform translate-y-[-4px]" />
              </div>

              <div className="flex items-center space-x-3.5 text-slate-500">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className={`p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer ${showHistory ? 'text-orange-500 bg-orange-50' : ''}`}
                  title="검색 기록"
                >
                  <History className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                  title={isMaximized ? '축소하기' : '확대하기'}
                >
                  {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                  title="닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className={`flex-1 overflow-y-auto p-6 flex flex-col ${messages.length > 0 ? 'justify-start items-start space-y-6' : 'items-center justify-center min-h-[350px]'}`}>
              {showHistory ? (
                /* History View */
                <div className="w-full h-full flex flex-col justify-start">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">최근 검색 기록</span>
                    {searchHistory.length > 0 && (
                      <button 
                        onClick={handleClearHistory}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold transition-all cursor-pointer"
                      >
                        전체 삭제
                      </button>
                    )}
                  </div>
                  {searchHistory.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      최근 검색 기록이 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {searchHistory.map((item, idx) => (
                        <div 
                          key={idx}
                          onClick={() => {
                            setQuery(item);
                            setShowHistory(false);
                          }}
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 cursor-pointer transition-all"
                        >
                          <span className="text-sm font-semibold text-slate-700">{item}</span>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : messages.length > 0 ? (
                /* Chat Messages View */
                <div className="w-full h-full flex flex-col justify-start space-y-6 overflow-y-auto pr-1">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col w-full ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {msg.sender === 'user' ? (
                        /* User Message Bubble */
                        <div className="bg-slate-100 text-slate-800 text-[13px] font-bold py-2.5 px-4 rounded-2xl max-w-[85%] shadow-sm leading-relaxed">
                          {msg.text}
                        </div>
                      ) : (
                        /* AI Message */
                        <div className="text-left w-full space-y-4">
                          <div className="text-slate-800 text-[13px] font-bold leading-relaxed whitespace-pre-wrap">
                            {msg.text.split('\n\n')[0]}
                          </div>

                          {/* Dynamic Search Card inside Message */}
                          {msg.searchCard && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm w-full space-y-3 mt-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  {msg.searchCard.type === 'flights' ? (
                                    <Plane className="h-4 w-4 text-slate-700 rotate-45 transform" />
                                  ) : (
                                    <Hotel className="h-4 w-4 text-slate-700" />
                                  )}
                                  <span className="font-extrabold text-slate-800 text-[14px]">
                                    {msg.searchCard.type === 'flights' 
                                      ? `ICN - ${msg.searchCard.toCity === 'New York' ? 'NYC' : msg.searchCard.toCity === 'Tokyo' ? 'TYO' : msg.searchCard.toCity === 'Paris' ? 'PAR' : msg.searchCard.toCity === 'London' ? 'LON' : msg.searchCard.toCity === 'Singapore' ? 'SIN' : msg.searchCard.toCity === 'Sydney' ? 'SYD' : 'JFK'}`
                                      : `${getKoreanCityName(msg.searchCard.toCity)} 추천 숙소`
                                    }
                                  </span>
                                </div>
                                
                                <button
                                  onClick={() => handleChatSuggestionClick(`${msg.searchCard?.departureDate} 출발 ${msg.searchCard?.returnDate} 귀국 ${getKoreanCityName(msg.searchCard?.toCity || 'New York')}행 ${msg.searchCard?.type === 'flights' ? '항공편' : '호텔'} 검색`)}
                                  className="text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-all cursor-pointer"
                                >
                                  확인
                                </button>
                              </div>

                              <div className="text-[12px] text-slate-500 font-semibold flex items-center space-x-1.5">
                                <span>{formatKoreanDate(msg.searchCard.departureDate)} - {formatKoreanDate(msg.searchCard.returnDate)}</span>
                                <span className="text-slate-300">|</span>
                                <span className="flex items-center gap-0.5">👥 2</span>
                              </div>

                              <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                                <div className="flex items-center space-x-1">
                                  {msg.searchCard.type === 'flights' ? (
                                    <>
                                      {renderMiniAirlineLogo('OZ')}
                                      {renderMiniAirlineLogo('UA')}
                                      {renderMiniAirlineLogo('KE')}
                                    </>
                                  ) : (
                                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                      ★ 4.8 우수함
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="text-[14px] font-black text-slate-950">
                                    {msg.searchCard.price}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-semibold block">
                                    {msg.searchCard.type === 'flights' ? '/1인당' : '/1박'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {msg.text.includes('\n\n') && (
                            <div className="text-slate-800 text-[13px] font-bold leading-relaxed whitespace-pre-wrap">
                              {msg.text.split('\n\n')[1]}
                            </div>
                          )}
                          
                          {/* Smiley / Frowny reactions */}
                          <div className="flex items-center space-x-2.5 mt-2">
                            <button 
                              type="button"
                              onClick={() => handleReaction(msg.id, 'like')}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                reactions[msg.id] === 'like' 
                                  ? 'text-orange-500 bg-orange-50 scale-110' 
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Smile className="h-4.5 w-4.5" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleReaction(msg.id, 'dislike')}
                              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                reactions[msg.id] === 'dislike' 
                                  ? 'text-red-500 bg-red-50 scale-110' 
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <Frown className="h-4.5 w-4.5" />
                            </button>
                          </div>

                          {/* Action suggestions with Curved Arrow */}
                          {msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="flex flex-col space-y-3.5 pt-4 border-t border-slate-50">
                              {msg.suggestions.map((sug, sIdx) => (
                                <button
                                  key={sIdx}
                                  onClick={() => handleChatSuggestionClick(sug)}
                                  className="flex items-start space-x-2.5 text-left text-[13px] font-bold text-slate-800 hover:text-orange-500 transition-colors group cursor-pointer"
                                >
                                  <CornerDownRight className="h-4 w-4 text-slate-400 mt-0.5 group-hover:text-orange-500 shrink-0" />
                                  <span className="leading-relaxed border-b border-transparent group-hover:border-orange-200">
                                    {sug}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* AI Typing Indicator */}
                  {isAiTyping && (
                    <div className="flex items-center space-x-1.5 self-start py-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                /* Main AI Ask View (Empty State) */
                <div className="w-full flex flex-col items-center text-center space-y-6 my-auto">
                  {/* Big Sparkle Star */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full transform scale-150 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-orange-400 to-red-500 p-5 rounded-3xl text-white shadow-lg">
                      <svg className="h-8 w-8 text-white fill-current" viewBox="0 0 24 24">
                        <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" />
                      </svg>
                    </div>
                  </div>

                  {/* 물어보기 Title */}
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">물어보기</h2>
                    
                    {/* Airport Dropdown Selector */}
                    <div className="relative mt-3">
                      <button 
                        onClick={() => setShowAirportDropdown(!showAirportDropdown)}
                        className="inline-flex items-center space-x-1 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                      >
                        <span>고객님은 <span className="text-orange-500 font-extrabold">{currentAirport.split(' ')[0]}</span> 모든 공항에 있습니다</span>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAirportDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showAirportDropdown && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl py-1.5 z-10 text-left">
                          {airports.map((ap) => (
                            <button
                              key={ap}
                              onClick={() => {
                                setCurrentAirport(ap);
                                setShowAirportDropdown(false);
                              }}
                              className="w-full px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                            >
                              <span>{ap}</span>
                              {currentAirport === ap && <Check className="h-3.5 w-3.5 text-orange-500" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="flex flex-col items-center gap-2 w-full pt-4">
                    <button
                      onClick={() => handleSuggestionClick('다음 주말 오사카행 직항편')}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer max-w-sm w-full sm:w-auto"
                    >
                      <Plane className="h-3.5 w-3.5 text-slate-500 rotate-45 transform" />
                      <span>직항편</span>
                    </button>
                    
                    <button
                      onClick={() => handleSuggestionClick('231,236원 이하 호텔 검색')}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer max-w-sm w-full sm:w-auto"
                    >
                      <Hotel className="h-3.5 w-3.5 text-slate-500" />
                      <span>231,236원 이하 호텔 검색</span>
                    </button>
                    
                    <button
                      onClick={() => handleSuggestionClick('SUV 차량 렌트')}
                      className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full text-xs font-bold text-slate-700 transition-all cursor-pointer max-w-sm w-full sm:w-auto"
                    >
                      <Car className="h-3.5 w-3.5 text-slate-500" />
                      <span>SUV 차량 렌트</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Input Area */}
            <div className="p-6 border-t border-slate-100 bg-white">
              {/* Thick rounded-2xl border */}
              <div className="border-[2.5px] border-slate-900 rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-slate-900/5 bg-white">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={messages.length > 0 ? "후속 질문을 입력하세요" : "오사카행 가장 저렴한 직항편"}
                  rows={2}
                  className="w-full resize-none border-none outline-none focus:outline-none focus:ring-0 text-sm font-semibold text-slate-800 placeholder-slate-400 bg-transparent"
                />

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/60">
                  <button 
                    type="button" 
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <Plus className="h-5 w-5" />
                  </button>

                  <div className="flex items-center space-x-2">
                    <button 
                      type="button" 
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => handleSubmit()}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 p-2 rounded-full transition-all cursor-pointer"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed text-center mt-3 max-w-sm mx-auto">
                AI가 답변합니다. AI는 실수를 할 수 있습니다. AI 모드를 사용함으로써 귀하는{' '}
                <a href="#rules" className="underline hover:text-slate-600 font-semibold">이용약관</a>{' '}
                및{' '}
                <a href="#privacy" className="underline hover:text-slate-600 font-semibold">개인정보처리방침</a>
                에 동의하게 됩니다
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
