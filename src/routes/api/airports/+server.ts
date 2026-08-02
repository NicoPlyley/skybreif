import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, platform }) => {
	const q = url.searchParams.get('q')?.trim().toUpperCase() ?? '';

	if (q.length < 2) {
		return json([]);
	}

	const db = platform?.env?.DB;
	if (!db) {
		return json({ error: 'Database not available' }, { status: 500 });
	}

	const { results } = await db
		.prepare(
			`SELECT icao, iata, name, city, country, lat, lon, elevation
			 FROM airports
			 WHERE icao LIKE ?1 OR iata LIKE ?1 OR name LIKE ?2
			 ORDER BY
			   CASE WHEN icao = ?3 THEN 0 ELSE 1 END,
			   icao
			 LIMIT 8`
		)
		.bind(`${q}%`, `%${q}%`, q)
		.all();

	return json(results);
};
