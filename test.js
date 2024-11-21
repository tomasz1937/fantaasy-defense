import { Sprite } from "./Sprite.js";
import { c } from "../game/canvas.js";
import { Projectile } from "./Projectile.js";

const buildingTypes = {
    'Archer Tower': { 
        imageSrc: 'img/Buildings/lv1ArcherTower.png', 
        price: 50,
        attackSpeed: 50, // bigger number = slower
        range: 800
    },
    'Mage Tower': { 
        imageSrc: 'img/Buildings/lv1MageTower.png', 
        price: 75,
        attackSpeed: 70, 
        range: 400
    },
    'Stone Tower': { 
        imageSrc: 'img/Buildings/lv1StoneTower.png', 
        price: 100,
        attackSpeed: 125, 
        range: 400
    }
};

export class Building extends Sprite {
    constructor({ position = { x: 0, y: 0 }, type = 'Archer Tower' }) {
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
        if (this.frameCount % 100 === 0 && this.target && this.target.isAlive) {
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
}


<div id="upgradeArea" style="position: absolute; left: 10px; top: 200px; width: 200px; background-color: rgba(0, 0, 0, 0.5); padding: 20px; display: none;">
                <h3>Upgrade Tower</h3>
                <div id="selectedTower">
                    <!-- Display current tower image and name -->
                    <img id="selectedTowerImg" src="img/Buildings/lv1ArcherTower.png" alt="Selected Tower" style="width: 100px; height: 100px;">
                    <div id="selectedTowerName">Archer Tower</div>
                    <div id="selectedTowerLevel">Level 1</div>
                </div>
            
                <div id="upgradeCost">
                    <h4>Upgrade Cost:</h4>
                    <span id="upgradeCostValue">50</span> Coins
                </div>
                <button id="upgradeButton">Upgrade</button>
            </div>