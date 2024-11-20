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
function calculate() {
    if (!isInputChanged) {
        // If input hasn't changed, block repeated calculations
        alert("No changes detected. Please modify an input to recalculate.");
        return;
    }

    // Reset the flag since we are calculating now
    isInputChanged = false;
    document.querySelector('button').innerHTML = '<i class="fas fa-calculator"></i> Calculate'; // Reset button label

    // Get values from the form inputs
    const provider = document.getElementById('creditScoreProvider').value;
    let creditScore = parseInt(document.getElementById('creditScore').value) || 0;
    let borrowingAdjustmentFactor = 1.0;

    // Determine the credit score ranges based on the selected provider or manual entry
    if (provider === 'manual') {
        if (creditScore >= 750) {
            borrowingAdjustmentFactor = 1.0; // Excellent
        } else if (creditScore >= 600 && creditScore < 750) {
            borrowingAdjustmentFactor = 0.90; // Fair
        } else {
            borrowingAdjustmentFactor = 0.80; // Poor
        }
    } else if (provider === 'equifax') {
        if (creditScore >= 811) {
            borrowingAdjustmentFactor = 1.0; // Excellent
        } else if (creditScore >= 671 && creditScore < 811) {
            borrowingAdjustmentFactor = 0.95; // Very Good
        } else if (creditScore >= 531 && creditScore < 671) {
            borrowingAdjustmentFactor = 0.90; // Good
        } else if (creditScore >= 439 && creditScore < 531) {
            borrowingAdjustmentFactor = 0.85; // Fair
        } else {
            borrowingAdjustmentFactor = 0.80; // Poor
        }
    } else if (provider === 'experian') {
        if (creditScore >= 961) {
            borrowingAdjustmentFactor = 1.0; // Excellent
        } else if (creditScore >= 881 && creditScore < 961) {
            borrowingAdjustmentFactor = 0.95; // Good
        } else if (creditScore >= 721 && creditScore < 881) {
            borrowingAdjustmentFactor = 0.90; // Fair
        } else if (creditScore >= 561 && creditScore < 721) {
            borrowingAdjustmentFactor = 0.85; // Poor
        } else {
            borrowingAdjustmentFactor = 0.80; // Very Poor
        }
    } else if (provider === 'transunion') {
        if (creditScore >= 628) {
            borrowingAdjustmentFactor = 1.0; // Excellent
        } else if (creditScore >= 604 && creditScore < 628) {
            borrowingAdjustmentFactor = 0.95; // Good
        } else if (creditScore >= 566 && creditScore < 604) {
            borrowingAdjustmentFactor = 0.90; // Fair
        } else if (creditScore >= 551 && creditScore < 566) {
            borrowingAdjustmentFactor = 0.85; // Poor
        } else {
            borrowingAdjustmentFactor = 0.80; // Very Poor
        }
    }

    // Perform calculations using the borrowingAdjustmentFactor
    const currentSalary = parseFloat(document.getElementById('currentSalary').value.replace(/,/g, '')) || 0;
    const incomeMultiplier = parseFloat(document.getElementById('incomeMultiplier').value);
    const estimatedBorrowing = currentSalary * incomeMultiplier * borrowingAdjustmentFactor;
    document.getElementById('estimatedBorrowing').innerText = `£${estimatedBorrowing.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    // Update other calculations as needed...
    alert("Calculation complete!");
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