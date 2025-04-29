import { NextResponse } from 'next/server';

export function middleware(request) {
    // Le middleware s'applique à toutes les requêtes
    return NextResponse.next();
}

// Configurer le matcher pour cibler spécifiquement les routes d'API Socket.IO
export const config = {
    matcher: '/api/socket/:path*',
};