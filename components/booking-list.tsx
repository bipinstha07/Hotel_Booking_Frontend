'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Booking {
  id?: string;
  customerName: string;
  customerEmail: string;
  checkInDate: string;
  checkOutDate: string;
  phoneNumber: number;
  bookingCreated: string;
  totalPrice: number;
  bookingStatus: string;
  notes: string;
  numberOfGuest: number;
  roomId: string;
  roomEntity?: {
    id: string;
    roomType: string;
    pricePerNight: number;
    capacity: number;
    description: string;
  };
}

export default function BookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/admin/roombooking/getAll');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBookings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to fetch bookings');
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      return format(new Date(dateTimeString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateTimeString;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchBookings}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">All Bookings</h2>
        <Button onClick={fetchBookings} variant="outline">
          Refresh
        </Button>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking, index) => (
            <Card key={booking.id || index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{booking.customerName}</CardTitle>
                    <CardDescription>{booking.customerEmail}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(booking.bookingStatus)}>
                    {booking.bookingStatus || 'Unknown'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Check-in:</span>
                    <div>{formatDate(booking.checkInDate)}</div>
                  </div>
                  <div>
                    <span className="font-medium">Check-out:</span>
                    <div>{formatDate(booking.checkOutDate)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Guests:</span>
                    <div>{booking.numberOfGuest} person(s)</div>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <div>{booking.phoneNumber}</div>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Room:</span>
                  <div className="flex items-center gap-2">
                    <span>{booking.roomEntity?.roomType || `Room ${booking.roomId}`}</span>
                    {booking.roomEntity && (
                      <Badge variant="outline" className="text-xs">
                        ${booking.roomEntity.pricePerNight}/night
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-sm">
                  <span className="font-medium">Total Price:</span>
                  <div className="text-lg font-bold text-green-600">
                    ${booking.totalPrice}
                  </div>
                </div>

                {booking.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span>
                    <div className="text-gray-600 mt-1">{booking.notes}</div>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-2 border-t">
                  Created: {formatDateTime(booking.bookingCreated)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 