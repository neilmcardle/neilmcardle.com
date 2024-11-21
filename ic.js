const svg = document.getElementById('svg-grid');
const shapesGroup = document.getElementById('shapes');
const gridGroup = document.getElementById('grid');
const shapeSelect = document.getElementById('shape-select');
const strokeWidthInput = document.getElementById('stroke-width-input');
const roundedCapsInput = document.getElementById('rounded-caps-input');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const newLineBtn = document.getElementById('new-line-btn');
const clearBtn = document.getElementById('clear-btn');
const saveIconBtn = document.getElementById('save-icon-btn');
const loadIconSelect = document.getElementById('load-icon-select');
const loadIconBtn = document.getElementById('load-icon-btn');
const deleteIconBtn = document.getElementById('delete-icon-btn');
const exportBtn = document.getElementById('export-btn');

const gridSize = 24;
let shapeType = shapeSelect.value;
let strokeWidth = parseFloat(strokeWidthInput.value);
let useRoundedCaps = roundedCapsInput.checked;
let startX = 0, startY = 0;
let currentShape = null;
let isDrawing = false;
let undoStack = [];
let redoStack = [];
let currentPathData = ""; // Track the path data for lines

// Initialize grid lines
for (let i = 0; i <= gridSize; i++) {
    let verticalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    verticalLine.setAttribute('x1', i);
    verticalLine.setAttribute('y1', 0);
    verticalLine.setAttribute('x2', i);
    verticalLine.setAttribute('y2', gridSize);
    verticalLine.setAttribute('class', 'grid-line');
    gridGroup.appendChild(verticalLine);

    let horizontalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontalLine.setAttribute('x1', 0);
    horizontalLine.setAttribute('y1', i);
    horizontalLine.setAttribute('x2', gridSize);
    horizontalLine.setAttribute('y2', i);
    horizontalLine.setAttribute('class', 'grid-line');
    gridGroup.appendChild(horizontalLine);
}

// Helper function to snap to grid
function getSnappedPoint(x, y) {
    return { x: Math.round(x), y: Math.round(y) };
}

// Start drawing the shape
svg.addEventListener('mousedown', (event) => {
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
    const snappedPoint = getSnappedPoint(svgPoint.x, svgPoint.y);
    startX = snappedPoint.x;
    startY = snappedPoint.y;

    if (shapeType === 'line') {
        // If drawing a new line or continuing an existing one
        if (!currentShape) {
            currentShape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            currentShape.setAttribute('class', 'drawn-shape');
            currentShape.setAttribute('stroke-width', strokeWidth);
            currentShape.setAttribute('stroke-linecap', useRoundedCaps ? 'round' : 'butt');
            shapesGroup.appendChild(currentShape);
            currentPathData = `M ${startX} ${startY}`;
        } else {
            // Continue from last point
            currentPathData += ` L ${startX} ${startY}`;
        }
        currentShape.setAttribute('d', currentPathData);
    } else {
        // For circle and rectangle, reset current shape on each draw
        if (shapeType === 'circle') {
            currentShape = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            currentShape.setAttribute('cx', startX);
            currentShape.setAttribute('cy', startY);
            currentShape.setAttribute('r', 0);
        } else if (shapeType === 'rectangle') {
            currentShape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            currentShape.setAttribute('x', startX);
            currentShape.setAttribute('y', startY);
            currentShape.setAttribute('width', 0);
            currentShape.setAttribute('height', 0);
        }
        currentShape.setAttribute('stroke-width', strokeWidth);
        currentShape.setAttribute('stroke-linecap', useRoundedCaps ? 'round' : 'butt');
        currentShape.setAttribute('class', 'drawn-shape');
        shapesGroup.appendChild(currentShape);
    }
    isDrawing = true;
});

// Update the shape size as you drag
svg.addEventListener('mousemove', (event) => {
    if (!isDrawing || !currentShape) return;

    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const svgPoint = pt.matrixTransform(svg.getScreenCTM().inverse());
    const snappedPoint = getSnappedPoint(svgPoint.x, svgPoint.y);
    const endX = snappedPoint.x;
    const endY = snappedPoint.y;

    if (shapeType === 'circle') {
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        currentShape.setAttribute('r', radius);
    } else if (shapeType === 'rectangle') {
        currentShape.setAttribute('x', Math.min(startX, endX));
        currentShape.setAttribute('y', Math.min(startY, endY));
        currentShape.setAttribute('width', Math.abs(endX - startX));
        currentShape.setAttribute('height', Math.abs(endY - startY));
    }
});

// Finish drawing the shape
svg.addEventListener('mouseup', () => {
    if (currentShape && shapeType === 'line') {
        undoStack.push(currentShape.cloneNode(true)); // Add shape to undo stack
        redoStack = []; // Clear redo stack
    }
    isDrawing = false;
});

// Start a new line independently
newLineBtn.addEventListener('click', () => {
    currentShape = null;
    currentPathData = "";
});

// Shape selection change
shapeSelect.addEventListener('change', (e) => {
    shapeType = e.target.value;
    currentShape = null;
    currentPathData = "";
});

// Update stroke width
strokeWidthInput.addEventListener('input', (e) => strokeWidth = parseFloat(e.target.value));

// Toggle rounded caps
roundedCapsInput.addEventListener('change', (e) => useRoundedCaps = e.target.checked);

// Clear all shapes
clearBtn.addEventListener('click', () => {
    shapesGroup.innerHTML = '';
    undoStack = [];
    redoStack = [];
    currentShape = null;
    currentPathData = "";
});

// Undo functionality
undoBtn.addEventListener('click', () => {
    if (undoStack.length > 0) {
        const lastAction = undoStack.pop();
        redoStack.push(lastAction.cloneNode(true));
        shapesGroup.removeChild(shapesGroup.lastChild);
    }
});

// Redo functionality
redoBtn.addEventListener('click', () => {
    if (redoStack.length > 0) {
        const lastUndo = redoStack.pop();
        shapesGroup.appendChild(lastUndo);
        undoStack.push(lastUndo.cloneNode(true));
    }
});

// Save icon
saveIconBtn.addEventListener('click', () => {
    const iconData = shapesGroup.innerHTML;
    const iconName = prompt("Enter a name for this icon:");
    if (iconName) {
        localStorage.setItem(`icon_${iconName}`, iconData);
        updateIconList();
    }
});

// Load saved icons
function updateIconList() {
    loadIconSelect.innerHTML = '';
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith("icon_")) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key.replace("icon_", "");
            loadIconSelect.appendChild(option);
        }
    });
}

// Load selected icon
loadIconBtn.addEventListener('click', () => {
    const selectedIcon = loadIconSelect.value;
    if (selectedIcon) {
        shapesGroup.innerHTML = localStorage.getItem(selectedIcon);
        undoStack = []; // Clear undo stack after loading a saved icon
        redoStack = [];
    }
});

// Delete selected icon
deleteIconBtn.addEventListener('click', () => {
    const selectedIcon = loadIconSelect.value;
    if (selectedIcon && confirm("Are you sure you want to delete this icon?")) {
        localStorage.removeItem(selectedIcon);
        updateIconList();
    }
});

exportBtn.addEventListener('click', () => {
// Clone the SVG for export
const exportSvg = svg.cloneNode(true);

// Remove grid and keyline templates
const grid = exportSvg.querySelector('#grid');
const keylineTemplate = exportSvg.querySelector('#keyline-template');
if (grid) exportSvg.removeChild(grid);
if (keylineTemplate) exportSvg.removeChild(keylineTemplate);

// Get shapes and ensure they are visible in the export
const shapes = exportSvg.querySelector('#shapes');
if (!shapes || shapes.children.length === 0) {
alert("No shapes to export!");
return;
}

// Ensure all shapes are properly styled
Array.from(shapes.children).forEach(shape => {
shape.setAttribute('fill', 'none'); // Default fill
shape.setAttribute('stroke', 'black'); // Default stroke
});

// Convert the SVG to a Blob for downloading
const serializer = new XMLSerializer();
const svgBlob = new Blob([serializer.serializeToString(exportSvg)], { type: 'image/svg+xml' });

// Create a download link
const link = document.createElement('a');
link.href = URL.createObjectURL(svgBlob);
link.download = 'icon.svg';
link.click();

// Cleanup URL object
URL.revokeObjectURL(link.href);
});

const roundedCornersInput = document.getElementById('rounded-corners-input');
let useRoundedCorners = false;

// Update rounded corners toggle when the checkbox changes
roundedCornersInput.addEventListener('change', (e) => {
useRoundedCorners = e.target.checked;
});

// Handle rectangle drawing with rounded corners
svg.addEventListener('mousemove', (event) => {
if (!isDrawing || shapeType !== 'rectangle') return;

const rect = svg.getBoundingClientRect();
const currentX = (event.clientX - rect.left) * (24 / rect.width);
const currentY = (event.clientY - rect.top) * (24 / rect.height);

currentShape.setAttribute('width', Math.abs(currentX - startX));
currentShape.setAttribute('height', Math.abs(currentY - startY));
currentShape.setAttribute('x', Math.min(startX, currentX));
currentShape.setAttribute('y', Math.min(startY, currentY));

// Apply rounded corners if the checkbox is checked
if (useRoundedCorners) {
const cornerRadius = 2; // You can adjust this value
currentShape.setAttribute('rx', cornerRadius);
currentShape.setAttribute('ry', cornerRadius);
} else {
currentShape.setAttribute('rx', 0);
currentShape.setAttribute('ry', 0);
}
});


// Load icon list on page load
updateIconList();