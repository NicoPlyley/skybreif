import type { Metar } from '$lib/types';

const getMetar = async (icao: string, controller: AbortController): Promise<Metar> => {
	let metar: Metar | null = null;
	try {
		const res = await fetch(`/api/metar/${icao}`, {
			signal: controller.signal
		});
		const data = (await res.json()) as Metar;

		if (data) metar = data;
	} catch (err) {
		if ((err as Error).name !== 'AbortError') {
			console.error('METAR failed', err);
		}
	}

	if (!metar) {
		throw new Error('METAR not found');
	}

	return metar;
};

export default getMetar;
