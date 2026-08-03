import type { AirportResult } from '$lib/types';

const getNearbyAirports = async (icao: string, controller: AbortController) => {
	let nearbyAirports: AirportResult[] = [];

	try {
		const res = await fetch(`/api/airports/${icao}/nearby`, {
			signal: controller.signal
		});
		nearbyAirports = await res.json();
	} catch (err) {
		if ((err as Error).name !== 'AbortError') {
			console.error('Search failed', err);
		}
	}

	return nearbyAirports;
};

export default getNearbyAirports;
