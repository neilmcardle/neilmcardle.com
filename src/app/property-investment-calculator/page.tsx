"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Calculator } from "lucide-react"

export default function PropertyInvestmentCalculator() {
  const [purchasePrice, setPurchasePrice] = useState("")
  const [renovationCosts, setRenovationCosts] = useState("")
  const [contingencyPercent, setContingencyPercent] = useState("10")
  const [holdingCosts, setHoldingCosts] = useState("0")
  const [agentFeePercent, setAgentFeePercent] = useState("1.5")
  const [bridgingLoanMonths, setBridgingLoanMonths] = useState("6")
  const [bridgingLoanRate, setBridgingLoanRate] = useState("1")
  const [arv, setArv] = useState("")
  const [result, setResult] = useState<{ profit: number; isPositive: boolean } | null>(null)

  const calculateInvestment = () => {
    const purchase = Number.parseFloat(purchasePrice)
    const renovation = Number.parseFloat(renovationCosts)
    const contingency = (Number.parseFloat(contingencyPercent) / 100) * renovation
    const holding = Number.parseFloat(holdingCosts)
    const agentFees = (Number.parseFloat(agentFeePercent) / 100) * Number.parseFloat(arv)
    const bridgingCosts = (Number.parseFloat(bridgingLoanRate) / 100) * purchase * Number.parseFloat(bridgingLoanMonths)
    const totalCosts = purchase + renovation + contingency + holding + agentFees + bridgingCosts
    const arvValue = Number.parseFloat(arv)

    if (isNaN(purchase) || isNaN(renovation) || isNaN(arvValue)) {
      alert("Please fill out all required fields with valid numbers.")
      return
    }

    const profit = arvValue - totalCosts
    setResult({ profit, isPositive: profit > 0 })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Property Investment Calculator</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="purchasePrice">Purchase Price (£)</Label>
            <Input
              id="purchasePrice"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g. 180000"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="renovationCosts">Renovation Costs (£)</Label>
            <Input
              id="renovationCosts"
              type="number"
              value={renovationCosts}
              onChange={(e) => setRenovationCosts(e.target.value)}
              placeholder="e.g. 50000"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="contingencyPercent">Contingency Fund (%)</Label>
            <Input
              id="contingencyPercent"
              type="number"
              value={contingencyPercent}
              onChange={(e) => setContingencyPercent(e.target.value)}
              placeholder="e.g. 20"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="holdingCosts">Holding Costs (£)</Label>
            <Input
              id="holdingCosts"
              type="number"
              value={holdingCosts}
              onChange={(e) => setHoldingCosts(e.target.value)}
              placeholder="e.g. 2000"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="agentFeePercent">Estate Agent Fees (%)</Label>
            <Input
              id="agentFeePercent"
              type="number"
              value={agentFeePercent}
              onChange={(e) => setAgentFeePercent(e.target.value)}
              placeholder="e.g. 1.5"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="bridgingLoanMonths">Bridging Loan Term (Months)</Label>
            <Input
              id="bridgingLoanMonths"
              type="number"
              value={bridgingLoanMonths}
              onChange={(e) => setBridgingLoanMonths(e.target.value)}
              placeholder="e.g. 6"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="bridgingLoanRate">Bridging Loan Monthly Interest Rate (%)</Label>
            <Input
              id="bridgingLoanRate"
              type="number"
              value={bridgingLoanRate}
              onChange={(e) => setBridgingLoanRate(e.target.value)}
              placeholder="e.g. 1.5"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="arv">After-Renovation Value (ARV) (£)</Label>
            <Input
              id="arv"
              type="number"
              value={arv}
              onChange={(e) => setArv(e.target.value)}
              placeholder="e.g. 250000"
            />
          </div>

          <Button onClick={calculateInvestment} className="w-full">
            <Calculator className="mr-2 h-4 w-4" /> Calculate Investment
          </Button>
        </div>

        <div className="space-y-6">
          {result && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Investment Outcome</h2>
                <p className={`text-3xl font-bold ${result.isPositive ? "text-green-600" : "text-red-600"}`}>
                  {result.isPositive ? "Profit" : "Loss"}: £{Math.abs(result.profit).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-2">{result.isPositive ? "Positive ROI" : "Negative ROI"}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Additional Information</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="stamp-duty">
                  <AccordionTrigger>Stamp Duty</AccordionTrigger>
                  <AccordionContent>
                    <p>Stamp Duty Land Tax (SDLT) rates vary based on property value and type:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>0% on properties up to £250,000</li>
                      <li>5% on £250,001–£925,000</li>
                      <li>10% on £925,001–£1.5m</li>
                      <li>12% above £1.5m</li>
                      <li>For additional properties, a 3% surcharge applies to all tiers</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Example:</strong> For a £300,000 property, the Stamp Duty is £11,500 for a second home.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="legal-fees">
                  <AccordionTrigger>Legal Fees</AccordionTrigger>
                  <AccordionContent>
                    <p>Legal fees include conveyancing, searches, and registration costs:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Conveyancing: £800–£1,500</li>
                      <li>Search Fees: £250–£500</li>
                      <li>Land Registration: £20–£910 (depends on property value)</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Example:</strong> For a £300,000 property, legal fees might total ~£1,735.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="capital-gains-tax">
                  <AccordionTrigger>Capital Gains Tax</AccordionTrigger>
                  <AccordionContent>
                    <p>Capital Gains Tax (CGT) is paid on profits from selling investment properties:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Basic Rate Taxpayers: 18% on gains</li>
                      <li>Higher Rate Taxpayers: 28% on gains</li>
                    </ul>
                    <p className="mt-2">
                      <strong>Example:</strong> If your taxable gain is £74,000, the CGT could be £13,320–£20,720.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="other-costs">
                  <AccordionTrigger>Other Costs</AccordionTrigger>
                  <AccordionContent>
                    <p>Be aware of additional costs like:</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Contingency Fund: 10–20% of renovation budget</li>
                      <li>Holding Costs: Mortgage, utilities, insurance during the renovation period</li>
                      <li>Estate Agent Fees: 1–2% of sale price (+VAT)</li>
                      <li>Bridging Loan Costs: Short-term financing with ~1% monthly interest</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

