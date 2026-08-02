import { json, type RequestHandler } from '@sveltejs/kit';
import type { AirportResult } from '$lib/types';

export const GET: RequestHandler = async ({ params, platform }) => {
	const maxDistanceInMiles = 20;
	const icao = params.icao;

	const latDegreePerMile = maxDistanceInMiles / 69;

	if (!icao || icao.length < 4) {
		return json({ error: 'Invalid ICAO Code' }, { status: 400 });
	}

	const db = platform?.env?.DB;
	if (!db) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	const airport: AirportResult | null = await db
		.prepare(`SELECT lon, lat FROM airports WHERE icao = ?1`)
		.bind(icao)
		.first();

	if (!airport) {
		return json({ error: 'ICAO Code Not Found' }, { status: 400 });
	}

	const lonDegreePerMile = maxDistanceInMiles / (69.17 * Math.cos(airport.lat * (Math.PI / 180)));

	const maxDeltaLat = airport.lat + latDegreePerMile;
	const minDeltaLat = airport.lat - latDegreePerMile;

	const maxDeltaLon = airport.lon + lonDegreePerMile;
	const minDeltaLon = airport.lon - lonDegreePerMile;

	const { results } = await db
		.prepare(
			`SELECT icao, iata, name, city, lat, lon, elevation,
                    (3959 * acos(
                            cos(radians(?1)) * cos(radians(lat)) *
                            cos(radians(lon) - radians(?2)) +
                            sin(radians(?1)) * sin(radians(lat))
                            )) AS distance_miles
             FROM airports
             WHERE lat BETWEEN ?3 AND ?4
               AND lon BETWEEN ?5 AND ?6
               AND icao != ?7
             ORDER BY distance_miles;`
		)
		.bind(airport.lat, airport.lon, minDeltaLat, maxDeltaLat, minDeltaLon, maxDeltaLon, icao)
		.all();

	return json(results);
};
