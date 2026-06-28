import { Airport, City, Airline, Flight, FlightSegment, Hotel } from './types';

export const AIRLINES: Airline[] = [
  { code: 'KE', name: 'Korean Air', logo: '✈️' },
  { code: 'OZ', name: 'Asiana Airlines', logo: '✈️' },
  { code: 'JL', name: 'Japan Airlines', logo: '🇯🇵' },
  { code: 'NH', name: 'All Nippon Airways', logo: '💙' },
  { code: 'DL', name: 'Delta Air Lines', logo: '🔺' },
  { code: 'BA', name: 'British Airways', logo: '🇬🇧' },
  { code: 'AF', name: 'Air France', logo: '🇫🇷' },
  { code: 'SQ', name: 'Singapore Airlines', logo: '🇸🇬' },
  { code: 'UA', name: 'United Airlines', logo: '🇺🇸' },
  { code: 'EK', name: 'Emirates', logo: '🇦🇪' },
  { code: '7C', name: 'Jeju Air', logo: '🍊' },
  { code: 'MM', name: 'Peach Aviation', logo: '🍑' },
];

export const AIRPORTS: Airport[] = [
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { code: 'GMP', name: 'Gimpo International Airport', city: 'Seoul', country: 'South Korea' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'United States' },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York', country: 'United States' },
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  { code: 'HNL', name: 'Daniel K. Inouye International Airport', city: 'Honolulu', country: 'United States' },
];

export const CITIES: City[] = [
  {
    id: 'SEOUL',
    name: 'Seoul',
    country: 'South Korea',
    airports: [AIRPORTS[0], AIRPORTS[1]],
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'TOKYO',
    name: 'Tokyo',
    country: 'Japan',
    airports: [AIRPORTS[2], AIRPORTS[3]],
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'NEWYORK',
    name: 'New York',
    country: 'United States',
    airports: [AIRPORTS[4], AIRPORTS[5], AIRPORTS[6]],
    imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'LONDON',
    name: 'London',
    country: 'United Kingdom',
    airports: [AIRPORTS[7], AIRPORTS[8]],
    imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'PARIS',
    name: 'Paris',
    country: 'France',
    airports: [AIRPORTS[9], AIRPORTS[10]],
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SINGAPORE',
    name: 'Singapore',
    country: 'Singapore',
    airports: [AIRPORTS[11]],
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'SYDNEY',
    name: 'Sydney',
    country: 'Australia',
    airports: [AIRPORTS[12]],
    imageUrl: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'HONOLULU',
    name: 'Honolulu',
    country: 'United States',
    airports: [AIRPORTS[13]],
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
];

// Helper to seed random generator for deterministic mock lists
function seededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return function () {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

export function generateFlights(
  fromCode: string,
  toCode: string,
  departureDate: string,
  returnDate?: string,
  cabinClass: 'economy' | 'premium' | 'business' | 'first' = 'economy',
  passengerCount: number = 1
): Flight[] {
  const fromAirport = AIRPORTS.find(a => a.code === fromCode || a.city.toLowerCase() === fromCode.toLowerCase()) || AIRPORTS[0];
  const toAirport = AIRPORTS.find(a => a.code === toCode || a.city.toLowerCase() === toCode.toLowerCase()) || AIRPORTS[2];

  const seed = `${fromAirport.code}-${toAirport.code}-${departureDate}-${cabinClass}`;
  const random = seededRandom(seed);

  // Determine baseline distance and price
  const isShortHaul = (fromAirport.country === 'South Korea' && toAirport.country === 'Japan') || 
                      (fromAirport.country === toAirport.country);
  const isIntercontinental = !isShortHaul && 
                             ((fromAirport.country === 'South Korea' || fromAirport.country === 'Japan') && toAirport.country === 'United States' || toAirport.country === 'United Kingdom' || toAirport.country === 'France' || toAirport.country === 'Australia');

  const basePrice = isShortHaul ? 150 : isIntercontinental ? 950 : 550;
  const classMultiplier = cabinClass === 'economy' ? 1 : cabinClass === 'premium' ? 1.5 : cabinClass === 'business' ? 3 : 5;
  const distanceMinutes = isShortHaul ? 120 : isIntercontinental ? 720 : 420;

  const flightsCount = Math.floor(random() * 8) + 12; // Generate 12 to 20 flights
  const flights: Flight[] = [];

  for (let i = 0; i < flightsCount; i++) {
    let airline = AIRLINES[Math.floor(random() * AIRLINES.length)];
    if (i === 0) {
      airline = AIRLINES.find(a => a.code === 'KE') || AIRLINES[0];
    } else if (i === 1) {
      airline = AIRLINES.find(a => a.code === 'OZ') || AIRLINES[1];
    }

    // Determine stopovers
    const numStops = isShortHaul ? 0 : random() < 0.35 ? 0 : random() < 0.8 ? 1 : 2;
    const priceVariance = (random() * 0.4 - 0.2) * basePrice; // -20% to +20%
    const stopoverDiscount = numStops * 100; // Layover is cheaper
    const finalPrice = Math.max(70, Math.floor((basePrice + priceVariance - stopoverDiscount) * classMultiplier * passengerCount));

    // Base departure hour
    const startHour = Math.floor(random() * 18) + 5; // flights between 5 AM and 11 PM
    const startMinute = Math.floor(random() * 4) * 15; // 00, 15, 30, 45

    // Build segments
    const outboundSegments: FlightSegment[] = [];
    let currentFrom = fromAirport;
    let currentHour = startHour;
    let currentMinute = startMinute;

    const generateSegments = (startAir: Airport, endAir: Airport, stops: number, isReturning: boolean) => {
      const segments: FlightSegment[] = [];
      let tempFrom = startAir;
      
      for (let s = 0; s <= stops; s++) {
        const isLastSegment = s === stops;
        let tempTo = endAir;
        
        if (!isLastSegment) {
          // Choose a layover airport that is different from start and end
          const availableLayovers = AIRPORTS.filter(a => a.code !== startAir.code && a.code !== endAir.code);
          tempTo = availableLayovers[Math.floor(random() * availableLayovers.length)];
        }

        const segmentDuration = Math.floor(distanceMinutes / (stops + 1) + (random() * 45 - 20));
        
        // Format departure/arrival times safely
        const depTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        
        // Calculate arrival hour/minute
        let arrHour = (currentHour + Math.floor((currentMinute + segmentDuration) / 60)) % 24;
        let arrMinute = (currentMinute + segmentDuration) % 60;
        const arrTimeStr = `${String(arrHour).padStart(2, '0')}:${String(arrMinute).padStart(2, '0')}`;

        segments.push({
          flightNumber: `${airline.code}${Math.floor(random() * 900) + 100}`,
          airline: airline,
          departureAirport: tempFrom,
          arrivalAirport: tempTo,
          departureTime: depTimeStr,
          arrivalTime: arrTimeStr,
          duration: segmentDuration,
          cabinClass: cabinClass,
          aircraft: random() < 0.5 ? 'Boeing 787-9 Dreamliner' : 'Airbus A355-900',
        });

        if (!isLastSegment) {
          // Layover duration: 90 - 240 mins
          const layoverDuration = Math.floor(random() * 150) + 90;
          currentHour = (arrHour + Math.floor((arrMinute + layoverDuration) / 60)) % 24;
          currentMinute = (arrMinute + layoverDuration) % 60;
        }
        
        tempFrom = tempTo;
      }
      return segments;
    };

    const outbound = generateSegments(fromAirport, toAirport, numStops, false);
    const totalDurationOutbound = outbound.reduce((sum, seg) => sum + seg.duration, 0) + (numStops * 120); // add layover time approximations

    let inbound: FlightSegment[] | undefined = undefined;
    let totalDurationInbound: number | undefined = undefined;

    if (returnDate) {
      // Return flight details
      const returnStartHour = Math.floor(random() * 18) + 5;
      const returnStartMinute = Math.floor(random() * 4) * 15;
      currentHour = returnStartHour;
      currentMinute = returnStartMinute;

      inbound = generateSegments(toAirport, fromAirport, numStops, true);
      totalDurationInbound = inbound.reduce((sum, seg) => sum + seg.duration, 0) + (numStops * 120);
    }

    const emission = Math.floor((totalDurationOutbound + (totalDurationInbound || 0)) * 0.15 * (passengerCount || 1));
    const bagIncluded = random() > 0.35; // 65% chance of included checked bags

    // Quality Score
    const speedScore = 1000 / (totalDurationOutbound / 60);
    const priceScore = 10000 / finalPrice;
    const score = Math.floor((speedScore * 0.4) + (priceScore * 0.4) + (bagIncluded ? 20 : 0) + (numStops === 0 ? 50 : 0));

    // Commission rate: 1.0% to 8.0%
    let commissionRate = Math.round((1.0 + random() * 7.0) * 10) / 10;
    if (airline.code === 'KE' || airline.code === 'OZ') {
      commissionRate = Math.round((3.5 + random() * 4.5) * 10) / 10;
    }

    flights.push({
      id: `FL-${fromAirport.code}-${toAirport.code}-${airline.code}-${i}`,
      outbound,
      inbound,
      price: finalPrice,
      currency: 'USD',
      cabinClass,
      stopsOutbound: numStops,
      stopsInbound: returnDate ? numStops : undefined,
      totalDurationOutbound,
      totalDurationInbound,
      carbonEmissionKg: emission,
      baggageIncluded: bagIncluded,
      score,
      commissionRate,
    });
  }

  // Sort by Best (default) - balanced combo of score
  return flights.sort((a, b) => b.score - a.score);
}

export const HOTELS_PRESET: Omit<Hotel, 'id' | 'city' | 'country'>[] = [
  {
    name: 'The Grand Palace Hotel',
    rating: 5,
    reviewScore: 9.3,
    reviewCount: 1248,
    pricePerNight: 280,
    currency: 'USD',
    amenities: ['Free WiFi', 'Infinity Pool', 'Luxury Spa', 'Fitness Center', 'Michelin Restaurant', '24h Room Service'],
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    address: '100 Luxury Avenue, Downtown Core',
    roomTypes: [
      { name: 'Deluxe King Room', price: 280, description: 'Spacious king-size bed with city views, marble bathroom, and high-tech amenities.' },
      { name: 'Executive Suite', price: 450, description: 'Separate living room, access to private club lounge, and panoramic skyline vistas.' },
      { name: 'Presidential Suite', price: 950, description: 'Ultimate opulence. Multiple bedrooms, private terrace, and 24/7 personal butler.' },
    ],
    reviews: [
      { author: 'Minji Kim', score: 9.5, comment: 'Staff was incredibly helpful. The view from the infinity pool at night is worth the price alone!', date: '2026-05-12' },
      { author: 'David Smith', score: 9.0, comment: 'Very clean, comfortable bed, excellent breakfast options. Will definitely stay here again.', date: '2026-06-01' },
    ],
  },
  {
    name: 'Metropolitan Boutique Stay',
    rating: 4,
    reviewScore: 8.8,
    reviewCount: 720,
    pricePerNight: 160,
    currency: 'USD',
    amenities: ['Free WiFi', 'Rooftop Bar', 'Pet Friendly', 'Coffee Shop', 'Bicycle Rental'],
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    address: '42 Hipster Lane, Arts District',
    roomTypes: [
      { name: 'Standard Queen', price: 160, description: 'Cozy and modern room featuring local art, custom furnishings, and a smart TV.' },
      { name: 'Studio Suite', price: 220, description: 'Extended living area with an espresso maker, rainfall shower, and extra-large bed.' },
    ],
    reviews: [
      { author: 'Satoshi Tanaka', score: 8.5, comment: 'Fantastic location near shops and cafes. The rooftop bar has great craft cocktails!', date: '2026-04-20' },
    ],
  },
  {
    name: 'Cozy Nest Comfort Inn',
    rating: 3,
    reviewScore: 8.1,
    reviewCount: 412,
    pricePerNight: 95,
    currency: 'USD',
    amenities: ['Free WiFi', 'Free Breakfast', 'Free Parking', 'Kitchenette', 'Self-service Laundry'],
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    address: '88 Comfort Road, Quiet Suburbs',
    roomTypes: [
      { name: 'Double Bed Standard', price: 95, description: 'Clean, warm room with two double beds, microwave, mini-fridge, and workspace.' },
      { name: 'Family Room', price: 140, description: 'Spacious room with triple beds, larger dining table, and direct pool access.' },
    ],
    reviews: [
      { author: 'Jessica Miller', score: 8.0, comment: 'A lovely budget-friendly stay. The complimentary breakfast had freshly made waffles!', date: '2026-06-15' },
    ],
  },
  {
    name: 'The Heritage Manor & Gardens',
    rating: 5,
    reviewScore: 9.6,
    reviewCount: 560,
    pricePerNight: 350,
    currency: 'USD',
    amenities: ['Free WiFi', 'Botanical Gardens', 'Historic Library', 'Tea Salon', 'Valet Parking', 'Concierge Service'],
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    address: '7 Royal Parklands, Palace Hill',
    roomTypes: [
      { name: 'Heritage Queen Room', price: 350, description: 'Classic antique decor, high ceilings, clawfoot bathtub, and garden views.' },
      { name: 'Royal Garden Suite', price: 550, description: 'Expansive historic suite with private glass conservatory, luxury fireplace, and canopy bed.' },
    ],
    reviews: [
      { author: 'Arthur Pendelton', score: 10, comment: 'An absolute masterpiece of a hotel. Feels like stepping back in time with all modern luxuries.', date: '2026-05-28' },
    ],
  },
  {
    name: 'Urban Oasis Eco-Resort',
    rating: 4,
    reviewScore: 8.9,
    reviewCount: 890,
    pricePerNight: 190,
    currency: 'USD',
    amenities: ['Free WiFi', 'Eco-friendly Pool', 'Organic Garden', 'Yoga Studio', 'Vegan Cafe', 'Solar-powered Station'],
    imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
    address: '33 greenway blvd, Eco District',
    roomTypes: [
      { name: 'Green Garden Room', price: 190, description: 'Sustainably sourced wood styling, air-purifying plants, natural light, and organic cotton sheets.' },
      { name: 'Zen Garden Suite', price: 280, description: 'Complete with a private meditation corner, tatami mat option, and outdoor stone bathtub.' },
    ],
    reviews: [
      { author: 'Elena Rostova', score: 9.0, comment: 'So peaceful! The yoga classes in the morning are fantastic and the breakfast is 100% organic.', date: '2026-06-10' },
    ],
  },
];

export function generateHotels(
  cityName: string,
  guestsCount: number = 2,
  roomsCount: number = 1
): Hotel[] {
  const city = CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase() || c.id.toLowerCase() === cityName.toLowerCase()) || CITIES[0];
  
  const seed = `${city.id}-hotels`;
  const random = seededRandom(seed);

  // Generate 6 to 10 hotels with deterministic attributes
  const hotelCount = Math.floor(random() * 4) + 6;
  const hotels: Hotel[] = [];

  for (let i = 0; i < hotelCount; i++) {
    const preset = HOTELS_PRESET[i % HOTELS_PRESET.length];
    
    // Add variations specific to this city
    const priceMultiplier = city.id === 'NEWYORK' || city.id === 'LONDON' ? 1.4 : city.id === 'TOKYO' || city.id === 'PARIS' ? 1.25 : 1.0;
    const finalPricePerNight = Math.floor(preset.pricePerNight * priceMultiplier * (1 + (random() * 0.2 - 0.1)));

    // Create custom rooms with altered prices
    const roomTypes = preset.roomTypes.map(room => ({
      ...room,
      price: Math.floor(room.price * priceMultiplier * (1 + (random() * 0.15 - 0.07))),
    }));

    // Adjust address for the city
    let address = preset.address;
    if (city.id === 'SEOUL') {
      address = address.replace('Downtown Core', 'Myeongdong, Seoul').replace('Arts District', 'Hongdae, Seoul');
    } else if (city.id === 'TOKYO') {
      address = address.replace('Downtown Core', 'Shinjuku, Tokyo').replace('Arts District', 'Shibuya, Tokyo');
    } else if (city.id === 'NEWYORK') {
      address = address.replace('Downtown Core', 'Manhattan, New York').replace('Arts District', 'Brooklyn, New York');
    } else if (city.id === 'LONDON') {
      address = address.replace('Downtown Core', 'Westminster, London').replace('Arts District', 'Soho, London');
    } else if (city.id === 'PARIS') {
      address = address.replace('Downtown Core', 'Champs-Élysées, Paris').replace('Arts District', 'Le Marais, Paris');
    }

    hotels.push({
      id: `HT-${city.id}-${i}`,
      name: preset.name.replace('The Grand', `The ${city.name} Grand`).replace('Metropolitan', `${city.name} Metro`),
      city: city.name,
      country: city.country,
      rating: preset.rating,
      reviewScore: Number((preset.reviewScore + (random() * 0.4 - 0.2)).toFixed(1)),
      reviewCount: preset.reviewCount + Math.floor(random() * 200 - 100),
      pricePerNight: finalPricePerNight,
      currency: 'USD',
      amenities: [...preset.amenities],
      imageUrl: preset.imageUrl,
      address: address,
      roomTypes: roomTypes,
      reviews: preset.reviews,
    });
  }

  // Sort by rating (high to low) by default
  return hotels.sort((a, b) => b.reviewScore - a.reviewScore);
}
