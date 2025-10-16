'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';

export default function OreMiner() {
  const [oreCount, setOreCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [autoMinerCount, setAutoMinerCount] = useState(0);

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

  // Auto miner functions
  const getAutoMinerCost = () => {
    return Math.floor(150 * Math.pow(1.5, autoMinerCount));
  };

  const buyAutoMiner = () => {
    const cost = getAutoMinerCost();
    if (oreCount >= cost) {
      setOreCount(prev => prev - cost);
      setAutoMinerCount(prev => prev + 1);
    }
  };

  // Auto mining effect - runs every second
  useEffect(() => {
    if (autoMinerCount > 0) {
      const interval = setInterval(() => {
        setOreCount(prev => prev + (autoMinerCount * currentPick.efficiency));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoMinerCount, currentPick.efficiency]);

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
          
          <div className="space-y-6">
            {/* Pick Upgrades Row */}
            <div className="bg-bg p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-text mb-6">Pick Upgrades</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Pick */}
                <div className="bg-surface p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-text mb-4 text-center">Current Pick</h4>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{currentPick.emoji}</div>
                    <h5 className="text-xl font-bold text-accent mb-2">{currentPick.name}</h5>
                    <p className="text-muted">Efficiency: {currentPick.efficiency} ore/click</p>
                  </div>
                </div>

                {/* Next Pick Upgrade */}
                {nextPick ? (
                  <div className="bg-surface p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-text mb-4 text-center">Next Upgrade</h4>
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">{nextPick.emoji}</div>
                      <h5 className="text-lg font-bold text-text mb-1">{nextPick.name}</h5>
                      <p className="text-muted text-sm">Efficiency: {nextPick.efficiency} ore/click</p>
                      <p className="text-accent text-sm font-semibold">+{nextPick.efficiency - currentPick.efficiency} ore/click</p>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={buyUpgrade}
                        disabled={oreCount < nextPick.cost}
                        className={`btn px-6 py-3 w-full ${
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
                ) : (
                  <div className="bg-surface p-4 rounded-lg text-center">
                    <div className="text-4xl mb-4">🏆</div>
                    <h4 className="text-lg font-semibold text-text mb-2">Max Level Reached!</h4>
                    <p className="text-muted">You have the ultimate mining pick!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Auto Miners Row */}
            <div className="bg-bg p-6 rounded-lg border border-border">
              <h3 className="text-xl font-semibold text-text mb-6">Auto Miners</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Auto Miners */}
                <div className="bg-surface p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-text mb-4 text-center">Auto Picks Owned</h4>
                  <div className="text-center">
                    <div className="text-4xl mb-2">⚙️</div>
                    <h5 className="text-xl font-bold text-accent mb-2">{autoMinerCount}</h5>
                    <p className="text-muted">
                      {autoMinerCount === 0 
                        ? 'No auto miners yet' 
                        : `${autoMinerCount * currentPick.efficiency} ore/second`
                      }
                    </p>
                  </div>
                </div>

                {/* Buy Auto Miner */}
                <div className="bg-surface p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-text mb-4 text-center">Buy Auto Pick</h4>
                  <div className="text-center mb-4">
                    <div className="text-3xl mb-2">⚙️</div>
                    <h5 className="text-lg font-bold text-text mb-1">Auto Pick</h5>
                    <p className="text-muted text-sm">Mines {currentPick.efficiency} ore/second</p>
                    <p className="text-accent text-sm font-semibold">Passive income!</p>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={buyAutoMiner}
                      disabled={oreCount < getAutoMinerCost()}
                      className={`btn px-6 py-3 w-full ${
                        oreCount >= getAutoMinerCost() 
                          ? 'hover:scale-105 active:scale-95' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      Buy for {getAutoMinerCost().toLocaleString()} ore
                    </button>
                    <p className="text-muted text-xs mt-2">
                      {oreCount >= getAutoMinerCost() 
                        ? 'Ready to buy!' 
                        : `Need ${(getAutoMinerCost() - oreCount).toLocaleString()} more ore`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>🎮 How to Play:</strong> Click the &quot;Mine Ore&quot; button to collect ore. 
            Upgrade your pick for better efficiency and buy Auto Picks for passive ore generation!
          </p>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">Ore Miner v0.02</p>
        </footer>
      </div>
    </main>
  );
}