function calculateInvestment() {
    const purchasePrice = parseFloat(document.getElementById('purchasePrice').value);
    const renovationCosts = parseFloat(document.getElementById('renovationCosts').value);
    const contingencyPercent = parseFloat(document.getElementById('contingencyPercent').value) || 10;
    const holdingCosts = parseFloat(document.getElementById('holdingCosts').value) || 0;
    const agentFeePercent = parseFloat(document.getElementById('agentFeePercent').value) || 1.5;
    const bridgingLoanMonths = parseFloat(document.getElementById('bridgingLoanMonths').value) || 6;
    const bridgingLoanRate = parseFloat(document.getElementById('bridgingLoanRate').value) || 1;
    const arv = parseFloat(document.getElementById('arv').value);

    if (isNaN(purchasePrice) || isNaN(renovationCosts) || isNaN(arv)) {
        alert('Please fill out all required fields with valid numbers.');
        return;
    }

    // Calculate contingency fund
    const contingencyFund = (contingencyPercent / 100) * renovationCosts;

    // Calculate estate agent fees
    const agentFees = (agentFeePercent / 100) * arv;

    // Calculate bridging loan costs
    const bridgingLoanCosts = (bridgingLoanRate / 100) * purchasePrice * bridgingLoanMonths;

    // Total costs
    const totalCosts = purchasePrice + renovationCosts + contingencyFund + holdingCosts + agentFees + bridgingLoanCosts;

    // Profit/Loss
    const profit = arv - totalCosts;

    // Display results
    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';

    const resultText = document.getElementById('resultText');
    if (profit > 0) {
        resultText.textContent = `Profit: £${profit.toLocaleString()} (Positive ROI)`;
        resultText.className = 'result-value positive';
    } else {
        resultText.textContent = `Loss: £${Math.abs(profit).toLocaleString()} (Negative ROI)`;
        resultText.className = 'result-value negative';
    }
}