# Hexagon Graph Generator

A customizable hexagon graph paper generator with print support. Perfect for tabletop games, strategy maps, RPG campaigns, or any creative project that needs hexagonal grids.

## Features

- **Customizable Grid Size**: Set the width and height in number of hexagons (1-50)
- **Adjustable Hex Size**: Control the size of individual hexagons (10-100 pixels)
- **Multiple Orientations**: Choose from three orientation styles:
  - 0° (Flat Top) - Common for strategy games
  - 90° (Pointy Top) - Popular for RPG hex maps
  - 45° (Diagonal) - Unique tilted appearance
- **Page Layout Mode**: Add custom header and footer text anchored to the four corners
- **Print Integration**: Direct browser print support with optimized print styles
- **Responsive Design**: Works on desktop and mobile devices

## Technical Stack

- **Framework**: Next.js with React
- **Rendering**: HTML5 Canvas for hexagon grid drawing
- **Styling**: Tailwind CSS with design system classes
- **Print**: CSS @media print queries for clean output

## Usage

1. **Set Grid Dimensions**: Use the Width and Height controls to define how many hexagons to display
2. **Adjust Hex Size**: Change the pixel size of each hexagon for larger or smaller grids
3. **Choose Orientation**: Select the rotation style that fits your needs
4. **Enable Page Layout** (Optional): Toggle on to add header/footer text
5. **Add Text** (Optional): Enter text for any of the four corner positions
6. **Print**: Click the Print button to open your browser's print dialog

### Print Tips

- Set margins to "None" or "Minimum" for maximum graph area
- Enable "Background graphics" in print settings
- Use "Landscape" orientation for wider grids
- Preview before printing to ensure proper fit

## Future Enhancements

- [ ] Add color customization for hex borders and fill
- [ ] Support for hex numbering/labeling
- [ ] Export to PNG/SVG image formats
- [ ] Preset templates (letter, A4, custom sizes)
- [ ] Grid coordinate display option
- [ ] Multiple pages for large grids
- [ ] Save/load grid configurations
- [ ] Add hex fill colors for terrain mapping
