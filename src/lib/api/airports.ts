import type { AirportResult } from '$lib/types';

const getAirports = async (term: string, controller: AbortController): Promise<AirportResult[]> => {
	let results: AirportResult[] = [];
	try {
		const res = await fetch(`/api/airports?q=${encodeURIComponent(term)}`, {
			signal: controller.signal
		});
		results = await res.json();
	} catch (err) {
		if ((err as Error).name !== 'AbortError') {
			console.error('Search failed', err);
		}
	}

	return results;
};

export default getAirports;
