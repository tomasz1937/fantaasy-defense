import { canvas, c } from './canvas.js';
import { waypoints } from './waypoints.js';
import { Enemy } from '../classes/Enemy.js';
import { Building } from '../classes/Building.js';
import { buildingTypes } from '../classes/Building.js'
import { initializePlacementTiles } from './tileBuild.js';
import { levelData } from './levelData.js';

let level;
let currentWave = 0; 
let animationId;
let activeTile = undefined;
let hearts = 25;
let coins = 150;
let activeTower = null;
let gameStarted = false;

const enemies = [];
const buildings = [];
const placementTiles = initializePlacementTiles(); 
const towerOptions = document.querySelectorAll('.towerOption');

const level1 = document.getElementById("level1")
const level2 = document.getElementById("level2")
const level3 = document.getElementById("level3")

const backButton = document.getElementById("backButton");
const levelBtn = document.getElementById("levelBtn");
const levelSelector = document.getElementById("levelSelector");
const waveIndicator = document.getElementById("waveIndicator");
const gameScreen = document.getElementById('game-screen')
const image = new Image();
const disabledLevels = document.querySelectorAll('.disabled');

const arrowHitSound = new Audio('./sounds/arrow/hit.mp3');
const goblinDeath = new Audio('./sounds/death/smallDie.mp3');
const orcDeath = new Audio('./sounds/death/orcDeath.mp3');
const build = new Audio('./sounds/building/build.mp3');
const upgrade = new Audio('./sounds/upgrade/upgrade.mp3')

const mainTheme = new Audio('./sounds/mainTheme/mainTheme.mp3');

orcDeath.volume = .5;
goblinDeath.volume = .3;
arrowHitSound.volume = .1;

// Parse wave data for spawning
function parseWaveData(waveString) {
    const goblinCount = parseInt(waveString.match(/(\d+)g/)?.[1] || 0);
    const orcCount = parseInt(waveString.match(/(\d+)o/)?.[1] || 0);
    const blackOrcCount = parseInt(waveString.match(/(\d+)b/)?.[1] || 0); 
    const giantCount = parseInt(waveString.match(/(\d+)G/)?.[1] || 0); 
    const yetiCount = parseInt(waveString.match(/(\d+)Y/)?.[1] || 0); 
    return { goblinCount, orcCount, blackOrcCount, giantCount, yetiCount }; 
}

// Function to spawn enemies
function spawnEnemies() {
    const waveData = level.waves[currentWave];
    if (!waveData) return;

    const { goblinCount, orcCount, blackOrcCount, giantCount, yetiCount } = parseWaveData(waveData);

    let xOffset = 50;

    // Goblins
    for (let i = 0; i < goblinCount; i++) {
        enemies.push(new Enemy({
            position: {
                x: waypoints[0].x - xOffset,
                y: waypoints[0].y 
            },
            type: 'goblin'
        }));
        xOffset += 50; 
    }

    // Orcs
    for (let i = 0; i < orcCount; i++) {
        enemies.push(new Enemy({
            position: {
                x: waypoints[0].x - xOffset,
                y: waypoints[0].y
            },
            type: 'orc'
        }));
        xOffset += 75; 
    }

    // BlackOrcs
    for (let i = 0; i < blackOrcCount; i++) {
        enemies.push(new Enemy({
            position: {
                x: waypoints[0].x - xOffset,
                y: waypoints[0].y
            },
            type: 'blackOrc'
        }));
        xOffset += 75;
    }

    // Giants
    for (let i = 0; i < giantCount; i++) {
        enemies.push(new Enemy({
            position: {
                x: waypoints[0].x - xOffset,
                y: waypoints[0].y
            },
            type: 'giant'
        }));
        xOffset += 100;
    }

    // Yetis
    for (let i = 0; i < yetiCount; i++) {
        enemies.push(new Enemy({
            position: {
                x: waypoints[0].x - xOffset,
                y: waypoints[0].y
            },
            type: 'yeti'
        }));
        xOffset += 80;
    }
}


// Highlight placement tiles function
function highlightPlacementTiles() {
    placementTiles.forEach(tile => {
        tile.highlighted = true; 
    });
}

// Function to start the game
function startGame() {

    mainTheme.play();
    mainTheme.volume = .25;
    mainTheme.loop = true;

    waveIndicator.style.display = 'flex'
    hearts = 10;
    coins = 150;
    currentWave = 0;
    enemies.length = 0; 
    image.src = level.imageSrc;
    animate();
}

// Main animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    // Draw the background image
    c.drawImage(image, 0, 0);

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update();

        // Remove enemy if it goes off the screen at the top
        if (enemy.position.y < 0) {
            hearts -= 1;
            document.querySelector('#hearts').innerHTML = hearts;
            enemies.splice(i, 1);

            if (hearts === 0) {
                cancelAnimationFrame(animationId);
                document.querySelector('#gameOver').style.display = 'flex';
                setTimeout(() => {
                    document.getElementById('mainMenu').style.display = 'flex';
                    waveIndicator.style.display = 'none'
                }, 3000); // Show the main menu after 3 seconds
            }
        }
    }

    // Respawn enemies when none are left
    if (enemies.length === 0 && currentWave < 40) {
        if(gameStarted){
            document.querySelector('#waveIndicator').innerHTML = 'Wave ' + ++currentWave;
            spawnEnemies();
        }
    }
    else if(enemies.length === 0 && currentWave > 40){
        document.querySelector('#gameOver').innerHTML = 'VICTORY';
        setTimeout(() => {
            document.getElementById('mainMenu').style.display = 'flex';
            waveIndicator.style.display = 'none'
        }, 3000); 
    }

    // Update placement tiles
    placementTiles.forEach((tile) => {
        tile.update(mouse);
    });

    // Update buildings and projectiles
    buildings.forEach((building) => {
        building.update();
        building.target = null;

        // Filter valid enemies to target, excluding dead enemies
        const validEnemies = enemies.filter((enemy) => {
            return enemy.isAlive && enemy.health > 0;
        }).filter((enemy) => {
            const xDifference = enemy.center.x - building.center.x;
            const yDifference = enemy.center.y - building.center.y;
            const distance = Math.hypot(xDifference, yDifference);
            return distance < enemy.radius + building.range;
        });
        building.target = validEnemies[0];

        for (let i = building.projectiles.length - 1; i >= 0; i--) {
            const projectile = building.projectiles[i];
            projectile.update();

            const xDifference = projectile.enemy.center.x - projectile.position.x;
            const yDifference = projectile.enemy.center.y - projectile.position.y;
            const distance = Math.hypot(xDifference, yDifference);

            // When a projectile hits an enemy
            if (distance < projectile.enemy.radius + projectile.radius) {
                projectile.enemy.health -= projectile.damage;

                // Check if the enemy dies and trigger death animation
                if (projectile.enemy.health <= 0 && projectile.enemy.isAlive) {

                    projectile.enemy.isAlive = false;

                    if(projectile.enemy.type == 'goblin'){
                        goblinDeath.play();
                    }
                    else{
                        orcDeath.play();
                    }
               
                    projectile.enemy.frames = projectile.enemy.deathFrames;
                    projectile.enemy.image = projectile.enemy.deathSprite;
                    coins += projectile.enemy.goldValue;
                    document.querySelector('#coins').innerHTML = coins;
                }
                // Remove the projectile after hit
                building.projectiles.splice(i, 1);
                const arrowHitSoundInstance = new Audio('./sounds/arrow/hit.mp3');
                arrowHitSoundInstance.play();
            }
        }
    });

    // Handle removing dead enemies after death animation
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // Only remove the enemy after the death animation completes
        if (!enemy.isAlive && enemy.frames.current >= enemy.frames.max) {
            enemies.splice(i, 1);
        }
    }
}

// Mouse object for tracking mouse movements
const mouse = {
    x: undefined,
    y: undefined
};

goButton.addEventListener('click', () => {
    goButton.style.display = 'none'; // Hide the "Go" button after click
    gameStarted = true; // Set gameStarted to true
    waveIndicator.style.display = 'flex'; // Show wave indicator
});


// Main menu listeners
levelBtn.addEventListener("click", () => {
    mainMenu.style.display = "none";
    levelSelector.style.display = "flex"; 
});

backButton.addEventListener("click", () => {
    levelSelector.style.display = "none";
    mainMenu.style.display = "flex"; 
});

level1.addEventListener("click", () => {
    level = levelData.level1;
    levelSelector.style.display = "none"; 
    gameScreen.style.display = 'block'
    startGame(); 
});

// level2.addEventListener("click", () => {
//     level = levelData.level2;
//     levelSelector.style.display = "none";
//     gameScreen.style.display = 'block'
//     startGame(); 
// });

// level3.addEventListener("click", () => {
//     level = levelData.level3;
//     levelSelector.style.display = "none";
//     gameScreen.style.display = 'block'
//     startGame(); 
// });

// Alert for disabled levels
disabledLevels.forEach(level => {
    level.addEventListener('click', () => {
        alert('This level is locked!');
    });
});

// Event listener for mouse clicks to build towers
canvas.addEventListener('click', (event) => {

    const rect = canvas.getBoundingClientRect();

    // Adjust mouse coordinates based on the canvas scale and position
    const mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
    const mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);

    console.log(mouseX)
    console.log(mouseY)


    // Check if the click is on a tile for placing a tower
    if (activeTile && !activeTile.isOccupied && coins - (activeTower ? activeTower.price : 0) >= 0) {
        coins -= activeTower.price;
        document.querySelector('#coins').innerHTML = coins;

        // Place the new building
        const newTower = new Building({
            position: { x: activeTile.position.x, y: activeTile.position.y },
            type: activeTower.name,
            level: 1  // Ensure the new tower starts at level 1
        });


        build.play();
        buildings.push(newTower);

        activeTile.isOccupied = true;
        activeTower = null;
        document.getElementById('towerOptions').style.display = 'none';
        placementTiles.forEach(tile => {
            tile.highlighted = false;
        });

        // After placing a new tower, update the upgrade area UI
        document.getElementById('selectedTowerName').textContent = newTower.type;
        document.getElementById('selectedTowerLevel').textContent = `Level: 1`;
        document.getElementById('selectedTowerImg').src = buildingTypes[newTower.type].imageSrc;

        // Set the initial upgrade cost to the cost for level 2
        const initialUpgradeData = buildingTypes[newTower.type].upgrade[2];
        if (initialUpgradeData) {
            document.getElementById('upgradeCost').innerHTML = `Upgrade Cost: <span id="upgradeCostValue">${initialUpgradeData.price}</span> Coins`;
        } else {
            document.getElementById('upgradeCost').textContent = 'MAX LEVEL';
        }
    } 
    // Check if the click is on a tower (for upgrading)
    else {
        let towerClicked = null;
        
        // Loop through buildings array to see if any tower is clicked
        buildings.forEach((building) => {
            if (
                mouseX > building.position.x && mouseX < building.position.x + building.width &&
                mouseY > building.position.y && mouseY < building.position.y + building.height
            ) {
                towerClicked = building;
            }
        });

        if (towerClicked) {
            // Show the upgrade menu with the tower's info
            document.getElementById('upgradeArea').style.display = 'flex';
            document.getElementById('selectedTowerName').textContent = towerClicked.type;
            document.getElementById('selectedTowerLevel').textContent = `Level: ${towerClicked.level}`;
            document.getElementById('selectedTowerImg').src = buildingTypes[towerClicked.type].upgrade[towerClicked.level]?.imageSrc || `img/Buildings/Lv1${towerClicked.type.replace(' ', '')}.png`;
            console.log(buildingTypes[towerClicked.type].upgrade[towerClicked.level]?.imageSrc || `img/Buildings/Lv1${towerClicked.type.replace(' ', '')}.png`)
                
            // Check if there is an upgrade available for the next level
            const nextLevel = towerClicked.level + 1;
            const upgradeData = buildingTypes[towerClicked.type].upgrade[nextLevel];

            // If upgrade exists for the next level, show the cost
            if (upgradeData) {
                document.getElementById('upgradeCost').innerHTML = `Upgrade Cost: <span id="upgradeCostValue">${upgradeData.price}</span> Coins`;
            } else {
                // If max level is reached, just show "MAX LEVEL"
                document.getElementById('upgradeCost').textContent = 'MAX LEVEL';
            }
            activeTower = towerClicked; // Set activeTower to the clicked tower for upgrades
        }
        else{
            document.getElementById('upgradeArea').style.display = 'none';
            document.getElementById('towerOptions').style.display = 'none';

            placementTiles.forEach(tile => {
                tile.highlighted = false;
            });

            activeTower = null;
        }
    }
});

//Upgrade button functionality
document.getElementById('upgradeArea').addEventListener('click', () => {
    if (activeTower) {
        const upgradeData = buildingTypes[activeTower.type].upgrade[activeTower.level + 1];

        // Check if there is an upgrade available and if the player has enough coins
        if (upgradeData && coins >= upgradeData.price) {
            coins -= upgradeData.price;
            document.querySelector('#coins').innerHTML = coins;

            upgrade.play();
            activeTower.upgrade(); // Call the upgrade method on the active tower

            // Update the UI after upgrading
            document.getElementById('selectedTowerLevel').textContent = `Level: ${activeTower.level}`;
            document.getElementById('selectedTowerImg').src = activeTower.imageSrc;

            const nextUpgradeData = buildingTypes[activeTower.type].upgrade[activeTower.level + 1];
            if (nextUpgradeData) {
                document.getElementById('upgradeCost').innerHTML = `Upgrade Cost: <span id="upgradeCostValue">${nextUpgradeData.price}</span> Coins`;
            } else {
                // Display only "MAX LEVEL" if no further upgrades are available
                document.getElementById('upgradeCost').textContent = 'MAX LEVEL';
            }
        } else if (!upgradeData) {
            // If no upgrades are available from the start (max level)
            document.getElementById('selectedTowerLevel').textContent = `Level: ${activeTower.level}`;
            document.getElementById('selectedTowerImg').src = activeTower.imageSrc;
            document.getElementById('upgradeCost').textContent = 'MAX LEVEL';
        } else {
            alert('Not enough coins for upgrade.');
        }
    }
});

// Event listener for mouse movement to track the position
window.addEventListener('mousemove', (event) => {

    const rect = canvas.getBoundingClientRect();

    mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width)
    mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);

    // Reset activeTile and building hover states
    activeTile = null;
    buildings.forEach(building => {
        building.isHovered = false;
    });

    // Check if mouse is over any placement tile
    for (let i = 0; i < placementTiles.length; i++) {
        const tile = placementTiles[i];
        if (
            mouse.x > tile.position.x &&
            mouse.x < tile.position.x + tile.size &&
            mouse.y > tile.position.y &&
            mouse.y < tile.position.y + tile.size
        ) {
            activeTile = tile;
            break;
        }
    }

    // Check if mouse is over any building
    buildings.forEach(building => {
        if (
            mouse.x > building.position.x &&
            mouse.x < building.position.x + building.width &&
            mouse.y > building.position.y &&
            mouse.y < building.position.y + building.height
        ) {
            building.isHovered = true;
        }
    });
});

// Event listener for the build towers area click
document.addEventListener('DOMContentLoaded', () => {
    const buildTowersArea = document.getElementById('buildTowersArea');
    const towerOptions = document.getElementById('towerOptions');

    buildTowersArea.addEventListener('click', () => {
        const shouldDisplay = towerOptions.style.display === 'none' || towerOptions.style.display === '';
        towerOptions.style.display = shouldDisplay ? 'flex' : 'none';
    });
});

// Event listener for tower option clicks
for (let i = 0; i < towerOptions.length; i++) {
    const option = towerOptions[i];

    option.addEventListener('click', (event) => {
        const target = event.target.closest('.towerOption');

        if (target) {
            const towerName = target.innerText.split(' - ')[0];
            const towerPrice = parseInt(target.innerText.split(' - ')[1]);

            highlightPlacementTiles();
            activeTower = { name: towerName, price: towerPrice };
        }
    });
}

