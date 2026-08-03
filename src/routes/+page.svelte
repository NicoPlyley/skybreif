<script lang="ts">
	import { MetricTile } from '$lib/components';
	import { Search } from '@lucide/svelte';
	import { AirportSearch } from '$lib/components';
	import type { AirportResult, Metar } from '$lib/types';
	import { getMetar, getNearbyAirports } from '$lib/api';

	let selectedAirport = $state<AirportResult | null>(null);
	let nearbyAirports = $state<AirportResult[]>([]);
	let metar = $state<Metar | null>(null);

	const flightCategoryStyles: Record<string, string> = {
		VFR: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
		MVFR: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
		IFR: 'bg-red-500/10 border-red-500/30 text-red-500',
		LIFR: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-500'
	};

	const updateSelectedAirport = (airport: AirportResult) => (selectedAirport = airport);

	$effect(() => {
		const controller = new AbortController();
		if (!selectedAirport) {
			nearbyAirports = [];
			metar = null;
			return;
		}

		const icao = selectedAirport.icao;

		const timer = setTimeout(async () => {
			metar = await getMetar(icao, controller);
			nearbyAirports = await getNearbyAirports(icao, controller);
		});

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	});
</script>

<div class="container">
	<MetricTile title="Airport METAR Inspector" icon={Search}>
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
			<AirportSearch bind:selectedAirport />

			{#if selectedAirport}
				<div class="flex items-center gap-3">
					<div class="leading-tight">
						<h2 class="text-sm font-medium text-txt-primary">{selectedAirport.name}</h2>
						<p class="text-xs text-txt-secondary">
							Elevation: {selectedAirport.elevation.toLocaleString()}ft MSL
						</p>
					</div>

					{#if metar}
						<span
							class="rounded-full border px-2.5 py-1 text-xs font-bold {flightCategoryStyles[
								metar.fltCat ?? ''
							] ?? 'border-border-subtle bg-surface text-txt-secondary'}"
						>
							{metar.fltCat}
						</span>
					{/if}
				</div>
			{/if}
		</div>
		{#if nearbyAirports.length > 0}
			<div class="mt-4 border-t border-border-subtle pt-4">
				<p class="mb-2 text-xs font-semibold tracking-wide text-txt-secondary uppercase">
					Nearby Airports
				</p>
				<div class="flex flex-wrap gap-2">
					{#each nearbyAirports as airport (airport.icao)}
						<button
							onclick={() => updateSelectedAirport(airport)}
							class="cursor-pointer rounded-full border border-border-subtle bg-background px-3 py-1.5 font-mono text-sm font-bold text-txt-secondary transition-colors hover:border-sky-accent hover:bg-sky-accent/10 hover:text-sky-accent"
						>
							{airport.icao}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</MetricTile>
</div>
