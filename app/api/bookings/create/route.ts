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

// Mock booking interface (in a real app, this would be your database service)
class BookingService {
  async addBooking(bookingDto: BookingDto): Promise<BookingDto> {
    // Mock implementation - in real app, this would save to database
    const newBooking: BookingDto = {
      ...bookingDto,
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return newBooking;
  }
}

const bookingService = new BookingService();

export async function POST(request: NextRequest) {
  try {
    const bookingDto: BookingDto = await request.json();
    
    // Validate required fields
    if (!bookingDto.userId || !bookingDto.roomId || !bookingDto.checkInDate || !bookingDto.checkOutDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the booking
    const savedBookingDto = await bookingService.addBooking(bookingDto);
    
    return NextResponse.json(savedBookingDto, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 