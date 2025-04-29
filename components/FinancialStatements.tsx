"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { BalanceSheetData, IncomeStatementData } from "../utils/stockApi"

interface FinancialStatementsProps {
  symbol: string
  balanceSheet: BalanceSheetData[]
  incomeStatement: IncomeStatementData[]
}

function formatCurrency(value: string | number): string {
  const num = typeof value === "string" ? Number.parseFloat(value) : value
  if (num >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`
  } else if (num >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`
  }
  return `$${num.toLocaleString()}`
}

export function FinancialStatements({ symbol, balanceSheet, incomeStatement }: FinancialStatementsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{symbol} - Financial Statements</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="balance-sheet">
          <TabsList>
            <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
            <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          </TabsList>

          <TabsContent value="balance-sheet">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  {balanceSheet.map((sheet) => (
                    <TableHead key={sheet.fiscalDateEnding}>{new Date(sheet.fiscalDateEnding).getFullYear()}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Assets</TableCell>
                  {balanceSheet.map((sheet) => (
                    <TableCell key={sheet.fiscalDateEnding}>{formatCurrency(sheet.totalAssets)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Current Assets</TableCell>
                  {balanceSheet.map((sheet) => (
                    <TableCell key={sheet.fiscalDateEnding}>{formatCurrency(sheet.totalCurrentAssets)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Cash & Equivalents</TableCell>
                  {balanceSheet.map((sheet) => (
                    <TableCell key={sheet.fiscalDateEnding}>{formatCurrency(sheet.cashAndCashEquivalents)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Total Liabilities</TableCell>
                  {balanceSheet.map((sheet) => (
                    <TableCell key={sheet.fiscalDateEnding}>{formatCurrency(sheet.totalLiabilities)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Current Liabilities</TableCell>
                  {balanceSheet.map((sheet) => (
                    <TableCell key={sheet.fiscalDateEnding}>{formatCurrency(sheet.totalCurrentLiabilities)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Long Term Debt</TableCell>
                  {balanceSheet.map((sheet) => (
                    <TableCell key={sheet.fiscalDateEnding}>{formatCurrency(sheet.longTermDebt)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Shareholder Equity</TableCell>
                  {balanceSheet.map((sheet) => (
                    <TableCell key={sheet.fiscalDateEnding}>{formatCurrency(sheet.totalShareholderEquity)}</TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="income-statement">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metric</TableHead>
                  {incomeStatement.map((statement) => (
                    <TableHead key={statement.fiscalDateEnding}>
                      {new Date(statement.fiscalDateEnding).getFullYear()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Total Revenue</TableCell>
                  {incomeStatement.map((statement) => (
                    <TableCell key={statement.fiscalDateEnding}>{formatCurrency(statement.totalRevenue)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Gross Profit</TableCell>
                  {incomeStatement.map((statement) => (
                    <TableCell key={statement.fiscalDateEnding}>{formatCurrency(statement.grossProfit)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Operating Income</TableCell>
                  {incomeStatement.map((statement) => (
                    <TableCell key={statement.fiscalDateEnding}>{formatCurrency(statement.operatingIncome)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Net Income</TableCell>
                  {incomeStatement.map((statement) => (
                    <TableCell key={statement.fiscalDateEnding}>{formatCurrency(statement.netIncome)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EBITDA</TableCell>
                  {incomeStatement.map((statement) => (
                    <TableCell key={statement.fiscalDateEnding}>{formatCurrency(statement.ebitda)}</TableCell>
                  ))}
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">EPS</TableCell>
                  {incomeStatement.map((statement) => (
                    <TableCell key={statement.fiscalDateEnding}>
                      ${Number.parseFloat(statement.eps).toFixed(2)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

