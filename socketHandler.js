const Message = require('./models/Message');
const User = require('./models/User');

// Map to store userId -> socketId
const userSocketMap = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Register user
    socket.on('registerUser', async (data) => {
      try {
        const { userId, name, age } = data;

        // Store mapping
        userSocketMap.set(userId, socket.id);
        socket.userId = userId;

        // Find or create user in database
        let user = await User.findOne({ userId });
        if (!user) {
          user = await User.create({ userId, name, age });
        }

        // Join a room with userId
        socket.join(userId);

        console.log(`User registered: ${userId} with socket ${socket.id}`);
        socket.emit('userRegistered', { message: 'Registered successfully' });
      } catch (error) {
        console.error('Error registering user:', error);
        socket.emit('error', { message: 'Registration failed' });
      }
    });

    // Handle user message
    socket.on('userMessage', async (data) => {
      try {
        const { userId, name, age, type, text, url, isAutoCapture } = data;

        // Save message to database
        const message = await Message.create({
          userId,
          sender: 'user',
          type,
          text: type === 'text' ? text : '',
          url: type === 'image' ? url : '',
          isAutoCapture: isAutoCapture || false
        });

        // Update user's last message
        await User.updateOne(
          { userId },
          {
            lastMessageAt: new Date(),
            lastMessagePreview: type === 'text' ? text : '[Image]'
          }
        );

        // Broadcast to admin
        io.emit('newUserMessage', {
          userId,
          name,
          age,
          message: {
            ...message.toObject(),
            id: message._id
          }
        });

        // Acknowledge to user
        socket.emit('messageSent', { id: message._id, timestamp: message.timestamp });
      } catch (error) {
        console.error('Error saving message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle admin reply
    socket.on('adminReply', async (data) => {
      try {
        const { userId, type, text, url, isAutoCapture } = data;

        // Save admin message
        const message = await Message.create({
          userId,
          sender: 'admin',
          type,
          text: type === 'text' ? text : '',
          url: type === 'image' ? url : '',
          isAutoCapture: isAutoCapture || false
        });

        // Send to specific user
        const userSocketId = userSocketMap.get(userId);
        if (userSocketId) {
          io.to(userSocketId).emit('adminMessage', {
            message: {
              ...message.toObject(),
              id: message._id
            }
          });
        }

        // Acknowledge to admin
        socket.emit('adminReplySent', { id: message._id, timestamp: message.timestamp });
      } catch (error) {
        console.error('Error sending admin reply:', error);
        socket.emit('error', { message: 'Failed to send reply' });
      }
    });

    // Handle admin start user auto-capture
    socket.on('startAutoCapture', async (data) => {
      try {
        const { userId } = data;
        const userSocketId = userSocketMap.get(userId);
        
        if (userSocketId) {
          io.to(userSocketId).emit('startAutoCapture');
        }
        
        socket.emit('autoCaptureStartSent', { userId });
      } catch (error) {
        console.error('Error starting auto capture:', error);
        socket.emit('error', { message: 'Failed to start auto capture' });
      }
    });

    // Handle admin stop auto-capture request
    socket.on('stopAutoCapture', async (data) => {
      try {
        const { userId } = data;
        const userSocketId = userSocketMap.get(userId);
        
        if (userSocketId) {
          io.to(userSocketId).emit('stopAutoCapture');
        }
        
        socket.emit('autoCaptureStopSent', { userId });
      } catch (error) {
        console.error('Error stopping auto capture:', error);
        socket.emit('error', { message: 'Failed to stop auto capture' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSocketMap.delete(socket.userId);
        console.log(`User disconnected: ${socket.userId}`);
      }
    });
  });
};

module.exports = { setupSocketHandlers, userSocketMap };
