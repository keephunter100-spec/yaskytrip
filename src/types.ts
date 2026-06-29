export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  airports: Airport[];
  imageUrl: string;
}

export interface Airline {
  code: string;
  name: string;
  logo: string;
}

export interface FlightSegment {
  flightNumber: string;
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string; // ISO string or simple time
  arrivalTime: string; // ISO string or simple time
  duration: number; // in minutes
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  aircraft: string;
}

export interface Flight {
  id: string;
  outbound: FlightSegment[];
  inbound?: FlightSegment[]; // undefined if one-way
  price: number;
  currency: string;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  stopsOutbound: number;
  stopsInbound?: number;
  totalDurationOutbound: number; // in minutes
  totalDurationInbound?: number;
  carbonEmissionKg: number;
  baggageIncluded: boolean;
  score: number; // Kayak ratio: combination of price, speed, convenience
  commissionRate: number; // Commission rate as percentage, e.g. 3.5 for 3.5%
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  rating: number; // out of 5 stars
  reviewScore: number; // e.g. 8.7
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  amenities: string[];
  imageUrl: string;
  address: string;
  lat?: number;
  lng?: number;
  roomTypes: {
    name: string;
    price: number;
    description: string;
  }[];
  reviews: {
    author: string;
    score: number;
    comment: string;
    date: string;
  }[];
}

export interface SearchQuery {
  type: 'flights' | 'hotels' | 'packages';
  tripType: 'round-trip' | 'one-way';
  fromCity: string;
  toCity: string;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  hotelGuests: number;
  hotelRooms: number;
}

export interface FilterOptions {
  maxPrice: number;
  stops: 'any' | 'direct' | '1-stop' | '2-stops';
  departureTimeRange: [number, number]; // [startHour, endHour]
  airlines: string[]; // Selected airline codes
  hotelRating: number; // minimum stars
  hotelAmenities: string[];
  onlyHighCommission: boolean; // Only recommend flights with 3%+ commission
}

export interface BookingDetails {
  id: string;
  type: 'flight' | 'hotel' | 'package';
  flight?: Flight;
  hotel?: Hotel;
  selectedRoomType?: string;
  passengers: {
    firstName: string;
    lastName: string;
    passportNumber?: string;
    email: string;
    phone: string;
  }[];
  selectedSeats?: string[];
  totalPrice: number;
  bookingDate: string;
}

export const CURRENCY_DATA: Record<string, { symbol: string; rate: number; prefix: boolean }> = {
  USD: { symbol: '$', rate: 1, prefix: true },
  KRW: { symbol: '₩', rate: 1400, prefix: true },
  JPY: { symbol: '¥', rate: 155, prefix: true },
  EUR: { symbol: '€', rate: 0.92, prefix: true },
  GBP: { symbol: '£', rate: 0.79, prefix: true },
  CNY: { symbol: '¥', rate: 7.25, prefix: true },
  TWD: { symbol: 'NT$', rate: 32, prefix: true },
  IDR: { symbol: 'Rp', rate: 16000, prefix: true },
  MYR: { symbol: 'RM', rate: 4.70, prefix: true },
  THB: { symbol: '฿', rate: 36, prefix: true },
  VND: { symbol: '₫', rate: 25000, prefix: false },
  RUB: { symbol: '₽', rate: 90, prefix: false },
  TRY: { symbol: '₺', rate: 32, prefix: true },
};

export const EXCHANGE_RATE = 1400;

export function formatPrice(priceInUSD: number, currency: string) {
  const info = CURRENCY_DATA[currency] || CURRENCY_DATA.USD;
  const value = Math.round(priceInUSD * info.rate);
  if (info.prefix) {
    return `${info.symbol}${value.toLocaleString()}`;
  }
  return `${value.toLocaleString()}${info.symbol}`;
}
