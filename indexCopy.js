// Get the canvas element and context
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 1920;
canvas.height = 1120;

// Fill the canvas background
c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);

// Initialize the 2D array for placement tiles
const placementTilesData2D = [];
for (let i = 0; i < placementTilesData.length; i += 60) {
    placementTilesData2D.push(placementTilesData.slice(i, i + 60));
}

const image = new Image();
image.onload = () => {
    // Show the main menu on initial load
    document.getElementById('mainMenu').style.display = 'flex';
};
image.src = 'img/Levels/campground.png';

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

const enemies = [];
let currentLevel = 1; 
let goblinCount = 3;
let orcCount = 1;
let animationId;

// Function to spawn enemies
function spawnEnemies() {
    const totalSpawnCount = goblinCount + orcCount; // Total enemies to spawn

    for (let i = 0; i < goblinCount; i++) {
        const xOffset = (i + 1) * 75; // Increment xOffset for each goblin
        enemies.push(new Enemy({
            position: {
                x: waypoints[0].x - xOffset,
                y: waypoints[0].y
            },
            type: 'goblin' // Use lowercase 'goblin' to match the enemyTypes object
        }));
    }

    for (let i = 0; i < orcCount; i++) {
        const xOffset = (goblinCount + i + 1) * 75; // Adjust xOffset for each orc
        enemies.push(new Enemy({
            position: {
                x: waypoints[0].x - xOffset,
                y: waypoints[0].y
            },
            type: 'orc' // Use lowercase 'orc' to match the enemyTypes object
        }));
    }
}

// Highlight placement tiles function
function highlightPlacementTiles() {
    placementTiles.forEach(tile => {
        tile.highlighted = true; // Set a highlighted property
    });
}

const buildings = [];
const buildTowersArea = document.getElementById('buildTowersArea');
const towerOptions = document.querySelectorAll('.towerOption');
const level1 = document.getElementById("level1")
const backButton = document.getElementById("backButton");
const levelSelectorBtn = document.getElementById("levelSelectorBtn");
const levelSelector = document.getElementById("levelSelector");
const levelIndicator = document.getElementById("levelIndicator");
const gameScreen = document.getElementById('game-screen')

let activeTile = undefined;
let enemyCount = 3;
let hearts = 10;
let coins = 100000;
let activeTower = null;

levelSelectorBtn.addEventListener("click", () => {
    mainMenu.style.display = "none";
    levelSelector.style.display = "flex"; // Show level selector
});

backButton.addEventListener("click", () => {
    levelSelector.style.display = "none";
    mainMenu.style.display = "flex"; // Show main menu again
});

level1.addEventListener("click", () => {
    levelSelector.style.display = "none";
    levelIndicator.textContent = "Level 1"; 
    gameScreen.style.display = 'flex'
    startGame(); // Call the function to start the game
});

// Function to start the game
function startGame() {
    // Initialize game variables if needed
    levelIndicator.style.display = 'flex'
    hearts = 10;
    coins = 100000;
    currentLevel = 1;
    enemies.length = 0; // Clear enemies array
    spawnEnemies();
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
                }, 3000); // Show the main menu after 3 seconds
            }
        }
    }

    // Respawn enemies when none are left
    if (enemies.length === 0) {
        document.querySelector('#levelIndicator').innerHTML = 'Level ' + ++currentLevel;
        goblinCount += 2;
        orcCount++;
        spawnEnemies();
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
            return distance < enemy.radius + building.radius;
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
                    projectile.enemy.frames = projectile.enemy.deathFrames;
                    projectile.enemy.image = projectile.enemy.deathSprite;
                    coins += projectile.enemy.goldValue;
                    document.querySelector('#coins').innerHTML = coins;
                }
                // Remove the projectile after hit
                building.projectiles.splice(i, 1);
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

// Event listener for mouse clicks to build towers
canvas.addEventListener('click', (event) => {
    if (activeTile && !activeTile.isOccupied && coins - (activeTower ? activeTower.price : 0) >= 0) {
        coins -= activeTower.price;
        document.querySelector('#coins').innerHTML = coins;

        // Ensure the type is taken from activeTower
        buildings.push(new Building({
            position: {
                x: activeTile.position.x,
                y: activeTile.position.y
            },
            type: activeTower.name // Pass the selected tower type
        }));

        activeTile.isOccupied = true;
        activeTower = null; // Reset after placing the building
        document.getElementById('towerOptions').style.display = 'none';
        placementTiles.forEach(tile => {
            tile.highlighted = false;
        });
    }
});

// Event listener for mouse movement to track the position
window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

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

