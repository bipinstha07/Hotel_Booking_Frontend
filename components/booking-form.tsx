'use client';

import { useState } from 'react';
import { bookingService, BookingDto, PaymentResponse } from '@/lib/booking-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import PaymentForm from './payment-form';
import Link from 'next/link';

export default function BookingForm() {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
        <CardDescription>
          Create a new booking with secure payment processing
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-gray-600 mb-6">
          Select your room and complete your booking with our secure payment system.
        </p>
        <Link href="/book-now">
          <Button className="w-full">
            Start Booking
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
} 