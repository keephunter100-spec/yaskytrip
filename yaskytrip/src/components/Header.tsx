import React from 'react';
import { Plane, Hotel, Briefcase, User, Globe, Compass, Star } from 'lucide-react';

interface HeaderProps {
  activeTab: 'flights' | 'hotels' | 'bookings';
  setActiveTab: (tab: 'flights' | 'hotels' | 'bookings') => void;
  bookingCount: number;
}

export default function Header({ activeTab, setActiveTab, bookingCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shrink-0" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => setActiveTab('flights')} 
              className="flex items-center space-x-2 text-2xl font-bold text-blue-600 tracking-tight"
              id="logo-btn"
            >
              <span className="bg-blue-600 text-white p-1.5 rounded-md flex items-center justify-center">
                <Plane className="h-4 w-4 rotate-45 transform" />
              </span>
              <span>YASKYTRIP</span>
            </button>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex space-x-6 h-14 items-center" id="nav-tabs">
              <button
                onClick={() => setActiveTab('flights')}
                className={`flex items-center space-x-2 h-14 text-sm font-medium transition-all ${
                  activeTab === 'flights'
                    ? 'text-blue-600 border-b-2 border-blue-600 pt-0.5'
                    : 'text-slate-600 hover:text-blue-600 pt-0.5'
                }`}
                id="nav-flights"
              >
                <Plane className="h-4 w-4" />
                <span>항공권</span>
              </button>

              <button
                onClick={() => setActiveTab('hotels')}
                className={`flex items-center space-x-2 h-14 text-sm font-medium transition-all ${
                  activeTab === 'hotels'
                    ? 'text-blue-600 border-b-2 border-blue-600 pt-0.5'
                    : 'text-slate-600 hover:text-blue-600 pt-0.5'
                }`}
                id="nav-hotels"
              >
                <Hotel className="h-4 w-4" />
                <span>호텔</span>
              </button>

              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center space-x-2 h-14 text-sm font-medium transition-all relative ${
                  activeTab === 'bookings'
                    ? 'text-blue-600 border-b-2 border-blue-600 pt-0.5'
                    : 'text-slate-600 hover:text-blue-600 pt-0.5'
                }`}
                id="nav-bookings"
              >
                <Briefcase className="h-4 w-4" />
                <span>나의 예약</span>
                {bookingCount > 0 && (
                  <span className="absolute top-2 -right-3.5 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-pulse">
                    {bookingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right Side Options */}
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-50 transition-colors hidden sm:flex items-center space-x-1 text-xs">
              <Globe className="h-4 w-4" />
              <span>KO | USD</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
            <div className="flex items-center space-x-2 p-1 px-2.5 bg-slate-50 border border-slate-100 rounded-md text-slate-700 text-xs font-medium cursor-pointer hover:bg-slate-100 transition-colors">
              <div className="h-5 w-5 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                K
              </div>
              <span className="hidden sm:inline-block">koreapaik@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
