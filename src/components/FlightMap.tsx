import React, { useState } from 'react';
import { Flight, SearchQuery, formatPrice } from '../types';
import { Compass, ZoomIn, ZoomOut, MapPin, Plane, Award, ShieldAlert, Check } from 'lucide-react';

interface FlightMapProps {
  flights: Flight[];
  selectedFlightId: string | null;
  onSelectFlight: (id: string | null) => void;
  onBook: (flight: Flight) => void;
  currency: string;
  searchQuery: SearchQuery;
}

const FlightMap: React.FC<FlightMapProps> = ({
  flights,
  selectedFlightId,
  onSelectFlight,
  onBook,
  currency,
  searchQuery,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // List of pre-defined virtual map coordinates for main global airports
  const getCityCoords = (cityName: string): { x: number; y: number; label: string; code: string } => {
    const city = cityName.toUpperCase();
    if (city.includes('SEOUL') || city.includes('서울')) {
      return { x: 740, y: 170, label: '서울 (Seoul)', code: 'ICN' };
    }
    if (city.includes('TOKYO') || city.includes('도쿄')) {
      return { x: 790, y: 165, label: '도쿄 (Tokyo)', code: 'HND' };
    }
    if (city.includes('LONDON') || city.includes('런던')) {
      return { x: 440, y: 110, label: '런던 (London)', code: 'LHR' };
    }
    if (city.includes('PARIS') || city.includes('파리')) {
      return { x: 460, y: 125, label: '파리 (Paris)', code: 'CDG' };
    }
    if (city.includes('SINGAPORE') || city.includes('싱가포르')) {
      return { x: 700, y: 280, label: '싱가포르 (Singapore)', code: 'SIN' };
    }
    if (city.includes('SYDNEY') || city.includes('시드니')) {
      return { x: 800, y: 390, label: '시드니 (Sydney)', code: 'SYD' };
    }
    if (city.includes('HONOLULU') || city.includes('호놀룰루')) {
      return { x: 920, y: 210, label: '호놀룰루 (Honolulu)', code: 'HNL' };
    }
    return { x: 230, y: 160, label: '뉴욕 (New York)', code: 'JFK' }; // Default New York
  };

  const startCity = getCityCoords(searchQuery.fromCity);
  const endCity = getCityCoords(searchQuery.toCity);

  // All fixed cities to draw as landmarks
  const landmarks = [
    { x: 740, y: 170, label: 'ICN', name: 'Seoul' },
    { x: 790, y: 165, label: 'HND', name: 'Tokyo' },
    { x: 230, y: 160, label: 'JFK', name: 'New York' },
    { x: 440, y: 110, label: 'LHR', name: 'London' },
    { x: 460, y: 125, label: 'CDG', name: 'Paris' },
    { x: 700, y: 280, label: 'SIN', name: 'Singapore' },
    { x: 800, y: 390, label: 'SYD', name: 'Sydney' },
    { x: 920, y: 210, label: 'HNL', name: 'Honolulu' },
  ];

  // Find currently selected flight details
  const selectedFlight = flights.find((f) => f.id === selectedFlightId) || flights[0];

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.75));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Compute curve control point for curved flight path (quadratic Bezier control point)
  const getCurveControlPoint = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    // Push control point up (smaller Y) to make it arch beautifully
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.max(40, distance * 0.2); // curve depth proportional to distance
    
    return {
      x: midX,
      y: midY - offset,
    };
  };

  const ctrl = getCurveControlPoint(startCity, endCity);

  // Parse layovers if any
  const firstOutbound = selectedFlight?.outbound[0];
  const lastOutbound = selectedFlight?.outbound[selectedFlight.outbound.length - 1];
  const layovers = selectedFlight?.outbound.slice(0, -1).map(seg => seg.arrivalAirport);

  // If layovers exist, we can render layover paths on map
  const renderFlightPaths = () => {
    if (!selectedFlight) return null;

    // Direct flight
    if (selectedFlight.outbound.length === 1) {
      return (
        <>
          <path
            id="flight-path-glow"
            d={`M ${startCity.x} ${startCity.y} Q ${ctrl.x} ${ctrl.y} ${endCity.x} ${endCity.y}`}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="6"
            className="opacity-30 blur-[2px]"
          />
          <path
            id="active-flight-path"
            d={`M ${startCity.x} ${startCity.y} Q ${ctrl.x} ${ctrl.y} ${endCity.x} ${endCity.y}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="3.5"
            strokeDasharray="8,5"
            className="transition-all duration-300"
          />
          {/* Animated Plane */}
          <g>
            <path
              d="M-5,-4 L7,0 L-5,4 L-2,0 Z"
              fill="#1d4ed8"
              className="drop-shadow-md"
            >
              <animateMotion dur="8s" repeatCount="indefinite" rotate="auto">
                <mpath href="#active-flight-path" />
              </animateMotion>
            </path>
          </g>
        </>
      );
    } else {
      // With layover: draw paths connected via the layover coordinate
      // Let's approximate layover city coordinates
      const firstSegment = selectedFlight.outbound[0];
      const secondSegment = selectedFlight.outbound[selectedFlight.outbound.length - 1];
      const layoverCity = firstSegment.arrivalAirport.city;
      const layoverCoords = getCityCoords(layoverCity);

      const ctrl1 = getCurveControlPoint(startCity, layoverCoords);
      const ctrl2 = getCurveControlPoint(layoverCoords, endCity);

      return (
        <>
          {/* Segment 1 */}
          <path
            id="path-seg1-glow"
            d={`M ${startCity.x} ${startCity.y} Q ${ctrl1.x} ${ctrl1.y} ${layoverCoords.x} ${layoverCoords.y}`}
            fill="none"
            stroke="#a7f3d0"
            strokeWidth="5"
            className="opacity-30 blur-[2px]"
          />
          <path
            id="path-seg1"
            d={`M ${startCity.x} ${startCity.y} Q ${ctrl1.x} ${ctrl1.y} ${layoverCoords.x} ${layoverCoords.y}`}
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeDasharray="6,4"
          />
          {/* Segment 2 */}
          <path
            id="path-seg2-glow"
            d={`M ${layoverCoords.x} ${layoverCoords.y} Q ${ctrl2.x} ${ctrl2.y} ${endCity.x} ${endCity.y}`}
            fill="none"
            stroke="#60a5fa"
            strokeWidth="5"
            className="opacity-30 blur-[2px]"
          />
          <path
            id="path-seg2"
            d={`M ${layoverCoords.x} ${layoverCoords.y} Q ${ctrl2.x} ${ctrl2.y} ${endCity.x} ${endCity.y}`}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeDasharray="6,4"
          />

          {/* Animated Plane Segment 1 */}
          <g>
            <path d="M-5,-4 L7,0 L-5,4 L-2,0 Z" fill="#047857">
              <animateMotion dur="6s" repeatCount="indefinite" rotate="auto">
                <mpath href="#path-seg1" />
              </animateMotion>
            </path>
          </g>

          {/* Animated Plane Segment 2 */}
          <g>
            <path d="M-5,-4 L7,0 L-5,4 L-2,0 Z" fill="#1d4ed8">
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                <mpath href="#path-seg2" />
              </animateMotion>
            </path>
          </g>

          {/* Layover dot */}
          <circle
            cx={layoverCoords.x}
            cy={layoverCoords.y}
            r="6"
            fill="#059669"
            stroke="#ffffff"
            strokeWidth="2"
            className="animate-pulse"
          />
          <text
            x={layoverCoords.x}
            y={layoverCoords.y + 16}
            textAnchor="middle"
            fill="#065f46"
            fontSize="9"
            fontWeight="black"
            className="bg-white/80 p-0.5 rounded font-mono"
          >
            {firstSegment.arrivalAirport.code} (경유)
          </text>
        </>
      );
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
      {/* Flight Cards Side Panel */}
      <div className="w-full lg:w-[35%] space-y-4 max-h-[600px] lg:max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg text-[11px] text-blue-800 leading-relaxed font-semibold flex items-start space-x-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
          <span>지도의 가상 항공 항로를 실시간으로 확인하고 간편하게 발권하실 수 있습니다. 카드를 선택하면 세부 경유 정보가 지도에 연동됩니다.</span>
        </div>

        {flights.map((flight) => (
          <div
            key={flight.id}
            onClick={() => onSelectFlight(flight.id)}
            className={`bg-white border p-4 rounded-xl shadow-sm transition-all duration-200 cursor-pointer ${
              selectedFlightId === flight.id
                ? 'border-blue-500 ring-2 ring-blue-600/10 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex justify-between items-start mb-2.5">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{flight.outbound[0].airline.logo}</span>
                <span className="text-xs font-black text-slate-800">{flight.outbound[0].airline.name}</span>
              </div>
              <span className="text-xs font-black text-blue-600 font-sans">
                {formatPrice(flight.price, currency)}
              </span>
            </div>

            <div className="grid grid-cols-3 items-center text-center gap-2">
              <div className="text-left">
                <span className="block text-sm font-extrabold text-slate-800">{flight.outbound[0].departureTime}</span>
                <span className="block text-[10px] text-slate-400 font-medium">{flight.outbound[0].departureAirport.code}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-400 font-bold">
                  {flight.outbound.length === 1 ? '직항' : `경유 ${flight.outbound.length - 1}회`}
                </span>
                <div className="w-12 h-[2px] bg-slate-200 my-1 relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full" style={{ width: flight.outbound.length === 1 ? '100%' : '50%' }} />
                </div>
                <span className="text-[8px] text-slate-400 font-medium">
                  {Math.floor(flight.outbound.reduce((acc, seg) => acc + seg.duration, 0) / 60)}시간 {flight.outbound.reduce((acc, seg) => acc + seg.duration, 0) % 60}분
                </span>
              </div>
              <div className="text-right">
                <span className="block text-sm font-extrabold text-slate-800">
                  {flight.outbound[flight.outbound.length - 1].arrivalTime}
                </span>
                <span className="block text-[10px] text-slate-400 font-medium">
                  {flight.outbound[flight.outbound.length - 1].arrivalAirport.code}
                </span>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onBook(flight);
              }}
              className="mt-3 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black transition-all flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>바로 예약하기</span>
              <Check className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Flight Map Canvas */}
      <div className="w-full lg:w-[65%] h-[450px] lg:h-[calc(100vh-220px)] rounded-2xl overflow-hidden border border-slate-200 shadow-lg relative bg-[#0f172a] select-none">
        
        {/* World Grid Lines Background SVG */}
        <div
          className="absolute inset-0 origin-top-left pointer-events-none transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: '1000px',
            height: '500px',
          }}
        >
          <svg width="1000" height="500" viewBox="0 0 1000 500" className="w-full h-full">
            {/* Dark Oceans */}
            <rect width="1000" height="500" fill="#0f172a" />
            
            {/* Latitude / Longitude Radar Grid Lines */}
            <g stroke="#334155" strokeWidth="0.5" strokeDasharray="3,3">
              <line x1="0" y1="100" x2="1000" y2="100" />
              <line x1="0" y1="200" x2="1000" y2="200" />
              <line x1="0" y1="300" x2="1000" y2="300" />
              <line x1="0" y1="400" x2="1000" y2="400" />
              
              <line x1="200" y1="0" x2="200" y2="500" />
              <line x1="400" y1="0" x2="400" y2="500" />
              <line x1="600" y1="0" x2="600" y2="500" />
              <line x1="800" y1="0" x2="800" y2="500" />
            </g>

            {/* Concentric radar rings centered on startCity */}
            <circle cx={startCity.x} cy={startCity.y} r="80" fill="none" stroke="#1e293b" strokeWidth="1" />
            <circle cx={startCity.x} cy={startCity.y} r="160" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4,4" />
            <circle cx={startCity.x} cy={startCity.y} r="240" fill="none" stroke="#1e293b" strokeWidth="1" />

            {/* Stylized continent representations (Abstract curves for aesthetic aesthetic) */}
            {/* North America */}
            <path d="M 50 100 Q 150 50 250 120 T 350 250 L 280 280 L 150 200 Z" fill="#1e293b" opacity="0.3" />
            {/* Europe */}
            <path d="M 400 80 Q 480 50 520 120 T 560 200 L 480 220 L 410 150 Z" fill="#1e293b" opacity="0.3" />
            {/* Asia */}
            <path d="M 600 100 Q 750 60 850 120 T 900 280 L 750 350 L 620 220 Z" fill="#1e293b" opacity="0.3" />
            {/* Australia */}
            <path d="M 750 380 Q 820 360 860 400 T 800 460 Z" fill="#1e293b" opacity="0.3" />

            {/* Draw non-active landmark airport pins */}
            {landmarks.map((mark) => {
              const isActive = mark.label === startCity.code || mark.label === endCity.code;
              return (
                <g key={mark.label} className="opacity-60 hover:opacity-100 transition-opacity">
                  <circle
                    cx={mark.x}
                    cy={mark.y}
                    r={isActive ? "6" : "3.5"}
                    fill={isActive ? "#3b82f6" : "#475569"}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                  />
                  <text
                    x={mark.x}
                    y={mark.y - 8}
                    fill={isActive ? "#60a5fa" : "#64748b"}
                    fontSize="9"
                    fontWeight={isActive ? "black" : "bold"}
                    textAnchor="middle"
                    className="font-mono tracking-tight"
                  >
                    {mark.label}
                  </text>
                </g>
              );
            })}

            {/* Dynamic Active Flight Arc Path & Animated Plane */}
            {renderFlightPaths()}

            {/* Start Node Pulse Circle */}
            <g>
              <circle cx={startCity.x} cy={startCity.y} r="10" fill="none" stroke="#2563eb" strokeWidth="1.5">
                <animate attributeName="r" values="8;20;8" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={startCity.x} cy={startCity.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
            </g>

            {/* End Node Pulse Circle */}
            <g>
              <circle cx={endCity.x} cy={endCity.y} r="10" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                <animate attributeName="r" values="8;20;8" dur="3s" begin="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur="3s" begin="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={endCity.x} cy={endCity.y} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
            </g>
          </svg>
        </div>

        {/* Floating City Labels & Radar UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-3 rounded-xl shadow-xl text-white max-w-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-[10px] font-black text-blue-400 tracking-wider uppercase">
              <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>실시간 항공 운항 관제 레이더</span>
            </div>
            <h4 className="text-xs font-black">
              {startCity.label} ➔ {endCity.label}
            </h4>
            <p className="text-[9px] text-slate-400 leading-normal">
              최적의 대권 항로(Great Circle Route) 기상 상태 양호. {selectedFlight?.outbound.length === 1 ? '직항 노선' : '경유 노선'} 운항 분석 중.
            </p>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 px-3 py-2 rounded-xl text-[9px] font-mono text-slate-400 space-y-0.5 pointer-events-auto">
            <div className="flex items-center space-x-1 text-emerald-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>RADAR STABLE</span>
            </div>
            <div>SYS LAT: 37.5665</div>
            <div>SYS LNG: 126.9780</div>
          </div>
        </div>

        {/* Map Control Buttons */}
        <div className="absolute bottom-4 right-4 flex items-center bg-slate-900/95 border border-slate-700/60 p-1.5 rounded-xl shadow-2xl space-x-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="text-[9px] font-black px-2 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
          >
            RESET
          </button>
        </div>

        {/* Flight route detail overlay */}
        {selectedFlight && (
          <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-700/50 p-3.5 rounded-xl text-white space-y-2 max-w-sm shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm">{selectedFlight.outbound[0].airline.logo}</span>
                <span className="text-xs font-black tracking-tight">{selectedFlight.outbound[0].airline.name}</span>
              </div>
              <span className="text-[10px] bg-blue-500/20 text-blue-300 font-black px-2 py-0.5 rounded border border-blue-500/30">
                {selectedFlight.outbound[0].flightNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-300">
              <div>
                <span className="text-slate-500 block">비행 기종</span>
                <span className="font-semibold text-white">{selectedFlight.outbound[0].aircraft}</span>
              </div>
              <div>
                <span className="text-slate-500 block">좌석 등급</span>
                <span className="font-semibold text-white capitalize">{selectedFlight.cabinClass === 'economy' ? '일반석' : selectedFlight.cabinClass === 'business' ? '비즈니스석' : '일등석'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlightMap;
