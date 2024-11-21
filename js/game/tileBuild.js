import { PlacementTile } from '../classes/PlacementTile.js';
import { placementTilesData } from './placementTilesData.js';

// Function to initialize placement tiles
export function initializePlacementTiles() {
    const placementTilesData2D = [];
    for (let i = 0; i < placementTilesData.length; i += 60) {
        placementTilesData2D.push(placementTilesData.slice(i, i + 60));
    }

    // Array to store placement tiles
    const placementTiles = [];
    placementTilesData2D.forEach((row, y) => {
        row.forEach((symbol, x) => {
            if (symbol === 2716) {
                placementTiles.push(new PlacementTile({
                    position: {
                        x: x * 32,
                        y: y * 32
                    },
                    isOccupied: false
                }));
            }
        });
    });
    return placementTiles; // Return the initialized placement tiles
}