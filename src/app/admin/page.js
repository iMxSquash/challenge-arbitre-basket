'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSocket from '../hooks/useSocket';
import { formatGameClock, formatShotClock } from '../utils/formatTime';
import Link from 'next/link';
import LoginForm from '../components/LoginForm';

export default function AdminPanel() {
    const { scoreState, updateScore } = useSocket();
    const [localState, setLocalState] = useState(scoreState);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const gameClockInterval = useRef(null);
    const shotClockInterval = useRef(null);

    // Synchronisation de l'état local avec l'état global du score
    useEffect(() => {
        setLocalState(scoreState);
    }, [scoreState]);

    // Effet pour gérer les chronomètres
    useEffect(() => {
        // Vérifier si l'utilisateur est connecté dans localStorage
        const adminLoggedIn = localStorage.getItem('basketballAdminLoggedIn');
        if (adminLoggedIn === 'true') {
            setIsLoggedIn(true);
        }

        // Nettoyage des intervalles à la destruction du composant
        return () => {
            if (gameClockInterval.current) clearInterval(gameClockInterval.current);
            if (shotClockInterval.current) clearInterval(shotClockInterval.current);
        };
    }, []);

    // Fonction de connexion
    const handleLogin = () => {
        setIsLoggedIn(true);
        localStorage.setItem('basketballAdminLoggedIn', 'true');
    };

    // Si l'utilisateur n'est pas connecté, afficher le formulaire de connexion
    if (!isLoggedIn) {
        return <LoginForm onLogin={handleLogin} />;
    }

    // Déconnexion
    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('basketballAdminLoggedIn');
    };

    // Démarrer/arrêter les chronomètres
    const toggleClock = () => {
        const newState = {
            ...localState,
            isClockRunning: !localState.isClockRunning
        };

        setLocalState(newState);
        updateScore(newState);

        if (!localState.isClockRunning) {
            // Démarrer les chronomètres
            gameClockInterval.current = setInterval(() => {
                setLocalState(prev => {
                    if (prev.gameClock <= 0) {
                        clearInterval(gameClockInterval.current);
                        return prev;
                    }

                    const newState = {
                        ...prev,
                        gameClock: Math.max(0, prev.gameClock - 1)
                    };

                    updateScore(newState);
                    return newState;
                });
            }, 1000);

            shotClockInterval.current = setInterval(() => {
                setLocalState(prev => {
                    if (prev.shotClock <= 0) {
                        clearInterval(shotClockInterval.current);
                        return prev;
                    }

                    const newState = {
                        ...prev,
                        shotClock: Math.max(0, prev.shotClock - 1)
                    };

                    updateScore(newState);
                    return newState;
                });
            }, 1000);
        } else {
            // Arrêter les chronomètres
            if (gameClockInterval.current) clearInterval(gameClockInterval.current);
            if (shotClockInterval.current) clearInterval(shotClockInterval.current);
        }
    };

    // Réinitialiser le chronomètre des tirs
    const resetShotClock = (value = 24) => {
        const newState = { ...localState, shotClock: value };
        setLocalState(newState);
        updateScore(newState);
    };

    // Mise à jour du score d'une équipe
    const updateTeamScore = (team, operation) => {
        const newState = { ...localState };

        if (team === 'home') {
            if (operation === '+1') newState.homeTeam.score += 1;
            else if (operation === '+2') newState.homeTeam.score += 2;
            else if (operation === '+3') newState.homeTeam.score += 3;
            else if (operation === '-1' && newState.homeTeam.score > 0) newState.homeTeam.score -= 1;
        } else {
            if (operation === '+1') newState.awayTeam.score += 1;
            else if (operation === '+2') newState.awayTeam.score += 2;
            else if (operation === '+3') newState.awayTeam.score += 3;
            else if (operation === '-1' && newState.awayTeam.score > 0) newState.awayTeam.score -= 1;
        }

        setLocalState(newState);
        updateScore(newState);
    };

    // Mise à jour des fautes d'équipe
    const updateTeamFouls = (team, operation) => {
        const newState = { ...localState };

        if (team === 'home') {
            if (operation === '+' && newState.homeTeam.fouls < 99) newState.homeTeam.fouls += 1;
            else if (operation === '-' && newState.homeTeam.fouls > 0) newState.homeTeam.fouls -= 1;
        } else {
            if (operation === '+' && newState.awayTeam.fouls < 99) newState.awayTeam.fouls += 1;
            else if (operation === '-' && newState.awayTeam.fouls > 0) newState.awayTeam.fouls -= 1;
        }

        setLocalState(newState);
        updateScore(newState);
    };

    // Mise à jour des temps morts
    const updateTeamTimeouts = (team, operation) => {
        const newState = { ...localState };

        if (team === 'home') {
            if (operation === '+' && newState.homeTeam.timeouts < 9) newState.homeTeam.timeouts += 1;
            else if (operation === '-' && newState.homeTeam.timeouts > 0) newState.homeTeam.timeouts -= 1;
        } else {
            if (operation === '+' && newState.awayTeam.timeouts < 9) newState.awayTeam.timeouts += 1;
            else if (operation === '-' && newState.awayTeam.timeouts > 0) newState.awayTeam.timeouts -= 1;
        }

        setLocalState(newState);
        updateScore(newState);
    };

    // Changement de période
    const changePeriod = (operation) => {
        const newState = { ...localState };

        if (operation === '+' && newState.period < 4) newState.period += 1;
        else if (operation === '-' && newState.period > 1) newState.period -= 1;

        setLocalState(newState);
        updateScore(newState);
    };

    // Réinitialisation de l'horloge de jeu
    const resetGameClock = () => {
        const newState = { ...localState, gameClock: 600 }; // 10:00
        setLocalState(newState);
        updateScore(newState);
    };

    // Modification des noms d'équipe
    const changeTeamName = (team, newName) => {
        const newState = { ...localState };

        if (team === 'home') {
            newState.homeTeam.name = newName;
        } else {
            newState.awayTeam.name = newName;
        }

        setLocalState(newState);
        updateScore(newState);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-6 bg-gray-100">
            <div className="flex justify-between items-center w-full max-w-6xl mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Interface Arbitre - Tableau de Contrôle</h1>
                <button
                    className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={handleLogout}
                    aria-label="Se déconnecter de l'interface arbitre"
                >
                    Déconnexion
                </button>
            </div>

            <div className="flex justify-end w-full max-w-6xl mb-4">
                <Link
                    href="/"
                    className="text-blue-700 hover:text-blue-900 font-medium"
                    aria-label="Voir le tableau d'affichage public"
                >
                    Voir le tableau d'affichage
                </Link>
            </div>

            <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6 mb-8">
                {/* État actuel du tableau */}
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                    <div className="bg-gray-200 p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">Période</h3>
                        <div className="text-3xl font-bold text-gray-900">{localState.period}</div>
                    </div>

                    <div className="bg-gray-200 p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">Temps de Jeu</h3>
                        <div className="text-3xl font-bold text-gray-900">{formatGameClock(localState.gameClock)}</div>
                    </div>

                    <div className="bg-gray-200 p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">Chrono de Tir</h3>
                        <div className="text-3xl font-bold text-gray-900">{formatShotClock(localState.shotClock)}</div>
                    </div>
                </div>

                {/* Contrôles des chronomètres */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="border border-gray-300 rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Contrôle du Temps</h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={`px-4 py-2 rounded font-bold text-white ${localState.isClockRunning ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${localState.isClockRunning ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
                                onClick={toggleClock}
                                aria-label={localState.isClockRunning ? "Arrêter le chronomètre" : "Démarrer le chronomètre"}
                            >
                                {localState.isClockRunning ? 'ARRÊTER' : 'DÉMARRER'}
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={resetGameClock}
                                aria-label="Réinitialiser l'horloge à 10:00"
                            >
                                Réinitialiser (10:00)
                            </button>
                        </div>
                    </div>

                    <div className="border border-gray-300 rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Chrono des Tirs</h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => resetShotClock(24)}
                                aria-label="Réinitialiser le chronomètre des tirs à 24 secondes"
                            >
                                24 secondes
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => resetShotClock(14)}
                                aria-label="Réinitialiser le chronomètre des tirs à 14 secondes"
                            >
                                14 secondes
                            </button>
                            <button
                                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => resetShotClock(0)}
                                aria-label="Réinitialiser le chronomètre des tirs à 0"
                            >
                                Réinitialiser (0)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contrôle des équipes */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                    {/* Équipe domicile */}
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-1">Nom de l'équipe</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localState.homeTeam.name}
                                    onChange={(e) => changeTeamName('home', e.target.value)}
                                    className="border border-gray-400 text-gray-900 rounded px-2 py-1 w-full"
                                    aria-label="Nom de l'équipe domicile"
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-gray-900">{localState.homeTeam.name}</h3>
                        <div className="text-4xl font-bold mb-4 text-gray-900">{localState.homeTeam.score}</div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '+1')}
                                aria-label="Ajouter 1 point à l'équipe domicile"
                            >
                                +1
                            </button>
                            <button
                                className="bg-red-700 hover:bg-red-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '-1')}
                                aria-label="Soustraire 1 point à l'équipe domicile"
                            >
                                -1
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '+2')}
                                aria-label="Ajouter 2 points à l'équipe domicile"
                            >
                                +2
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '+3')}
                                aria-label="Ajouter 3 points à l'équipe domicile"
                            >
                                +3
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Fautes: {localState.homeTeam.fouls}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('home', '+')}
                                        aria-label="Ajouter une faute à l'équipe domicile"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('home', '-')}
                                        aria-label="Soustraire une faute à l'équipe domicile"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Temps morts: {localState.homeTeam.timeouts}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('home', '+')}
                                        aria-label="Ajouter un temps mort à l'équipe domicile"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('home', '-')}
                                        aria-label="Soustraire un temps mort à l'équipe domicile"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Équipe visiteur */}
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-1">Nom de l'équipe</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localState.awayTeam.name}
                                    onChange={(e) => changeTeamName('away', e.target.value)}
                                    className="border border-gray-400 text-gray-900 rounded px-2 py-1 w-full"
                                    aria-label="Nom de l'équipe visiteur"
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-gray-900">{localState.awayTeam.name}</h3>
                        <div className="text-4xl font-bold mb-4 text-gray-900">{localState.awayTeam.score}</div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '+1')}
                                aria-label="Ajouter 1 point à l'équipe visiteur"
                            >
                                +1
                            </button>
                            <button
                                className="bg-red-700 hover:bg-red-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '-1')}
                                aria-label="Soustraire 1 point à l'équipe visiteur"
                            >
                                -1
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '+2')}
                                aria-label="Ajouter 2 points à l'équipe visiteur"
                            >
                                +2
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '+3')}
                                aria-label="Ajouter 3 points à l'équipe visiteur"
                            >
                                +3
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Fautes: {localState.awayTeam.fouls}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('away', '+')}
                                        aria-label="Ajouter une faute à l'équipe visiteur"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('away', '-')}
                                        aria-label="Soustraire une faute à l'équipe visiteur"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Temps morts: {localState.awayTeam.timeouts}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('away', '+')}
                                        aria-label="Ajouter un temps mort à l'équipe visiteur"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('away', '-')}
                                        aria-label="Soustraire un temps mort à l'équipe visiteur"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contrôle de la période */}
                <div className="border border-gray-300 rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Période</h2>
                    <div className="flex gap-4 items-center">
                        <div className="text-2xl font-bold text-gray-900">Période {localState.period}</div>
                        <div className="flex gap-2">
                            <button
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => changePeriod('-')}
                                aria-label="Passer à la période précédente"
                            >
                                Période précédente
                            </button>
                            <button
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => changePeriod('+')}
                                aria-label="Passer à la période suivante"
                            >
                                Période suivante
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}