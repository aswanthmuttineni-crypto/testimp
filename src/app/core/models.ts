export interface AgingRow {
  tenantId: string;
  name: string;
  phone: string;
  room: string;
  monthlyRent: number;
  overdueMonths: { month: string; year: number; amount: number }[];
  totalOverdue: number;
}

export interface FileRef {
  filename?: string;
  path?: string;
  mimetype?: string;
}

export interface Room {
  _id?: string;
  roomNo: string;
  floor: number;
  capacity: number;
  rentAmount: number;
  status?: 'OCCUPIED' | 'VACANT';
  occupiedBeds?: number;
  beds?: Array<{ name: string; bedNo: number }>;
  // Amenities
  ac?: boolean;
  tv?: boolean;
  fridge?: boolean;
  fan?: boolean;
  heater?: boolean;
  wifi?: boolean;
  wardrobe?: boolean;
  attachedBath?: boolean;
}

export interface Tenant {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  aadhaarNo?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  roomId: string | Room;
  bedNo: number;
  joiningDate: string;
  advanceAmount: number;
  monthlyRent: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
  idProof?: FileRef;
}

export interface Rent {
  _id?: string;
  tenantId: string | Tenant;
  month: string;
  year: number;
  amount: number;
  paymentDate?: string;
  status: 'PAID' | 'PENDING';
  note?: string;
}

export interface Expense {
  _id?: string;
  title: string;
  amount: number;
  category:
    | 'Electricity'
    | 'Water'
    | 'Maintenance'
    | 'Food'
    | 'Salary'
    | 'Internet'
    | 'Repairs';
  date: string;
  notes?: string;
  bill?: FileRef;
}

export interface Settings {
  _id?: string;
  hostelName: string;
  adminEmail: string;
  adminPhone?: string;
  address: string;
  foodMenu: string;
  weeklyMenu: WeeklyMenuItem[];
  notificationEmail?: string;
  emailNotificationsEnabled?: boolean;
}

export interface WeeklyMenuItem {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MonthlyDue {
  tenant: Tenant;
  month: string;
  year: number;
  amount: number;
  status: 'PENDING' | 'PAID';
}

export interface MonthlyDues {
  month: string;
  year: number;
  dues: MonthlyDue[];
}

export interface Summary {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  occupiedRooms: number;
  vacantRooms: number;
  activeTenantCount: number;
  pendingRent: number;
  currentMonthDues: number;
  monthlyDues: MonthlyDues;
  rents: Rent[];
  expenses: Expense[];
}
