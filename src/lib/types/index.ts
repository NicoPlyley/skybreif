export interface AirportResult {
	icao: string;
	iata: string | null;
	name: string;
	city: string;
	country: string;
	lat: number;
	lon: number;
	elevation: number;
}

interface MetarCloudLayer {
	cover: string; // e.g. "FEW", "SCT", "BKN", "OVC"
	base: number | null; // cloud base in feet AGL
}

export interface Metar {
	icaoId: string;
	receiptTime: string; // ISO 8601
	obsTime: number; // Unix timestamp (seconds)
	reportTime: string; // ISO 8601
	temp: number | null; // Celsius
	dewp: number | null; // Celsius
	wdir: number | 'VRB' | null; // degrees, or "VRB" for variable wind
	wspd: number | null; // knots
	wgst: number | null; // knots, gust speed
	visib: string | number; // e.g. "10+", "1/2", or a plain number
	altim: number | null; // hPa/millibars
	slp: number | null; // sea level pressure, hPa
	qcField: number;
	metarType: 'METAR' | 'SPECI';
	rawOb: string; // the raw METAR text string
	lat: number;
	lon: number;
	elev: number; // station elevation, feet
	name: string;
	cover: string | null; // overall sky cover summary
	clouds: MetarCloudLayer[];
	fltCat: 'VFR' | 'MVFR' | 'IFR' | 'LIFR' | null; // flight category
}
