"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Coins, Wallet, Stamp, PieChart, CreditCard, Calendar, DollarSign, BarChart2, UserCheck } from "lucide-react"

interface CalculationResults {
  agentFees: number
  leftoverAmount: number
  purchaseStampDuty: number
  downPaymentPercentage: number
  reducedCost: number
  monthlyMortgage: number
  estimatedBorrowing: number
  incomeDifference: number
  requiredIncome: number
}

export default function HomeMoveCalculator() {
  const [isSellingHouse, setIsSellingHouse] = useState("yes")
  const [salePrice, setSalePrice] = useState("")
  const [currentMortgage, setCurrentMortgage] = useState("")
  const [legalFees, setLegalFees] = useState("")
  const [agentFeesPercentage, setAgentFeesPercentage] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [futurePropertyPrice, setFuturePropertyPrice] = useState("")
  const [creditScoreProvider, setCreditScoreProvider] = useState("manual")
  const [creditScore, setCreditScore] = useState("")
  const [interestRate, setInterestRate] = useState("")
  const [loanTerm, setLoanTerm] = useState("30")
  const [isAdditionalProperty, setIsAdditionalProperty] = useState("no")
  const [currentSalary, setCurrentSalary] = useState("")
  const [incomeMultiplier, setIncomeMultiplier] = useState("4.5")
  const [results, setResults] = useState<CalculationResults>({
    agentFees: 0,
    leftoverAmount: 0,
    purchaseStampDuty: 0,
    downPaymentPercentage: 0,
    reducedCost: 0,
    monthlyMortgage: 0,
    estimatedBorrowing: 0,
    incomeDifference: 0,
    requiredIncome: 0,
  })

  const calculateStampDuty = (price: number, isAdditional: boolean) => {
    let stampDuty = 0
    const thresholds = [
      { limit: 250000, rate: 0.0 },
      { limit: 925000, rate: 0.05 },
      { limit: 1500000, rate: 0.1 },
      { limit: Number.POSITIVE_INFINITY, rate: 0.12 },
    ]

    let remainingPrice = price
    for (let i = 0; i < thresholds.length; i++) {
      if (remainingPrice > 0) {
        const taxableAmount = Math.min(remainingPrice, thresholds[i].limit - (thresholds[i - 1]?.limit || 0))
        stampDuty += taxableAmount * thresholds[i].rate
        remainingPrice -= taxableAmount
      } else {
        break
      }
    }

    if (isAdditional) {
      stampDuty *= 1.05 // Additional 5% for additional properties
    }

    return stampDuty
  }

  const handleCalculate = () => {
    const salePriceNum = Number.parseFloat(salePrice.replace(/,/g, "")) || 0
    const currentMortgageNum = Number.parseFloat(currentMortgage.replace(/,/g, "")) || 0
    const legalFeesNum = Number.parseFloat(legalFees.replace(/,/g, "")) || 0
    const agentFeesPercentageNum = Number.parseFloat(agentFeesPercentage.replace(/,/g, "")) || 0
    const depositAmountNum = Number.parseFloat(depositAmount.replace(/,/g, "")) || 0
    const futurePropertyPriceNum = Number.parseFloat(futurePropertyPrice.replace(/,/g, "")) || 0
    const interestRateNum = Number.parseFloat(interestRate.replace(/,/g, "")) || 0
    const currentSalaryNum = Number.parseFloat(currentSalary.replace(/,/g, "")) || 0
    const incomeMultiplierNum = Number.parseFloat(incomeMultiplier)
    const creditScoreNum = Number.parseInt(creditScore) || 0

    const agentFees = (agentFeesPercentageNum / 100) * salePriceNum
    const leftoverAmount =
      isSellingHouse === "yes" ? salePriceNum - currentMortgageNum - legalFeesNum - agentFees : depositAmountNum

    const stampDuty = calculateStampDuty(futurePropertyPriceNum, isAdditionalProperty === "yes")

    const downPaymentPercentage = (leftoverAmount / futurePropertyPriceNum) * 100
    const reducedCost = futurePropertyPriceNum - leftoverAmount

    const monthlyInterestRate = interestRateNum / 100 / 12
    const numberOfPayments = Number.parseInt(loanTerm) * 12
    const monthlyPayment =
      (reducedCost * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments))

    const estimatedBorrowing = currentSalaryNum * incomeMultiplierNum
    const requiredIncome = reducedCost / incomeMultiplierNum
    const incomeDifference = estimatedBorrowing - reducedCost

    setResults({
      agentFees,
      leftoverAmount,
      purchaseStampDuty: stampDuty,
      downPaymentPercentage,
      reducedCost,
      monthlyMortgage: monthlyPayment,
      estimatedBorrowing,
      incomeDifference,
      requiredIncome,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Home Move Calculator</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4">
            <Label>Are you selling a house?</Label>
            <Select value={isSellingHouse} onValueChange={setIsSellingHouse}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isSellingHouse === "yes" ? (
            <>
              <div className="space-y-4">
                <Label>Sale Price of Current Property (£)</Label>
                <Input
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Enter sale price"
                />
              </div>
              <div className="space-y-4">
                <Label>Current Mortgage Amount (£)</Label>
                <Input
                  value={currentMortgage}
                  onChange={(e) => setCurrentMortgage(e.target.value)}
                  placeholder="Enter current mortgage amount"
                />
              </div>
              <div className="space-y-4">
                <Label>Legal Fees (£)</Label>
                <Input
                  value={legalFees}
                  onChange={(e) => setLegalFees(e.target.value)}
                  placeholder="Enter legal fees"
                />
              </div>
              <div className="space-y-4">
                <Label>Estate Agent Fees (% of Sale Price)</Label>
                <Input
                  value={agentFeesPercentage}
                  onChange={(e) => setAgentFeesPercentage(e.target.value)}
                  placeholder="Enter agent fees percentage"
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Label>Deposit Amount (£)</Label>
              <Input
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter deposit amount"
              />
            </div>
          )}

          <div className="space-y-4">
            <Label>Cost of Future Property (£)</Label>
            <Input
              value={futurePropertyPrice}
              onChange={(e) => setFuturePropertyPrice(e.target.value)}
              placeholder="Enter future property price"
            />
          </div>

          <div className="space-y-4">
            <Label>Credit Score Provider</Label>
            <Select value={creditScoreProvider} onValueChange={setCreditScoreProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Enter Manually</SelectItem>
                <SelectItem value="equifax">Equifax</SelectItem>
                <SelectItem value="experian">Experian</SelectItem>
                <SelectItem value="transunion">TransUnion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Credit Score</Label>
            <Input
              value={creditScore}
              onChange={(e) => setCreditScore(e.target.value)}
              placeholder="Enter your credit score"
            />
          </div>

          <div className="space-y-4">
            <Label>Future Mortgage Interest Rate (%)</Label>
            <Input
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="Enter interest rate"
            />
          </div>

          <div className="space-y-4">
            <Label>Future Mortgage Term (Years)</Label>
            <Input
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(e.target.value)}
              placeholder="Enter loan term in years"
              min="1"
              max="40"
            />
          </div>

          <div className="space-y-4">
            <Label>Is this an additional property?</Label>
            <Select value={isAdditionalProperty} onValueChange={setIsAdditionalProperty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Current Annual Salary (£)</Label>
            <Input
              value={currentSalary}
              onChange={(e) => setCurrentSalary(e.target.value)}
              placeholder="Enter your annual salary"
            />
          </div>

          <div className="space-y-4">
            <Label>Income Multiplier</Label>
            <Select value={incomeMultiplier} onValueChange={setIncomeMultiplier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4.5">4.5x (Income below £60,000)</SelectItem>
                <SelectItem value="5">5x (Income between £60,000 and £100,000)</SelectItem>
                <SelectItem value="5.5">5.5x (Income above £100,000)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCalculate} className="w-full">
            Calculate
          </Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-4">
                <ResultItem icon={<Coins className="h-5 w-5" />} label="Estate Agent Fees" value={results.agentFees} />
                <ResultItem
                  icon={<Wallet className="h-5 w-5" />}
                  label="Equity Left from Sale"
                  value={results.leftoverAmount}
                />
                <ResultItem
                  icon={<Stamp className="h-5 w-5" />}
                  label="Stamp Duty on Purchase"
                  value={results.purchaseStampDuty}
                />
                <ResultItem
                  icon={<PieChart className="h-5 w-5" />}
                  label="Down Payment Percentage"
                  value={results.downPaymentPercentage}
                  isPercentage
                />
                <ResultItem
                  icon={<CreditCard className="h-5 w-5" />}
                  label="Future Property Value After Deposit"
                  value={results.reducedCost}
                />
                <ResultItem
                  icon={<Calendar className="h-5 w-5" />}
                  label="Monthly Mortgage Payment"
                  value={results.monthlyMortgage}
                />
                <ResultItem
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Estimated Borrowing Based on Salary"
                  value={results.estimatedBorrowing}
                />
                <ResultItem
                  icon={<BarChart2 className="h-5 w-5" />}
                  label="Borrowing Shortfall/Surplus"
                  value={results.incomeDifference}
                />
                <ResultItem
                  icon={<UserCheck className="h-5 w-5" />}
                  label="Minimum Income Required for Loan Approval"
                  value={results.requiredIncome}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface ResultItemProps {
  icon: React.ReactNode
  label: string
  value: number
  isPercentage?: boolean
}

function ResultItem({ icon, label, value, isPercentage = false }: ResultItemProps) {
  return (
    <div className="flex items-center space-x-4">
      {icon}
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">
          {isPercentage
            ? `${value.toFixed(2)}%`
            : `£${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        </p>
      </div>
    </div>
  )
}

