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
  paymentStatus?: string;
  paymentIntentId?: string;
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
  roomType?: string;
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

  const getPaymentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'border-l-green-500';
      case 'pending':
        return 'border-l-yellow-500';
      case 'cancelled':
        return 'border-l-red-500';
      case 'completed':
        return 'border-l-blue-500';
      default:
        return 'border-l-gray-400';
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
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <Card key={booking.id || index} className={`hover:shadow-xl transition-all duration-300 border-l-4 ${getStatusBorderColor(booking.bookingStatus)}`}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Column 1: Customer & Booking Info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {booking.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-900">{booking.customerName}</h3>
                        <p className="text-sm text-gray-600">{booking.customerEmail}</p>
                      </div>
                      <Badge className={`text-xs font-medium ${getStatusColor(booking.bookingStatus)}`}>
                        {booking.bookingStatus || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{booking.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{booking.numberOfGuest} guests</span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">ID: #{booking.id}</div>
                    </div>
                  </div>

                  {/* Column 2: Dates */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold text-sm text-gray-900">Stay Details</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-600">Check-in:</span>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkInDate)}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-600">Check-out:</span>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(booking.checkOutDate)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-semibold text-sm text-gray-900">Room Info</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-medium text-gray-600">Room Type:</span>
                          <p className="text-sm font-semibold text-gray-900">{booking.roomType || booking.roomEntity?.roomType || `Room ${booking.roomId}`}</p>
                        </div>
                        {booking.roomEntity && (
                          <div>
                            <span className="text-xs font-medium text-gray-600">Price/Night:</span>
                            <p className="text-sm font-semibold text-gray-900">${booking.roomEntity.pricePerNight}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Payment & Total */}
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-sm text-gray-900">Payment</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-center">
                          <span className="text-xs font-medium text-gray-600">Total Amount</span>
                          <p className="text-xl font-bold text-green-600">${booking.totalPrice}</p>
                        </div>
                        {booking.paymentStatus && (
                          <div className="text-center">
                            <span className="text-xs font-medium text-gray-600">Status</span>
                            <div className="flex justify-center mt-1">
                              <Badge className={`text-xs font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                                {booking.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {booking.paymentIntentId && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          <span className="text-xs font-medium text-gray-700">Payment ID</span>
                        </div>
                        <p className="text-xs text-gray-600 font-mono break-all">{booking.paymentIntentId}</p>
                      </div>
                    )}
                  </div>

                  {/* Column 4: Notes & Additional Info */}
                  <div className="space-y-3">
                    {booking.notes && (
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="font-semibold text-sm text-gray-900">Notes</span>
                        </div>
                        <p className="text-sm text-gray-700 bg-white/50 p-2 rounded border">{booking.notes}</p>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-sm text-gray-900">Created</span>
                      </div>
                      <p className="text-sm text-gray-700">{formatDateTime(booking.bookingCreated)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 