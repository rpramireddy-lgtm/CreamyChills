const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // Customer joins their order room
    socket.on('track-order', (orderId) => {
      socket.join(`order-${orderId}`);
    });

    // Staff joins admin room
    socket.on('join-admin', () => {
      socket.join('admin');
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

const emitOrderUpdate = (orderId, data) => {
  if (io) {
    io.to(`order-${orderId}`).emit('order-status', data);
    io.to('admin').emit('order-update', { orderId, ...data });
  }
};

const emitNewOrder = (order) => {
  if (io) {
    io.to('admin').emit('new-order', order);
  }
};

module.exports = { initSocket, emitOrderUpdate, emitNewOrder };
