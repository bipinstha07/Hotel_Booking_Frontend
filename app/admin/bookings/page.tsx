"use client"

import BookingList from '@/components/booking-list';
import Image from "next/image"

export default function AdminBookingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Image
            src="/logo.png"
            alt="LuxuryStay Logo"
            width={130}
            height={130}
            className="mr-3 rounded-lg"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard - Bookings</h1>
            <p className="text-gray-600">
              View and manage all hotel bookings from the Java Spring Boot API
            </p>
          </div>
        </div>
      </div>
      
      <BookingList />
    </div>
  );
}
