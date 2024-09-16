const colorPicker = document.getElementById("colorPicker");
const canavsColor = document.getElementById("canavsColor");
const myCanvas = document.getElementById("myCanvas");
const clearButton = document.getElementById("clearButton");
const saveButton = document.getElementById("saveButton");
const Fontsize = document.getElementById("Fontsize");
const retrieveButton = document.getElementById("retrieveButton");

const canvas = document.querySelector('canvas');


const ctx = myCanvas.getContext('2d');   // is a setup step to allow you to draw 2D graphics on an HTML5 canvas element.

let undoStack = [];  // Stack to store undo states
let redoStack = [];  // Stack to store redo states

let isDrawing = false;   // Tracks if the mouse is pressed down (drawing)
let lastX = 0;           // Last X coordinate
let lastY = 0;           // Last Y coordinate

//This allows the user to dynamically change the drawing color on the canvas by simply selecting a new color from the color picker.
colorPicker.addEventListener('change', (e) => {    //The change event is fired when the user selects a new color in the color picker.
    ctx.strokeStyle = e.target.value;   // This property sets the color or style used for lines and borders around shapes drawn on the canvas.
    ctx.fillStyle = e.target.value;     //This property sets the color or style used to fill the inside of shapes drawn on the canvas.
})


myCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;

})
myCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return; // Exit if not drawing
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
});

myCanvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
})

canavsColor.addEventListener('change', (e) => {
    ctx.fillStyle = e.target.value;
    ctx.fillRect(0,0,800,500);
})

Fontsize.addEventListener('change', (e) => {
    ctx.lineWidth = e.target.value;
})

clearButton.addEventListener('click',() =>{
    ctx.clearRect(0,0,myCanvas.width,myCanvas.height);
})

saveButton.addEventListener('click', () => {
    localStorage.setItem('canvasContents', myCanvas.toDataURL());

    let link = document.createElement('a');

    link.download = 'my-Canvas.png';

    link.href = myCanvas.toDataURL();

    link.click();
})

retrieveButton.addEventListener('click', ()=> {
    let savedCanvas = localStorage.getItem('canvasContents');

    if(savedCanvas){
        let img = new Image();
        img.src = savedCanvas;
        ctx.drawImage(img,0,0)
    }
})


const UNDO_LIMIT = 20;  // Maximum number of undo states
const REDO_LIMIT = 20;  // Maximum number of redo states



function saveState(stack) {
    if (stack.length >= UNDO_LIMIT) {
        stack.shift();  // Remove the oldest state if the limit is reached
    }
    stack.push(myCanvas.toDataURL());
}

// Function to restore a canvas state
function restoreState(state) {
    const img = new Image();
    img.src = state;
    img.onload = () => {
        ctx.clearRect(0, 0, myCanvas.width, myCanvas.height); // Clear the canvas
        ctx.drawImage(img, 0, 0); // Restore the state
    };
}

// Function to undo the last action
function undo() {
    if (undoStack.length > 0) {
        // Save the current state to redo stack
        if (redoStack.length >= REDO_LIMIT) {
            redoStack.shift();  // Remove the oldest state if the limit is reached
        }
        redoStack.push(myCanvas.toDataURL());
        // Restore the last state from undo stack
        const lastState = undoStack.pop();
        restoreState(lastState);
    }
}

// Function to redo the last undone action
function redo() {
    if (redoStack.length > 0) {
        // Save the current state to undo stack
        if (undoStack.length >= UNDO_LIMIT) {
            undoStack.shift();  // Remove the oldest state if the limit is reached
        }
        undoStack.push(myCanvas.toDataURL());
        // Restore the last state from redo stack
        const nextState = redoStack.pop();
        restoreState(nextState);
    }
}

// Function to undo all actions
function undoAll() {
    undoStack = [];  // Clear the undo stack
    redoStack = [];  // Clear the redo stack
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height); // Clear the canvas
}

// Event listener for color picker
colorPicker.addEventListener('change', (e) => {
    ctx.strokeStyle = e.target.value;
    ctx.fillStyle = e.target.value;
});

// Event listener for canvas drawing
myCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastX = e.offsetX;
    lastY = e.offsetY;
    saveState(undoStack); // Save state before starting a new drawing
    redoStack = []; // Clear redo stack on new drawing
});

myCanvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lastX = e.offsetX;
    lastY = e.offsetY;
});

myCanvas.addEventListener('mouseup', (e) => {
    isDrawing = false;
});

// Event listener for changing canvas background color
canavsColor.addEventListener('change', (e) => {
    saveState(undoStack); // Save state before changing background color
    redoStack = []; // Clear redo stack on background color change
    ctx.fillStyle = e.target.value;
    ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
});

// Event listener for changing line width
Fontsize.addEventListener('change', (e) => {
    ctx.lineWidth = e.target.value;
});

// Event listener for clearing the canvas
clearButton.addEventListener('click', () => {
    saveState(undoStack); // Save state before clearing the canvas
    redoStack = []; // Clear redo stack on clear
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
});

// Event listener for saving the canvas content
saveButton.addEventListener('click', () => {
    localStorage.setItem('canvasContents', myCanvas.toDataURL());

    let link = document.createElement('a');
    link.download = 'my-Canvas.png';
    link.href = myCanvas.toDataURL();
    link.click();
});

// Event listener for retrieving saved canvas content
retrieveButton.addEventListener('click', () => {
    let savedCanvas = localStorage.getItem('canvasContents');

    if (savedCanvas) {
        let img = new Image();
        img.src = savedCanvas;
        img.onload = () => {
            ctx.clearRect(0, 0, myCanvas.width, myCanvas.height); // Clear the canvas
            ctx.drawImage(img, 0, 0);
        };
    }
});

// Event listener for undo using Ctrl + Z
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault(); // Prevent the default undo action
        undo(); // Call the undo function
    }
    // Event listener for redo using Ctrl + Y
    if (e.ctrlKey && e.key === 'y') {
        e.preventDefault(); // Prevent the default redo action
        redo(); // Call the redo function
    }
});



