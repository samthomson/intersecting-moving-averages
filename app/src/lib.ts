import * as Types from './declarations'
import Logger from './services/logging'

import fetch from 'node-fetch'

const oracleRequest = async (options, requestLogParams: string) => {
	const url = process.env.ORACLE_URL

	if (!url) {
		throw Error('No URL set for oracle service. See readme.')
	}

	let attemptsMade = 0
	const maxAttempts = 4
	const delayBetweenRetries = 1000 // milliseconds

	while (attemptsMade < maxAttempts) {
		attemptsMade++
		try {

			// attempt to make request
			const httpRequest = await fetch(url, options)
			const success = httpRequest.status === 200

			const payload = await httpRequest.json()

			if (!success) {
				// log error
				Logger.warn('Oracle unreachable', httpRequest.status)
				return undefined
			}

			return payload
		} catch (err) {
			Logger.error('oracle request failed', err)
			if (attemptsMade < maxAttempts) {
				// we'll try again, so for now, just log this error
				// wait a moment before continuing
				Logger.info(
					`wait ${delayBetweenRetries / 1000} seconds before retrying`,
				)
				await delay(delayBetweenRetries)
			} else {
				Logger.warn(
					`failed ${maxAttempts} now, throw an error to get out of here`,
				)
				// we've failed too many times in a row - throw a real error
				throw Error(`oracle-request-failed-${maxAttempts}-times`)
			}
		}
	}
}

const queryOracleForMAs =  async (): Promise<Types.Oracle.MarketData[]> => {
	const options = {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: `
				query {
					markets {
						pageInfo {
							totalItems
						}
						items {
							sourceId
							exchange						
							quote
							symbol
							minTradeSize
							status
							high
							low
							quoteVolume
							lastTradeRate
							bidRate
							askRate
							precision
							crunched {
								maThirtyMin
								maTenHour
								maInstant
								lastUpdated
							}
						}
					}
				}
			`,
		}),
	}

	const payload = await oracleRequest(options, 'markets')

	// @ts-ignore
	const markets: Types.Oracle.MarketData[] = payload?.data?.markets?.items ?? []

	// successfully called API but got no data
	if (markets.length === 0) {
		Logger.error(`Oracle was reachable but couldn't get markets.`)
	}

	const filteredMarkets = markets
	.filter(market => market.sourceId === 1) // bittrex

	return filteredMarkets
}

// get market data for market being tracked
export const getLatestMarketData = async (trackingMarket: Types.Market): Promise<Types.Oracle.MarketData> => {
	// call oracle and get markets with default MAs
	const markets = await queryOracleForMAs()

	// filter down to just market being tracked
	const foundMarket = markets.filter(market => market.quote === trackingMarket.quote && market.symbol === trackingMarket.symbol)

	// return that market
	return foundMarket?.[0]
}

export const delay = async (ms: number): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms))
}
