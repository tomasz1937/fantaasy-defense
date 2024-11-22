import { c } from "../game/canvas.js";

export class PlacementTile {
    constructor({ position = { x: 0, y: 0 }, isOccupied = false }) {
        this.position = position;
        this.size = 32;
        this.color = 'rgba(255, 255, 255, 0)';  
        this.isOccupied = isOccupied;  
        this.highlighted = false; 
        this.hovered = false; // Track if the tile is being hovered
    }

    draw() {
        c.fillStyle = this.color;
        c.fillRect(this.position.x, this.position.y, this.size, this.size);
    }

    update(mouse) {
        // Check if the mouse is hovering over this tile
        if (
            mouse.x !== undefined &&
            mouse.y !== undefined &&
            mouse.x > this.position.x &&
            mouse.x < this.position.x + this.size &&
            mouse.y > this.position.y &&
            mouse.y < this.position.y + this.size
        ) {
            this.hovered = true;
        } else {
            this.hovered = false;
        }

        // Update the tile's color based on its state
        if (this.isOccupied) {
            this.color = 'rgba(255, 255, 255, 0)';  
        } else if (this.hovered && this.highlighted) {
            this.color = 'yellow'; 
        } else if (this.highlighted) {
            this.color = 'green'; 
        } else {
            this.color = 'rgba(255, 255, 255, 0)';
        }

        this.draw();
    }
}


