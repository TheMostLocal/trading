"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { HistoricalData } from "../utils/stockApi"

interface StockChartProps {
  data: HistoricalData[]
  symbol: string
}

export function StockChart({ data, symbol }: StockChartProps) {
  const chartData = [...data].reverse()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{symbol} - 30 Day Price History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Line type="monotone" dataKey="close" stroke="hsl(var(--primary))" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

