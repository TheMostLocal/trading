export interface StockData {
  symbol: string
  exchange: string
  price: number
  volume: number
  darkPoolVolume: number
}

export function generateMockStockData(symbol: string): StockData {
  const exchanges = ["NYSE", "NASDAQ", "LSE", "TSE"]
  return {
    symbol,
    exchange: exchanges[Math.floor(Math.random() * exchanges.length)],
    price: Number((Math.random() * 1000).toFixed(2)),
    volume: Math.floor(Math.random() * 1000000),
    darkPoolVolume: Math.floor(Math.random() * 500000),
  }
}

