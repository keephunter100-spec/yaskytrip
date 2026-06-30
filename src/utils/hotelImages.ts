import { Hotel } from '../types';

export interface HotelImageCategory {
  id: string;
  nameKo: string;
  nameEn: string;
  imageUrl: string;
  descriptionKo: string;
  descriptionEn: string;
}

// Collections of high-quality hotel photos from Unsplash for each category
const CATEGORY_IMAGES = {
  lobby: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  ],
  lounge: [
    'https://images.unsplash.com/photo-1541971875076-8f970d573be6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517544806532-34f3c09b55db?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506059612708-99d6c258160e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?auto=format&fit=crop&w=1200&q=80',
  ],
  bar: [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511108690759-009324a90311?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=1200&q=80',
  ],
  other: [
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
  ],
  bedroom: [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
  ],
  gym: [
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
  ],
  shop: [
    'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80',
  ],
  bathroom: [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80',
  ],
};

// Generates a simple, deterministic hash from a string
function getDeterministicIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % max;
}

/**
 * Returns a list of categorized images for a hotel.
 * The hotel's main image is always placed as the first category (lobby/front desk).
 */
export function getHotelImageCategories(hotel: Hotel): HotelImageCategory[] {
  const nameHash = hotel.name || '';
  const idx = getDeterministicIndex(nameHash, 4);

  // We map categories with high-quality images
  const categories: Omit<HotelImageCategory, 'imageUrl'>[] = [
    {
      id: 'lobby',
      nameKo: '프론트 데스크',
      nameEn: 'Front Desk',
      descriptionKo: '세련되고 아늑한 분위기의 24시간 인포메이션 데스크 및 로비 라운지입니다.',
      descriptionEn: 'An elegant and cozy lobby area with 24/7 reception and concierge assistance.',
    },
    {
      id: 'lounge',
      nameKo: '라운지',
      nameEn: 'Lounge',
      descriptionKo: '투숙객 전용 비즈니스 세션이나 미팅, 휴식을 취할 수 있는 모던 라운지입니다.',
      descriptionEn: 'A modern resident lounge ideal for business meetings, relaxation, or coffee.',
    },
    {
      id: 'bar',
      nameKo: '바',
      nameEn: '바',
      descriptionKo: '엄선된 와인과 클래식 칵테일, 스낵을 즐길 수 있는 고급스러운 바 공간입니다.',
      descriptionEn: 'A luxury bar space serving hand-selected wines, fine cocktails, and light bites.',
    },
    {
      id: 'other',
      nameKo: '기타',
      nameEn: 'Other',
      descriptionKo: '아름다운 야외 수영장 및 도심 속 특별한 조경을 자랑하는 외관 전경입니다.',
      descriptionEn: 'A stunning outdoor swimming pool and landscaping boasting scenic skyline views.',
    },
    {
      id: 'bedroom',
      nameKo: '침실',
      nameEn: 'Bedroom',
      descriptionKo: '최고급 구스다운 침구류와 개별 스마트 냉난방을 탑재한 럭셔리 베드룸입니다.',
      descriptionEn: 'A premium bedroom boasting high-thread-count linens and customizable smart AC.',
    },
    {
      id: 'gym',
      nameKo: '체육관',
      nameEn: 'Gym',
      descriptionKo: '최신 라이프피트니스 기구와 유산소 라인업을 완비한 쾌적한 피트니스 센터입니다.',
      descriptionEn: 'State-of-the-art cardiovascular and strength training equipment by LifeFitness.',
    },
    {
      id: 'shop',
      nameKo: '상점',
      nameEn: 'Shop',
      descriptionKo: '이색적인 디저트 및 로컬 브랜드 커피를 판매하는 시그니처 델리 숍입니다.',
      descriptionEn: 'A signature deli and convenience boutique offering custom desserts and gourmet coffee.',
    },
    {
      id: 'bathroom',
      nameKo: '욕실',
      nameEn: 'Bathroom',
      descriptionKo: '이탈리아산 천연 대리석 욕조와 세련된 고급 프렌치 욕실 어메니티를 제공합니다.',
      descriptionEn: 'Italian natural marble bathing facilities supplied with luxury French amenities.',
    },
  ];

  return categories.map((cat) => {
    let url = hotel.imageUrl;

    if (cat.id === 'lobby' && hotel.imageUrl) {
      // Keep hotel's original primary image for lobby/first
      url = hotel.imageUrl;
    } else {
      // Pick dynamic unique image based on deterministic index
      const pool = CATEGORY_IMAGES[cat.id as keyof typeof CATEGORY_IMAGES] || CATEGORY_IMAGES.lobby;
      const index = (idx + cat.nameKo.length) % pool.length;
      url = pool[index];
    }

    return {
      ...cat,
      imageUrl: url,
    };
  });
}
