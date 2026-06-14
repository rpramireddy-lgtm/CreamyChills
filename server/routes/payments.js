const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const squarePaymentService = require('../services/squarePaymentService');

// Process card/Apple Pay/Google Pay payment
router.post('/process', async (req, res) => {
  try {
    const { 
      orderId, 
      sourceId, // Square nonce from Web Payments SDK
      paymentMethod, // 'CARD', 'APPLE_PAY', 'GOOGLE_PAY'
      amount,
      customerEmail,
      customerName
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Sync customer to Square
    let squareCustomerId = null;
    if (customerEmail) {
      const customerResult = await squarePaymentService.syncCustomer({
        email: customerEmail,
        givenName: customerName?.split(' ')[0],
        familyName: customerName?.split(' ').slice(1).join(' '),
        phoneNumber: order.customer?.phone
      });
      if (customerResult.success) {
        squareCustomerId = customerResult.customerId;
      }
    }

    // Process payment through Square
    const paymentResult = await squarePaymentService.createPayment({
      sourceId,
      amount,
      orderId: order._id.toString(),
      customerId: squareCustomerId,
      metadata: {
        paymentMethod,
        customerEmail
      }
    });

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        error: paymentResult.error
      });
    }

    // Create payment record
    const payment = new Payment({
      order: orderId,
      paymentMethod,
      amount,
      status: 'COMPLETED',
      squarePaymentId: paymentResult.paymentId,
      squareCustomerId,
      squareReceiptUrl: paymentResult.receiptUrl,
      cardBrand: paymentResult.cardDetails?.card?.cardBrand,
      cardLast4: paymentResult.cardDetails?.card?.last4,
      completedAt: new Date()
    });

    await payment.save();

    // Update order status
    order.status = 'CONFIRMED';
    order.payment = {
      method: paymentMethod,
      status: 'COMPLETED',
      transactionId: paymentResult.paymentId
    };
    await order.save();

    res.json({
      success: true,
      paymentId: payment._id,
      squarePaymentId: paymentResult.paymentId,
      receiptUrl: paymentResult.receiptUrl,
      order: order
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Payment processing failed',
      error: error.message 
    });
  }
});

// Process cash payment (on collection or delivery)
router.post('/cash', async (req, res) => {
  try {
    const { 
      orderId, 
      paymentMethod, // 'CASH_ON_COLLECTION' or 'CASH_ON_DELIVERY'
      amount 
    } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Record cash payment in Square for reporting
    const squareResult = await squarePaymentService.recordCashPayment({
      amount,
      orderId: order._id.toString(),
      paymentType: paymentMethod
    });

    // Create payment record
    const payment = new Payment({
      order: orderId,
      paymentMethod,
      amount,
      status: 'PENDING', // Will be completed when cash is received
      squarePaymentId: squareResult.paymentId,
      paymentNote: `${paymentMethod} - Payment pending`
    });

    await payment.save();

    // Update order
    order.payment = {
      method: paymentMethod,
      status: 'PENDING'
    };
    await order.save();

    res.json({
      success: true,
      paymentId: payment._id,
      message: 'Cash payment recorded',
      order: order
    });

  } catch (error) {
    console.error('Cash payment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Cash payment recording failed',
      error: error.message 
    });
  }
});

// Confirm cash payment received
router.post('/cash/:paymentId/confirm', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('order');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'COMPLETED';
    payment.completedAt = new Date();
    await payment.save();

    const order = payment.order;
    order.status = 'CONFIRMED';
    order.payment.status = 'COMPLETED';
    await order.save();

    res.json({
      success: true,
      payment,
      order
    });

  } catch (error) {
    console.error('Cash confirmation error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Cash confirmation failed',
      error: error.message 
    });
  }
});

// Refund payment
router.post('/refund', async (req, res) => {
  try {
    const { paymentId, amount, reason } = req.body;

    const payment = await Payment.findById(paymentId).populate('order');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (!payment.squarePaymentId) {
      return res.status(400).json({ 
        message: 'Cannot refund cash payments through this endpoint' 
      });
    }

    // Process refund through Square
    const refundResult = await squarePaymentService.refundPayment({
      paymentId: payment.squarePaymentId,
      amount: amount || payment.amount,
      reason,
      orderId: payment.order._id.toString()
    });

    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Refund failed',
        error: refundResult.error
      });
    }

    // Update payment record
    const refundAmount = amount || payment.amount;
    payment.refundedAmount += refundAmount;
    payment.refunds.push({
      refundId: refundResult.refundId,
      amount: refundAmount,
      reason,
      refundedAt: new Date()
    });

    if (payment.refundedAmount >= payment.amount) {
      payment.status = 'REFUNDED';
    } else {
      payment.status = 'PARTIALLY_REFUNDED';
    }

    await payment.save();

    // Update order
    const order = payment.order;
    order.status = 'REFUNDED';
    await order.save();

    res.json({
      success: true,
      refundId: refundResult.refundId,
      payment,
      order
    });

  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Refund failed',
      error: error.message 
    });
  }
});

// Get payment details
router.get('/:paymentId', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate('order');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// List payments for order
router.get('/order/:orderId', async (req, res) => {
  try {
    const payments = await Payment.find({ order: req.params.orderId });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reconciliation endpoint - list all payments
router.get('/reconcile/daily', async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const payments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('order');

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      byMethod: {
        CARD: { count: 0, amount: 0 },
        APPLE_PAY: { count: 0, amount: 0 },
        GOOGLE_PAY: { count: 0, amount: 0 },
        CASH_ON_COLLECTION: { count: 0, amount: 0 },
        CASH_ON_DELIVERY: { count: 0, amount: 0 }
      },
      byStatus: {
        COMPLETED: { count: 0, amount: 0 },
        PENDING: { count: 0, amount: 0 },
        FAILED: { count: 0, amount: 0 },
        REFUNDED: { count: 0, amount: 0 }
      }
    };

    payments.forEach(payment => {
      if (summary.byMethod[payment.paymentMethod]) {
        summary.byMethod[payment.paymentMethod].count++;
        summary.byMethod[payment.paymentMethod].amount += payment.amount;
      }
      
      if (summary.byStatus[payment.status]) {
        summary.byStatus[payment.status].count++;
        summary.byStatus[payment.status].amount += payment.amount;
      }
    });

    res.json({
      date: startDate.toISOString().split('T')[0],
      summary,
      payments
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
