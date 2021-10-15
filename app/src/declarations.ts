
export type Market = {
	quote: string
	symbol: string
}

export type TrackedMarket = {
	market: Market
	shortAboveLong?: boolean
}

export namespace Oracle {
	export type MarketData = {
		sourceId: number
		quote: string
		symbol: string
		crunched: {
			maThirtyMin: number
			maTenHour: number
		}
	}
}
