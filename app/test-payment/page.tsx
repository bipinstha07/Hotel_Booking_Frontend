'use client';

import { useState } from 'react';
import { bookingService } from '@/lib/booking-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import PaymentForm from '@/components/payment-form';

export default function TestPaymentPage() {
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const testBooking = async () => {
    setLoading(true);
    
    try {
      // Test data that should work with your backend
      const testBookingData = {
        customerName: 'Test User',
        customerEmail: 'test@example.com',
        userId: 'user123',
        roomId: '02339d5a-b954-4ef8-8a20-9561442f0897', // Valid room ID
        checkInDate: '2025-08-20',
        checkOutDate: '2025-08-22',
        guestCount: 2,
        totalPrice: 6000, // $60.00 in cents (2 nights * $30)
      };

      console.log('Testing booking with data:', testBookingData);
      
      const response = await bookingService.createBooking(testBookingData);
      console.log('Booking response:', response);
      
      setPaymentData(response);
      setShowPayment(true);
      
      toast.success('Test booking created!', {
        description: `Booking ID: ${response.bookingId}`,
      });
    } catch (error) {
      console.error('Test booking failed:', error);
      // Show the exact backend error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Test Booking Failed', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setPaymentData(null);
    toast.success('Payment test completed successfully!');
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setPaymentData(null);
  };

  if (showPayment && paymentData) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Test Payment</h1>
            <p className="text-gray-600">
              Testing the payment flow with your backend
            </p>
          </div>
          
          <PaymentForm
            clientSecret={paymentData.clientSecret}
            bookingId={paymentData.bookingId}
            amount={6000} // $60.00 in cents
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Flow Test</h1>
          <p className="text-gray-600">
            Test the complete booking and payment flow
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Test Payment Flow</CardTitle>
            <CardDescription>
              This will create a test booking and proceed to payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Test Data:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Room: Single AC (Room 100)</li>
                  <li>• Dates: June 15-17, 2025</li>
                  <li>• Guests: 2</li>
                  <li>• Total: $60.00 (2 nights × $30)</li>
                </ul>
              </div>
              
              <Button 
                onClick={testBooking} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating Test Booking...' : 'Start Payment Test'}
              </Button>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Test Card:</h3>
                <p className="text-sm text-yellow-700">
                  Use: <strong>4242 4242 4242 4242</strong> for successful payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 