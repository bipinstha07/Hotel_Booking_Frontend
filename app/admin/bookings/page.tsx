"use client"

import BookingList from '@/components/booking-list';

export default function AdminBookingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard - Bookings</h1>
        <p className="text-gray-600">
          View and manage all hotel bookings from the Java Spring Boot API
        </p>
      </div>
      
      <BookingList />
    </div>
  );
}
