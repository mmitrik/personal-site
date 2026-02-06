'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '../../../components/Header';

export default function HexagonGraph() {
  // Graph configuration state
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(8);
  const [hexSize, setHexSize] = useState(30);
  const [orientation, setOrientation] = useState(0);
  
  // Page layout state
  const [headerTopLeft, setHeaderTopLeft] = useState('');
  const [headerTopRight, setHeaderTopRight] = useState('');
  const [footerBottomLeft, setFooterBottomLeft] = useState('');
  const [footerBottomRight, setFooterBottomRight] = useState('');
  const [showPageLayout, setShowPageLayout] = useState(false);
  
  const canvasRef = useRef(null);

  // Calculate hexagon points based on orientation
  const getHexPoints = (centerX, centerY, size, orientationDeg) => {
    const points = [];
    const angleOffset = orientationDeg * (Math.PI / 180);
    
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + angleOffset;
      const x = centerX + size * Math.cos(angle);
      const y = centerY + size * Math.sin(angle);
      points.push({ x, y });
    }
    
    return points;
  };

  // Draw hexagon grid on canvas
  const drawHexGrid = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Calculate spacing based on orientation
    let horizSpacing, vertSpacing, offsetX, offsetY;
    
    if (orientation === 0) {
      // Flat-top hexagons
      horizSpacing = hexSize * 1.5;
      vertSpacing = hexSize * Math.sqrt(3);
      offsetX = hexSize;
      offsetY = hexSize * Math.sqrt(3) / 2;
    } else if (orientation === 90) {
      // Pointy-top hexagons
      horizSpacing = hexSize * Math.sqrt(3);
      vertSpacing = hexSize * 1.5;
      offsetX = hexSize * Math.sqrt(3) / 2;
      offsetY = hexSize;
    } else {
      // 45-degree rotated
      horizSpacing = hexSize * 1.5;
      vertSpacing = hexSize * 1.5;
      offsetX = hexSize;
      offsetY = hexSize;
    }

    // Calculate canvas size
    const canvasWidth = width * horizSpacing + offsetX * 2;
    const canvasHeight = height * vertSpacing + offsetY * 2;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw hexagons
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;

    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        let centerX, centerY;
        
        if (orientation === 0) {
          // Flat-top: offset odd rows
          centerX = offsetX + col * horizSpacing;
          centerY = offsetY + row * vertSpacing + (col % 2 === 1 ? vertSpacing / 2 : 0);
        } else if (orientation === 90) {
          // Pointy-top: offset odd columns
          centerX = offsetX + col * horizSpacing + (row % 2 === 1 ? horizSpacing / 2 : 0);
          centerY = offsetY + row * vertSpacing;
        } else {
          // 45-degree: diagonal offset
          centerX = offsetX + col * horizSpacing + (row % 2 === 1 ? horizSpacing / 2 : 0);
          centerY = offsetY + row * vertSpacing;
        }

        const points = getHexPoints(centerX, centerY, hexSize, orientation === 45 ? 15 : (orientation === 90 ? 30 : 0));
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < 6; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  };

  // Redraw when settings change
  useEffect(() => {
    drawHexGrid();
  }, [width, height, hexSize, orientation]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-6xl mx-auto p-8 pt-16">
        <Header />

        <section className="bg-surface p-10 rounded-2xl shadow-sm print:shadow-none print:p-0">
          {/* Title - Hidden when printing */}
          <div className="text-center mb-8 print:hidden">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              ⬡ Hexagon Graph Generator
            </h1>
            <p className="text-muted text-lg">
              Create printable hexagon graph paper with customizable settings
            </p>
          </div>

          {/* Controls - Hidden when printing */}
          <div className="print:hidden">
            {/* Grid Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Width (hexagons)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Height (hexagons)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                  className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Hex Size (pixels)
                </label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={hexSize}
                  onChange={(e) => setHexSize(Math.max(10, Math.min(100, parseInt(e.target.value) || 10)))}
                  className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Orientation
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(parseInt(e.target.value))}
                  className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                >
                  <option value={0}>0° (Flat Top)</option>
                  <option value={90}>90° (Pointy Top)</option>
                  <option value={45}>45° (Diagonal)</option>
                </select>
              </div>
            </div>

            {/* Page Layout Toggle */}
            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPageLayout}
                  onChange={(e) => setShowPageLayout(e.target.checked)}
                  className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-text font-medium">Enable Page Layout (Header/Footer)</span>
              </label>
            </div>

            {/* Header/Footer Inputs */}
            {showPageLayout && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-bg rounded-lg border border-border">
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Header - Top Left
                  </label>
                  <input
                    type="text"
                    value={headerTopLeft}
                    onChange={(e) => setHeaderTopLeft(e.target.value)}
                    placeholder="e.g., Title or Name"
                    className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Header - Top Right
                  </label>
                  <input
                    type="text"
                    value={headerTopRight}
                    onChange={(e) => setHeaderTopRight(e.target.value)}
                    placeholder="e.g., Date"
                    className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Footer - Bottom Left
                  </label>
                  <input
                    type="text"
                    value={footerBottomLeft}
                    onChange={(e) => setFooterBottomLeft(e.target.value)}
                    placeholder="e.g., Notes"
                    className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text mb-2">
                    Footer - Bottom Right
                  </label>
                  <input
                    type="text"
                    value={footerBottomRight}
                    onChange={(e) => setFooterBottomRight(e.target.value)}
                    placeholder="e.g., Page number"
                    className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={handlePrint}
                className="bg-accent text-white px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Graph
              </button>
              
              <button
                onClick={drawHexGrid}
                className="bg-border text-text px-6 py-3 rounded-lg hover:bg-surface flex items-center gap-2 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>

          {/* Print Preview / Canvas Area */}
          <div className={`${showPageLayout ? 'print:p-8' : ''}`}>
            {/* Page Header - Only shown when page layout is enabled */}
            {showPageLayout && (headerTopLeft || headerTopRight) && (
              <div className="flex justify-between items-start mb-4 text-sm text-gray-700 print:text-black">
                <span>{headerTopLeft}</span>
                <span>{headerTopRight}</span>
              </div>
            )}
            
            {/* Canvas Container */}
            <div className="flex justify-center overflow-auto bg-bg p-4 rounded-lg border border-border print:border-0 print:p-0 print:bg-white">
              <canvas
                ref={canvasRef}
                className="max-w-full"
                style={{ maxHeight: '600px' }}
              />
            </div>
            
            {/* Page Footer - Only shown when page layout is enabled */}
            {showPageLayout && (footerBottomLeft || footerBottomRight) && (
              <div className="flex justify-between items-end mt-4 text-sm text-gray-700 print:text-black">
                <span>{footerBottomLeft}</span>
                <span>{footerBottomRight}</span>
              </div>
            )}
          </div>
        </section>

        {/* Info Section - Hidden when printing */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:hidden">
          <p className="text-yellow-800 text-sm">
            <strong>💡 How it Works:</strong> Adjust the width, height, and size controls to customize your hexagon grid. 
            Choose an orientation style and optionally add header/footer text for your printed pages. 
            Click "Print Graph" to open your browser's print dialog.
          </p>
        </div>

        {/* Tips Section - Hidden when printing */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
          <p className="text-blue-800 text-sm">
            <strong>🎯 Tips:</strong> For best printing results, set your browser's print settings to "No margins" 
            or "Minimum margins" and ensure "Background graphics" is enabled. The 0° orientation (Flat Top) 
            is commonly used for strategy game maps, while 90° (Pointy Top) is popular for hex-based RPGs.
          </p>
        </div>

        {/* Version Footer - Hidden when printing */}
        <footer className="mt-8 text-center print:hidden">
          <p className="text-muted text-xs">Hexagon Graph Generator v1.0</p>
        </footer>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </main>
  );
}
