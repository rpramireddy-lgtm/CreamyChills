const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    this.from = process.env.EMAIL_FROM || 'Creamy Chills <orders@creamychills.com>';
  }

  async sendOrderConfirmation(order, email) {
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e8;font-family:'PT Serif',serif">${item.product?.name || item.name} x${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f0e8e8;text-align:right;font-family:'PT Serif',serif">£${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'PT Serif',Georgia,serif">
      <div style="background:#b03160;padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-family:'Poppins',sans-serif;font-weight:500">Creamy Chills</h1>
      </div>
      <div style="padding:30px;background:#ffffff">
        <h2 style="color:#b03160;font-family:'Poppins',sans-serif;font-weight:500;margin-top:0">Order Confirmed ✓</h2>
        <p style="color:#333;line-height:1.6">Thank you for your order! We're preparing your desserts now.</p>
        
        <div style="background:#fff8f4;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 5px;color:#666;font-size:0.9rem">Order Number</p>
          <p style="margin:0;font-weight:600;color:#b03160;font-size:1.2rem">${order.orderNumber}</p>
        </div>

        <table style="width:100%;border-collapse:collapse;margin:20px 0">
          ${itemsHtml}
          <tr>
            <td style="padding:12px 0;font-weight:600">Total</td>
            <td style="padding:12px 0;text-align:right;font-weight:600;color:#b03160;font-size:1.1rem">£${order.total.toFixed(2)}</td>
          </tr>
        </table>

        <div style="background:#fff8f4;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 5px;color:#666;font-size:0.9rem">${order.deliveryMethod === 'pickup' ? 'Collection' : 'Delivery'}</p>
          <p style="margin:0;color:#333">${order.deliveryMethod === 'pickup' ? '60 East Main Street, Broxburn' : order.deliveryAddress?.street + ', ' + order.deliveryAddress?.city}</p>
          ${order.estimatedDeliveryTime ? `<p style="margin:5px 0 0;color:#b03160;font-size:0.9rem">Estimated: ${new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
        </div>
      </div>
      <div style="background:#f8f8f8;padding:20px;text-align:center;font-size:0.85rem;color:#999">
        <p style="margin:0">Creamy Chills • 60 East Main Street, Broxburn, EH52 5EE</p>
      </div>
    </div>`;

    await this._send(email, `Order Confirmed - ${order.orderNumber}`, html);
  }

  async sendOrderStatusUpdate(order, email, status) {
    const statusMessages = {
      confirmed: { title: 'Order Confirmed', msg: 'Your order has been confirmed and is being prepared.' },
      preparing: { title: 'Being Prepared', msg: 'Our team is preparing your delicious desserts!' },
      ready: { title: 'Ready for Collection', msg: 'Your order is ready! Come pick it up at 60 East Main Street, Broxburn.' },
      delivered: { title: 'Delivered', msg: 'Your order has been delivered. Enjoy!' },
      cancelled: { title: 'Order Cancelled', msg: 'Your order has been cancelled. If you were charged, a refund will be processed.' }
    };

    const info = statusMessages[status] || { title: 'Status Update', msg: `Your order status is now: ${status}` };

    const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'PT Serif',Georgia,serif">
      <div style="background:#b03160;padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-family:'Poppins',sans-serif;font-weight:500">Creamy Chills</h1>
      </div>
      <div style="padding:30px;background:#ffffff">
        <h2 style="color:#b03160;font-family:'Poppins',sans-serif;font-weight:500;margin-top:0">${info.title}</h2>
        <p style="color:#333;line-height:1.6">${info.msg}</p>
        <div style="background:#fff8f4;border-radius:8px;padding:20px;margin:20px 0">
          <p style="margin:0 0 5px;color:#666;font-size:0.9rem">Order Number</p>
          <p style="margin:0;font-weight:600;color:#b03160;font-size:1.1rem">${order.orderNumber}</p>
        </div>
      </div>
      <div style="background:#f8f8f8;padding:20px;text-align:center;font-size:0.85rem;color:#999">
        <p style="margin:0">Creamy Chills • 60 East Main Street, Broxburn, EH52 5EE</p>
      </div>
    </div>`;

    await this._send(email, `${info.title} - ${order.orderNumber}`, html);
  }

  async sendWelcomeEmail(user) {
    const html = `
    <div style="max-width:600px;margin:0 auto;font-family:'PT Serif',Georgia,serif">
      <div style="background:#b03160;padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-family:'Poppins',sans-serif;font-weight:500">Creamy Chills</h1>
      </div>
      <div style="padding:30px;background:#ffffff">
        <h2 style="color:#b03160;font-family:'Poppins',sans-serif;font-weight:500;margin-top:0">Welcome, ${user.name}!</h2>
        <p style="color:#333;line-height:1.6">Thank you for joining Creamy Chills. We're excited to have you.</p>
        <p style="color:#333;line-height:1.6">Browse our menu and place your first order today.</p>
        <div style="text-align:center;margin:30px 0">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products" style="background:#b03160;color:white;padding:12px 30px;border-radius:100px;text-decoration:none;font-family:'PT Serif',serif">Browse Menu</a>
        </div>
      </div>
      <div style="background:#f8f8f8;padding:20px;text-align:center;font-size:0.85rem;color:#999">
        <p style="margin:0">Creamy Chills • 60 East Main Street, Broxburn, EH52 5EE</p>
      </div>
    </div>`;

    await this._send(user.email, 'Welcome to Creamy Chills', html);
  }

  async _send(to, subject, html) {
    try {
      if (!process.env.SMTP_USER) {
        console.log(`📧 [EMAIL SKIPPED] To: ${to} | Subject: ${subject}`);
        return;
      }

      await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html
      });
      console.log(`📧 Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error(`📧 Email failed to ${to}:`, error.message);
    }
  }
}

module.exports = new EmailService();
