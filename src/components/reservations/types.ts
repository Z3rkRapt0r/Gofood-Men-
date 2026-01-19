export type ReservationSettings = {
    isActive: boolean;
    totalSeats: number;
    totalHighChairs: number;
    notificationEmail?: string;
};

export type TableConfig = {
    id: string;
    name: string;
    seats: number;
    isActive: boolean;
};

export type ReservationShift = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    daysOfWeek: number[]; // 0=Sunday
    isActive: boolean;
};

// Unified config object for the Wizard
export type ReservationConfig = ReservationSettings & {
    tables: TableConfig[];
    shifts: ReservationShift[];
};

export type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'arrived';

export type Reservation = {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    guests: number;
    highChairs: number;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    notes?: string;
    status: ReservationStatus;
    createdAt: string;
    assignedTableIds?: string[];
};

