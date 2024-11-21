import { Sprite } from "./Sprite.js";
import { c } from "../game/canvas.js";

const projectileTypes = {
    'Archer Tower': { 
        imageSrc: 'img/Projectiles/arrow.png', 
        damage: 20,
        speed: 4
    },
    'Mage Tower': { 
        imageSrc: 'img/Projectiles/lightningBolt.png', 
        damage: 50,
        speed: 5
    },
    'Stone Tower': { 
        imageSrc: 'img/Projectiles/stone.png', 
        damage: 90,
        speed: 4
    },
    'Dark Mage Tower': { 
        imageSrc: 'img/Projectiles/DarkLightningBolt.png', 
        damage: 80,
        speed: 7
    }
};

export class Projectile extends Sprite {
    constructor({ position = { x: 0, y: 0 }, enemy, type }) {

        const projectileData = projectileTypes[type] || projectileTypes['Archer Tower'];
    
        super({
            position,
            imageSrc: projectileData.imageSrc
        });

        this.velocity = {
            x: 0,
            y: 0
        };
        this.enemy = enemy;
        this.radius = 10;
        this.angle = 0; 
        this.width = this.image.width; 
        this.height = this.image.height; 
        this.damage = projectileData.damage
        this.power = projectileData.speed
    }

    update() {
        this.draw();

        // Calculate the angle towards the enemy
        const angle = Math.atan2(
            this.enemy.center.y - this.position.y,
            this.enemy.center.x - this.position.x
        );
        this.angle = angle; 

        // PROJECTILE VELOCITY
        const power = this.power

        this.velocity.x = Math.cos(angle) * power;
        this.velocity.y = Math.sin(angle) * power;

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    draw() {
        c.save();
        c.translate(this.position.x, this.position.y);
        c.rotate(this.angle + Math.PI / 1.35); // Rotation to match the projectile's image orientation
        c.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);
        c.restore();
    }
}



