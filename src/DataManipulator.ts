import { timeStamp } from 'console';
import { ServerRespond, HistoryEntry } from './DataStreamer';

export interface Row {
	price_abc: number,
	price_def: number,
	ratio: number,
	timestamp: Date,
	upper_bound: number,
	lower_bound: number,
	trigger_alert: number
}


export class DataManipulator {
	static generateRow(serverResponds: ServerRespond[], ratioHist: HistoryEntry[]) {
		const priceABC = (serverResponds[0].top_ask.price + serverResponds[0].top_bid.price) / 2;
		const priceDEF = (serverResponds[1].top_ask.price + serverResponds[1].top_bid.price) / 2;
		const ratio = priceABC / priceDEF;
		const timestamp = serverResponds[0].timestamp > serverResponds[1].timestamp ? serverResponds[0].timestamp : serverResponds[1].timestamp;

		// get date threshold = 1 year ago
		let hist_threshold = new Date(timestamp);
		hist_threshold.setFullYear(hist_threshold.getFullYear() - 1);
		// init variable for calc avg
		let hist_avg_ratio = 0.;
		let hist_count = 0;
		for (let i = 0; i < ratioHist.length; i++) {
			if (ratioHist[i].timestamp < hist_threshold) {
				continue;
			}

			hist_avg_ratio += ratioHist[i].value;
			hist_count++;
		}
		// case: no history added
		if (hist_count === 0) {
			// use 0.5 as default value because 0.5 * 0.1 = 0.05
			hist_avg_ratio = 0.5;
		} else {
			hist_avg_ratio /= hist_count;
		}

		console.log(hist_avg_ratio);

		const upperBound = 1 + hist_avg_ratio * 0.1;
		const lowerBound = 1 - hist_avg_ratio * 0.1;

		return {
			price_abc: priceABC,
			price_def: priceDEF,
			ratio: ratio,
			timestamp: timestamp,
			upper_bound: upperBound,
			lower_bound: lowerBound,
			trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined
		}
	}
}
