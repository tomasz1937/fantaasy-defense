import { c } from "../game/canvas.js";

export class PlacementTile {
    constructor({ position = { x: 0, y: 0 }, isOccupied = false }) {
        this.position = position;
        this.size = 32;
        this.color = 'rgba(255, 255, 255, 0)';  // Initially transparent
        this.visibleUntil = 0;  // Timestamp until which the tile stays visible
        this.isOccupied = isOccupied;  // Flag to check if the tile is occupied
        this.highlighted = false; // New property to determine if tile is highlighted
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.size, this.size);
    }

    update() {
        if (this.isOccupied) {
            this.color = 'rgba(255, 255, 255, 0)';  
        } else if (this.highlighted) {
            this.color = 'green'; 
        } else {
            this.color = 'rgba(255, 255, 255, 0)';
        }
        this.draw();
    }
}

