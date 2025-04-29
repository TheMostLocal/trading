const API_KEY = "4PVZCEE2KKY3ADBS"
const MAX_RETRIES = 3
const RETRY_DELAY = 2000 // 2 seconds

export interface StockData {
  symbol: string
  price: number
  volume: number
  change: number
  changePercent: number
  impliedVolatility?: number // New field for IV
}

export interface HistoricalData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BalanceSheetData {
  fiscalDateEnding: string
  totalAssets: string
  totalCurrentAssets: string
  cashAndCashEquivalents: string
  totalLiabilities: string
  totalShareholderEquity: string
  totalCurrentLiabilities: string
  longTermDebt: string
}

export interface IncomeStatementData {
  fiscalDateEnding: string
  totalRevenue: string
  grossProfit: string
  operatingIncome: string
  netIncome: string
  ebitda: string
  eps: string
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<any> {
  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data["Note"]) {
      // API is rate limited
      if (retries > 0) {
        console.log(`Rate limited. Retrying in ${RETRY_DELAY / 1000} seconds...`)
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
        return fetchWithRetry(url, retries - 1)
      } else {
        throw new Error("API rate limit reached. Please try again later.")
      }
    }

    if (data["Error Message"]) {
      throw new Error(data["Error Message"])
    }

    return data
  } catch (error) {
    if (retries > 0) {
      console.log(`Error occurred. Retrying in ${RETRY_DELAY / 1000} seconds...`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return fetchWithRetry(url, retries - 1)
    } else {
      throw error
    }
  }
}

export async function fetchStockData(symbol: string): Promise<StockData> {
  const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
  const optionsUrl = `https://www.alphavantage.co/query?function=OPTION_CHAIN&symbol=${symbol}&apikey=${API_KEY}`

  const [quoteData, optionsData] = await Promise.all([fetchWithRetry(quoteUrl), fetchWithRetry(optionsUrl)])

  if (!quoteData["Global Quote"] || Object.keys(quoteData["Global Quote"]).length === 0) {
    throw new Error(`No data available for symbol: ${symbol}`)
  }

  const quote = quoteData["Global Quote"]
  const price = Number.parseFloat(quote["05. price"] || "0")

  let impliedVolatility: number | undefined

  if (optionsData.options && optionsData.options.length > 0) {
    const atm_calls = optionsData.options[0].callExpiration
      .filter((option: any) => Math.abs(option.strike - price) < 0.5)
      .sort((a: any, b: any) => Math.abs(a.strike - price) - Math.abs(b.strike - price))

    if (atm_calls.length > 0) {
      impliedVolatility = Number.parseFloat(atm_calls[0].impliedVolatility)
    }
  }

  return {
    symbol: symbol,
    price: price,
    volume: Number.parseInt(quote["06. volume"] || "0"),
    change: Number.parseFloat(quote["09. change"] || "0"),
    changePercent: Number.parseFloat((quote["10. change percent"] || "0%").replace("%", "")),
    impliedVolatility: impliedVolatility,
  }
}

export async function fetchHistoricalData(symbol: string): Promise<HistoricalData[]> {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
  const data = await fetchWithRetry(url)

  const timeSeriesData = data["Time Series (Daily)"]
  if (!timeSeriesData || Object.keys(timeSeriesData).length === 0) {
    throw new Error(`No historical data available for symbol: ${symbol}`)
  }

  return Object.entries(timeSeriesData)
    .map(([date, values]: [string, any]) => ({
      date,
      open: Number.parseFloat(values["1. open"]),
      high: Number.parseFloat(values["2. high"]),
      low: Number.parseFloat(values["3. low"]),
      close: Number.parseFloat(values["4. close"]),
      volume: Number.parseInt(values["5. volume"]),
    }))
    .slice(0, 30) // Last 30 days
}

export async function fetchBalanceSheet(symbol: string): Promise<BalanceSheetData[]> {
  const url = `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${symbol}&apikey=${API_KEY}`
  const data = await fetchWithRetry(url)

  if (!data.annualReports || data.annualReports.length === 0) {
    throw new Error(`No balance sheet data available for symbol: ${symbol}`)
  }

  return data.annualReports.slice(0, 4) // Last 4 years
}

export async function fetchIncomeStatement(symbol: string): Promise<IncomeStatementData[]> {
  const url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`
  const data = await fetchWithRetry(url)

  if (!data.annualReports || data.annualReports.length === 0) {
    throw new Error(`No income statement data available for symbol: ${symbol}`)
  }

  return data.annualReports.slice(0, 4) // Last 4 years
}

