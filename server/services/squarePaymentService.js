const { SquareClient, SquareEnvironment } = require('square');

class SquarePaymentService {
  constructor() {
    this.client = new SquareClient({
      token: process.env.SQUARE_ACCESS_TOKEN || '',
      environment: process.env.SQUARE_ENVIRONMENT === 'production' 
        ? SquareEnvironment.Production 
        : SquareEnvironment.Sandbox
    });
  }

  async createPayment({
    sourceId,
    amount,
    currency = 'GBP',
    orderId,
    customerId,
    note,
    metadata = {}
  }) {
    try {
      const amountInPence = Math.round(amount * 100);
      
      const response = await this.client.payments.create({
        sourceId,
        idempotencyKey: `${orderId}-${Date.now()}`,
        amountMoney: {
          amount: BigInt(amountInPence),
          currency
        },
        customerId,
        note: note || `Creamy Chills Order #${orderId}`,
        referenceId: orderId.toString(),
        autocomplete: true,
        locationId: process.env.SQUARE_LOCATION_ID
      });

      const payment = response.payment;
      return {
        success: true,
        paymentId: payment.id,
        status: payment.status,
        receiptUrl: payment.receiptUrl,
        createdAt: payment.createdAt,
        cardDetails: payment.cardDetails
      };
    } catch (error) {
      console.error('Square payment error:', error);
      return {
        success: false,
        error: error.message,
        errors: error.errors
      };
    }
  }

  async syncCustomer({
    email,
    phoneNumber,
    givenName,
    familyName,
    squareCustomerId = null
  }) {
    try {
      if (squareCustomerId) {
        const response = await this.client.customers.update({
          customerId: squareCustomerId,
          emailAddress: email,
          phoneNumber,
          givenName,
          familyName
        });
        return {
          success: true,
          customerId: response.customer.id
        };
      } else {
        const response = await this.client.customers.create({
          idempotencyKey: `${email}-${Date.now()}`,
          emailAddress: email,
          phoneNumber,
          givenName,
          familyName
        });
        return {
          success: true,
          customerId: response.customer.id
        };
      }
    } catch (error) {
      console.error('Square customer sync error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getPayment(paymentId) {
    try {
      const response = await this.client.payments.get({ paymentId });
      return {
        success: true,
        payment: response.payment
      };
    } catch (error) {
      console.error('Get payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async refundPayment({
    paymentId,
    amount,
    reason,
    orderId
  }) {
    try {
      const amountInPence = Math.round(amount * 100);
      
      const response = await this.client.refunds.refundPayment({
        idempotencyKey: `refund-${orderId}-${Date.now()}`,
        paymentId,
        amountMoney: {
          amount: BigInt(amountInPence),
          currency: 'GBP'
        },
        reason
      });

      return {
        success: true,
        refundId: response.refund.id,
        status: response.refund.status
      };
    } catch (error) {
      console.error('Square refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async recordCashPayment({
    amount,
    orderId,
    paymentType,
    metadata = {}
  }) {
    try {
      const amountInPence = Math.round(amount * 100);
      
      const response = await this.client.payments.create({
        sourceId: 'CASH',
        idempotencyKey: `cash-${orderId}-${Date.now()}`,
        amountMoney: {
          amount: BigInt(amountInPence),
          currency: 'GBP'
        },
        note: `${paymentType} - Order #${orderId}`,
        referenceId: orderId.toString(),
        locationId: process.env.SQUARE_LOCATION_ID
      });

      return {
        success: true,
        paymentId: response.payment.id
      };
    } catch (error) {
      console.warn('Cash payment recording skipped:', error.message);
      return {
        success: true,
        paymentId: null,
        note: 'Cash payment recorded locally only'
      };
    }
  }

  async listPayments({ beginTime, endTime, locationId }) {
    try {
      const response = await this.client.payments.list({
        beginTime,
        endTime,
        locationId: locationId || process.env.SQUARE_LOCATION_ID
      });

      return {
        success: true,
        payments: response.payments || []
      };
    } catch (error) {
      console.error('List payments error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SquarePaymentService();
