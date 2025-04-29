'use client';

import { useState } from 'react';

export default function LoginForm({ onLogin }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Mot de passe simple (dans un cas réel, utilisez une authentification plus sécurisée)
    const ADMIN_PASSWORD = 'arbitre123';

    const handleSubmit = (e) => {
        e.preventDefault();

        if (password === ADMIN_PASSWORD) {
            onLogin();
            setError('');
        } else {
            setError('Mot de passe incorrect');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-300">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Accès Arbitre</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-400 text-gray-900 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            placeholder="Entrez le mot de passe"
                            required
                            aria-describedby={error ? "password-error" : undefined}
                        />
                    </div>

                    {error && (
                        <div id="password-error" className="text-red-700 text-sm font-medium" role="alert">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
                            aria-label="Se connecter à l'interface arbitre"
                        >
                            Se connecter
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-center text-sm text-gray-700">
                    Cette page est réservée aux arbitres
                </div>
            </div>
        </div>
    );
}