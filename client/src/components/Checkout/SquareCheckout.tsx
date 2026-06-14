import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Card,
  CardContent,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CreditCard,
  Apple,
  Smartphone,
  Money,
  LocalShipping
} from '@mui/icons-material';

declare global {
  interface Window {
    Square: any;
  }
}

interface SquareCheckoutProps {
  orderId: string;
  amount: number;
  customerEmail: string;
  customerName: string;
  onSuccess: (paymentResult: any) => void;
  onError: (error: string) => void;
}

const SquareCheckout: React.FC<SquareCheckoutProps> = ({
  orderId,
  amount,
  customerEmail,
  customerName,
  onSuccess,
  onError
}) => {
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [payments, setPayments] = useState<any>(null);
  const [card, setCard] = useState<any>(null);
  const [applePay, setApplePay] = useState<any>(null);
  const [googlePay, setGooglePay] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initializeSquare();
  }, []);

  const initializeSquare = async () => {
    if (!window.Square) {
      setError('Square Payments SDK not loaded');
      return;
    }

    try {
      const paymentsInstance = window.Square.payments(
        process.env.REACT_APP_SQUARE_APPLICATION_ID,
        process.env.REACT_APP_SQUARE_LOCATION_ID
      );
      
      setPayments(paymentsInstance);

      // Initialize Card
      const cardInstance = await paymentsInstance.card();
      await cardInstance.attach('#card-container');
      setCard(cardInstance);

      // Initialize Apple Pay
      const paymentRequest = paymentsInstance.paymentRequest({
        countryCode: 'GB',
        currencyCode: 'GBP',
        total: {
          amount: amount.toString(),
          label: 'Creamy Chills'
        }
      });

      const applePayInstance = await paymentsInstance.applePay(paymentRequest);
      setApplePay(applePayInstance);

      // Initialize Google Pay
      const googlePayInstance = await paymentsInstance.googlePay(paymentRequest);
      await googlePayInstance.attach('#google-pay-button');
      setGooglePay(googlePayInstance);

    } catch (e) {
      console.error('Square initialization error:', e);
      setError('Failed to initialize payment methods');
    }
  };

  const handleCardPayment = async () => {
    if (!card) return;

    setLoading(true);
    setError('');

    try {
      const result = await card.tokenize();
      
      if (result.status === 'OK') {
        await processPayment(result.token, 'CARD');
      } else {
        setError('Card tokenization failed');
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleApplePay = async () => {
    if (!applePay) return;

    setLoading(true);
    setError('');

    try {
      const result = await applePay.tokenize();
      
      if (result.status === 'OK') {
        await processPayment(result.token, 'APPLE_PAY');
      } else {
        setError('Apple Pay failed');
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleGooglePay = async () => {
    if (!googlePay) return;

    setLoading(true);
    setError('');

    try {
      const result = await googlePay.tokenize();
      
      if (result.status === 'OK') {
        await processPayment(result.token, 'GOOGLE_PAY');
      } else {
        setError('Google Pay failed');
        setLoading(false);
      }
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  const handleCashPayment = async (type: 'CASH_ON_COLLECTION' | 'CASH_ON_DELIVERY') => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/payments/cash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          paymentMethod: type,
          amount
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data);
      } else {
        setError(data.message || 'Cash payment failed');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (sourceId: string, method: string) => {
    try {
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          sourceId,
          paymentMethod: method,
          amount,
          customerEmail,
          customerName
        })
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data);
      } else {
        setError(data.message || 'Payment failed');
        onError(data.message || 'Payment failed');
      }
    } catch (e: any) {
      setError(e.message);
      onError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 500, color: '#b03160' }}>
        Payment Method
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl component="fieldset" fullWidth>
        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <FormControlLabel
                value="CARD"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard />
                    <Typography>Card Payment</Typography>
                  </Box>
                }
              />
              {paymentMethod === 'CARD' && (
                <Box sx={{ mt: 2 }}>
                  <div id="card-container"></div>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleCardPayment}
                    disabled={loading}
                    sx={{ mt: 2, bgcolor: '#b03160' }}
                  >
                    {loading ? <CircularProgress size={24} /> : `Pay £${amount.toFixed(2)}`}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <FormControlLabel
                value="APPLE_PAY"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Apple />
                    <Typography>Apple Pay</Typography>
                  </Box>
                }
              />
              {paymentMethod === 'APPLE_PAY' && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleApplePay}
                  disabled={loading}
                  sx={{ mt: 2, bgcolor: '#000' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Pay with Apple Pay'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <FormControlLabel
                value="GOOGLE_PAY"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Smartphone />
                    <Typography>Google Pay</Typography>
                  </Box>
                }
              />
              {paymentMethod === 'GOOGLE_PAY' && (
                <div id="google-pay-button" style={{ marginTop: '16px' }}></div>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <FormControlLabel
                value="CASH_ON_COLLECTION"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Money />
                    <Typography>Cash on Collection</Typography>
                  </Box>
                }
              />
              {paymentMethod === 'CASH_ON_COLLECTION' && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleCashPayment('CASH_ON_COLLECTION')}
                  disabled={loading}
                  sx={{ mt: 2, bgcolor: '#b03160' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Confirm Order'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <FormControlLabel
                value="CASH_ON_DELIVERY"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping />
                    <Typography>Cash on Delivery</Typography>
                  </Box>
                }
              />
              {paymentMethod === 'CASH_ON_DELIVERY' && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleCashPayment('CASH_ON_DELIVERY')}
                  disabled={loading}
                  sx={{ mt: 2, bgcolor: '#b03160' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Confirm Order'}
                </Button>
              )}
            </CardContent>
          </Card>
        </RadioGroup>
      </FormControl>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        Total amount: £{amount.toFixed(2)}
      </Typography>
    </Box>
  );
};

export default SquareCheckout;
