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

// GET - Get booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = mockBookings.find(b => b.id === params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
 
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update booking status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = mockBookings.find(b => b.id === params.id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const updateData = await request.json();
    
    // Update the booking with new data
    const updatedBooking: BookingDto = {
      ...booking,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    // In a real app, you would update the database here
    // For now, we'll just return the updated booking
    const bookingIndex = mockBookings.findIndex(b => b.id === params.id);
    if (bookingIndex !== -1) {
      mockBookings[bookingIndex] = updatedBooking;
    }

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingIndex = mockBookings.findIndex(b => b.id === params.id);
    
    if (bookingIndex === -1) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // In a real app, you would delete from database here
    // For now, we'll just remove from the mock array
    mockBookings.splice(bookingIndex, 1);

    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 