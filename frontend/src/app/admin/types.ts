export type DeletableUser = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  walletBalance: number;
  createdAt?: string;
};

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPERADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  walletBalance: number;
  zodiacSign?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  createdAt: string;
  _count: {
    bookings: number;
    orders: number;
    transactions: number;
  };
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    image: string;
    energizedBy: string;
    labCertified: boolean;
  };
}

export interface Order {
  id: string;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  createdAt: string;
  items: OrderItem[];
  orderReference?: string;
  orderNumber?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  itemCount?: number;
  paymentStatus?: string;
  deliveryStatus?: string;
  statusHistory?: any[];
}

export interface Booking {
  id: string;
  serviceType: string;
  serviceTitle?: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMinutes: number;
  totalCost: number;
  status: string;
  notes?: string;
  createdAt: string;
  astrologer: {
    id: string;
    name: string;
    title?: string;
    imageUrl?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  user?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  statusHistory?: any[];
}

export interface WalletTx {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  balanceAfter: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorEmail?: string;
  targetEmail?: string;
  details?: any;
  createdAt: string;
}

export interface DetailedUser extends UserSummary {
  timeOfBirth?: string;
  savedKundlis?: any[];
  savedReadings?: any[];
  orders: Order[];
  bookings: Booking[];
  transactions: WalletTx[];
  auditLogsTriggered: AuditLog[];
  auditLogsReceived: AuditLog[];
}

export interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  isBooked: boolean;
  isPublished: boolean;
  canDelete: boolean;
  notes?: string | null;
  booking?: {
    id: string;
    customerName: string;
    customerPhone?: string | null;
    status: string;
  } | null;
}

export interface AvailabilityData {
  date: string;
  isBlocked: boolean;
  blockedReason: string | null;
  slots: AvailabilitySlot[];
  totalSlots: number;
  bookedCount: number;
}

export function getUserInitials(user?: any, nameOverride?: string) {
  const raw = (nameOverride || user?.name || '').trim();
  if (raw) {
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }

  if (user?.email) {
    const clean = user.email.split('@')[0].replace(/[0-9]+/g, '');
    const parts = clean.split(/[._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0].length > 0) {
      return parts[0][0].toUpperCase();
    }
  }

  if (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') return 'A';
  return 'Y';
}

export function getAvatarBackground(role?: string) {
  const r = (role || '').toUpperCase();
  if (r === 'ADMIN' || r === 'SUPERADMIN') {
    return 'bg-gradient-to-br from-[#4A044E] via-[#5B0D15] to-[#701A75] border-amber-300 text-amber-200 ring-amber-300/40';
  }
  if (r === 'ASTROLOGER') {
    return 'bg-gradient-to-br from-[#064E3B] via-[#0F766E] to-[#78350F] border-emerald-300 text-emerald-100 ring-emerald-300/40';
  }
  return 'bg-gradient-to-br from-[#5B0D15] via-[#7B121C] to-[#3B1E22] border-amber-300/80 text-amber-200 ring-amber-200/50';
}
