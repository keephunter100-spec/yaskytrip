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
  type: 'flights' | 'hotels';
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
  type: 'flight' | 'hotel';
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

export const EXCHANGE_RATE = 1400;

export function formatPrice(priceInUSD: number, currency: string) {
  if (currency === 'KRW') {
    return `₩${Math.round(priceInUSD * EXCHANGE_RATE).toLocaleString()}`;
  }
  return `$${priceInUSD.toLocaleString()}`;
}

