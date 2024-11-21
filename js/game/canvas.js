// Get the canvas element and context
export const canvas = document.querySelector('canvas');
export const c = canvas.getContext('2d');

// Set canvas dimensions
canvas.width = 1920;
canvas.height = 1120;

// Fill the canvas background
c.fillStyle = 'white';
c.fillRect(0, 0, canvas.width, canvas.height);