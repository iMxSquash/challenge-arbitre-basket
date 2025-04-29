'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket() {
    const [socket, setSocket] = useState(null);
    const [scoreState, setScoreState] = useState({
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
        gameClock: 600,
        isClockRunning: false
    });

    useEffect(() => {
        // Make sure the code runs only on the client side
        if (typeof window === "undefined") return;

        // Socket.IO configuration to connect to the external server on port 4000
        const socketInstance = io('http://localhost:4000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        // Event handler for connection
        socketInstance.on('connect', () => {
            console.log('Connected to external Socket.IO server', socketInstance.id);
        });

        // Event handler for connection errors
        socketInstance.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
        });

        // Event handler for score updates
        socketInstance.on('scoreUpdate', (newScoreState) => {
            console.log('Score update received:', newScoreState);
            setScoreState(newScoreState);
        });

        // Set the socket in state
        setSocket(socketInstance);

        // Cleanup when component is unmounted
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Function to update the score
    const updateScore = (newScoreState) => {
        if (socket) {
            socket.emit('updateScore', newScoreState);
        }
    };

    // Function to reset the shot clock
    const resetShotClock = (value = 24) => {
        if (socket) {
            socket.emit('resetShotClock', value);
        }
    };

    // Function to reset the game clock
    const resetGameClock = (value = 600) => {
        if (socket) {
            socket.emit('resetGameClock', value);
        }
    };

    return {
        socket,
        scoreState,
        updateScore,
        resetShotClock,
        resetGameClock,
    };
}

export default useSocket;