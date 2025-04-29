import { Server as ServerIO } from 'socket.io';

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

let io;

export async function GET(req) {
    if (process.env.NODE_ENV !== 'production') {
        console.log('GET request to Socket.IO endpoint');
    }

    // Extraction du NextApiResponse depuis la propriété NextRequest
    const res = req.socket?.server;

    if (!res?.io) {
        // Création d'une nouvelle instance de Server Socket.IO
        const path = '/api/socket/io';
        io = new ServerIO(res?.server, {
            path,
            addTrailingSlash: false,
        });

        // Enregistrement de l'instance IO sur l'objet réponse
        res.io = io;

        // Gestion des connexions
        io.on('connection', (socket) => {
            console.log('Client connecté:', socket.id);

            // Envoyer l'état actuel du score au client qui vient de se connecter
            socket.emit('scoreUpdate', scoreState);

            // Gestion de la mise à jour du score
            socket.on('updateScore', (newScoreState) => {
                scoreState = { ...newScoreState };
                io.emit('scoreUpdate', scoreState);
            });

            // Gestion de la déconnexion
            socket.on('disconnect', () => {
                console.log('Client déconnecté:', socket.id);
            });
        });
    }

    return new Response('Socket.IO server is running', { status: 200 });
}