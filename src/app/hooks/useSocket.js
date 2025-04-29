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
        // Assurez-vous que le code s'exécute uniquement côté client
        if (typeof window === "undefined") return;

        // Configuration Socket.IO pour se connecter au serveur externe sur le port 4000
        const socketInstance = io('http://localhost:4000', {
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        // Gestionnaire d'événements pour la connexion
        socketInstance.on('connect', () => {
            console.log('Connecté au serveur Socket.IO externe', socketInstance.id);
        });

        // Gestionnaire d'événements pour les erreurs de connexion
        socketInstance.on('connect_error', (error) => {
            console.error('Erreur de connexion Socket.IO:', error);
        });

        // Gestionnaire d'événements pour les mises à jour du score
        socketInstance.on('scoreUpdate', (newScoreState) => {
            console.log('Mise à jour du score reçue:', newScoreState);
            setScoreState(newScoreState);
        });

        // Définition du socket dans l'état
        setSocket(socketInstance);

        // Nettoyage à la destruction du composant
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Fonction pour mettre à jour le score
    const updateScore = (newScoreState) => {
        if (socket) {
            socket.emit('updateScore', newScoreState);
        }
    };

    return { socket, scoreState, updateScore };
}

export default useSocket;