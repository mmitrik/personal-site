'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Header from '../../../components/Header';

// US Letter size at 96 DPI (standard screen resolution)
const LETTER_SHORT = 816;  // 8.5 inches * 96 DPI
const LETTER_LONG = 1056;  // 11 inches * 96 DPI
const PAGE_MARGIN = 40;    // Margin for header/footer text

export default function HexagonGraph() {
  // Graph configuration state
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(8);
  const [hexSize, setHexSize] = useState(30);
  const [orientation, setOrientation] = useState(0);
  const [pageOrientation, setPageOrientation] = useState('portrait');
  
  // Computed page dimensions based on orientation
  const pageWidth = pageOrientation === 'portrait' ? LETTER_SHORT : LETTER_LONG;
  const pageHeight = pageOrientation === 'portrait' ? LETTER_LONG : LETTER_SHORT;
  
  // Page layout state
  const [headerTopLeft, setHeaderTopLeft] = useState('');
  const [headerTopRight, setHeaderTopRight] = useState('');
  const [footerBottomLeft, setFooterBottomLeft] = useState('');
  const [footerBottomRight, setFooterBottomRight] = useState('');
  
  // Style options
  const [lineStyle, setLineStyle] = useState('solid');
  const [lineColor, setLineColor] = useState('#333333');
  const [lineThickness, setLineThickness] = useState(1);
  const [shadingEnabled, setShadingEnabled] = useState(false);
  const [shadingColor, setShadingColor] = useState('#d4d4d4');
  const [shadingPattern, setShadingPattern] = useState('none'); // none, all, every-other, every-third
  
  // Greyscale color presets
  const greyscalePresets = [
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#d4d4d4' },
    { name: 'Medium Gray', value: '#808080' },
    { name: 'Dark Gray', value: '#4a4a4a' },
    { name: 'Black', value: '#000000' },
  ];
  
  // Collapsible section state
  const [gridSettingsOpen, setGridSettingsOpen] = useState(true);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [headerFooterOpen, setHeaderFooterOpen] = useState(false);
  
  const canvasRef = useRef(null);

  // Calculate maximum values that fit in the canvas
  const calculateMaxValues = useCallback((currentHexSize, currentOrientation, currentPageWidth, currentPageHeight) => {
    const graphAreaWidth = currentPageWidth - (PAGE_MARGIN * 2);
    const graphAreaHeight = currentPageHeight - (PAGE_MARGIN * 2);
    
    let horizSpacing, vertSpacing, offsetX, offsetY;
    
    if (currentOrientation === 0) {
      // Flat-top hexagons
      horizSpacing = currentHexSize * 1.5;
      vertSpacing = currentHexSize * Math.sqrt(3);
      offsetX = currentHexSize;
      offsetY = currentHexSize * Math.sqrt(3) / 2;
    } else {
      // Pointy-top hexagons (90 degrees)
      horizSpacing = currentHexSize * Math.sqrt(3);
      vertSpacing = currentHexSize * 1.5;
      offsetX = currentHexSize * Math.sqrt(3) / 2;
      offsetY = currentHexSize;
    }
    
    const maxWidth = Math.max(1, Math.floor((graphAreaWidth - offsetX * 2) / horizSpacing) + 1);
    const maxHeight = Math.max(1, Math.floor((graphAreaHeight - offsetY * 2) / vertSpacing) + 1);
    
    return { maxWidth, maxHeight };
  }, []);

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
  const drawHexGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas size based on page orientation
    canvas.width = pageWidth;
    canvas.height = pageHeight;

    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageWidth, pageHeight);

    // Draw page border (light gray)
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, pageWidth, pageHeight);

    // Calculate spacing based on orientation
    let horizSpacing, vertSpacing, offsetX, offsetY;
    
    if (orientation === 0) {
      // Flat-top hexagons
      horizSpacing = hexSize * 1.5;
      vertSpacing = hexSize * Math.sqrt(3);
      offsetX = hexSize;
      offsetY = hexSize * Math.sqrt(3) / 2;
    } else {
      // Pointy-top hexagons (90 degrees)
      horizSpacing = hexSize * Math.sqrt(3);
      vertSpacing = hexSize * 1.5;
      offsetX = hexSize * Math.sqrt(3) / 2;
      offsetY = hexSize;
    }

    // Starting position (upper left with margin for header/footer)
    const startX = PAGE_MARGIN + offsetX;
    const startY = PAGE_MARGIN + offsetY;

    // Helper function to determine if cell should be shaded
    const shouldShadeCell = (row, col) => {
      if (!shadingEnabled || shadingPattern === 'none') return false;
      if (shadingPattern === 'all') return true;
      if (shadingPattern === 'every-other-row') return row % 2 === 0;
      if (shadingPattern === 'every-other-col') return col % 2 === 0;
      if (shadingPattern === 'every-third-row') return row % 3 === 0;
      if (shadingPattern === 'every-third-col') return col % 3 === 0;
      return false;
    };

    // Helper to create edge key for deduplication
    const edgeKey = (x1, y1, x2, y2) => {
      // Normalize edge direction so (A,B) and (B,A) produce same key
      const p1 = `${x1.toFixed(2)},${y1.toFixed(2)}`;
      const p2 = `${x2.toFixed(2)},${y2.toFixed(2)}`;
      return p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
    };

    // Collect all unique edges
    const edges = new Map();
    const hexCenters = []; // Collect hex centers for dots style

    // First pass: draw fills and collect edges
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        let centerX, centerY;
        
        if (orientation === 0) {
          // Flat-top: offset odd columns
          centerX = startX + col * horizSpacing;
          centerY = startY + row * vertSpacing + (col % 2 === 1 ? vertSpacing / 2 : 0);
        } else {
          // Pointy-top: offset odd rows
          centerX = startX + col * horizSpacing + (row % 2 === 1 ? horizSpacing / 2 : 0);
          centerY = startY + row * vertSpacing;
        }

        // Store center point for dots style
        hexCenters.push({ x: centerX, y: centerY });

        const points = getHexPoints(centerX, centerY, hexSize, orientation === 90 ? 30 : 0);
        
        // Fill with shading if applicable (do this first, before edges)
        if (shouldShadeCell(row, col)) {
          ctx.fillStyle = shadingColor;
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < 6; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.closePath();
          ctx.fill();
        }
        
        // Collect edges (deduplicated)
        for (let i = 0; i < 6; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % 6];
          const key = edgeKey(p1.x, p1.y, p2.x, p2.y);
          if (!edges.has(key)) {
            edges.set(key, { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
          }
        }
      }
    }

    // Collect unique vertices from edges for dots style
    const vertices = new Set();
    for (const edge of edges.values()) {
      vertices.add(`${edge.x1.toFixed(2)},${edge.y1.toFixed(2)}`);
      vertices.add(`${edge.x2.toFixed(2)},${edge.y2.toFixed(2)}`);
    }

    // Second pass: draw edges or dots based on line style
    if (lineStyle === 'dots') {
      // Draw dots at each unique vertex
      ctx.fillStyle = lineColor;
      for (const vertexKey of vertices) {
        const [x, y] = vertexKey.split(',').map(Number);
        ctx.beginPath();
        ctx.arc(x, y, lineThickness * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
      // Draw dots at each hex center
      for (const center of hexCenters) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, lineThickness * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Draw edges
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineThickness;
      if (lineStyle === 'dotted') {
        ctx.setLineDash([3, 3]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      for (const edge of edges.values()) {
        ctx.moveTo(edge.x1, edge.y1);
        ctx.lineTo(edge.x2, edge.y2);
      }
      ctx.stroke();
    }

    // Reset line dash for text
    ctx.setLineDash([]);

    // Draw header/footer text
    ctx.fillStyle = '#333333';
    ctx.font = '14px sans-serif';
    
    // Header - Top Left
    if (headerTopLeft) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(headerTopLeft, PAGE_MARGIN, 12);
    }
    
    // Header - Top Right
    if (headerTopRight) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(headerTopRight, pageWidth - PAGE_MARGIN, 12);
    }
    
    // Footer - Bottom Left
    if (footerBottomLeft) {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(footerBottomLeft, PAGE_MARGIN, pageHeight - 12);
    }
    
    // Footer - Bottom Right
    if (footerBottomRight) {
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(footerBottomRight, pageWidth - PAGE_MARGIN, pageHeight - 12);
    }
  }, [width, height, hexSize, orientation, pageWidth, pageHeight, headerTopLeft, headerTopRight, footerBottomLeft, footerBottomRight, lineStyle, lineColor, lineThickness, shadingEnabled, shadingColor, shadingPattern]);

  // Handle width change with bounds checking
  const handleWidthChange = (newWidth) => {
    const { maxWidth } = calculateMaxValues(hexSize, orientation, pageWidth, pageHeight);
    setWidth(Math.max(1, Math.min(maxWidth, newWidth)));
  };

  // Handle height change with bounds checking
  const handleHeightChange = (newHeight) => {
    const { maxHeight } = calculateMaxValues(hexSize, orientation, pageWidth, pageHeight);
    setHeight(Math.max(1, Math.min(maxHeight, newHeight)));
  };

  // Handle hex size change with bounds checking
  const handleHexSizeChange = (newSize) => {
    const clampedSize = Math.max(10, Math.min(100, newSize));
    const { maxWidth, maxHeight } = calculateMaxValues(clampedSize, orientation, pageWidth, pageHeight);
    
    setHexSize(clampedSize);
    // Adjust width and height if they exceed new maximums
    if (width > maxWidth) setWidth(maxWidth);
    if (height > maxHeight) setHeight(maxHeight);
  };

  // Handle hex orientation change with bounds checking
  const handleOrientationChange = (newOrientation) => {
    const { maxWidth, maxHeight } = calculateMaxValues(hexSize, newOrientation, pageWidth, pageHeight);
    
    setOrientation(newOrientation);
    // Adjust width and height if they exceed new maximums
    if (width > maxWidth) setWidth(maxWidth);
    if (height > maxHeight) setHeight(maxHeight);
  };

  // Handle page orientation change with bounds checking
  const handlePageOrientationChange = (newPageOrientation) => {
    const newPageWidth = newPageOrientation === 'portrait' ? LETTER_SHORT : LETTER_LONG;
    const newPageHeight = newPageOrientation === 'portrait' ? LETTER_LONG : LETTER_SHORT;
    const { maxWidth, maxHeight } = calculateMaxValues(hexSize, orientation, newPageWidth, newPageHeight);
    
    setPageOrientation(newPageOrientation);
    // Adjust width and height if they exceed new maximums
    if (width > maxWidth) setWidth(maxWidth);
    if (height > maxHeight) setHeight(maxHeight);
  };

  // Get current max values for slider limits
  const { maxWidth, maxHeight } = calculateMaxValues(hexSize, orientation, pageWidth, pageHeight);

  // Redraw when settings change
  useEffect(() => {
    drawHexGrid();
  }, [drawHexGrid]);

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-bg text-text print:min-h-0 print:bg-white">
      <div className="max-w-7xl mx-auto p-8 pt-16 print:p-0 print:max-w-none">
        <Header />

        <section className="bg-surface p-10 rounded-2xl shadow-sm print:shadow-none print:p-0 print:bg-white print:rounded-none">
          {/* Title - Hidden when printing */}
          <div className="text-center mb-8 print:hidden">
            <h1 className="text-4xl font-heading font-bold text-text mb-4">
              ⬡ Hexagon Graph Generator
            </h1>
            <p className="text-muted text-lg">
              Create printable hexagon graph paper with customizable settings
            </p>
          </div>

          {/* Main Layout: Canvas on left, Controls on right */}
          <div className="flex flex-col lg:flex-row gap-8 print:block">
            {/* Canvas Area */}
            <div className="flex-1 print:flex-none">
              <div className="overflow-auto bg-bg p-4 rounded-lg border border-border print:border-0 print:p-0 print:bg-white print:overflow-visible print:rounded-none">
                <canvas
                  ref={canvasRef}
                  className="block"
                  style={{ 
                    width: `${pageWidth}px`, 
                    height: `${pageHeight}px`,
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                />
              </div>
            </div>

            {/* Controls Panel - Hidden when printing */}
            <div className="lg:w-80 flex-shrink-0 print:hidden">
              <div className="bg-bg rounded-lg border border-border p-4 space-y-4">
                
                {/* Grid Settings Section - Collapsible */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGridSettingsOpen(!gridSettingsOpen)}
                    className="w-full flex items-center justify-between p-3 bg-surface hover:bg-opacity-80 transition-colors"
                  >
                    <h2 className="text-lg font-heading font-semibold text-text">
                      Grid Settings
                    </h2>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-muted transition-transform ${gridSettingsOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {gridSettingsOpen && (
                    <div className="p-4 space-y-4 border-t border-border">
                      {/* Width Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Width: {width} hexagons
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max={maxWidth}
                            value={width}
                            onChange={(e) => handleWidthChange(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <input
                            type="number"
                            min="1"
                            max={maxWidth}
                            value={width}
                            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 1)}
                            className="w-16 p-2 text-center border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                        <p className="text-xs text-muted mt-1">Max: {maxWidth}</p>
                      </div>

                      {/* Height Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Height: {height} hexagons
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max={maxHeight}
                            value={height}
                            onChange={(e) => handleHeightChange(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <input
                            type="number"
                            min="1"
                            max={maxHeight}
                            value={height}
                            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 1)}
                            className="w-16 p-2 text-center border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                        <p className="text-xs text-muted mt-1">Max: {maxHeight}</p>
                      </div>

                      {/* Hex Size Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Hex Size: {hexSize} pixels
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="10"
                            max="100"
                            value={hexSize}
                            onChange={(e) => handleHexSizeChange(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <input
                            type="number"
                            min="10"
                            max="100"
                            value={hexSize}
                            onChange={(e) => handleHexSizeChange(parseInt(e.target.value) || 10)}
                            className="w-16 p-2 text-center border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Hex Orientation Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Hex Orientation
                        </label>
                        <select
                          value={orientation}
                          onChange={(e) => handleOrientationChange(parseInt(e.target.value))}
                          className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                          <option value={0}>0° (Flat Top)</option>
                          <option value={90}>90° (Pointy Top)</option>
                        </select>
                      </div>

                      {/* Page Orientation Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Page Orientation
                        </label>
                        <select
                          value={pageOrientation}
                          onChange={(e) => handlePageOrientationChange(e.target.value)}
                          className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                          <option value="portrait">Portrait</option>
                          <option value="landscape">Landscape</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Styles Section - Collapsible */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setStylesOpen(!stylesOpen)}
                    className="w-full flex items-center justify-between p-3 bg-surface hover:bg-opacity-80 transition-colors"
                  >
                    <h2 className="text-lg font-heading font-semibold text-text">
                      Styles
                    </h2>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-muted transition-transform ${stylesOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {stylesOpen && (
                    <div className="p-4 space-y-4 border-t border-border">
                      {/* Line Style Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Line Style
                        </label>
                        <select
                          value={lineStyle}
                          onChange={(e) => setLineStyle(e.target.value)}
                          className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                          <option value="solid">Solid</option>
                          <option value="dotted">Dotted</option>
                          <option value="dots">Dots at Intersections</option>
                        </select>
                      </div>

                      {/* Line Color Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Line Color
                        </label>
                        <div className="flex items-center gap-2">
                          {greyscalePresets.map((preset) => (
                            <button
                              key={preset.value}
                              onClick={() => setLineColor(preset.value)}
                              className={`w-8 h-8 rounded border-2 transition-all ${
                                lineColor === preset.value
                                  ? 'border-accent ring-2 ring-accent ring-offset-1'
                                  : 'border-border hover:border-muted'
                              }`}
                              style={{ backgroundColor: preset.value }}
                              title={preset.name}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Line Thickness Control */}
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Line Thickness: {lineThickness}px
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={lineThickness}
                            onChange={(e) => setLineThickness(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <input
                            type="number"
                            min="1"
                            max="5"
                            value={lineThickness}
                            onChange={(e) => setLineThickness(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                            className="w-16 p-2 text-center border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* Shading Enable */}
                      <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={shadingEnabled}
                            onChange={(e) => {
                              setShadingEnabled(e.target.checked);
                              if (e.target.checked && shadingPattern === 'none') {
                                setShadingPattern('all');
                              }
                            }}
                            className="w-5 h-5 rounded border-border text-accent focus:ring-accent"
                          />
                          <span className="text-sm font-medium text-text">Enable Cell Shading</span>
                        </label>
                      </div>

                      {/* Shading Options - Only shown when enabled */}
                      {shadingEnabled && (
                        <>
                          {/* Shading Color */}
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Shading Color
                            </label>
                            <div className="flex items-center gap-2">
                              {greyscalePresets.map((preset) => (
                                <button
                                  key={preset.value}
                                  onClick={() => setShadingColor(preset.value)}
                                  className={`w-8 h-8 rounded border-2 transition-all ${
                                    shadingColor === preset.value
                                      ? 'border-accent ring-2 ring-accent ring-offset-1'
                                      : 'border-border hover:border-muted'
                                  }`}
                                  style={{ backgroundColor: preset.value }}
                                  title={preset.name}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Shading Pattern */}
                          <div>
                            <label className="block text-sm font-medium text-text mb-2">
                              Shading Pattern
                            </label>
                            <select
                              value={shadingPattern}
                              onChange={(e) => setShadingPattern(e.target.value)}
                              className="w-full p-3 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent"
                            >
                              <option value="none">None</option>
                              <option value="all">All Cells</option>
                              <option value="every-other-row">Every Other Row</option>
                              <option value="every-other-col">Every Other Column</option>
                              <option value="every-third-row">Every Third Row</option>
                              <option value="every-third-col">Every Third Column</option>
                            </select>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Header & Footer Section - Collapsible */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setHeaderFooterOpen(!headerFooterOpen)}
                    className="w-full flex items-center justify-between p-3 bg-surface hover:bg-opacity-80 transition-colors"
                  >
                    <h2 className="text-lg font-heading font-semibold text-text">
                      Header &amp; Footer
                    </h2>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 text-muted transition-transform ${headerFooterOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {headerFooterOpen && (
                    <div className="p-4 space-y-4 border-t border-border">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Header - Top Left
                        </label>
                        <input
                          type="text"
                          value={headerTopLeft}
                          onChange={(e) => setHeaderTopLeft(e.target.value)}
                          placeholder="e.g., Title"
                          className="w-full p-2 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
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
                          className="w-full p-2 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
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
                          className="w-full p-2 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
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
                          placeholder="e.g., Page 1"
                          className="w-full p-2 border border-border rounded-lg bg-surface text-text focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Print Button - Always visible */}
                <div className="pt-2">
                  <button
                    onClick={handlePrint}
                    className="w-full bg-accent text-white px-6 py-3 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 font-medium"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Graph
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Section - Hidden when printing */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 print:hidden">
          <p className="text-yellow-800 text-sm">
            <strong>💡 How it Works:</strong> Use the sliders or input fields to adjust your hexagon grid. 
            The canvas represents a US Letter sized page (8.5&quot; × 11&quot;). Enable Header/Footer to add text 
            that appears on the printed page. Click &ldquo;Print Graph&rdquo; to open your browser&apos;s print dialog.
          </p>
        </div>

        {/* Tips Section - Hidden when printing */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
          <p className="text-blue-800 text-sm">
            <strong>🎯 Tips:</strong> For best printing results, set your browser&apos;s print settings to &ldquo;No margins&rdquo; 
            and select &ldquo;US Letter&rdquo; paper size. The 0° orientation (Flat Top) is commonly used for strategy game maps, 
            while 90° (Pointy Top) is popular for hex-based RPGs.
          </p>
        </div>

        {/* Version Footer - Hidden when printing */}
        <footer className="mt-8 text-center print:hidden">
          <p className="text-muted text-xs">Hexagon Graph Generator v1.1</p>
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
            size: ${pageOrientation === 'portrait' ? 'letter portrait' : 'letter landscape'};
            margin: 0;
          }
          
          canvas {
            width: 100% !important;
            height: auto !important;
            max-width: none !important;
          }
        }
      `}</style>
    </main>
  );
}
