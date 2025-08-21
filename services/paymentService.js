const Order = require('../models/order');

class PaymentService {
  async processPayment(orderId, paymentMethod, amount) {
    if (!orderId || !paymentMethod || typeof amount !== 'number') {
      throw new Error('Invalid payment parameters');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    // Simulate processing
    let success = false;
    let referenceId = `PMT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    if (paymentMethod === 'cash') {
      // Cash is considered confirmed immediately at point of delivery
      success = true;
    } else {
      // Simulate higher success rate for UPI/Card
      const successRate = paymentMethod === 'upi' || paymentMethod === 'card' ? 0.92 : 0.85;
      success = Math.random() < successRate;
      // Light artificial delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Update order payment status (and optionally advance order status)
    if (success) {
      order.paymentStatus = 'paid';
      if (order.status === 'pending') {
        order.status = 'processing';
      }
    } else {
      order.paymentStatus = 'failed';
    }

    await order.save();

    return {
      success,
      referenceId,
      orderId: order._id,
      paymentStatus: order.paymentStatus
    }; 
  }
}

module.exports = new PaymentService();

