import * as Types from './declarations'
import * as Lib from './lib'
import Logger from './services/logging'


const init = async () => {

	Logger.info('tracking started...\n')

	// declare structure for last top/bottom averages
	const marketBeingTracked: Types.Market = { quote: 'BTC', symbol: 'DOGE'}
	const trackedMarket: Types.TrackedMarket = { market: marketBeingTracked }

	// while loop
	while (true) {

		// get latest top bottom averages
		const oracleMarketData = await Lib.getLatestMarketData(marketBeingTracked)

		const shortAboveLong = oracleMarketData.crunched.maThirtyMin > oracleMarketData.crunched.maTenHour

		if (shortAboveLong !== trackedMarket.shortAboveLong) {
			// update trackedMarket
			trackedMarket.shortAboveLong = shortAboveLong

			// raise event
			topMAHasChanged(trackedMarket, oracleMarketData)
		}

		// wait/delay 1m
		await Lib.delay(60000)
	}
}

const topMAHasChanged = (trackedMarket: Types.TrackedMarket, oracleMarketData: Types.Oracle.MarketData) => {
	const marketName = `${trackedMarket.market.quote}-${trackedMarket.market.symbol}`
	const shortMA = `short MA (${oracleMarketData.crunched.maThirtyMin})`
	const longMA = `long MA (${oracleMarketData.crunched.maTenHour})`

	const changeDirection = trackedMarket.shortAboveLong ? `now the ${shortMA} is above the ${longMA}` : `now the ${longMA} is above the ${shortMA}`

	Logger.info(`\n${marketName}: The top moving average has changed: ${changeDirection}`)
}

init()
