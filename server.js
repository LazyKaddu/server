const http = require('http');
const socketIo = require('socket.io');

// Create an HTTP server
const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5173","http://localhost:3000"], // Allow requests from these origins
        methods: ["GET", "POST"]
    }
});

const groups = {}; // To store group memberships

io.on('connection', (socket) => {
    console.log('a user connected');

    // Listen for joining a group
    socket.on('joinGroup', (data) => {
        const { userId, groupId } = data;
        console.log(`User ${userId} is trying to join group ${groupId}`); // Debug log

        if (!groups[groupId]) {
            groups[groupId] = new Set(); // Create a new group if it doesn't exist
        }
        groups[groupId].add(userId); // Add user to the group
        socket.join(groupId); // Join the socket to the group
        console.log(`User ${userId} joined group ${groupId}`); // Confirm join

        // Emit an event to the frontend with user data and groupId
        socket.emit('groupJoined', { userId, groupId });
    });

    socket.on("sendContent", (data) => {
        console.log(data);
        socket.to(data.groupId).emit(data);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('listening on *:3000');
});
