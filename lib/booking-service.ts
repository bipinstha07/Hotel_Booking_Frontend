// Booking service for frontend API calls to Java Spring Boot backend

export interface BookingDto {
  id?: string;
  userId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuest: number;
  notes?: string;
  phoneNumber?: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
  customerEmail?: string;
  customerName?: string;
  bookingStatus?: string;
  paymentStatus?: string;
}

export interface PaymentResponse {
  clientSecret: string;
  bookingId: string;
}

export class BookingService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/user/booking`;

  // Create a new booking with Stripe payment intent
  async createBooking(bookingDto: Omit<BookingDto, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'bookingStatus' | 'paymentStatus'>): Promise<PaymentResponse> {
    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingDto),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend error response:', error);
      // Use the exact error message from backend
      throw new Error(error.message || 'Failed to create booking');
    }

    const responseData = await response.json();
    console.log('Backend response:', responseData);
    
    // Handle the response format from your backend
    return {
      clientSecret: responseData.clientSecret,
      bookingId: responseData.bookingId,
    };
  }

  // Confirm payment after successful Stripe payment
  async confirmPayment(paymentIntentId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Payment confirmation error:', error);
      // Use the exact error message from backend
      throw new Error(error.message || 'Failed to confirm payment');
    }

    const result = await response.text();
    console.log('Payment confirmation result:', result);
    return result;
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