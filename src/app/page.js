'use client';

import React, { useEffect } from 'react';
import useSocket from './hooks/useSocket';
import { formatGameClock, formatShotClock } from './utils/formatTime';
import Link from 'next/link';

export default function Scoreboard() {
  const { scoreState } = useSocket();
  const { homeTeam, awayTeam, period, shotClock, gameClock, isClockRunning } = scoreState;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-4xl font-bold mb-10">Basketball Scoreboard</h1>

      <div className="w-full max-w-4xl border-4 border-yellow-500 rounded-lg p-6 bg-gray-900">
        {/* Header with period information and timers */}
        <div className="flex justify-between mb-8 text-5xl font-bold">
          <div className="text-center p-2 bg-gray-800 rounded-lg w-1/4">
            <div className="text-lg font-normal">Period</div>
            <div>{period}</div>
          </div>

          <div className="text-center p-2 bg-gray-800 rounded-lg w-1/2">
            <div className="text-lg font-normal">Game Time</div>
            <div className={isClockRunning ? "text-green-500" : "text-red-500"}>
              {formatGameClock(gameClock)}
            </div>
          </div>

          <div className="text-center p-2 bg-gray-800 rounded-lg w-1/4">
            <div className="text-lg font-normal">Shot</div>
            <div className={shotClock <= 5 && shotClock > 0 ? "text-red-500" : ""}>
              {formatShotClock(shotClock)}
            </div>
          </div>
        </div>

        {/* Team scores */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Home team */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{homeTeam.name}</div>
            <div className="text-8xl font-bold mb-4">{homeTeam.score}</div>
            <div className="flex justify-between text-2xl">
              <div>
                <div className="text-sm">Fouls</div>
                <div className="font-semibold">{homeTeam.fouls}</div>
              </div>
              <div>
                <div className="text-sm">Timeouts</div>
                <div className="font-semibold">{homeTeam.timeouts}</div>
              </div>
            </div>
          </div>

          {/* Away team */}
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{awayTeam.name}</div>
            <div className="text-8xl font-bold mb-4">{awayTeam.score}</div>
            <div className="flex justify-between text-2xl">
              <div>
                <div className="text-sm">Fouls</div>
                <div className="font-semibold">{awayTeam.fouls}</div>
              </div>
              <div>
                <div className="text-sm">Timeouts</div>
                <div className="font-semibold">{awayTeam.timeouts}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-400">
          <Link href="/admin" className="text-blue-500 underline">
            Referee Access
          </Link>
        </div>
      </div>
    </main>
  );
}
