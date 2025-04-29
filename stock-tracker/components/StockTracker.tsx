"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  fetchStockData,
  fetchHistoricalData,
  fetchBalanceSheet,
  fetchIncomeStatement,
  type StockData,
  type HistoricalData,
  type BalanceSheetData,
  type IncomeStatementData,
} from "../utils/stockApi"
import { StockChart } from "./StockChart"
import { FinancialStatements } from "./FinancialStatements"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function StockTracker() {
  const [stocks, setStocks] = useState<StockData[]>([])
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetData[]>([])
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementData[]>([])

  const defaultSymbols = ["TSLA", "GME", "INTC", "AAPL"]

  const handleAddStock = useCallback(
    async (symbol: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const newStock = await fetchStockData(symbol.toUpperCase())
        setStocks((prevStocks) => {
          const filtered = prevStocks.filter((s) => s.symbol !== symbol.toUpperCase())
          return [...filtered, newStock]
        })
        if (!selectedStock) {
          handleSelectStock(symbol.toUpperCase())
        }
      } catch (err) {
        console.error(err)
        setError(`Failed to fetch data for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    },
    [selectedStock],
  )

  const handleSelectStock = async (symbol: string) => {
    setSelectedStock(symbol)
    setError(null)
    try {
      const [historicalData, balanceSheetData, incomeStatementData] = await Promise.all([
        fetchHistoricalData(symbol),
        fetchBalanceSheet(symbol),
        fetchIncomeStatement(symbol),
      ])
      setHistoricalData(historicalData)
      setBalanceSheet(balanceSheetData)
      setIncomeStatement(incomeStatementData)
    } catch (err) {
      console.error("Failed to fetch data:", err)
      setError(`Failed to fetch detailed data for ${symbol}: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    async function loadInitialStocks() {
      for (const symbol of defaultSymbols) {
        await handleAddStock(symbol)
        await delay(1000) // Wait for 1 second between each API call
      }
    }
    loadInitialStocks()
  }, [handleAddStock])

  useEffect(() => {
    const interval = setInterval(() => {
      stocks.forEach((stock) => handleAddStock(stock.symbol))
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [stocks, handleAddStock])

  const handleRetry = () => {
    setError(null)
    defaultSymbols.forEach((symbol) => handleAddStock(symbol))
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>IV (ATM Call)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow
                  key={stock.symbol}
                  className={`cursor-pointer ${selectedStock === stock.symbol ? "bg-muted" : ""}`}
                  onClick={() => handleSelectStock(stock.symbol)}
                >
                  <TableCell className="font-medium">{stock.symbol}</TableCell>
                  <TableCell>${stock.price.toFixed(2)}</TableCell>
                  <TableCell className={stock.change >= 0 ? "text-green-600" : "text-red-600"}>
                    {stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                  </TableCell>
                  <TableCell>{stock.volume.toLocaleString()}</TableCell>
                  <TableCell>
                    {stock.impliedVolatility !== undefined ? `${(stock.impliedVolatility * 100).toFixed(2)}%` : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedStock && historicalData.length > 0 && <StockChart data={historicalData} symbol={selectedStock} />}

      {selectedStock && balanceSheet.length > 0 && incomeStatement.length > 0 && (
        <FinancialStatements symbol={selectedStock} balanceSheet={balanceSheet} incomeStatement={incomeStatement} />
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {(error || isLoading) && (
        <Button onClick={handleRetry} disabled={isLoading}>
          {isLoading ? "Loading..." : "Retry"}
        </Button>
      )}
    </div>
  )
}

