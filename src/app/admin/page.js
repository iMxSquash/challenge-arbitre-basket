'use client';

import React, { useState, useEffect } from 'react';
import useSocket from '../hooks/useSocket';
import { formatGameClock, formatShotClock } from '../utils/formatTime';
import Link from 'next/link';
import LoginForm from '../components/LoginForm';

export default function AdminPanel() {
    const { scoreState, updateScore, resetShotClock, resetGameClock } = useSocket();
    const [localState, setLocalState] = useState(scoreState);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Synchronization of local state with global score state
    useEffect(() => {
        setLocalState(scoreState);
    }, [scoreState]);

    // Effect to check if the user is logged in
    useEffect(() => {
        // Check if the user is logged in from localStorage
        const adminLoggedIn = localStorage.getItem('basketballAdminLoggedIn');
        if (adminLoggedIn === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    // Login function
    const handleLogin = () => {
        setIsLoggedIn(true);
        localStorage.setItem('basketballAdminLoggedIn', 'true');
    };

    // If the user is not logged in, display the login form
    if (!isLoggedIn) {
        return <LoginForm onLogin={handleLogin} />;
    }

    // Logout
    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('basketballAdminLoggedIn');
    };

    // Start/stop timers
    const toggleClock = () => {
        const newState = {
            ...localState,
            isClockRunning: !localState.isClockRunning
        };

        setLocalState(newState);
        updateScore(newState);
    };

    // Update team score
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

    // Update team fouls
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

    // Update timeouts
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

    // Change period
    const changePeriod = (operation) => {
        const newState = { ...localState };

        if (operation === '+' && newState.period < 4) newState.period += 1;
        else if (operation === '-' && newState.period > 1) newState.period -= 1;

        setLocalState(newState);
        updateScore(newState);
    };

    // Change team names
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

    // Function to reset the game clock to 10:00
    const handleResetGameClock = () => {
        resetGameClock(600); // 10 minutes (600 seconds)
    };

    // Function to reset the shot clock
    const handleResetShotClock = (value) => {
        resetShotClock(value);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-6 bg-gray-100">
            <div className="flex justify-between items-center w-full max-w-6xl mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Referee Interface - Control Panel</h1>
                <button
                    className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={handleLogout}
                    aria-label="Log out from referee interface"
                >
                    Logout
                </button>
            </div>

            <div className="flex justify-end w-full max-w-6xl mb-4">
                <Link
                    href="/"
                    className="text-blue-700 hover:text-blue-900 font-medium"
                    aria-label="View public scoreboard"
                >
                    View scoreboard
                </Link>
            </div>

            <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6 mb-8">
                {/* Current scoreboard state */}
                <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                    <div className="bg-gray-200 p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">Period</h3>
                        <div className="text-3xl font-bold text-gray-900">{localState.period}</div>
                    </div>

                    <div className="bg-gray-200 p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">Game Time</h3>
                        <div className="text-3xl font-bold text-gray-900">{formatGameClock(localState.gameClock)}</div>
                    </div>

                    <div className="bg-gray-200 p-4 rounded border border-gray-300">
                        <h3 className="text-lg font-semibold mb-1 text-gray-900">Shot Clock</h3>
                        <div className="text-3xl font-bold text-gray-900">{formatShotClock(localState.shotClock)}</div>
                    </div>
                </div>

                {/* Timer controls */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="border border-gray-300 rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Time Control</h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={`px-4 py-2 rounded font-bold text-white ${localState.isClockRunning ? 'bg-red-700 hover:bg-red-800' : 'bg-green-700 hover:bg-green-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${localState.isClockRunning ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
                                onClick={toggleClock}
                                aria-label={localState.isClockRunning ? "Stop timer" : "Start timer"}
                            >
                                {localState.isClockRunning ? 'STOP' : 'START'}
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={handleResetGameClock}
                                aria-label="Reset clock to 10:00"
                            >
                                Reset (10:00)
                            </button>
                        </div>
                    </div>

                    <div className="border border-gray-300 rounded-lg p-4">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Shot Clock</h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => handleResetShotClock(24)}
                                aria-label="Reset shot clock to 24 seconds"
                            >
                                24 seconds
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={() => handleResetShotClock(14)}
                                aria-label="Reset shot clock to 14 seconds"
                            >
                                14 seconds
                            </button>
                            <button
                                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => handleResetShotClock(0)}
                                aria-label="Reset shot clock to 0"
                            >
                                Reset (0)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Team controls */}
                <div className="grid grid-cols-2 gap-6 mb-4">
                    {/* Home team */}
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-1">Team name</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localState.homeTeam.name}
                                    onChange={(e) => changeTeamName('home', e.target.value)}
                                    className="border border-gray-400 rounded px-2 py-1 w-full"
                                    aria-label="Home team name"
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-gray-900">{localState.homeTeam.name}</h3>
                        <div className="text-4xl font-bold mb-4 text-gray-900">{localState.homeTeam.score}</div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '+1')}
                                aria-label="Add 1 point to home team"
                            >
                                +1
                            </button>
                            <button
                                className="bg-red-700 hover:bg-red-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '-1')}
                                aria-label="Subtract 1 point from home team"
                            >
                                -1
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '+2')}
                                aria-label="Add 2 points to home team"
                            >
                                +2
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('home', '+3')}
                                aria-label="Add 3 points to home team"
                            >
                                +3
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Fouls: {localState.homeTeam.fouls}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('home', '+')}
                                        aria-label="Add a foul to home team"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('home', '-')}
                                        aria-label="Subtract a foul from home team"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Timeouts: {localState.homeTeam.timeouts}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('home', '+')}
                                        aria-label="Add a timeout to home team"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('home', '-')}
                                        aria-label="Subtract a timeout from home team"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Away team */}
                    <div className="border border-gray-300 rounded-lg p-4">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-900 mb-1">Team name</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={localState.awayTeam.name}
                                    onChange={(e) => changeTeamName('away', e.target.value)}
                                    className="border border-gray-400 rounded px-2 py-1 w-full"
                                    aria-label="Away team name"
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-gray-900">{localState.awayTeam.name}</h3>
                        <div className="text-4xl font-bold mb-4 text-gray-900">{localState.awayTeam.score}</div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '+1')}
                                aria-label="Add 1 point to away team"
                            >
                                +1
                            </button>
                            <button
                                className="bg-red-700 hover:bg-red-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '-1')}
                                aria-label="Subtract 1 point from away team"
                            >
                                -1
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '+2')}
                                aria-label="Add 2 points to away team"
                            >
                                +2
                            </button>
                            <button
                                className="bg-green-700 hover:bg-green-800 text-white py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                                onClick={() => updateTeamScore('away', '+3')}
                                aria-label="Add 3 points to away team"
                            >
                                +3
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Fouls: {localState.awayTeam.fouls}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('away', '+')}
                                        aria-label="Add a foul to away team"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamFouls('away', '-')}
                                        aria-label="Subtract a foul from away team"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2 text-gray-900">Timeouts: {localState.awayTeam.timeouts}</h4>
                                <div className="flex gap-2">
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('away', '+')}
                                        aria-label="Add a timeout to away team"
                                    >
                                        +
                                    </button>
                                    <button
                                        className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        onClick={() => updateTeamTimeouts('away', '-')}
                                        aria-label="Subtract a timeout from away team"
                                    >
                                        -
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Period control */}
                <div className="border border-gray-300 rounded-lg p-4">
                    <h2 className="text-xl font-bold mb-4 text-gray-900">Period</h2>
                    <div className="flex gap-4 items-center">
                        <div className="text-2xl font-bold text-gray-900">Period {localState.period}</div>
                        <div className="flex gap-2">
                            <button
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => changePeriod('-')}
                                aria-label="Go to previous period"
                            >
                                Previous period
                            </button>
                            <button
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-bold focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                onClick={() => changePeriod('+')}
                                aria-label="Go to next period"
                            >
                                Next period
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}