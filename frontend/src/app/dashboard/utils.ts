export const DEFAULT_GURUJI_MEET_LINK = 'https://meet.google.com/meet/hui-smdn-gtp';

export function formatGoogleMeetLink(bookingId?: string): string {
  if (bookingId && bookingId.startsWith('https://meet.google.com/')) {
    return bookingId;
  }
  return DEFAULT_GURUJI_MEET_LINK;
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
