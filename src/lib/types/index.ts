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
