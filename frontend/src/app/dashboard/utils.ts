export function formatGoogleMeetLink(bookingId: string): string {
  if (bookingId && bookingId.startsWith('https://meet.google.com/')) {
    return bookingId;
  }
  const sanitized = (bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const numToLetter: Record<string, string> = {
    '0': 'a', '1': 'b', '2': 'c', '3': 'd', '4': 'e',
    '5': 'f', '6': 'g', '7': 'h', '8': 'i', '9': 'j',
  };
  let letters = sanitized
    .split('')
    .map((ch) => numToLetter[ch] || ch)
    .join('');
  while (letters.length < 10) {
    letters += 'avd';
  }
  const p1 = letters.slice(0, 3);
  const p2 = letters.slice(3, 7);
  const p3 = letters.slice(7, 10);
  return `https://meet.google.com/${p1}-${p2}-${p3}`;
}

export function resolveProductImage(item: any): string {
  const direct =
    item?.image ||
    item?.product?.image ||
    (Array.isArray(item?.product?.images) ? item.product.images[0] : null) ||
    (Array.isArray(item?.images) ? item.images[0] : null);

  if (
    direct &&
    typeof direct === 'string' &&
    (direct.startsWith('/') || direct.startsWith('http://') || direct.startsWith('https://')) &&
    !direct.includes('undefined')
  ) {
    return direct;
  }

  const name = (
    item?.product?.name ||
    item?.name ||
    item?.productName ||
    item?.title ||
    item?.product?.title ||
    ''
  ).toLowerCase();

  if (name.includes('tourmaline') || name.includes('black') || name.includes('nazar')) return '/products/prod-black-tourmaline.png';
  if (name.includes('pyrite') || name.includes('golden') || name.includes('wealth')) return '/products/prod-pyrite.png';
  if (name.includes('tiger')) return '/products/prod-tiger-eye-macro.jpg';
  if (name.includes('rose') || name.includes('quartz') || name.includes('love')) return '/products/prod-rose-quartz.png';
  if (name.includes('aventurine') || name.includes('green') || name.includes('luck')) return '/products/prod-aventurine.png';
  if (name.includes('carnelian') || name.includes('fire')) return '/products/prod-carnelian.png';
  if (name.includes('moonstone')) return '/products/prod-moonstone.png';
  if (name.includes('yantra') || name.includes('shree') || name.includes('copper')) return '/products/shree-yantra.jpg';
  if (name.includes('rudraksha') || name.includes('mala') || name.includes('mukhi')) return '/products/rudraksha-mala.jpg';
  return '/products/prod-tiger-eye-macro.jpg';
}

export const DEFAULT_SAMPLE_ORDERS: any[] = [
  {
    id: 'AVD-ORD-89421',
    orderNumber: '#AVD-ORD-89421',
    productName: 'Natural Consecrated 7 Mukhi Nepali Rudraksha Mala',
    items: [
      {
        id: 'it-1',
        name: 'Natural Consecrated 7 Mukhi Nepali Rudraksha Mala',
        image: '/products/rudraksha-mala.jpg',
        price: 2499,
        quantity: 1,
        variant: '108 Beads • Varanasi Blessed',
        subtitle: 'Blessing: Mahalakshmi & Saturn Alignment',
      },
    ],
    totalAmount: 2499,
    status: 'DELIVERED',
    deliveryDate: 'Nov 24, 2025',
    deliveryStatusText: 'Delivered on Nov 24, 2025',
    deliverySubtext: 'Your consecrated parcel has been delivered to resident',
    shippingAddress: {
      recipient: 'Yash Patidar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      postalCode: '452001',
    },
    canReview: true,
    createdAt: '2025-11-24T14:15:00.000Z',
  },
  {
    id: 'AVD-ORD-78219',
    orderNumber: '#AVD-ORD-78219',
    productName: 'Black Tourmaline Aura Shield & Nazar Raksha Bracelet',
    items: [
      {
        id: 'it-2',
        name: 'Black Tourmaline Aura Shield & Nazar Raksha Bracelet',
        image: '/products/prod-black-tourmaline.png',
        price: 1499,
        quantity: 1,
        variant: '8mm Grade-AAA Natural Shield Beads',
        subtitle: 'Consecration: Shani & Rahu Kavach',
      },
    ],
    totalAmount: 1499,
    status: 'DELIVERED',
    deliveryDate: 'Nov 10, 2025',
    deliveryStatusText: 'Delivered on Nov 10, 2025',
    deliverySubtext: 'Your consecrated parcel has been delivered to resident',
    shippingAddress: {
      recipient: 'Yash Patidar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      postalCode: '452001',
    },
    canReview: true,
    createdAt: '2025-11-10T11:20:00.000Z',
  },
  {
    id: 'AVD-ORD-65123',
    orderNumber: '#AVD-ORD-65123',
    productName: 'Energized Golden Pyrite Wealth & Abundance Magnet Bracelet',
    items: [
      {
        id: 'it-3',
        name: 'Energized Golden Pyrite Wealth & Abundance Magnet Bracelet',
        image: '/products/prod-pyrite.png',
        price: 1599,
        quantity: 1,
        variant: '8mm Natural Pyrite • High Vibration',
        subtitle: 'Solar Plexus & Cashflow Activation',
      },
    ],
    totalAmount: 1599,
    status: 'SHIPPED',
    deliveryDate: 'Expected Tomorrow',
    deliveryStatusText: 'In Transit • Expected Tomorrow',
    deliverySubtext: 'Consignment cleared through Varanasi Hub',
    shippingAddress: {
      recipient: 'Yash Patidar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      postalCode: '452001',
    },
    canReview: false,
    createdAt: '2025-11-26T16:45:00.000Z',
  },
  {
    id: 'AVD-ORD-51042',
    orderNumber: '#AVD-ORD-51042',
    productName: 'Siddha Shri Sampoorna Maha Lakshmi & Kuber Yantra',
    items: [
      {
        id: 'it-4',
        name: 'Siddha Shri Sampoorna Maha Lakshmi & Kuber Yantra',
        image: '/products/shree-yantra.jpg',
        price: 1850,
        quantity: 1,
        variant: 'Pure Copper Plate (6x6 Inch)',
        subtitle: 'Pran-Pratishtha in Sacred Fire Altar',
      },
    ],
    totalAmount: 1850,
    status: 'PROCESSING',
    deliveryDate: 'Dispatches in 24h',
    deliveryStatusText: 'Consecration in Progress',
    deliverySubtext: 'Undergoing 108 Beej Mantra energization',
    shippingAddress: {
      recipient: 'Yash Patidar',
      city: 'Indore',
      state: 'Madhya Pradesh',
      postalCode: '452001',
    },
    canReview: false,
    createdAt: '2025-11-28T09:30:00.000Z',
  },
];

export function getCombinedOrders(backendOrders: any[] = []): any[] {
  let localOrders: any[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('astro_placed_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localOrders = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse astro_placed_orders:', e);
    }
  }

  const combined = [...backendOrders];
  for (const localOrd of localOrders) {
    const exists = combined.some(
      (b) =>
        String(b.id || b._id) === String(localOrd.id || localOrd._id) ||
        (b.createdAt && localOrd.createdAt && Math.abs(new Date(b.createdAt).getTime() - new Date(localOrd.createdAt).getTime()) < 3000)
    );
    if (!exists) {
      combined.unshift(localOrd);
    }
  }

  if (combined.length === 0) {
    return DEFAULT_SAMPLE_ORDERS;
  }

  return combined;
}

export function getCombinedBookings(backendBookings: any[] = []): any[] {
  let localBookings: any[] = [];
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('astro_consultations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          localBookings = parsed.filter(
            (b) => b && b.id !== '9ead962f-2896-4652-a8f9-2651723508fd'
          );
        }
      }
    } catch (e) {
      console.error('Failed to parse astro_consultations:', e);
    }
  }

  const combined = [
    ...backendBookings.filter((b) => b && b.id !== '9ead962f-2896-4652-a8f9-2651723508fd'),
  ];
  for (const localB of localBookings) {
    const exists = combined.some(
      (b) =>
        String(b.id || b._id) === String(localB.id || localB._id) ||
        (b.scheduledDate === localB.scheduledDate && b.scheduledTime === localB.scheduledTime)
    );
    if (!exists) {
      combined.unshift(localB);
    }
  }

  return combined.map((b) => ({
    ...b,
    meetLink:
      b.meetLink && b.meetLink.includes('meet.google.com')
        ? b.meetLink
        : formatGoogleMeetLink(b.id || b._id || ''),
  }));
}
