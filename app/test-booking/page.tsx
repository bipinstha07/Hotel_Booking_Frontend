import BookingForm from '@/components/booking-form';

export default function TestBookingPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Test Booking API</h1>
        <p className="text-gray-600">
          This page tests the connection to your Java Spring Boot API at{' '}
          <code className="bg-gray-100 px-2 py-1 rounded">http://localhost:8080/user/booking/create</code>
        </p>
      </div>
      
      <BookingForm />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">API Endpoint Details:</h3>
        <ul className="text-sm space-y-1">
          <li><strong>URL:</strong> http://localhost:8080/user/booking/create</li>
          <li><strong>Method:</strong> POST</li>
          <li><strong>Content-Type:</strong> application/json</li>
          <li><strong>Expected Response:</strong> 201 Created with booking data</li>
        </ul>
      </div>
    </div>
  );
} 