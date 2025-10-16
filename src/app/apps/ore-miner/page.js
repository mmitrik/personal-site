'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';

export default function OreMiner() {
  const [oreCount, setOreCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);

  // Pick upgrade progression
  const pickUpgrades = [
    { name: 'Iron Pick', efficiency: 1, cost: 0, emoji: '⛏️' },
    { name: 'Steel Pick', efficiency: 2, cost: 100, emoji: '🔨' },
    { name: 'Titanium Pick', efficiency: 3, cost: 300, emoji: '⚒️' },
    { name: 'Tungsten Pick', efficiency: 5, cost: 800, emoji: '🛠️' },
    { name: 'Diamond Pick', efficiency: 8, cost: 2000, emoji: '💎' }
  ];

  const currentPick = pickUpgrades[currentPickIndex];
  const nextPick = pickUpgrades[currentPickIndex + 1];

  const mineOre = () => {
    setClickCount(prev => prev + 1);
    setOreCount(prev => prev + currentPick.efficiency);
  };

  const buyUpgrade = () => {
    if (nextPick && oreCount >= nextPick.cost) {
      setOreCount(prev => prev - nextPick.cost);
      setCurrentPickIndex(prev => prev + 1);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto p-8 pt-16">
        <Header />

        {/* Game Section */}
        <section className="bg-surface p-10 rounded-2xl shadow-sm">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              ⛏️ Ore Miner
            </h1>
            <p className="text-muted text-lg">
              Click the button to mine ore and build your collection!
            </p>
          </div>

          {/* Ore Counter */}
          <div className="text-center mb-8">
            <div className="bg-bg p-8 rounded-2xl shadow-sm border border-border">
              <h2 className="text-2xl font-semibold text-text mb-4">Ore Collected</h2>
              <div className="text-6xl font-bold text-accent mb-2">
                {oreCount.toLocaleString()}
              </div>
              <p className="text-muted">
                {oreCount === 0 ? 'No ore collected yet' : 
                 oreCount === 1 ? '1 piece of ore' : 
                 `${oreCount.toLocaleString()} pieces of ore`}
              </p>
            </div>
          </div>

          {/* Mine Button */}
          <div className="text-center mb-8">
            <button
              onClick={mineOre}
              className="btn text-2xl px-12 py-6 transform transition-transform hover:scale-105 active:scale-95"
            >
              {currentPick.emoji} Mine Ore
            </button>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-bg p-4 rounded-lg border border-border text-center">
              <h3 className="font-semibold text-text mb-2">Total Clicks</h3>
              <p className="text-accent text-xl font-bold">{clickCount.toLocaleString()}</p>
            </div>
            <div className="bg-bg p-4 rounded-lg border border-border text-center">
              <h3 className="font-semibold text-text mb-2">Efficiency</h3>
              <p className="text-accent text-xl font-bold">{currentPick.efficiency} ore/click</p>
            </div>
            <div className="bg-bg p-4 rounded-lg border border-border text-center">
              <h3 className="font-semibold text-text mb-2">Mining Level</h3>
              <p className="text-accent text-xl font-bold">
                {oreCount < 10 ? 'Beginner' : 
                 oreCount < 50 ? 'Apprentice' : 
                 oreCount < 100 ? 'Skilled' : 
                 oreCount < 500 ? 'Expert' : 'Master'}
              </p>
            </div>
          </div>
        </section>

        {/* Upgrades Section */}
        <section className="mt-8 bg-surface p-8 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-semibold text-text mb-6 text-center">Upgrades</h2>
          
          {/* Current Pick */}
          <div className="bg-bg p-6 rounded-lg border border-border mb-6">
            <h3 className="text-lg font-semibold text-text mb-4 text-center">Current Pick</h3>
            <div className="text-center">
              <div className="text-4xl mb-2">{currentPick.emoji}</div>
              <h4 className="text-xl font-bold text-accent mb-2">{currentPick.name}</h4>
              <p className="text-muted">Efficiency: {currentPick.efficiency} ore/click</p>
            </div>
          </div>

          {/* Next Upgrade */}
          {nextPick ? (
            <div className="bg-bg p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-text mb-4 text-center">Next Upgrade</h3>
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-3xl mb-2">{nextPick.emoji}</div>
                  <h4 className="text-lg font-bold text-text mb-1">{nextPick.name}</h4>
                  <p className="text-muted text-sm">Efficiency: {nextPick.efficiency} ore/click</p>
                  <p className="text-accent text-sm font-semibold">+{nextPick.efficiency - currentPick.efficiency} ore/click</p>
                </div>
                <div className="text-center">
                  <button
                    onClick={buyUpgrade}
                    disabled={oreCount < nextPick.cost}
                    className={`btn px-6 py-3 ${
                      oreCount >= nextPick.cost 
                        ? 'hover:scale-105 active:scale-95' 
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    Buy for {nextPick.cost.toLocaleString()} ore
                  </button>
                  <p className="text-muted text-xs mt-2">
                    {oreCount >= nextPick.cost 
                      ? 'Ready to upgrade!' 
                      : `Need ${(nextPick.cost - oreCount).toLocaleString()} more ore`
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-bg p-6 rounded-lg border border-border text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-text mb-2">Max Level Reached!</h3>
              <p className="text-muted">You have the ultimate mining pick!</p>
            </div>
          )}
        </section>

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>🎮 How to Play:</strong> Click the "Mine Ore" button to collect ore. 
            Watch your collection grow and upgrade your pick for better efficiency!
          </p>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">Ore Miner v0.01</p>
        </footer>
      </div>
    </main>
  );
}