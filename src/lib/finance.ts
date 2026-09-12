// 移植自 CF-Server-Monitor 官方默认主题 src/frontend/utils/finance.js
// 以人民币（CNY）为基准做汇率换算与「剩余价值」统计。

export type ExchangeRates = Record<string, number>

const MS_PER_DAY = 24 * 60 * 60 * 1000
const LONG_TERM_YEARS = 100
const RATE_CACHE_KEY = 'cfsm-finance-rates-cny-v1'

// rate 含义：1 CNY = rate 外币。CNY 固定为 1。
const CURRENCY_CONFIG: Record<string, { rate: number; symbol: string }> = {
  AED: { rate: 0.5435, symbol: 'د.إ' },
  AUD: { rate: 0.20941, symbol: 'A$' },
  BDT: { rate: 18.02, symbol: '৳' },
  BRL: { rate: 0.74734, symbol: 'R$' },
  CAD: { rate: 0.20691, symbol: 'C$' },
  CHF: { rate: 0.11746, symbol: 'CHF' },
  CNY: { rate: 1, symbol: '¥' },
  CZK: { rate: 3.0787, symbol: 'Kč' },
  DKK: { rate: 0.95296, symbol: 'kr' },
  EGP: { rate: 7.15, symbol: 'EGP' },
  EUR: { rate: 0.1275, symbol: '€' },
  GBP: { rate: 0.11027, symbol: '£' },
  GTQ: { rate: 1.14, symbol: 'Q' },
  HKD: { rate: 1.1594, symbol: 'HK$' },
  HUF: { rate: 44.688, symbol: 'Ft' },
  IDR: { rate: 2622.37, symbol: 'Rp' },
  ILS: { rate: 0.43085, symbol: '₪' },
  INR: { rate: 14.0178, symbol: '₹' },
  ISK: { rate: 18.4626, symbol: 'kr' },
  JPY: { rate: 23.707, symbol: '¥' },
  KRW: { rate: 224.11, symbol: '₩' },
  KZT: { rate: 64, symbol: '₸' },
  LKR: { rate: 44.4, symbol: 'LKR' },
  MXN: { rate: 2.5472, symbol: 'Mex$' },
  MYR: { rate: 0.59945, symbol: 'RM' },
  MNT: { rate: 530, symbol: '₮' },
  NGN: { rate: 225.6, symbol: '₦' },
  NOK: { rate: 1.4096, symbol: 'kr' },
  NZD: { rate: 0.2535, symbol: 'NZ$' },
  PHP: { rate: 8.9288, symbol: '₱' },
  PKR: { rate: 41.5, symbol: '₨' },
  PLN: { rate: 0.54138, symbol: 'zł' },
  RON: { rate: 0.66769, symbol: 'lei' },
  RUB: { rate: 11.9, symbol: '₽' },
  SAR: { rate: 0.555, symbol: '﷼' },
  SEK: { rate: 1.3895, symbol: 'kr' },
  SGD: { rate: 0.18975, symbol: 'S$' },
  THB: { rate: 4.8172, symbol: '฿' },
  TRY: { rate: 6.849, symbol: '₺' },
  UAH: { rate: 3.6, symbol: '₴' },
  USD: { rate: 0.14799, symbol: '$' },
  VND: { rate: 3500, symbol: '₫' },
  ZAR: { rate: 2.3995, symbol: 'R' },
}

export const DEFAULT_EXCHANGE_RATES: ExchangeRates = Object.fromEntries(
  Object.entries(CURRENCY_CONFIG).map(([code, cfg]) => [code, cfg.rate])
)

const CURRENCY_SYMBOLS: Record<string, string> = Object.fromEntries(
  Object.entries(CURRENCY_CONFIG).map(([code, cfg]) => [code, cfg.symbol])
)

const SUPPORTED_CURRENCIES = Object.keys(CURRENCY_CONFIG)

const CURRENCY_ALIASES: Record<string, string> = {
  $: 'USD',
  'US$': 'USD',
  USD: 'USD',
  '¥': 'CNY',
  '￥': 'CNY',
  CNY: 'CNY',
  RMB: 'CNY',
  'CN¥': 'CNY',
  '¥JPY': 'JPY',
  'JP¥': 'JPY',
  JPY: 'JPY',
  '€': 'EUR',
  EUR: 'EUR',
  '£': 'GBP',
  GBP: 'GBP',
  'HK$': 'HKD',
  HKD: 'HKD',
  'A$': 'AUD',
  AUD: 'AUD',
  'C$': 'CAD',
  CAD: 'CAD',
  'S$': 'SGD',
  SGD: 'SGD',
  'NZ$': 'NZD',
  NZD: 'NZD',
  '₣': 'CHF',
  CHF: 'CHF',
  '₩': 'KRW',
  KRW: 'KRW',
  '₹': 'INR',
  INR: 'INR',
  '฿': 'THB',
  THB: 'THB',
  '₫': 'VND',
  VND: 'VND',
  '₱': 'PHP',
  PHP: 'PHP',
  RP: 'IDR',
  IDR: 'IDR',
  RM: 'MYR',
  MYR: 'MYR',
  '₺': 'TRY',
  TRY: 'TRY',
  '₪': 'ILS',
  ILS: 'ILS',
  '৳': 'BDT',
  BDT: 'BDT',
  '₨': 'PKR',
  PKR: 'PKR',
  LKR: 'LKR',
  '₮': 'MNT',
  MNT: 'MNT',
  '₽': 'RUB',
  RUB: 'RUB',
  'R$': 'BRL',
  BRL: 'BRL',
  KR: 'SEK',
  SEK: 'SEK',
  NOK: 'NOK',
  DKK: 'DKK',
  'ZŁ': 'PLN',
  'zł': 'PLN',
  PLN: 'PLN',
  '₴': 'UAH',
  UAH: 'UAH',
  '₸': 'KZT',
  KZT: 'KZT',
  R: 'ZAR',
  ZAR: 'ZAR',
  '₦': 'NGN',
  NGN: 'NGN',
  EGP: 'EGP',
  'د.إ': 'AED',
  AED: 'AED',
  '﷼': 'SAR',
  SAR: 'SAR',
  Q: 'GTQ',
  GTQ: 'GTQ',
}

const BILLING_CYCLE_DAYS: Record<string, number> = {
  month: 30,
  quarter: 90,
  half_year: 180,
  year: 365,
  two_years: 730,
  three_years: 1095,
  four_years: 1460,
  five_years: 1825,
}

const EXCHANGE_RATE_APIS: { url: string; parse: (data: unknown) => unknown }[] = [
  {
    url: 'https://api.frankfurter.dev/v1/latest?base=CNY',
    parse: (data) => (data as { rates?: unknown })?.rates,
  },
  {
    url: 'https://open.er-api.com/v6/latest/CNY',
    parse: (data) => (data as { rates?: unknown })?.rates,
  },
]

export function normalizeFinanceCurrency(value?: string): string {
  const raw = String(value || 'CNY').trim()
  if (!raw) return 'CNY'
  const upper = raw.toUpperCase()
  const code = CURRENCY_ALIASES[raw] || CURRENCY_ALIASES[upper] || upper
  return code in DEFAULT_EXCHANGE_RATES ? code : 'CNY'
}

function detectCurrencyFromPrice(price?: string | number): string {
  const raw = String(price || '')
  if (/[¥￥]/.test(raw)) return 'CNY'
  if (/€/.test(raw)) return 'EUR'
  if (/£/.test(raw)) return 'GBP'
  if (/\$/.test(raw)) return 'USD'
  return 'CNY'
}

function serverCurrency(server: { currency?: string; price?: string | number }): string {
  return normalizeFinanceCurrency(
    server.currency || detectCurrencyFromPrice(server.price)
  )
}

export function isFreeServer(server: { tags?: string }): boolean {
  return String(server.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .includes('白嫖中')
}

function serverPriceCNY(
  server: { price?: string | number; currency?: string },
  rates: ExchangeRates
): number {
  const price = Number(server.price)
  if (!server.price || !Number.isFinite(price) || price <= 0) return 0
  const currency = serverCurrency(server)
  if (currency === 'CNY') return price
  const rate = rates[currency] || DEFAULT_EXCHANGE_RATES[currency] || 0
  return rate > 0 ? price / rate : 0
}

function billingCycleDays(server: { billing_cycle?: string }): number {
  if (!server.billing_cycle) return 0
  return BILLING_CYCLE_DAYS[server.billing_cycle] || 0
}

export function remainingValueCNY(
  server: {
    price?: string | number
    currency?: string
    billing_cycle?: string
    expire_date?: string
    tags?: string
  },
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES,
  now = Date.now()
): number {
  if (isFreeServer(server)) return 0
  const priceCNY = serverPriceCNY(server, rates)
  if (priceCNY <= 0) return 0

  const expireDate = String(server.expire_date || '').trim()
  if (!expireDate) return 0
  const expiredAt = new Date(`${expireDate}T00:00:00`).getTime()
  if (!Number.isFinite(expiredAt)) return 0

  const diffMs = expiredAt - now
  if (diffMs <= 0) return 0
  if (diffMs / (MS_PER_DAY * 365) > LONG_TERM_YEARS) return priceCNY

  const cycleDays = billingCycleDays(server)
  if (cycleDays <= 0) return priceCNY

  return Math.min(priceCNY, (priceCNY * diffMs) / (cycleDays * MS_PER_DAY))
}

// 所有节点原价合计（人民币，跳过「白嫖中」）
export function sumTotalValueCNY(
  servers: {
    price?: string | number
    currency?: string
    tags?: string
  }[],
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES
): number {
  let total = 0
  for (const server of servers) {
    if (isFreeServer(server)) continue
    total += serverPriceCNY(server, rates)
  }
  return total
}

export function sumRemainingValueCNY(
  servers: {
    price?: string | number
    currency?: string
    billing_cycle?: string
    expire_date?: string
    tags?: string
  }[],
  rates: ExchangeRates = DEFAULT_EXCHANGE_RATES,
  now = Date.now()
): number {
  let total = 0
  for (const server of servers) {
    if (isFreeServer(server)) continue
    total += remainingValueCNY(server, rates, now)
  }
  return total
}

export function formatCNY(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0
  const value = new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Math.abs(safe) < 100000 ? 2 : 0,
    notation: Math.abs(safe) >= 100000 ? 'compact' : 'standard',
  }).format(safe)
  return `${CURRENCY_SYMBOLS.CNY || '¥'}${value}`
}

export async function getDailyExchangeRates(): Promise<{
  rates: ExchangeRates
  source: string
}> {
  const today = getTodayDateKey()
  const cached = readCachedExchangeRates()
  if (cached?.date === today) {
    return { rates: cached.rates, source: 'cache' }
  }

  const fetched = await fetchExchangeRates()
  if (fetched) {
    writeCachedExchangeRates(fetched, today)
    return { rates: fetched, source: 'network' }
  }

  if (cached) return { rates: cached.rates, source: 'stale-cache' }
  return { rates: DEFAULT_EXCHANGE_RATES, source: 'default' }
}

async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  for (const api of EXCHANGE_RATE_APIS) {
    try {
      const controller = new AbortController()
      const timer = window.setTimeout(() => controller.abort(), 5000)
      let data: unknown
      try {
        const res = await fetch(api.url, { signal: controller.signal })
        if (!res.ok) continue
        data = await res.json()
      } finally {
        window.clearTimeout(timer)
      }
      const rates = sanitizeExchangeRates(api.parse(data))
      if (rates) return rates
    } catch {
      /* 换下一个汇率源 */
    }
  }
  return null
}

function sanitizeExchangeRates(rates: unknown): ExchangeRates | null {
  if (!rates || typeof rates !== 'object') return null
  const source = rates as Record<string, unknown>
  const result: ExchangeRates = { ...DEFAULT_EXCHANGE_RATES, CNY: 1 }
  for (const currency of SUPPORTED_CURRENCIES) {
    if (currency === 'CNY') continue
    const value = Number(source[currency])
    if (Number.isFinite(value) && value > 0) result[currency] = value
  }
  return result
}

function readCachedExchangeRates(): { date: string; rates: ExchangeRates } | null {
  try {
    const raw = localStorage.getItem(RATE_CACHE_KEY)
    if (!raw) return null
    const cache = JSON.parse(raw) as { base?: string; date?: string; rates?: unknown }
    const rates = sanitizeExchangeRates(cache?.rates)
    if (cache?.base !== 'CNY' || !cache?.date || !rates) return null
    return { date: cache.date, rates }
  } catch {
    return null
  }
}

function writeCachedExchangeRates(rates: ExchangeRates, date: string) {
  try {
    localStorage.setItem(
      RATE_CACHE_KEY,
      JSON.stringify({ base: 'CNY', date, fetchedAt: Date.now(), rates })
    )
  } catch {
    /* 缓存失败不影响统计 */
  }
}

function getTodayDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
