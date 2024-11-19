// Assuming this is the uploaded script.js file for the mortgage calculator.

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded and parsed");
  
    // Attach event listener to the calculate button
    const calculateButton = document.getElementById("calculateButton");
    if (calculateButton) {
      calculateButton.addEventListener("click", function () {
        console.log("Calculate button clicked");
        calculateMortgage();
      });
    } else {
      console.error("Calculate button element not found");
    }
  });
  
  async function calculateMortgage() {
    console.log("calculateMortgage function executed");
  
    // Collect input values
    const salePrice = parseFloat(document.getElementById('salePrice').value);
    const currentMortgage = parseFloat(document.getElementById('currentMortgage').value);
    const legalFees = parseFloat(document.getElementById('legalFees').value);
    const agentFeesPercentage = parseFloat(document.getElementById('agentFeesPercentage').value);
    const futurePropertyPrice = parseFloat(document.getElementById('futurePropertyPrice').value);
    const interestRate = parseFloat(document.getElementById('interestRate').value);
    const loanTerm = parseInt(document.getElementById('loanTerm').value);
    const currentSalary = parseFloat(document.getElementById('currentSalary').value);
    const incomeMultiplier = parseFloat(document.getElementById('incomeMultiplier').value);
  
    // Log input values for debugging
    console.log("Sale Price:", salePrice);
    console.log("Current Mortgage:", currentMortgage);
    console.log("Legal Fees:", legalFees);
    console.log("Agent Fees Percentage:", agentFeesPercentage);
    console.log("Future Property Price:", futurePropertyPrice);
    console.log("Interest Rate:", interestRate);
    console.log("Loan Term:", loanTerm);
    console.log("Current Salary:", currentSalary);
    console.log("Income Multiplier:", incomeMultiplier);
  
    // Prepare the data to be sent to the server
    const requestData = {
      salePrice,
      currentMortgage,
      legalFees,
      agentFeesPercentage,
      futurePropertyPrice,
      interestRate,
      loanTerm,
      currentSalary,
      incomeMultiplier
    };
  
    try {
      // Make a POST request to the API Gateway endpoint
      const response = await fetch('https://j82c41u2s1.execute-api.us-east-1.amazonaws.com/stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
  
      console.log("API response received:", response);
  
      if (response.ok) {
        const result = await response.json();
        console.log("API result:", result);
  
        // Update the UI with the results from the Lambda function
        document.getElementById('agentFees').innerText = `£${result.agentFees}`;
        document.getElementById('leftoverAmount').innerText = `£${result.leftoverAmount}`;
        document.getElementById('monthlyMortgage').innerText = `£${result.monthlyMortgage}`;
        document.getElementById('estimatedBorrowing').innerText = `£${result.estimatedBorrowing}`;
        document.getElementById('incomeDifference').innerText = `£${result.incomeDifference}`;
      } else {
        console.error('API error:', await response.text());
      }
    } catch (error) {
      console.error('Error while calculating mortgage:', error);
    }

  


document.addEventListener('DOMContentLoaded', function () {
    const sections = [
        'iconography-content',
        'design-systems-content',
        'vectorPaintContainer',
        'mortgageCalculatorContainer'
    ];

    document.querySelectorAll('.side-panel a').forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();

            // Hide all sections
            sections.forEach(section => {
                const element = document.getElementById(section);
                if (element) {
                    element.style.display = 'none';
                }
            });

            // Show the target section
            const target = this.getAttribute('href').replace('#', '') + '-content';
            const targetElement = document.getElementById(target);
            if (targetElement) {
                targetElement.style.display = 'block';
            }
        });
    });

    // Default: Show the first section
    document.getElementById('iconography-content').style.display = 'block';
});



document.querySelector('a[href="#vector-paint"]').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('design-system-content').classList.add('hidden'); // Ensure Design System is hidden
    document.getElementById('vectorPaintContainer').style.display = 'block';
});

document.addEventListener("DOMContentLoaded", () => {
    const mortgageCalculatorContainer = document.getElementById("mortgageCalculatorContainer");
    const vectorPaintContainer = document.getElementById("vectorPaintContainer");

    function hideSections() {
        document.querySelectorAll('.blog-content, #vectorPaintContainer, #mortgageCalculatorContainer').forEach(section => {
            section.style.display = 'none';
        });
    }

    document.querySelector('a[href="#vector-paint"]').addEventListener('click', (e) => {
        e.preventDefault();
        hideSections();
        document.getElementById('vectorPaintContainer').style.display = 'block';
    });
    

    document.querySelector('a[href="#iconography"]').addEventListener('click', (e) => {
        e.preventDefault();
        hideSections(); // Hide all other sections
        const iconographyContent = document.getElementById('iconography-content');
        iconographyContent.classList.remove('hidden'); // Show Iconography content
        iconographyContent.style.display = 'block'; // Ensure it is visible if not controlled by hidden class
    });
    

    document.querySelector('a[href="#design-systems"]').addEventListener('click', (e) => {
        e.preventDefault();
        hideSections(); // Hide other sections
        switchContent(document.getElementById('design-system-content'));
    });

    document.querySelector('a[href="#mortgage-calculator"]').addEventListener('click', (e) => {
        e.preventDefault();
        hideSections(); // First, hide other sections
        mortgageCalculatorContainer.style.display = "block"; // Show Mortgage Calculator
    });

    // Function to switch blog content visibility
    function switchContent(contentToShow) {
        document.querySelectorAll('.blog-content').forEach(content => {
            content.classList.add('hidden');
        });
        contentToShow.classList.remove('hidden');
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const homeContent = document.getElementById('home-content');
    const iconographyContent = document.getElementById('iconography-content');
    const designSystemContent = document.getElementById('design-system-content');

    document.querySelector('a[href="#iconography"]').addEventListener('click', (e) => {
        e.preventDefault();
        switchContent(iconographyContent);
    });

    document.querySelector('a[href="#design-systems"]').addEventListener('click', (e) => {
        e.preventDefault();
        switchContent(designSystemContent);
    });

    document.querySelector('a[href="#home"]').addEventListener('click', (e) => {
        e.preventDefault();
        switchContent(homeContent);
    });

    function switchContent(contentToShow) {
        document.querySelectorAll('.blog-content').forEach(content => {
            content.classList.add('hidden');
        });
        contentToShow.classList.remove('hidden');
    }
});

        document.addEventListener("DOMContentLoaded", () => {
    const iconographyLink = document.querySelector('a[href="#iconography-panel"]');
    const designSystemLink = document.querySelector('a[href="#design-system-panel"]');

    iconographyLink.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("iconography-panel").classList.add("open");
    });

    designSystemLink.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById("design-system-panel").classList.add("open");
    });

    document.querySelectorAll(".close-btn").forEach(button => {
        button.addEventListener("click", () => {
            const panel = button.closest(".sliding-panel");
            panel.classList.remove("open");
        });
    });
});


 function toggleDarkMode() {
            document.body.classList.toggle('dark-mode');
            const icon = document.getElementById('darkModeIcon');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        }

        function toggleDepositInput() {
            const isSellingHouse = document.getElementById('isSellingHouse').value;
            const saleFields = document.getElementById('saleFields');
            const depositField = document.getElementById('depositField');
            if (isSellingHouse === 'yes') {
                saleFields.style.display = 'block';
                depositField.style.display = 'none';
            } else {
                saleFields.style.display = 'none';
                depositField.style.display = 'block';
            }
        }

        let isInputChanged = false; // Flag to track if input has changed

        // Function to set up event listeners on all input fields
        function setupInputChangeListeners() {
            const inputs = document.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    isInputChanged = true; // Mark input as changed
                    document.querySelector('button').innerHTML = ''; // Change button label
                });
            });
        }

        // Function to run calculations
        async function calculateMortgage() {
            console.log("Calculate button clicked"); // Debug line
            // Collect user inputs
            const salePrice = parseFloat(document.getElementById('salePrice').value);
            const currentMortgage = parseFloat(document.getElementById('currentMortgage').value);
            const legalFees = parseFloat(document.getElementById('legalFees').value);
            const agentFeesPercentage = parseFloat(document.getElementById('agentFeesPercentage').value);
            const futurePropertyPrice = parseFloat(document.getElementById('futurePropertyPrice').value);
            const interestRate = parseFloat(document.getElementById('interestRate').value);
            const loanTerm = parseInt(document.getElementById('loanTerm').value);
            const currentSalary = parseFloat(document.getElementById('currentSalary').value);
            const incomeMultiplier = parseFloat(document.getElementById('incomeMultiplier').value);
        
            // Prepare the data to be sent to the server
            const requestData = {
                salePrice,
                currentMortgage,
                legalFees,
                agentFeesPercentage,
                futurePropertyPrice,
                interestRate,
                loanTerm,
                currentSalary,
                incomeMultiplier
            };
        
            try {
                // Make a POST request to the API Gateway endpoint
                const response = await fetch('https://j82c41u2s1.execute-api.us-east-1.amazonaws.com/prod', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
        
                if (response.ok) {
                    const result = await response.json();
        
                    // Update the UI with the results from the Lambda function
                    document.getElementById('agentFees').innerText = `£${result.agentFees}`;
                    document.getElementById('leftoverAmount').innerText = `£${result.leftoverAmount}`;
                    document.getElementById('monthlyMortgage').innerText = `£${result.monthlyMortgage}`;
                    document.getElementById('estimatedBorrowing').innerText = `£${result.estimatedBorrowing}`;
                    document.getElementById('incomeDifference').innerText = `£${result.incomeDifference}`;
                } else {
                    console.error('API error:', await response.text());
                }
            } catch (error) {
                console.error('Error while calculating mortgage:', error);
            }
        }
    }

            function toggleCreditScoreInput() {
    const provider = document.getElementById('creditScoreProvider').value;
    const creditScoreInputGroup = document.getElementById('creditScoreInputGroup');
    const creditScoreRangeGroup = document.getElementById('creditScoreRangeGroup');
    const creditScoreRange = document.getElementById('creditScoreRange');

    creditScoreInputGroup.style.display = 'block'; // Always allow manual entry

        if (provider === 'manual') {
        creditScoreRangeGroup.style.display = 'block';
        creditScoreRange.innerHTML = `
            <strong>Manual Credit Score Ranges:</strong><br>
            Poor: 0 – 599<br>
            Fair: 600 – 749<br>
            Excellent: 750 and above<br>
            For more accurate calculations we recommend using a credit score provider such as CheckMyFile.
        `;
    } else if (provider === 'equifax') {
        creditScoreRangeGroup.style.display = 'block';
        creditScoreRange.innerHTML = `
            <strong>Equifax Credit Score Ranges:</strong><br>
            Poor: 0 - 438<br>
            Fair: 439 - 530<br>
            Good: 531 - 670<br>
            Very Good: 671 - 810<br>
            Excellent: 811 - 1000
        `;
    } else if (provider === 'experian') {
        creditScoreRangeGroup.style.display = 'block';
        creditScoreRange.innerHTML = `
            <strong>Experian Credit Score Ranges:</strong><br>
            Very Poor: 0 - 560<br>
            Poor: 561 - 720<br>
            Fair: 721 - 880<br>
            Good: 881 - 960<br>
            Excellent: 961 - 999
        `;
    } else if (provider === 'transunion') {
        creditScoreRangeGroup.style.display = 'block';
        creditScoreRange.innerHTML = `
            <strong>TransUnion Credit Score Ranges:</strong><br>
            Very Poor: 0 - 550<br>
            Poor: 551 - 565<br>
            Fair: 566 - 603<br>
            Good: 604 - 627<br>
            Excellent: 628 - 710
        `;
    } else {
        creditScoreRangeGroup.style.display = 'none';
    }
}


        function calculate() {
            // Get the original interest rate from the input field
            const originalInterestRate = parseFloat(document.getElementById('interestRate').value.replace(/,/g, '')) || 0;
            const creditScore = parseInt(document.getElementById('creditScore').value) || 0;
    
            // Create a new variable for the adjusted interest rate
            let adjustedInterestRate = originalInterestRate;
    
            // Adjust the interest rate based on credit score
            if (creditScore >= 750) {
                adjustedInterestRate = originalInterestRate * 0.9; // Apply a 10% discount for excellent credit
            } else if (creditScore < 600) {
                adjustedInterestRate = originalInterestRate * 1.2; // Increase rate by 20% for poor credit
            }
    
            // Note: Do NOT update the interest rate input field. Use adjustedInterestRate only for calculations.
    
            const isSellingHouse = document.getElementById('isSellingHouse').value;
            let downPayment;
    
            if (isSellingHouse === 'yes') {
                const salePrice = parseFloat(document.getElementById('salePrice').value.replace(/,/g, '')) || 0;
                const currentMortgage = parseFloat(document.getElementById('currentMortgage').value.replace(/,/g, '')) || 0;
                const legalFees = parseFloat(document.getElementById('legalFees').value.replace(/,/g, '')) || 0;
                const agentFeesPercentage = parseFloat(document.getElementById('agentFeesPercentage').value.replace(/,/g, '')) || 0;
                const agentFees = (agentFeesPercentage / 100) * salePrice;
                const leftoverAmount = salePrice - currentMortgage - legalFees - agentFees;
                downPayment = leftoverAmount;
                document.getElementById('agentFees').innerText = `£${agentFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                document.getElementById('leftoverAmount').innerText = `£${leftoverAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            } else {
                downPayment = parseFloat(document.getElementById('depositAmount').value.replace(/,/g, '')) || 0;
            }
    
            const futurePropertyPrice = parseFloat(document.getElementById('futurePropertyPrice').value.replace(/,/g, '')) || 0;
            const loanTerm = parseInt(document.getElementById('loanTerm').value) || 30;
            const isAdditionalProperty = document.getElementById('isAdditionalProperty').value.trim().toLowerCase() === 'yes';
            const currentSalary = parseFloat(document.getElementById('currentSalary').value.replace(/,/g, '')) || 0;
            const incomeMultiplier = parseFloat(document.getElementById('incomeMultiplier').value);
    
            const purchaseStampDuty = calculateStampDuty(futurePropertyPrice, isAdditionalProperty);
            document.getElementById('purchaseStampDuty').innerText = `£${purchaseStampDuty.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    
            const downPaymentPercentage = (downPayment / futurePropertyPrice) * 100;
            document.getElementById('downPaymentPercentage').innerText = `${downPaymentPercentage.toFixed(2)}%`;
    
            const reducedCost = futurePropertyPrice - downPayment;
            document.getElementById('reducedCost').innerText = `£${reducedCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    
            const loanAmount = reducedCost;
            const monthlyInterestRate = (adjustedInterestRate / 100) / 12;
            const numberOfPayments = loanTerm * 12;
            const monthlyPayment = (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
            document.getElementById('monthlyMortgage').innerText = `£${monthlyPayment.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    
            const estimatedBorrowing = currentSalary * incomeMultiplier;
            const requiredIncome = loanAmount / incomeMultiplier;
            const incomeDifference = estimatedBorrowing - loanAmount;
    
            document.getElementById('estimatedBorrowing').innerText = `£${estimatedBorrowing.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            document.getElementById('incomeDifference').innerText = `£${incomeDifference.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            document.getElementById('requiredIncome').innerText = `£${requiredIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        }
    
        function calculateStampDuty(price, isAdditionalProperty) {
            let stampDuty = 0;
            const thresholds = [
                { limit: 250000, rate: 0.00 },
                { limit: 925000, rate: 0.05 },
                { limit: 1500000, rate: 0.10 },
                { limit: Infinity, rate: 0.12 }
            ];
    
            let remainingPrice = price;
            for (let i = 0; i < thresholds.length; i++) {
                if (remainingPrice > 0) {
                    const taxableAmount = Math.min(remainingPrice, thresholds[i].limit - (thresholds[i - 1]?.limit || 0));
                    stampDuty += taxableAmount * thresholds[i].rate;
                    remainingPrice -= taxableAmount;
                } else {
                    break;
                }
            }
    
            if (isAdditionalProperty) {
                stampDuty *= 1.05; // Additional 5% for additional properties
            }
    
            return stampDuty;
        }
        
        window.onload = function() {
    setupInputChangeListeners(); // To call the setup function when the page loads
    toggleCreditScoreInput(); // To show the manual ranges on page load
};

    // document.addEventListener("DOMContentLoaded", () => {
    //     const vectorPaintLink = document.querySelector('a[href="#vector-paint"]');
    //     const mortgageCalculatorLink = document.querySelector('a[href="#mortgage-calculator"]');
    //     const vectorPaintContainer = document.getElementById("vectorPaintContainer");
    //     const mortgageCalculatorContainer = document.getElementById("mortgageCalculatorContainer");

    //     vectorPaintLink.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         vectorPaintContainer.style.display = "block"; // Show Vector Paint
    //         mortgageCalculatorContainer.style.display = "none"; // Hide Mortgage Calculator
    //     });

    //     mortgageCalculatorLink.addEventListener("click", (e) => {
    //         e.preventDefault();
    //         mortgageCalculatorContainer.style.display = "block"; // Show Mortgage Calculator
    //         vectorPaintContainer.style.display = "none"; // Hide Vector Paint
    //     });

        // document.getElementById("dismissAll").addEventListener("click", () => {
        //     mortgageCalculatorContainer.style.display = "none";
        //     vectorPaintContainer.style.display = "none";
        // });
    // });

    // document.addEventListener("DOMContentLoaded", () => {
    //     const mortgageCalculatorLink = document.querySelector('a[href="#mortgage-calculator"]');
    //     const mortgageCalculatorContainer = document.getElementById("mortgageCalculatorContainer");

    //     mortgageCalculatorLink.addEventListener("click", (e) => {
    //         e.preventDefault();

    //         // Show the mortgage calculator container
    //         mortgageCalculatorContainer.style.display = "block";

    //         // Hide any other sections if necessary
    //         document.querySelectorAll(".sliding-panel.open, .vectorPaintContainer, #vectorPaintContainer").forEach(panel => {
    //             panel.style.display = "none";
    //         });
    //     });

        // // Optional: Add logic to hide it on "Dismiss All" click
        // document.getElementById("dismissAll").addEventListener("click", () => {
        //     mortgageCalculatorContainer.style.display = "none";
        // });
    // });


    document.addEventListener("DOMContentLoaded", () => {
        const paintbrushHint = document.getElementById("paintbrushHint");
        const drawBtn = document.getElementById("drawBtn");

        // Show the hint when the page loads
        setTimeout(() => {
            paintbrushHint.style.display = "block";
        }, 500); // Slight delay to draw attention

        // Hide the hint when the paintbrush is clicked
        drawBtn.addEventListener("click", () => {
            paintbrushHint.style.display = "none";
        });

        // Optional: Automatically hide the hint after 10 seconds
        setTimeout(() => {
            paintbrushHint.style.display = "none";
        }, 10000); // 10 seconds
    });

    document.querySelectorAll(".side-panel a").forEach(link => {
        link.addEventListener("click", (e) => {
            if (link.getAttribute("href") !== "#vector-paint") {
                vectorPaintContainer.style.display = "none";
            }
        });
    });

    document.addEventListener("DOMContentLoaded", () => {
        const vectorPaintLink = document.querySelector('a[href="#vector-paint"]');
        const vectorPaintContainer = document.getElementById("vectorPaintContainer");

        vectorPaintLink.addEventListener("click", (e) => {
            e.preventDefault();

            // Toggle the visibility of the Vector Paint container
            vectorPaintContainer.style.display = "block";
            
            // Hide any other panels or content if necessary
            document.querySelectorAll(".sliding-panel.open, .sliding-panel-skills.open, .sliding-panel-tools.open, .sliding-panel-education.open").forEach(panel => {
                panel.classList.remove("open");
            });
        });

    //     // Optional: Hide the Vector Paint tool when clicking outside or dismissing
    //     document.getElementById("dismissAll").addEventListener("click", () => {
    //         vectorPaintContainer.style.display = "none";
    //     });
    // });

    // document.addEventListener("DOMContentLoaded", () => {
    //     const dismissAllButton = document.getElementById("dismissAll");

    //     function updateDismissAllButton() {
    //         const openPanels = document.querySelectorAll(".sliding-panel.open, .sliding-panel-skills.open, .sliding-panel-tools.open, .sliding-panel-education.open");
    //         if (openPanels.length > 1) {
    //             dismissAllButton.style.display = "inline-block"; // Adjust to inline-block for inline layout
    //         } else {
    //             dismissAllButton.style.display = "none";
    //         }
    //     }

        // document.querySelectorAll(".sliding-panel, .sliding-panel-skills, .sliding-panel-tools, .sliding-panel-education").forEach(panel => {
        //     panel.addEventListener("transitionend", updateDismissAllButton);
        // });

    //     dismissAllButton.addEventListener("click", () => {
    //         document.querySelectorAll(".sliding-panel.open, .sliding-panel-skills.open, .sliding-panel-tools.open, .sliding-panel-education.open").forEach(panel => {
    //             panel.classList.remove("open");
    //         });
    //         updateDismissAllButton();
    //     });

    //     updateDismissAllButton();
    // });

    document.querySelectorAll(".side-panel a").forEach(link => {
    link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (!href.startsWith("http")) { 
            // Prevent default only for internal links.
            e.preventDefault(); 
            const targetPanelId = href.substring(1) + "-panel";
            document.getElementById(targetPanelId)?.classList.add("open");
        }
    });

    document.querySelectorAll(".close-btn").forEach(button => {
        button.addEventListener("click", () => {
            const panel = button.closest(".sliding-panel");
            panel.classList.remove("open");
        });
    });
});

    function closePanel(panelId) {
    document.getElementById(panelId).classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
    const paintbrushHint = document.getElementById("paintbrushHint");
    const svgCanvas = document.getElementById("drawingCanvas");
    const drawBtn = document.getElementById("drawBtn");
    const lineSizeSlider = document.getElementById("lineSizeSlider");
    const opacitySlider = document.getElementById("opacitySlider");
    const sizeOpacityBtn = document.getElementById("sizeOpacityBtn");
    const sizeOpacityDiv = document.getElementById("sizeOpacityDiv");
    const colorPreview = document.getElementById("colorPreview");
    const colorPaletteDiv = document.getElementById("colorPaletteDiv");
    const colorPickerCanvas = document.getElementById("colorPickerCanvas");
    const colorPickerCtx = colorPickerCanvas.getContext("2d");
    const innerColorSquare = document.getElementById("innerColorSquare");
    const saveDrawingBtn = document.getElementById("saveDrawingBtn");
    const loadDrawingBtn = document.getElementById("loadDrawingBtn");
    const resetBtn = document.getElementById("resetBtn");
    const savePanel = document.getElementById("savePanel");
    const savedDrawingsContainer = document.getElementById("savedDrawings");

    let drawColor = "#000000";
    let lineWidth = 5; // Default brush size
    let opacity = 1.0; // Default opacity
    let drawing = false;
    let currentPath = null;
    let savedDrawings = [];

    lineSizeSlider.addEventListener("input", (e) => {
    lineWidth = e.target.value; // Update brush size dynamically
    });

    opacitySlider.addEventListener("input", (e) => {
    opacity = e.target.value; // Update opacity dynamically
    });

    
    document.addEventListener("DOMContentLoaded", () => {
    

    // Show the hint when the page loads
    setTimeout(() => {
        paintbrushHint.style.display = "block";
    }, 500); // Slight delay to draw attention

    // Hide the hint when the paintbrush is clicked
    drawBtn.addEventListener("click", () => {
        paintbrushHint.style.display = "none";
    });

    // Optional: Automatically hide the hint after 10 seconds
    setTimeout(() => {
        paintbrushHint.style.display = "none";
    }, 10000); // 10 seconds
});

    // Toggle draw button
    drawBtn.addEventListener("click", () => {
        drawBtn.classList.toggle("active");
    });

    // Toggle size and opacity panel
    sizeOpacityBtn.addEventListener("click", () => {
        sizeOpacityDiv.classList.toggle("open");
    });

    // Open color palette
    colorPreview.addEventListener("click", () => {
        colorPaletteDiv.classList.toggle("open");
    });

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
if (!drawing || !drawing.data) {
    alert("No valid drawing data to export.");
    return;
}
const blob = new Blob([drawing.data], { type: "image/svg+xml;charset=utf-8" });
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = `${drawing.name || 'untitled'}.svg`;
document.body.appendChild(link); // Append to ensure the click is registered
link.click();
document.body.removeChild(link); // Cleanup after download
URL.revokeObjectURL(url);
};


    // Reset canvas
    resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset the canvas?")) {
            svgCanvas.innerHTML = "";
        }
    });

    // Save drawing
    saveDrawingBtn.addEventListener("click", () => {
        const drawingName = prompt("Enter a name for your drawing:");
        if (!drawingName || savedDrawings.some(d => d.name === drawingName)) {
            alert("Invalid or duplicate name. Please try again.");
            return;
        }
        const svgData = new XMLSerializer().serializeToString(svgCanvas);
        savedDrawings.push({ name: drawingName, data: svgData });
        updateSavedDrawings();
        alert("Drawing saved successfully!");
    });

    // Load drawing panel
    loadDrawingBtn.addEventListener("click", () => {
        savePanel.classList.toggle("open");
    });

    // Update saved drawings list
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

    
    
    // Drawing functionality
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
});