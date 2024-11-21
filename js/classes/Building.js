import { Sprite } from "./Sprite.js";
import { c } from "../game/canvas.js";
import { Projectile } from "./Projectile.js";

export const buildingTypes = {
    'Archer Tower': { 
        imageSrc: 'img/Buildings/Lv1ArcherTower.png', 
        price: 50,
        attackSpeed: 50, // bigger number = slower
        range: 250,
        upgrade: {
            2: {
                imageSrc: 'img/Buildings/Lv2ArcherTower.png',
                price: 200,
                attackSpeed: 40,
                range: 300
            },
            3: {
                imageSrc: 'img/Buildings/Lv3ArcherTower.png',
                price: 500,
                attackSpeed: 20,
                range: 325
            }
        }
    },
    'Mage Tower': { 
        imageSrc: 'img/Buildings/Lv1MageTower.png', 
        price: 200,
        attackSpeed: 70, 
        range: 300,
        upgrade: {
            2: {
                imageSrc: 'img/Buildings/Lv2MageTower.png',
                price: 400,
                attackSpeed: 60,
                range: 400
            },
            3: {
                imageSrc: 'img/Buildings/Lv3MageTower.png',
                price: 600,
                attackSpeed: 50,
                range: 400
            }
        }
    },
    'Stone Tower': { 
        imageSrc: 'img/Buildings/Lv1StoneTower.png', 
        price: 400,
        attackSpeed: 125, 
        range: 400,
        upgrade: {
            2: {
                imageSrc: 'img/Buildings/Lv2StoneTower.png',
                price: 800,
                attackSpeed: 100,
                range: 425
            },
            3: {
                imageSrc: 'img/Buildings/Lv3StoneTower.png',
                price: 1100,
                attackSpeed: 80,
                range: 500
            }
        }
    },
    'Dark Mage Tower': {
        imageSrc: 'img/Buildings/Lv1DarkMageTower.png',
        price: 600,
        attackSpeed: 80,
        range: 450,
        upgrade: {
            2: {
                imageSrc: 'img/Buildings/Lv2DarkMageTower.png',
                price: 1000,
                attackSpeed: 65,
                range: 475
            },
            3: {
                imageSrc: 'img/Buildings/Lv3DarkMageTower.png',
                price: 1500,
                attackSpeed: 55,
                range: 600
            }
        }
    }
};


export class Building extends Sprite {
    constructor({ position = { x: 0, y: 0 }, type = 'Archer Tower', level = 1 }) {
        const buildingData = buildingTypes[type] || buildingTypes['Archer Tower']; 

        super({
            position: {
                x: position.x,
                y: position.y - 64 
            },
            imageSrc: buildingData.imageSrc,
            frames: {
                max: 1
            }
        });

        this.level = level;
        this.type = type; 
        this.width = 64;
        this.height = 64;
        this.center = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2
        };
        this.projectiles = [];
        this.range = buildingData.range; 
        this.attackSpeed = buildingData.attackSpeed;
        this.price = buildingData.price; 
        this.target = null; 
        this.frameCount = 0; // Counter for firing interval
        this.isHovered = false; 
    }

    draw() {
        super.draw();

        // Draw the range circle only if the mouse is over the building
        if (this.isHovered) {
            c.beginPath();
            c.arc(this.center.x, this.center.y, this.range, 0, Math.PI * 2);
            c.fillStyle = 'rgba(0, 0, 255, 0.2)';
            c.fill();
        }
    }

    update() {
        this.draw();

        // Check if the tower should fire a projectile
        if (this.frameCount % this.attackSpeed === 0 && this.target && this.target.isAlive) {
            this.projectiles.push(new Projectile({
                position: {
                    x: this.center.x,
                    y: this.center.y
                },
                enemy: this.target,
                type: this.type
            }));
        }
        this.frameCount++;
    }

    // Method to handle mouse hover
    handleHover(mouse) {
        this.isHovered = (
            mouse.x > this.position.x && 
            mouse.x < this.position.x + this.width && 
            mouse.y > this.position.y && 
            mouse.y < this.position.y + this.height
        );
    }

    // Upgrade the building to the next level
    upgrade() {
        const upgradeData = buildingTypes[this.type].upgrade[this.level + 1];
    
        if (upgradeData) {
            this.level++;
            this.imageSrc = upgradeData.imageSrc; 
    
            // Ensure the image is loaded before drawing
            this.image = new Image();
            this.image.src = this.imageSrc;
    
            this.image.onload = () => {
                super.draw();  // Force redraw
            };
    
            this.attackSpeed = upgradeData.attackSpeed;
            this.range = upgradeData.range;
            this.price = upgradeData.price;
        }
    }
}


