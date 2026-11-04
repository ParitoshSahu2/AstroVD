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
    item?.productImage ||
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
  if (name.includes('hakik') || name.includes('sulemani')) return '/products/prod-sulemani-hakik.png';
  if (name.includes('hematite')) return '/products/prod-hematite.png';
  if (name.includes('moss') || name.includes('agate')) return '/products/prod-moss-agate.png';
  if (name.includes('jasper') || name.includes('dalmation')) return '/products/prod-dalmation-jasper.png';
  if (name.includes('unakite')) return '/products/prod-unakite.png';
  if (name.includes('serpentine')) return '/products/prod-serpentine.png';
  if (name.includes('chalcedony')) return '/products/prod-yellow-chalcedony.png';
  if (name.includes('yantra') || name.includes('shree') || name.includes('copper')) return '/products/shree-yantra.jpg';
  if (name.includes('rudraksha') || name.includes('mala') || name.includes('mukhi')) return '/products/rudraksha-mala.jpg';
  return '/products/prod-tiger-eye-macro.jpg';
}

export const DEFAULT_SAMPLE_ORDERS: any[] = [];

export function getCombinedOrders(backendOrders: any[] = []): any[] {
  if (Array.isArray(backendOrders) && backendOrders.length > 0) {
    return backendOrders;
  }
  return [];
}

export function getCombinedBookings(backendBookings: any[] = []): any[] {
  if (!Array.isArray(backendBookings)) return [];
  return backendBookings
    .filter((b) => b && b.id !== '9ead962f-2896-4652-a8f9-2651723508fd')
    .map((b) => ({
      ...b,
      meetLink:
        b.meetLink && b.meetLink.includes('meet.google.com')
          ? b.meetLink
          : formatGoogleMeetLink(b.id || b._id || ''),
    }));
}
