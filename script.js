        document.addEventListener("DOMContentLoaded", () => {
            const svgCanvas = document.getElementById("drawingCanvas");
            const drawBtn = document.getElementById("drawBtn");
            const sizeOpacityBtn = document.getElementById("sizeOpacityBtn");
            const sizeOpacityDiv = document.getElementById("sizeOpacityDiv");
            const lineSizeSlider = document.getElementById("lineSizeSlider");
            const opacitySlider = document.getElementById("opacitySlider");
            const colorPreview = document.getElementById("colorPreview");
            const colorPaletteDiv = document.getElementById("colorPaletteDiv");
            const colorPickerCanvas = document.getElementById("colorPickerCanvas");
            const colorPickerCtx = colorPickerCanvas.getContext("2d");
            const saveDrawingBtn = document.getElementById("saveDrawingBtn");
            const loadDrawingBtn = document.getElementById("loadDrawingBtn");
            const resetBtn = document.getElementById("resetBtn");
            const savePanel = document.getElementById("savePanel");
            const savedDrawingsContainer = document.getElementById("savedDrawings");
            const experiencePanel = document.getElementById("experience-panel");
            const experienceLink = document.getElementById("experience-link");
            const closeBtn = document.querySelector(".close-btn");
    
            let drawColor = "#000000";
            let lineWidth = 5;
            let opacity = 1.0;
            let drawing = false;
            let currentPath = null;
            let savedDrawings = [];
    
            // Event listeners
            drawBtn.addEventListener("click", () => {
                drawBtn.classList.toggle("active");
            });
    
            sizeOpacityBtn.addEventListener("click", () => {
                sizeOpacityDiv.classList.toggle("open");
            });
    
            colorPreview.addEventListener("click", () => {
                colorPaletteDiv.classList.toggle("open");
            });
    
            resetBtn.addEventListener("click", () => {
                if (confirm("Are you sure you want to reset the canvas?")) {
                    svgCanvas.innerHTML = "";
                }
            });
    
            saveDrawingBtn.addEventListener("click", () => {
                let drawingName = prompt("Enter a name for your drawing:");
                if (!drawingName || savedDrawings.some(d => d.name === drawingName)) {
                    alert("Invalid or duplicate name. Please try again.");
                    return;
                }
                const svgData = new XMLSerializer().serializeToString(svgCanvas);
                savedDrawings.push({ name: drawingName, data: svgData });
                updateSavedDrawings();
                alert("Drawing saved successfully!");
            });
    
            loadDrawingBtn.addEventListener("click", () => {
                savePanel.classList.toggle("open");
            });
            experienceLink.addEventListener("click", (e) => {
                e.preventDefault();
                experiencePanel.classList.add("open");
            });
            closeBtn.addEventListener("click", () => {
                experiencePanel.classList.remove("open");
            });
            lineSizeSlider.addEventListener("input", (e) => {
                lineWidth = e.target.value;
            });
            opacitySlider.addEventListener("input", (e) => {
                opacity = e.target.value;
            });
    
            svgCanvas.addEventListener("mousedown", startDrawing);
            svgCanvas.addEventListener("mousemove", moveDrawing);
            svgCanvas.addEventListener("mouseup", stopDrawing);
            svgCanvas.addEventListener("mouseleave", stopDrawing);
    
            function startDrawing(e) {
                if (!drawBtn.classList.contains("active")) return;
                drawing = true;
                const { x, y } = getMousePosition(e);
                currentPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
                currentPath.setAttribute("d", `M${x},${y}`);
                currentPath.setAttribute("stroke", drawColor);
                currentPath.setAttribute("stroke-opacity", opacity);
                currentPath.setAttribute("stroke-width", lineWidth);
                currentPath.setAttribute("fill", "none");
                currentPath.setAttribute("stroke-linecap", "round");
                currentPath.setAttribute("stroke-linejoin", "round");
                svgCanvas.appendChild(currentPath);
            }
    
            function moveDrawing(e) {
                if (!drawing) return;
                const { x, y } = getMousePosition(e);
                const d = currentPath.getAttribute("d");
                currentPath.setAttribute("d", `${d} L${x},${y}`);
            }
    
            function stopDrawing() {
                drawing = false;
                currentPath = null;
            }
    
            function getMousePosition(e) {
                const rect = svgCanvas.getBoundingClientRect();
                return { x: e.clientX - rect.left, y: e.clientY - rect.top };
            }
    
            function updateSavedDrawings() {
                savedDrawingsContainer.innerHTML = "";
                savedDrawings.forEach((drawing, index) => {
                    const drawingElement = document.createElement("div");
                    drawingElement.classList.add("saved-drawing");
                    drawingElement.innerHTML = `
                        <span>${drawing.name}</span>
                        <button onclick="loadSavedDrawing(${index})"><i class="fa-regular fa-window-restore"></i></button>
                        <button onclick="exportDrawing(${index})"><i class="fa-solid fa-download"></i></button>
                        <button onclick="deleteSavedDrawing(${index})"><i class="fa-solid fa-trash"></i></button>
                    `;
                    savedDrawingsContainer.appendChild(drawingElement);
                });
            }
    
            window.loadSavedDrawing = function(index) {
                const confirmLoad = confirm("This will overwrite the current canvas. Continue?");
                if (confirmLoad) {
                    const drawing = savedDrawings[index];
                    svgCanvas.innerHTML = drawing.data;
                    alert("Drawing loaded successfully!");
                }
            };
    
            window.deleteSavedDrawing = function(index) {
                if (confirm("Are you sure you want to delete this drawing?")) {
                    savedDrawings.splice(index, 1);
                    updateSavedDrawings();
                    alert("Drawing deleted successfully!");
                }
            };
    
            window.exportDrawing = function(index) {
                const drawing = savedDrawings[index];
                const blob = new Blob([drawing.data], { type: "image/svg+xml" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${drawing.name}.svg`;
                link.click();
                URL.revokeObjectURL(url);
            };
    
            // Reset canvas
            resetBtn.addEventListener("click", () => {
                if (confirm("Are you sure you want to reset the canvas?")) {
                    svgCanvas.innerHTML = "";
                }
            });

             // Color Picker Logic
             colorPickerCanvas.addEventListener("click", (e) => {
                const rect = colorPickerCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const pixel = colorPickerCtx.getImageData(x, y, 1, 1).data;
                if (pixel[3] !== 0) { // Check for alpha to ensure a color is selected
                    drawColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
                    colorPreview.style.backgroundColor = drawColor;
                    drawInnerColorSquare(); // Update inner color square with new hue
                }
            });

            innerColorSquare.addEventListener("click", (e) => {
                const rect = innerColorSquare.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ctx = document.createElement("canvas").getContext("2d");
                ctx.canvas.width = rect.width;
                ctx.canvas.height = rect.height;

                const gradientHorizontal = ctx.createLinearGradient(0, 0, rect.width, 0);
                gradientHorizontal.addColorStop(0, "white");
                gradientHorizontal.addColorStop(1, drawColor);
                ctx.fillStyle = gradientHorizontal;
                ctx.fillRect(0, 0, rect.width, rect.height);

                const gradientVertical = ctx.createLinearGradient(0, 0, 0, rect.height);
                gradientVertical.addColorStop(0, "rgba(0, 0, 0, 0)");
                gradientVertical.addColorStop(1, "black");
                ctx.fillStyle = gradientVertical;
                ctx.fillRect(0, 0, rect.width, rect.height);

                const pixel = ctx.getImageData(x, y, 1, 1).data;
                drawColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
                colorPreview.style.backgroundColor = drawColor;
            });
            
            // Draw color picker
            function drawColorPicker() {
                const radius = colorPickerCanvas.width / 2;
                const gradientOuter = colorPickerCtx.createConicGradient(0, radius, radius);

                gradientOuter.addColorStop(0, 'red');
                gradientOuter.addColorStop(0.16, 'yellow');
                gradientOuter.addColorStop(0.33, 'green');
                gradientOuter.addColorStop(0.5, 'cyan');
                gradientOuter.addColorStop(0.66, 'blue');
                gradientOuter.addColorStop(0.83, 'magenta');
                gradientOuter.addColorStop(1, 'red');

                colorPickerCtx.fillStyle = gradientOuter;
                colorPickerCtx.beginPath();
                colorPickerCtx.arc(radius, radius, radius, 0, 2 * Math.PI);
                colorPickerCtx.fill();

                drawInnerColorSquare();
            }

            function drawInnerColorSquare() {
                const ctx = document.createElement("canvas").getContext("2d");
                const width = 150;
                const height = 150;
                ctx.canvas.width = width;
                ctx.canvas.height = height;

                const gradientHorizontal = ctx.createLinearGradient(0, 0, width, 0);
                gradientHorizontal.addColorStop(0, "white");
                gradientHorizontal.addColorStop(1, drawColor);
                ctx.fillStyle = gradientHorizontal;
                ctx.fillRect(0, 0, width, height);

                const gradientVertical = ctx.createLinearGradient(0, 0, 0, height);
                gradientVertical.addColorStop(0, "rgba(0, 0, 0, 0)");
                gradientVertical.addColorStop(1, "black");
                ctx.fillStyle = gradientVertical;
                ctx.fillRect(0, 0, width, height);

                innerColorSquare.style.backgroundImage = `url(${ctx.canvas.toDataURL()})`;
            }

            drawColorPicker();
        });

    