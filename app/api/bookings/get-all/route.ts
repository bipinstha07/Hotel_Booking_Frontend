import { NextRequest, NextResponse } from 'next/server';

// Define the booking DTO interface
interface BookingDto {
  id?: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

// Mock data - in real app, this would come from database
const mockBookings: BookingDto[] = [
  {
    id: '1',
    userId: 'user1',
    roomId: 'room1',
    checkInDate: '2024-01-15',
    checkOutDate: '2024-01-17',
    guestCount: 2,
    totalPrice: 200,
    status: 'confirmed',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
  },
  {
    id: '2',
    userId: 'user2',
    roomId: 'room2',
    checkInDate: '2024-01-20',
    checkOutDate: '2024-01-22',
    guestCount: 1,
    totalPrice: 150,
    status: 'pending',
    createdAt: '2024-01-11T14:30:00Z',
    updatedAt: '2024-01-11T14:30:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    let filteredBookings = [...mockBookings];

    // Filter by userId if provided
    if (userId) {
      filteredBookings = filteredBookings.filter(booking => booking.userId === userId);
    }

    // Filter by status if provided
    if (status) {
      filteredBookings = filteredBookings.filter(booking => booking.status === status);
    }

    return NextResponse.json(filteredBookings, { status: 200 });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 