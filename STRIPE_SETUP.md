# Stripe Integration Setup Guide

This guide explains how to set up and use the Stripe payment integration in your hotel booking application.

## Prerequisites

1. **Stripe Account**: You need a Stripe account (test mode is fine for development)
2. **Backend Running**: Your Java Spring Boot backend should be running on `http://localhost:8080`
3. **Stripe Dependencies**: The required packages are already installed

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### 2. Get Your Stripe Keys

1. Log into your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to Developers → API Keys
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Replace `pk_test_your_actual_publishable_key_here` in your `.env.local` file

### 3. Backend Configuration

Make sure your Java Spring Boot backend has:

1. **Stripe Dependencies** in `pom.xml`:
```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>24.0.0</version>
</dependency>
```

2. **Stripe Secret Key** in `application.properties`:
```properties
stripe.secret.key=sk_test_your_secret_key_here
```

3. **CORS Configuration** to allow frontend requests:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

## How It Works

### 1. Booking Creation Flow

1. User fills out the booking form
2. Frontend sends booking data to backend (`/user/booking/create`)
3. Backend creates a Stripe Payment Intent
4. Backend returns `clientSecret` and `bookingId`
5. Frontend shows payment form with Stripe Elements

### 2. Payment Processing Flow

1. User enters card details in Stripe Elements
2. Frontend confirms payment with Stripe using `clientSecret`
3. If successful, frontend calls backend (`/user/booking/confirm`)
4. Backend updates booking status to "CONFIRMED"
5. User sees success message

## Testing

### Test Card Numbers

Use these test card numbers for development:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

### Test the Integration

1. Start your backend: `./mvnw spring-boot:run`
2. Start your frontend: `npm run dev`
3. Navigate to: `http://localhost:3000/test-booking`
4. Fill out the booking form
5. Use test card numbers for payment

## API Endpoints

### Frontend → Backend

- **POST** `/user/booking/create`
  - Creates booking and Stripe Payment Intent
  - Returns: `{ clientSecret, bookingId }`

- **POST** `/user/booking/confirm`
  - Confirms payment after successful Stripe payment
  - Body: `{ paymentIntentId }`
  - Returns: Confirmation message

## Error Handling

The integration includes comprehensive error handling:

- **Network errors**: Displayed as toast notifications
- **Stripe errors**: Shown in the payment form
- **Backend errors**: Displayed as toast notifications
- **Validation errors**: Form-level validation

## Security Notes

1. **Never expose your Stripe secret key** in frontend code
2. **Always use HTTPS** in production
3. **Validate all inputs** on both frontend and backend
4. **Use webhook signatures** in production for payment confirmation

## Production Deployment

For production:

1. Use live Stripe keys (not test keys)
2. Set up webhook endpoints for payment confirmation
3. Implement proper error logging
4. Add rate limiting
5. Use HTTPS everywhere
6. Set up monitoring and alerts

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows `http://localhost:3000`
2. **Stripe Key Errors**: Check your publishable key is correct
3. **Payment Fails**: Verify your secret key is correct in backend
4. **Network Errors**: Ensure backend is running on port 8080

### Debug Mode

Enable debug logging by adding to your backend:

```java
logging.level.com.stripe=DEBUG
```

## Files Modified

- `lib/booking-service.ts` - Updated to handle Stripe payment flow
- `components/booking-form.tsx` - Integrated with payment form
- `components/payment-form.tsx` - New Stripe Elements component
- `lib/stripe-config.ts` - Stripe configuration
- `app/test-booking/page.tsx` - Test page for the complete flow 