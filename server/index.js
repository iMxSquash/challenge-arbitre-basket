const http = require('http');
const { Server } = require('socket.io');

// Configuration for a global basketball score state
const initialScoreState = {
    homeTeam: {
        name: 'Équipe A',
        score: 0,
        fouls: 0,
        timeouts: 5
    },
    awayTeam: {
        name: 'Équipe B',
        score: 0,
        fouls: 0,
        timeouts: 5
    },
    period: 1,
    shotClock: 24,
    gameClock: 600, // 10 minutes (600 seconds) per period
    isClockRunning: false
};

// Variable to store the current score state
let scoreState = { ...initialScoreState };

// Variables for timer intervals
let gameClockInterval = null;
let shotClockInterval = null;

// Function to start the clocks
function startClocks(io) {
    // Stop existing timers if necessary
    stopClocks();

    // Start the game clock
    gameClockInterval = setInterval(() => {
        if (scoreState.gameClock > 0) {
            scoreState.gameClock -= 1;

            // Broadcast the update to all connected clients
            io.emit('scoreUpdate', scoreState);

            // If the timer reaches zero, stop the timers and emit the buzzer event
            if (scoreState.gameClock === 0) {
                stopClocks();
                scoreState.isClockRunning = false;
                io.emit('buzzer', 'gameClock');
                io.emit('scoreUpdate', scoreState);
            }
        }
    }, 1000);

    // Start the shot clock
    shotClockInterval = setInterval(() => {
        if (scoreState.shotClock > 0) {
            scoreState.shotClock -= 1;

            // If the shot clock reaches zero, emit the buzzer event
            if (scoreState.shotClock === 0) {
                io.emit('buzzer', 'shotClock');
            }
        }
    }, 1000);
}

// Function to stop the clocks
function stopClocks() {
    if (gameClockInterval) {
        clearInterval(gameClockInterval);
        gameClockInterval = null;
    }

    if (shotClockInterval) {
        clearInterval(shotClockInterval);
        shotClockInterval = null;
    }
}

// Creation of a basic HTTP server
const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Socket.IO server is running' }));
});

// Creation of the Socket.IO server
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.IO connection events
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Send the current score state to the newly connected client
    socket.emit('scoreUpdate', scoreState);

    // Handling score updates
    socket.on('updateScore', (newScoreState) => {
        console.log('Score update received');

        // If the clock state changes (start/stop)
        if (newScoreState.isClockRunning !== scoreState.isClockRunning) {
            if (newScoreState.isClockRunning) {
                startClocks(io);
            } else {
                stopClocks();
            }
        }

        // Update the score state
        scoreState = { ...scoreState, ...newScoreState };

        // Broadcast the update to all connected clients
        io.emit('scoreUpdate', scoreState);
    });

    // Handling the shot clock reset
    socket.on('resetShotClock', (value = 24) => {
        scoreState.shotClock = value;
        io.emit('scoreUpdate', scoreState);
    });

    // Resetting the game clock
    socket.on('resetGameClock', (value = 600) => {
        scoreState.gameClock = value;
        io.emit('scoreUpdate', scoreState);
    });

    // Handling the manual buzzer
    socket.on('triggerBuzzer', () => {
        io.emit('buzzer', 'manual');
    });

    // Handling disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Setting the port for the Socket.IO server (different from port 3000 used by Next.js)
const PORT = 4000;

// Starting the server
httpServer.listen(PORT, () => {
    console.log(`Socket.IO server started on port ${PORT}`);
});