const https = require('https');
const http = require('http');

class WebhookService {
  async notifyNewOrder(order) {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    const message = `🍦 *New Order!* ${order.orderNumber}\n£${order.total?.toFixed(2)} • ${order.items?.length} items • ${order.deliveryMethod === 'pickup' ? 'Collection' : 'Delivery'}`;

    if (slackUrl) {
      await this._postJson(slackUrl, { text: message });
    }

    // WhatsApp via Twilio (if configured)
    if (process.env.TWILIO_SID && process.env.WHATSAPP_TO) {
      console.log(`📱 WhatsApp alert: ${message.replace(/\*/g, '')}`);
    }
  }

  async notifyOrderReady(order) {
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      await this._postJson(slackUrl, { text: `✅ Order ${order.orderNumber} is *READY* for ${order.deliveryMethod === 'pickup' ? 'collection' : 'delivery'}` });
    }
  }

  async _postJson(url, data) {
    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(url);
        const body = JSON.stringify(data);
        const options = {
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        };
        const lib = parsed.protocol === 'https:' ? https : http;
        const req = lib.request(options, (res) => { res.on('data', () => {}); res.on('end', resolve); });
        req.on('error', (e) => { console.warn('Webhook error:', e.message); resolve(); });
        req.write(body);
        req.end();
      } catch (e) { resolve(); }
    });
  }
}

module.exports = new WebhookService();
