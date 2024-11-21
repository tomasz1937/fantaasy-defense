import { Sprite } from "./Sprite.js";
import { c } from "../game/canvas.js";
import { waypoints } from "../game/waypoints.js";

export class Enemy extends Sprite {
    constructor({ position = {x:0, y:0} , type = 'goblin'}) {

        const enemyTypes = {
            goblin: {type: 'goblin', maxHealth: 100, imageSrc: 'img/Enemies/Goblin/GoblinWalk.png', goldValue: 10, deathSrc: 'img/Enemies/Goblin/GoblinDie.png', speed: 1.05, width: 45 },
            orc: { type: 'orc', maxHealth: 200, imageSrc: 'img/Enemies/Orc/OrcWalk.png', goldValue: 20, deathSrc: 'img/Enemies/Orc/OrcDie.png', speed: 1, width: 60 },
            blackOrc: {type: 'blackOrc', maxHealth: 350, imageSrc: 'img/Enemies/BlackOrc/BlackOrcWalk.png', goldValue: 30, deathSrc: 'img/Enemies/BlackOrc/BlackOrcDie.png', speed: .95, width: 90},
            giant: {type: 'giant', maxHealth: 600, imageSrc: 'img/Enemies/Giant/GiantWalk.png', goldValue: 75, deathSrc: 'img/Enemies/Giant/GiantDie.png', speed: .95, width: 120},
            yeti: {type: 'yeti', maxHealth: 700, imageSrc: 'img/Enemies/Yeti/YetiWalk.png', goldValue: 60, deathSrc: 'img/Enemies/Yeti/YetiDie.png', speed: .95, width: 100}
        };

        const enemyType = enemyTypes[type]; 

        super({ position, imageSrc: enemyType.imageSrc, frames: { max: 10 } });

        this.type = enemyType.type
        this.maxHealth = enemyType.maxHealth
        this.goldValue = enemyType.goldValue
        this.health = this.maxHealth
        this.height = 100
        this.position = position
        this.width = enemyType.width
        this.waypointIndex = 0;
        this.center = {
            x: this.position.x + this.width/2,
            y: this.position.y + this.height/2
        }
        this.radius = 25
        this.velocity = {
            x:0,
            y:0
        }
        this.isAlive = true 
        this.deathSprite = new Image() 
        this.deathSprite.src = enemyType.deathSrc
        this.deathFrames = { max: 10, current: 0, elapsed: 0, hold: 6 } 
        this.speed = enemyType.speed
    }
    
    draw() {
        if (this.isAlive) {
            super.draw()
    
            // Health bar
            c.fillStyle = 'red';
            c.fillRect(this.position.x, this.position.y - 15, this.width, 10);

            // Green bar (current health)
            c.fillStyle = 'green';
            const greenBarWidth = this.width * (this.health / this.maxHealth);
            c.fillRect(this.position.x, this.position.y - 15, greenBarWidth, 10);

        } else {
            // Temporarily set the death sprite sheet and frames
            const originalImage = this.image 
            const originalFrames = this.frames 
    
            this.image = this.deathSprite 
            this.frames = this.deathFrames 
    
            super.draw() 
            this.image = originalImage
            this.frames = originalFrames
    
            // Increment frames for death animation
            this.deathFrames.elapsed++
            if (this.deathFrames.elapsed % this.deathFrames.hold === 0) {
                this.deathFrames.current++
                
            }
        }
    }
    
    update(){
        this.draw()

        const waypoint = waypoints[this.waypointIndex]
        const yDistance = waypoint.y - this.center.y
        const xDistance = waypoint.x - this.center.x
        const angle = Math.atan2(yDistance, xDistance)
        const speed = this.speed

        this.velocity.x = Math.cos(angle) * speed
        this.velocity.y = Math.sin(angle) * speed

        this.position.x += this.velocity.x 
        this.position.y += this.velocity.y 
        this.center = {
            x: this.position.x + this.width/2,
            y: this.position.y + this.height/2
        }
        if(
            Math.abs(Math.round(this.center.x) - Math.round(waypoint.x)) < Math.abs(this.velocity.x) && 
            Math.abs(Math.round(this.center.y) - Math.round(waypoint.y)) < Math.abs(this.velocity.y) && 
            this.waypointIndex < waypoints.length - 1)
            {
            this.waypointIndex++
        }
    }
}









