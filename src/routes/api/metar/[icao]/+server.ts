import type { RequestHandler } from './$types';
import type { Metar } from '$lib/types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params, fetch }) => {
	let result: Metar | null = null;

	try {
		const res = await fetch(
			`https://aviationweather.gov/api/data/metar?ids=${params.icao}&format=json`
		);
		const data = (await res.json()) as Metar[];
		console.log(data);
		if (data.length > 0) {
			result = data[0];
		}
	} catch (err) {
		if ((err as Error).name !== 'AbortError') {
			console.error('Metar failed', err);
		}
		return json({ error: 'METAR not available' }, { status: 500 });
	}

	return json(result);
};
