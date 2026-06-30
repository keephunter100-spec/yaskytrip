import React from 'react';
import { Plane, Hotel, Briefcase, Globe, Car, Tag } from 'lucide-react';
import { LANGUAGES } from './LanguageSelectionModal';
import { getTranslation } from '../utils/translations';
import { CURRENCY_DATA } from '../types';

interface HeaderProps {
  activeTab: 'flights' | 'hotels' | 'bookings' | 'packages' | 'cars' | 'deals';
  setActiveTab: (tab: 'flights' | 'hotels' | 'bookings' | 'packages' | 'cars' | 'deals') => void;
  bookingCount: number;
  currency: string;
  setCurrency: (currency: string) => void;
  currentUserEmail: string | null;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  language: 'KO' | 'EN';
  setLanguage: (language: string) => void;
  selectedLanguageCode: string;
  onOpenLanguageModal: () => void;
}

export default function Header({ 
  activeTab, 
  setActiveTab, 
  bookingCount, 
  currency, 
  setCurrency,
  currentUserEmail,
  onOpenAuth,
  onLogout,
  language,
  setLanguage,
  selectedLanguageCode,
  onOpenLanguageModal
}: HeaderProps) {
  // Translations
  const t = {
    flights: getTranslation('flights', selectedLanguageCode),
    hotels: getTranslation('hotels', selectedLanguageCode),
    bookings: getTranslation('bookings', selectedLanguageCode),
    logout: getTranslation('logout', selectedLanguageCode),
    login: getTranslation('login', selectedLanguageCode),
    signup: getTranslation('signup', selectedLanguageCode),
    cars: selectedLanguageCode === 'ko' ? '렌터카' : 'Car Rental',
    deals: selectedLanguageCode === 'ko' ? '할인 혜택' : 'Deals & Coupons',
  };

  const currencySymbol = CURRENCY_DATA[currency]?.symbol || '$';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shrink-0" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <button 
              onClick={() => setActiveTab('flights')} 
              className="flex items-center space-x-2.5 text-2xl transition-all"
              id="logo-btn"
            >
              <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white p-1.5 rounded-lg flex items-center justify-center shadow-sm">
                <Plane className="h-4.5 w-4.5 rotate-45 transform" />
              </span>
              <span className="logo-custom text-[21px] tracking-[0.08em] select-none bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-red-500 font-bold">YASKYTRIP</span>
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
                <span>{t.flights}</span>
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
                <span>{t.hotels}</span>
              </button>

              <button
                onClick={() => setActiveTab('cars')}
                className={`flex items-center space-x-2 h-14 text-sm font-medium transition-all ${
                  activeTab === 'cars'
                    ? 'text-blue-600 border-b-2 border-blue-600 pt-0.5'
                    : 'text-slate-600 hover:text-blue-600 pt-0.5'
                }`}
                id="nav-cars"
              >
                <Car className="h-4 w-4" />
                <span>{t.cars}</span>
              </button>

              <button
                onClick={() => setActiveTab('deals')}
                className={`flex items-center space-x-2 h-14 text-sm font-medium transition-all ${
                  activeTab === 'deals'
                    ? 'text-blue-600 border-b-2 border-blue-600 pt-0.5'
                    : 'text-slate-600 hover:text-blue-600 pt-0.5'
                }`}
                id="nav-deals"
              >
                <Tag className="h-4 w-4" />
                <span>{t.deals}</span>
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
                <span>{t.bookings}</span>
                {bookingCount > 0 && (
                  <span className="absolute top-2 -right-3.5 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-pulse">
                    {bookingCount}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Right Side Options */}
          <div className="flex items-center space-x-3">
            {/* National Flags Language Switcher (Opens Language Selection Modal) */}
            <div className="flex items-center" id="language-selector">
              <button
                onClick={onOpenLanguageModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm text-xs font-bold transition-all cursor-pointer"
                title="언어 선택 / Select Language"
                id="language-modal-trigger-btn"
              >
                <span className="text-base select-none leading-none">
                  {LANGUAGES.find(l => l.code === selectedLanguageCode)?.flag || '🇰🇷'}
                </span>
                <span className="text-slate-700 font-bold text-[11px] tracking-tight">
                  {LANGUAGES.find(l => l.code === selectedLanguageCode)?.name || '한국어'}
                </span>
              </button>
            </div>

            <div className="h-4 w-[1px] bg-slate-200"></div>

            <button 
              onClick={() => setCurrency(currency === 'USD' ? 'KRW' : 'USD')}
              className="p-1.5 text-slate-700 hover:text-blue-600 rounded-md hover:bg-slate-50 transition-all hidden sm:flex items-center space-x-1 text-xs cursor-pointer border border-slate-200 shadow-sm"
              title="Click to toggle currency between KRW (원) and USD ($)"
              id="currency-toggle-btn"
            >
              <Globe className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              <span className="font-extrabold">{currencySymbol} {currency}</span>
            </button>
            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
            
            {currentUserEmail ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 p-1 px-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-700 text-xs font-medium">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold">
                    {currentUserEmail.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline-block max-w-[120px] truncate">{currentUserEmail}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-slate-200"
                  id="header-logout-btn"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-all cursor-pointer border border-slate-200"
                  id="header-login-btn"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all cursor-pointer shadow-sm"
                  id="header-signup-btn"
                >
                  {t.signup}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
