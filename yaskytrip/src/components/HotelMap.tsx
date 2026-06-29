import React, { useState, useRef, useEffect } from 'react';
import { Hotel, formatPrice } from '../types';
import { X, Heart, Star, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Compass, MapPin } from 'lucide-react';

interface HotelMapProps {
  hotels: Hotel[];
  selectedHotelId: string | null;
  onSelectHotel: (hotelId: string | null) => void;
  onBook: (hotel: Hotel, roomName: string, price: number) => void;
  currency: string;
  cityName: string;
}

const HotelMap: React.FC<HotelMapProps> = ({
  hotels,
  selectedHotelId,
  onSelectHotel,
  onBook,
  currency,
  cityName,
}) => {
  // Map interactive state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Find currently selected hotel
  const selectedHotel = hotels.find((h) => h.id === selectedHotelId);

  // Reset image slider index when selected hotel changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedHotelId]);

  // Center on hotel when selected
  useEffect(() => {
    if (selectedHotel && selectedHotel.lat && selectedHotel.lng) {
      // Find relative position of selected hotel to center of map coordinate space
      // Let's map lat/lng into a 800x600 virtual coordinate space
      const coords = getVirtualCoords(selectedHotel.lat, selectedHotel.lng);
      setPan({
        x: 400 - coords.x * zoom,
        y: 300 - coords.y * zoom,
      });
    }
  }, [selectedHotelId]);

  // City-specific center and bounds
  const getCityBounds = () => {
    const city = cityName.toUpperCase();
    if (city.includes('SEOUL') || city.includes('서울')) {
      return { lat: 37.5665, lng: 126.9780, name: 'SEOUL' };
    } else if (city.includes('TOKYO') || city.includes('도쿄')) {
      return { lat: 35.6762, lng: 139.6503, name: 'TOKYO' };
    } else if (city.includes('LONDON') || city.includes('런던')) {
      return { lat: 51.5074, lng: -0.1278, name: 'LONDON' };
    } else if (city.includes('PARIS') || city.includes('파리')) {
      return { lat: 48.8566, lng: 2.3522, name: 'PARIS' };
    } else if (city.includes('SINGAPORE') || city.includes('싱가포르')) {
      return { lat: 1.3521, lng: 103.8198, name: 'SINGAPORE' };
    } else if (city.includes('SYDNEY') || city.includes('시드니')) {
      return { lat: -33.8688, lng: 151.2093, name: 'SYDNEY' };
    } else if (city.includes('HONOLULU') || city.includes('호놀룰루')) {
      return { lat: 21.3069, lng: -157.8583, name: 'HONOLULU' };
    } else {
      return { lat: 40.7829, lng: -73.9654, name: 'NEWYORK' }; // Default to New York
    }
  };

  const cityBounds = getCityBounds();

  // Convert lat/lng to standard 800x600 virtual coordinate box based on city center
  const getVirtualCoords = (lat: number, lng: number) => {
    const centerLat = cityBounds.lat;
    const centerLng = cityBounds.lng;

    // Mapping factor (approximate scaling)
    const latDiff = lat - centerLat;
    const lngDiff = lng - centerLng;

    // Scale diffs so they sit nicely in the 800x600 SVG frame (400, 300 is center)
    const scale = 14000; 
    let x = 400 + lngDiff * scale;
    let y = 300 - latDiff * scale * 1.3; // Flip Y axis for maps

    return { x, y };
  };

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on buttons or card preview, do not drag
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.no-drag')) return;

    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    }
  };

  // Zoom control helpers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleResetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Image slides for the popup
  const mockHotelImages = [
    selectedHotel?.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
  ];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % mockHotelImages.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + mockHotelImages.length) % mockHotelImages.length);
  };

  const getReviewWord = (score: number) => {
    if (score >= 9.5) return '최고';
    if (score >= 9.0) return '매우 좋음';
    if (score >= 8.5) return '훌륭함';
    if (score >= 8.0) return '좋음';
    if (score >= 5.0) return '보통';
    return '만족';
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#cbdbe5] overflow-hidden select-none cursor-grab active:cursor-grabbing border border-slate-200 rounded-lg shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Background SVG Grid / Cities Map Representation */}
      <div 
        className="absolute inset-0 origin-top-left pointer-events-none transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '800px',
          height: '600px',
        }}
      >
        <svg width="800" height="600" viewBox="0 0 800 600" className="w-full h-full">
          {/* Base Landmass */}
          <rect width="800" height="600" fill="#f4f3f0" />

          {/* Render specific City visual assets */}
          {cityBounds.name === 'NEWYORK' && (
            <>
              {/* Hudson River (Left) */}
              <path d="M -100 -50 L 150 -50 C 140 100 120 300 80 450 C 60 550 40 650 30 700 L -100 700 Z" fill="#a4c6eb" />
              {/* East River (Right) */}
              <path d="M 600 -50 C 580 50 560 150 590 250 C 620 350 670 420 720 480 C 760 520 820 550 850 570 L 850 700 L 500 700 C 480 620 460 500 480 420 C 510 320 540 220 530 120 C 520 80 500 40 480 -50 Z" fill="#a4c6eb" />
              {/* Central Park (Green) */}
              <rect x="350" y="80" width="100" height="260" fill="#c3ebc4" rx="4" />
              <text x="400" y="210" fill="#588e5b" fontSize="10" fontWeight="bold" textAnchor="middle" opacity="0.6">CENTRAL PARK</text>
              <text x="400" y="222" fill="#588e5b" fontSize="8" textAnchor="middle" opacity="0.6">센트럴 파크</text>

              {/* Major Roads (Grid Lines) */}
              <g stroke="#ffffff" strokeWidth="2" opacity="0.8">
                {/* Avenues */}
                <line x1="280" y1="-50" x2="220" y2="650" />
                <line x1="340" y1="-50" x2="280" y2="650" />
                <line x1="460" y1="-50" x2="400" y2="650" />
                <line x1="520" y1="-50" x2="460" y2="650" />
                {/* Streets */}
                <line x1="100" y1="100" x2="600" y2="60" />
                <line x1="100" y1="180" x2="600" y2="140" />
                <line x1="100" y1="260" x2="600" y2="220" />
                <line x1="100" y1="340" x2="600" y2="300" />
                <line x1="100" y1="420" x2="600" y2="380" />
                <line x1="100" y1="500" x2="600" y2="460" />
                
                {/* Broadway (diagonal) */}
                <path d="M 520 -50 L 320 300 L 120 650" stroke="#f6ebc4" strokeWidth="4" fill="none" />
              </g>

              {/* Neighborhood text labels */}
              <text x="250" y="150" fill="#8c8b88" fontSize="9" fontWeight="bold">Upper West Side</text>
              <text x="500" y="150" fill="#8c8b88" fontSize="9" fontWeight="bold">Upper East Side</text>
              <text x="320" y="420" fill="#8c8b88" fontSize="9" fontWeight="bold" transform="rotate(-15, 320, 420)">Times Square</text>
              <text x="450" y="480" fill="#8c8b88" fontSize="9" fontWeight="bold">Midtown East</text>
              <text x="280" y="540" fill="#8c8b88" fontSize="9" fontWeight="bold">Chelsea</text>
            </>
          )}

          {/* SEOUL MAP REPRESENTATION */}
          {cityBounds.name === 'SEOUL' && (
            <>
              {/* Han River (Shorthand curves) */}
              <path d="M -100 400 Q 150 250 350 320 T 850 250 L 850 370 Q 600 420 350 380 T -100 480 Z" fill="#a4c6eb" />
              <text x="500" y="340" fill="#5b86bd" fontSize="9" fontWeight="bold" opacity="0.6">한강 (Han River)</text>
              
              {/* Namsan Park (Green hill) */}
              <circle cx="420" cy="180" r="45" fill="#c3ebc4" opacity="0.9" />
              <text x="420" y="180" fill="#588e5b" fontSize="9" fontWeight="bold" textAnchor="middle">Namsan (남산)</text>

              {/* Major grid connections */}
              <g stroke="#ffffff" strokeWidth="2.5" opacity="0.7">
                <path d="M 400 0 L 400 135" fill="none" />
                <path d="M 400 135 L 420 300" fill="none" />
                <path d="M 100 200 C 250 200 350 220 500 200" fill="none" />
                <path d="M 250 100 C 250 250 300 350 300 600" fill="none" />
                <path d="M 550 100 C 550 250 500 350 550 600" fill="none" />
              </g>

              {/* Neighborhoods */}
              <text x="380" y="90" fill="#8c8b88" fontSize="10" fontWeight="bold">Myeongdong (명동)</text>
              <text x="210" y="150" fill="#8c8b88" fontSize="10" fontWeight="bold">Hongdae (홍대)</text>
              <text x="530" y="480" fill="#8c8b88" fontSize="10" fontWeight="bold">Gangnam (강남)</text>
              <text x="280" y="420" fill="#8c8b88" fontSize="10" fontWeight="bold">Yeouido (여의도)</text>
            </>
          )}

          {/* OTHER CITIES GENERAL MOCK GRID */}
          {cityBounds.name !== 'NEWYORK' && cityBounds.name !== 'SEOUL' && (
            <>
              {/* General River/Water Body */}
              <path d="M -50 200 C 200 150 400 300 850 250 L 850 320 C 400 370 200 220 -50 270 Z" fill="#a4c6eb" />
              
              {/* General Central Green Area */}
              <circle cx="300" cy="120" r="50" fill="#c3ebc4" />
              <text x="300" y="125" fill="#588e5b" fontSize="9" fontWeight="bold" textAnchor="middle">Park Area</text>

              {/* General Road Network */}
              <g stroke="#ffffff" strokeWidth="2" opacity="0.7">
                <line x1="150" y1="0" x2="150" y2="600" />
                <line x1="450" y1="0" x2="450" y2="600" />
                <line x1="0" y1="150" x2="800" y2="150" />
                <line x1="0" y1="450" x2="800" y2="450" />
                {/* Diagonal boulevard */}
                <line x1="0" y1="0" x2="800" y2="500" stroke="#f6ebc4" strokeWidth="3.5" />
              </g>
              <text x="180" y="80" fill="#8c8b88" fontSize="10" fontWeight="bold">{cityName} Downtown</text>
              <text x="500" y="420" fill="#8c8b88" fontSize="10" fontWeight="bold">Residential Quarter</text>
            </>
          )}
        </svg>
      </div>

      {/* Hotel Location Price Pins */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: '800px',
          height: '600px',
          transformOrigin: '0 0',
        }}
      >
        {hotels.map((hotel) => {
          if (!hotel.lat || !hotel.lng) return null;
          const coords = getVirtualCoords(hotel.lat, hotel.lng);
          const isSelected = hotel.id === selectedHotelId;

          // Price text mapping
          const priceText = currency === 'KRW' 
            ? `${Math.round(hotel.pricePerNight * 1400).toLocaleString()}원`
            : `$${hotel.pricePerNight}`;

          return (
            <div
              key={hotel.id}
              className="absolute pointer-events-auto cursor-pointer no-drag group"
              style={{
                left: `${coords.x}px`,
                top: `${coords.y}px`,
                transform: 'translate(-50%, -100%)',
              }}
              onClick={() => onSelectHotel(hotel.id)}
            >
              {/* Marker pin shape with price */}
              <div 
                className={`relative px-2.5 py-1.5 rounded-full font-sans font-bold text-xs shadow-md transition-all duration-150 flex items-center space-x-1 whitespace-nowrap ${
                  isSelected 
                    ? 'bg-blue-600 text-white border-2 border-white scale-110 z-30' 
                    : 'bg-white text-slate-800 hover:bg-slate-50 hover:scale-105 border border-slate-300/80 z-20'
                }`}
              >
                {/* Special icon for starred hotels */}
                {hotel.rating >= 4 && (
                  <Star className={`h-3 w-3 ${isSelected ? 'text-yellow-300 fill-yellow-300' : 'text-amber-500 fill-amber-500'}`} />
                )}
                <span>{priceText}</span>
              </div>

              {/* Pin Indicator Point */}
              <div 
                className={`w-2.5 h-2.5 rotate-45 mx-auto -mt-1.5 shadow-sm transition-colors duration-150 ${
                  isSelected ? 'bg-blue-600 border-r-2 border-b-2 border-white' : 'bg-white border-r border-b border-slate-300/80'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Map Controls */}
      <div className="absolute bottom-5 right-5 flex flex-col space-y-2 no-drag pointer-events-auto">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shadow-md text-slate-700 transition-colors cursor-pointer"
          title="확대"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shadow-md text-slate-700 transition-colors cursor-pointer"
          title="축소"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          onClick={handleResetMap}
          className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shadow-md text-slate-700 transition-colors cursor-pointer"
          title="원래 위치로"
        >
          <Compass className="h-5 w-5" />
        </button>
      </div>

      {/* Kayak-Style Hotel Preview Card Overlay on Map */}
      {selectedHotel && (
        <div 
          className="absolute top-5 right-5 w-76 bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 no-drag pointer-events-auto z-40 transition-all duration-200 animate-in fade-in slide-in-from-top-3"
          id="hotel-map-popup"
        >
          {/* Close button */}
          <button
            onClick={() => onSelectHotel(null)}
            className="absolute top-2.5 right-2.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors z-25 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Heart/Like button */}
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="absolute top-2.5 left-2.5 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors z-25 cursor-pointer"
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'}`} />
          </button>

          {/* Image Slider Component */}
          <div className="relative h-40 bg-slate-100 overflow-hidden">
            <img
              src={mockHotelImages[activeImageIndex]}
              alt={selectedHotel.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              referrerPolicy="no-referrer"
            />
            
            {/* Slider arrows */}
            <button
              onClick={handlePrevImage}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-slate-800" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-xs transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-slate-800" />
            </button>

            {/* Slider Dots */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 bg-black/30 px-2 py-0.5 rounded-full">
              {mockHotelImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === activeImageIndex ? 'bg-white scale-110' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Hotel Information details */}
          <div className="p-4 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 leading-snug">{selectedHotel.name}</h4>
              <div className="flex items-center space-x-2 mt-1">
                {/* Custom review score display matching Kayak screenshot */}
                <span className="bg-slate-800 text-white text-[10px] font-black px-1.5 py-0.5 rounded leading-none">
                  {selectedHotel.reviewScore.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {getReviewWord(selectedHotel.reviewScore)} ({selectedHotel.reviewCount})
                </span>
              </div>
            </div>

            {/* Action buttons matching exact layout: "전화 문의" + orange "바로 예약" */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">객실 최저가</span>
                <span className="text-sm font-black text-slate-800 font-sans">
                  {formatPrice(selectedHotel.pricePerNight, currency)}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <a
                  href="tel:02-1544-0000"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] px-3 py-2 rounded-md transition-colors"
                >
                  전화 문의
                </a>
                <button
                  onClick={() => onBook(selectedHotel, selectedHotel.roomTypes[0]?.name || '디럭스 룸', selectedHotel.pricePerNight)}
                  className="bg-[#ff5a19] hover:bg-[#e04a10] text-white font-black text-[11px] px-4 py-2 rounded-md transition-colors shadow-sm cursor-pointer"
                >
                  바로 예약
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Small label for the current city coordinate bounds */}
      <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-md flex items-center space-x-1 shadow-md">
        <MapPin className="h-3 w-3 text-red-400 fill-red-400 animate-bounce" />
        <span className="font-sans font-bold">{cityName.toUpperCase()} MAP (SIMULATION)</span>
      </div>
    </div>
  );
};

export default HotelMap;
