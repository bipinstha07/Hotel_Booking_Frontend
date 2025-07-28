// Booking service for frontend API calls to Java Spring Boot backend

export interface BookingDto {
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

export class BookingService {
  private baseUrl = 'http://localhost:8080/user/booking';

  // Create a new booking
  async createBooking(bookingDto: Omit<BookingDto, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<BookingDto> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return response.json();
  }

  // Get all bookings with optional filters
  async getAllBookings(filters?: { userId?: string; status?: string }): Promise<BookingDto[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);

    const response = await fetch(`${this.baseUrl}/get-all?${params.toString()}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch bookings');
    }

    return response.json();
  }

  // Get booking by ID
  async getBookingById(id: string): Promise<BookingDto> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch booking');
    }

    return response.json();
  }

  // Update booking status
  async updateBookingStatus(id: string, status: BookingDto['status']): Promise<BookingDto> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update booking');
    }

    return response.json();
  }

  // Cancel booking
  async cancelBooking(id: string): Promise<BookingDto> {
    return this.updateBookingStatus(id, 'cancelled');
  }

  // Confirm booking
  async confirmBooking(id: string): Promise<BookingDto> {
    return this.updateBookingStatus(id, 'confirmed');
  }
}

// Export a singleton instance
export const bookingService = new BookingService(); 