'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';

export default function OreMiner() {
  const [oreCount, setOreCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [autoMinerCount, setAutoMinerCount] = useState(0);
  const [excavatorCount, setExcavatorCount] = useState(0);
  const [excavatorUpgradeIndex, setExcavatorUpgradeIndex] = useState(0);
  const [drillingRigCount, setDrillingRigCount] = useState(0);
  const [drillingRigUpgradeIndex, setDrillingRigUpgradeIndex] = useState(0);
  const [blastingCrewCount, setBlastingCrewCount] = useState(0);
  const [blastingCrewUpgradeIndex, setBlastingCrewUpgradeIndex] = useState(0);

  // Local storage functions
  const saveGameState = () => {
    if (typeof window !== 'undefined') {
      const gameState = {
        oreCount,
        clickCount,
        currentPickIndex,
        autoMinerCount,
        excavatorCount,
        excavatorUpgradeIndex,
        drillingRigCount,
        drillingRigUpgradeIndex,
        blastingCrewCount,
        blastingCrewUpgradeIndex
      };
      localStorage.setItem('oreMinerGameState', JSON.stringify(gameState));
    }
  };

  const loadGameState = () => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('oreMinerGameState');
      if (savedState) {
        const gameState = JSON.parse(savedState);
        setOreCount(gameState.oreCount || 0);
        setClickCount(gameState.clickCount || 0);
        setCurrentPickIndex(gameState.currentPickIndex || 0);
        setAutoMinerCount(gameState.autoMinerCount || 0);
        setExcavatorCount(gameState.excavatorCount || 0);
        setExcavatorUpgradeIndex(gameState.excavatorUpgradeIndex || 0);
        setDrillingRigCount(gameState.drillingRigCount || 0);
        setDrillingRigUpgradeIndex(gameState.drillingRigUpgradeIndex || 0);
        setBlastingCrewCount(gameState.blastingCrewCount || 0);
        setBlastingCrewUpgradeIndex(gameState.blastingCrewUpgradeIndex || 0);
      }
    }
  };

  const resetGameState = () => {
    const confirmed = window.confirm(
      'Are you sure you want to start a new game?\n\nThis will permanently delete all your progress.'
    );
    
    if (confirmed) {
      setOreCount(0);
      setClickCount(0);
      setCurrentPickIndex(0);
      setAutoMinerCount(0);
      setExcavatorCount(0);
      setExcavatorUpgradeIndex(0);
      setDrillingRigCount(0);
      setDrillingRigUpgradeIndex(0);
      setBlastingCrewCount(0);
      setBlastingCrewUpgradeIndex(0);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('oreMinerGameState');
      }
    }
  };

  // Pick upgrade progression
  const pickUpgrades = [
    { name: 'Iron Pick', efficiency: 1, cost: 0, emoji: '⛏️' },
    { name: 'Steel Pick', efficiency: 2, cost: 100, emoji: '🔨' },
    { name: 'Titanium Pick', efficiency: 3, cost: 300, emoji: '⚒️' },
    { name: 'Tungsten Pick', efficiency: 5, cost: 800, emoji: '🛠️' },
    { name: 'Diamond Pick', efficiency: 8, cost: 2000, emoji: '💎' }
  ];

  // Excavator upgrade progression
  const excavatorUpgrades = [
    { name: 'Basic Bucket', multiplier: 1, cost: 0 },
    { name: 'Steel Bucket', multiplier: 2, cost: 5000 }
  ];

  // Drilling Rig upgrade progression
  const drillingRigUpgrades = [
    { name: 'Basic Drill', multiplier: 1, cost: 0 },
    { name: 'Steel Drill', multiplier: 2, cost: 50000 }
  ];

  // Blasting Crew upgrade progression
  const blastingCrewUpgrades = [
    { name: 'Standard TNT', multiplier: 1, cost: 0 },
    { name: 'Mega TNT', multiplier: 2, cost: 500000 }
  ];

  const currentPick = pickUpgrades[currentPickIndex];
  const nextPick = pickUpgrades[currentPickIndex + 1];
  const currentExcavatorUpgrade = excavatorUpgrades[excavatorUpgradeIndex];
  const nextExcavatorUpgrade = excavatorUpgrades[excavatorUpgradeIndex + 1];
  const currentDrillingRigUpgrade = drillingRigUpgrades[drillingRigUpgradeIndex];
  const nextDrillingRigUpgrade = drillingRigUpgrades[drillingRigUpgradeIndex + 1];
  const currentBlastingCrewUpgrade = blastingCrewUpgrades[blastingCrewUpgradeIndex];
  const nextBlastingCrewUpgrade = blastingCrewUpgrades[blastingCrewUpgradeIndex + 1];

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

  // Excavator functions
  const getExcavatorCost = () => {
    return Math.floor(1000 * Math.pow(1.5, excavatorCount));
  };

  const buyExcavator = () => {
    const cost = getExcavatorCost();
    if (oreCount >= cost) {
      setOreCount(prev => prev - cost);
      setExcavatorCount(prev => prev + 1);
    }
  };

  const buyExcavatorUpgrade = () => {
    if (nextExcavatorUpgrade && oreCount >= nextExcavatorUpgrade.cost) {
      setOreCount(prev => prev - nextExcavatorUpgrade.cost);
      setExcavatorUpgradeIndex(prev => prev + 1);
    }
  };

  // Drilling Rig functions
  const getDrillingRigCost = () => {
    return Math.floor(10000 * Math.pow(1.5, drillingRigCount));
  };

  const buyDrillingRig = () => {
    const cost = getDrillingRigCost();
    if (oreCount >= cost) {
      setOreCount(prev => prev - cost);
      setDrillingRigCount(prev => prev + 1);
    }
  };

  const buyDrillingRigUpgrade = () => {
    if (nextDrillingRigUpgrade && oreCount >= nextDrillingRigUpgrade.cost) {
      setOreCount(prev => prev - nextDrillingRigUpgrade.cost);
      setDrillingRigUpgradeIndex(prev => prev + 1);
    }
  };

  // Blasting Crew functions
  const getBlastingCrewCost = () => {
    return Math.floor(100000 * Math.pow(1.5, blastingCrewCount));
  };

  const buyBlastingCrew = () => {
    const cost = getBlastingCrewCost();
    if (oreCount >= cost) {
      setOreCount(prev => prev - cost);
      setBlastingCrewCount(prev => prev + 1);
    }
  };

  const buyBlastingCrewUpgrade = () => {
    if (nextBlastingCrewUpgrade && oreCount >= nextBlastingCrewUpgrade.cost) {
      setOreCount(prev => prev - nextBlastingCrewUpgrade.cost);
      setBlastingCrewUpgradeIndex(prev => prev + 1);
    }
  };

  // Auto mining effect - runs every second
  useEffect(() => {
    const totalPassiveIncome = 
      (autoMinerCount * currentPick.efficiency) +
      (excavatorCount * 10 * currentExcavatorUpgrade.multiplier) +
      (drillingRigCount * 100 * currentDrillingRigUpgrade.multiplier) +
      (blastingCrewCount * 1000 * currentBlastingCrewUpgrade.multiplier);

    if (totalPassiveIncome > 0) {
      const interval = setInterval(() => {
        setOreCount(prev => prev + totalPassiveIncome);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [
    autoMinerCount, 
    currentPick.efficiency, 
    excavatorCount, 
    currentExcavatorUpgrade.multiplier,
    drillingRigCount,
    currentDrillingRigUpgrade.multiplier,
    blastingCrewCount,
    currentBlastingCrewUpgrade.multiplier
  ]);

  // Load game state on mount
  useEffect(() => {
    loadGameState();
  }, []);

  // Save game state whenever it changes
  useEffect(() => {
    saveGameState();
  }, [oreCount, clickCount, currentPickIndex, autoMinerCount, excavatorCount, excavatorUpgradeIndex, drillingRigCount, drillingRigUpgradeIndex, blastingCrewCount, blastingCrewUpgradeIndex]);

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

            {/* Excavators Row - Unlocked after 5 Auto Miners */}
            {autoMinerCount >= 5 && (
              <div className="bg-bg p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold text-text mb-6">Excavators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Excavators */}
                  <div className="bg-surface p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-text mb-4 text-center">Excavators Owned</h4>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🚜</div>
                      <h5 className="text-xl font-bold text-accent mb-2">{excavatorCount}</h5>
                      <p className="text-muted">
                        {excavatorCount === 0 
                          ? 'No excavators yet' 
                          : `${excavatorCount * 10 * currentExcavatorUpgrade.multiplier} ore/second`
                        }
                      </p>
                      <p className="text-muted text-sm mt-2">{currentExcavatorUpgrade.name}</p>
                    </div>
                  </div>

                  {/* Buy Excavator */}
                  <div className="bg-surface p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-text mb-4 text-center">Buy Excavator</h4>
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">🚜</div>
                      <h5 className="text-lg font-bold text-text mb-1">Excavator</h5>
                      <p className="text-muted text-sm">Mines {10 * currentExcavatorUpgrade.multiplier} ore/second</p>
                      <p className="text-accent text-sm font-semibold">Heavy machinery!</p>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={buyExcavator}
                        disabled={oreCount < getExcavatorCost()}
                        className={`btn px-6 py-3 w-full ${
                          oreCount >= getExcavatorCost() 
                            ? 'hover:scale-105 active:scale-95' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        Buy for {getExcavatorCost().toLocaleString()} ore
                      </button>
                      <p className="text-muted text-xs mt-2">
                        {oreCount >= getExcavatorCost() 
                          ? 'Ready to buy!' 
                          : `Need ${(getExcavatorCost() - oreCount).toLocaleString()} more ore`
                        }
                      </p>
                      {nextExcavatorUpgrade && (
                        <button
                          onClick={buyExcavatorUpgrade}
                          disabled={oreCount < nextExcavatorUpgrade.cost}
                          className={`btn-outline px-4 py-2 w-full mt-2 text-sm ${
                            oreCount >= nextExcavatorUpgrade.cost 
                              ? 'hover:scale-105 active:scale-95' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          Upgrade: {nextExcavatorUpgrade.name} ({nextExcavatorUpgrade.cost.toLocaleString()} ore)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Drilling Rigs Row - Unlocked after 5 Excavators */}
            {excavatorCount >= 5 && (
              <div className="bg-bg p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold text-text mb-6">Drilling Rigs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Drilling Rigs */}
                  <div className="bg-surface p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-text mb-4 text-center">Drilling Rigs Owned</h4>
                    <div className="text-center">
                      <div className="text-4xl mb-2">🔩</div>
                      <h5 className="text-xl font-bold text-accent mb-2">{drillingRigCount}</h5>
                      <p className="text-muted">
                        {drillingRigCount === 0 
                          ? 'No drilling rigs yet' 
                          : `${drillingRigCount * 100 * currentDrillingRigUpgrade.multiplier} ore/second`
                        }
                      </p>
                      <p className="text-muted text-sm mt-2">{currentDrillingRigUpgrade.name}</p>
                    </div>
                  </div>

                  {/* Buy Drilling Rig */}
                  <div className="bg-surface p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-text mb-4 text-center">Buy Drilling Rig</h4>
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">🔩</div>
                      <h5 className="text-lg font-bold text-text mb-1">Drilling Rig</h5>
                      <p className="text-muted text-sm">Mines {100 * currentDrillingRigUpgrade.multiplier} ore/second</p>
                      <p className="text-accent text-sm font-semibold">Deep drilling power!</p>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={buyDrillingRig}
                        disabled={oreCount < getDrillingRigCost()}
                        className={`btn px-6 py-3 w-full ${
                          oreCount >= getDrillingRigCost() 
                            ? 'hover:scale-105 active:scale-95' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        Buy for {getDrillingRigCost().toLocaleString()} ore
                      </button>
                      <p className="text-muted text-xs mt-2">
                        {oreCount >= getDrillingRigCost() 
                          ? 'Ready to buy!' 
                          : `Need ${(getDrillingRigCost() - oreCount).toLocaleString()} more ore`
                        }
                      </p>
                      {nextDrillingRigUpgrade && (
                        <button
                          onClick={buyDrillingRigUpgrade}
                          disabled={oreCount < nextDrillingRigUpgrade.cost}
                          className={`btn-outline px-4 py-2 w-full mt-2 text-sm ${
                            oreCount >= nextDrillingRigUpgrade.cost 
                              ? 'hover:scale-105 active:scale-95' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          Upgrade: {nextDrillingRigUpgrade.name} ({nextDrillingRigUpgrade.cost.toLocaleString()} ore)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blasting Crews Row - Unlocked after 5 Drilling Rigs */}
            {drillingRigCount >= 5 && (
              <div className="bg-bg p-6 rounded-lg border border-border">
                <h3 className="text-xl font-semibold text-text mb-6">Blasting Crews</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Blasting Crews */}
                  <div className="bg-surface p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-text mb-4 text-center">Blasting Crews Owned</h4>
                    <div className="text-center">
                      <div className="text-4xl mb-2">💥</div>
                      <h5 className="text-xl font-bold text-accent mb-2">{blastingCrewCount}</h5>
                      <p className="text-muted">
                        {blastingCrewCount === 0 
                          ? 'No blasting crews yet' 
                          : `${blastingCrewCount * 1000 * currentBlastingCrewUpgrade.multiplier} ore/second`
                        }
                      </p>
                      <p className="text-muted text-sm mt-2">{currentBlastingCrewUpgrade.name}</p>
                    </div>
                  </div>

                  {/* Buy Blasting Crew */}
                  <div className="bg-surface p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-text mb-4 text-center">Buy Blasting Crew</h4>
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">💥</div>
                      <h5 className="text-lg font-bold text-text mb-1">Blasting Crew</h5>
                      <p className="text-muted text-sm">Mines {1000 * currentBlastingCrewUpgrade.multiplier} ore/second</p>
                      <p className="text-accent text-sm font-semibold">Explosive results!</p>
                    </div>
                    <div className="text-center">
                      <button
                        onClick={buyBlastingCrew}
                        disabled={oreCount < getBlastingCrewCost()}
                        className={`btn px-6 py-3 w-full ${
                          oreCount >= getBlastingCrewCost() 
                            ? 'hover:scale-105 active:scale-95' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                      >
                        Buy for {getBlastingCrewCost().toLocaleString()} ore
                      </button>
                      <p className="text-muted text-xs mt-2">
                        {oreCount >= getBlastingCrewCost() 
                          ? 'Ready to buy!' 
                          : `Need ${(getBlastingCrewCost() - oreCount).toLocaleString()} more ore`
                        }
                      </p>
                      {nextBlastingCrewUpgrade && (
                        <button
                          onClick={buyBlastingCrewUpgrade}
                          disabled={oreCount < nextBlastingCrewUpgrade.cost}
                          className={`btn-outline px-4 py-2 w-full mt-2 text-sm ${
                            oreCount >= nextBlastingCrewUpgrade.cost 
                              ? 'hover:scale-105 active:scale-95' 
                              : 'opacity-50 cursor-not-allowed'
                          }`}
                        >
                          Upgrade: {nextBlastingCrewUpgrade.name} ({nextBlastingCrewUpgrade.cost.toLocaleString()} ore)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            <strong>🎮 How to Play:</strong> Click the &quot;Mine Ore&quot; button to collect ore. 
            Upgrade your pick for better efficiency and buy Auto Picks for passive ore generation!
          </p>
        </div>

        {/* Reset Game Section */}
        <div className="mt-8 text-center">
          <button
            onClick={resetGameState}
            className="btn-outline px-4 py-2 text-sm"
          >
            Start New Game
          </button>
          <p className="text-muted text-xs mt-2">
            This will reset all progress and cannot be undone
          </p>
        </div>

        {/* Version Footer */}
        <footer className="mt-8 text-center">
          <p className="text-muted text-xs">Ore Miner v0.04</p>
        </footer>
      </div>
    </main>
  );
}