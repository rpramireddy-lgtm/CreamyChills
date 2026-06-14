# Square Payment Integration - Creamy Chills

## Overview
Square acts as payment processor ONLY. Creamy Chills platform manages all products, categories, modifiers, images, promotions, customers, and orders.

## Payment Methods Supported

1. **Card Payment** - Credit/Debit cards via Square Web Payments SDK
2. **Apple Pay** - Apple Pay via Square
3. **Google Pay** - Google Pay via Square
4. **Cash on Collection** - Customer pays when picking up
5. **Cash on Delivery** - Customer pays when order is delivered

## Architecture

### Creamy Chills Platform (Primary)
- ✅ Product catalog management
- ✅ Categories and modifiers
- ✅ Image library
- ✅ Customer management
- ✅ Order management
- ✅ Promotions and discounts
- ✅ Inventory tracking

### Square (Payment Processor Only)
- ✅ Card payment processing
- ✅ Apple Pay / Google Pay
- ✅ Payment receipt generation
- ✅ Refund processing
- ✅ Customer sync (for payment history)
- ✅ Cash transaction recording (for reporting)

## Database Models

### Payment
```javascript
{
  order: ObjectId,
  paymentMethod: 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'CASH_ON_COLLECTION' | 'CASH_ON_DELIVERY',
  amount: Number,
  currency: 'GBP',
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED',
  squarePaymentId: String,
  squareCustomerId: String,
  squareReceiptUrl: String,
  cardBrand: String,
  cardLast4: String,
  refundedAmount: Number,
  refunds: Array,
  completedAt: Date
}
```

## API Endpoints

### Process Card/Apple Pay/Google Pay
```
POST /api/payments/process
Body: {
  orderId: string,
  sourceId: string,  // Square payment token
  paymentMethod: 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY',
  amount: number,
  customerEmail: string,
  customerName: string
}
```

### Process Cash Payment
```
POST /api/payments/cash
Body: {
  orderId: string,
  paymentMethod: 'CASH_ON_COLLECTION' | 'CASH_ON_DELIVERY',
  amount: number
}
```

### Confirm Cash Received
```
POST /api/payments/cash/:paymentId/confirm
```

### Refund Payment
```
POST /api/payments/refund
Body: {
  paymentId: string,
  amount: number,  // Optional - full refund if not specified
  reason: string
}
```

### Get Payment Details
```
GET /api/payments/:paymentId
```

### Get Order Payments
```
GET /api/payments/order/:orderId
```

### Daily Reconciliation
```
GET /api/payments/reconcile/daily?date=2025-01-15
```

## Frontend Integration

### Square Web Payments SDK

Load in public/index.html:
```html
<script src="https://sandbox.web.squarecdn.com/v1/square.js"></script>
```

For production:
```html
<script src="https://web.squarecdn.com/v1/square.js"></script>
```

### Component Usage

```tsx
import SquareCheckout from './components/checkout/SquareCheckout';

<SquareCheckout
  orderId={order._id}
  amount={orderTotal}
  customerEmail={customer.email}
  customerName={customer.name}
  onSuccess={(result) => {
    // Payment successful
    console.log('Payment ID:', result.paymentId);
    console.log('Receipt URL:', result.receiptUrl);
  }}
  onError={(error) => {
    // Payment failed
    console.error('Payment error:', error);
  }}
/>
```

## Environment Variables

### Server (.env)
```
SQUARE_ACCESS_TOKEN=your_square_access_token
SQUARE_APPLICATION_ID=your_square_application_id
SQUARE_LOCATION_ID=your_square_location_id
SQUARE_ENVIRONMENT=sandbox  # or 'production'
```

### Client (.env)
```
REACT_APP_SQUARE_APPLICATION_ID=your_square_application_id
REACT_APP_SQUARE_LOCATION_ID=your_square_location_id
```

## Setup Instructions

### 1. Install Square SDK
```bash
cd server
npm install square
```

### 2. Configure Square Account
- Create Square Developer account
- Get Application ID from Square Dashboard
- Get Access Token from Square Dashboard
- Get Location ID from Square Dashboard

### 3. Set Environment Variables
Copy `.env.example` to `.env` and fill in Square credentials

### 4. Test Payments

**Sandbox Test Cards:**
- Visa: 4111 1111 1111 1111
- Mastercard: 5105 1051 0510 5100
- Amex: 3782 822463 10005
- Any future expiry date
- Any CVV

## Payment Flow

### Card/Apple Pay/Google Pay
1. Customer enters payment details
2. Square Web Payments SDK tokenizes payment
3. Token sent to Creamy Chills backend
4. Backend calls Square Payments API
5. Payment processed by Square
6. Creamy Chills records payment in database
7. Order status updated to CONFIRMED
8. Customer receives confirmation + receipt

### Cash on Collection
1. Customer selects cash on collection
2. Order created with PENDING payment status
3. Cash transaction recorded in Square (for reporting)
4. Customer picks up order
5. Staff confirms cash received via admin panel
6. Payment status updated to COMPLETED

### Cash on Delivery
1. Customer selects cash on delivery
2. Order created with PENDING payment status
3. Cash transaction recorded in Square (for reporting)
4. Driver delivers order
5. Driver confirms cash received
6. Payment status updated to COMPLETED

## Refunds

### Full Refund
```javascript
POST /api/payments/refund
{
  "paymentId": "payment_id",
  "reason": "Customer request"
}
```

### Partial Refund
```javascript
POST /api/payments/refund
{
  "paymentId": "payment_id",
  "amount": 5.00,
  "reason": "Item out of stock"
}
```

## Reconciliation

### Daily Report
```javascript
GET /api/payments/reconcile/daily?date=2025-01-15

Response:
{
  "date": "2025-01-15",
  "summary": {
    "totalPayments": 45,
    "totalAmount": 892.50,
    "byMethod": {
      "CARD": { "count": 25, "amount": 550.00 },
      "APPLE_PAY": { "count": 10, "amount": 200.00 },
      "GOOGLE_PAY": { "count": 5, "amount": 92.50 },
      "CASH_ON_COLLECTION": { "count": 3, "amount": 30.00 },
      "CASH_ON_DELIVERY": { "count": 2, "amount": 20.00 }
    },
    "byStatus": {
      "COMPLETED": { "count": 40, "amount": 850.00 },
      "PENDING": { "count": 5, "amount": 42.50 }
    }
  },
  "payments": [...]
}
```

## Security

- ✅ Payment tokens never stored
- ✅ Card details tokenized by Square
- ✅ Only last 4 digits stored
- ✅ PCI compliance handled by Square
- ✅ HTTPS required for production
- ✅ Idempotency keys prevent duplicate charges

## Error Handling

All payment responses include:
```javascript
{
  "success": true/false,
  "paymentId": "...",
  "message": "...",
  "error": "..."
}
```

## Testing Checklist

- [ ] Card payment successful
- [ ] Apple Pay payment successful
- [ ] Google Pay payment successful
- [ ] Cash on collection recorded
- [ ] Cash on delivery recorded
- [ ] Cash payment confirmation works
- [ ] Full refund works
- [ ] Partial refund works
- [ ] Payment details retrieved
- [ ] Reconciliation report accurate
- [ ] Customer synced to Square
- [ ] Receipt URL generated
- [ ] Failed payment handled
- [ ] Duplicate payment prevented

## Production Checklist

- [ ] Change SQUARE_ENVIRONMENT to 'production'
- [ ] Use production Square credentials
- [ ] Use production Web Payments SDK URL
- [ ] Enable HTTPS
- [ ] Test with real cards (small amounts)
- [ ] Set up webhook notifications
- [ ] Configure payment receipts email
- [ ] Set up refund notifications
- [ ] Test Apple Pay domain verification
- [ ] Test Google Pay merchant setup

## Support

For Square API issues:
- Documentation: https://developer.squareup.com/docs
- Support: https://squareup.com/help

For Creamy Chills integration issues:
- Check server logs
- Review payment records in database
- Use reconciliation endpoint for debugging
