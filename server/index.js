const http = require('http');
const { Server } = require('socket.io');

// Configuration pour un état global du score de basketball
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
    gameClock: 600, // 10 minutes (600 secondes) par période
    isClockRunning: false
};

// Variable pour stocker l'état actuel du score
let scoreState = { ...initialScoreState };

// Création d'un serveur HTTP basique
const httpServer = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'Serveur Socket.IO en cours d\'exécution' }));
});

// Création du serveur Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Permettre les connexions depuis le client Next.js
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Événements de connexion Socket.IO
io.on('connection', (socket) => {
    console.log('Client connecté:', socket.id);

    // Envoyer l'état actuel du score au client qui vient de se connecter
    socket.emit('scoreUpdate', scoreState);

    // Gestion de la mise à jour du score
    socket.on('updateScore', (newScoreState) => {
        console.log('Mise à jour du score reçue:', newScoreState);
        scoreState = { ...newScoreState };
        // Diffuser la mise à jour à tous les clients connectés
        io.emit('scoreUpdate', scoreState);
    });

    // Gestion de la déconnexion
    socket.on('disconnect', () => {
        console.log('Client déconnecté:', socket.id);
    });
});

// Définition du port pour le serveur Socket.IO (différent du port 3000 utilisé par Next.js)
const PORT = 4000;

// Démarrage du serveur
httpServer.listen(PORT, () => {
    console.log(`Serveur Socket.IO démarré sur le port ${PORT}`);
});