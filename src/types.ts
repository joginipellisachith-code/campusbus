export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: string;
}

export interface Bus {
  id: string;
  routeName: string;
  busNumber: string;
  capacity: number;
  bookedSeats: number;
  schedule: string;
  driverName: string;
  price: number;
  active: boolean;
}

export interface Booking {
  id: string;
  busId: string;
  studentId: string;
  studentName: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentIntentId?: string;
  amount: number;
}
