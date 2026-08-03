<script lang="ts">
	import { MetricTile } from '$lib/components';
	import { Search, CloudSun, Wind, Eye, Thermometer, Gauge, CloudFog } from '@lucide/svelte';
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

<div class="container flex flex-col gap-4">
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

	{#if metar}
		<MetricTile title="Decoded Surface Observation" icon={CloudSun}>
			<div class="flex flex-col gap-4">
				<!-- Raw METAR box -->
				<div class="rounded-xl border border-border-subtle bg-background p-3.5">
					<div
						class="mb-1 flex items-center justify-between text-[10px] tracking-widest text-txt-secondary uppercase"
					>
						<span>Raw METAR Text</span>
						<span class="text-sky-accent">
							{new Date(metar.obsTime * 1000).toLocaleString('en-US', {
								hour: 'numeric',
								minute: '2-digit',
								month: 'short',
								day: 'numeric',
								hour12: false,
								timeZone: 'UTC'
							}) + ' Z'}
						</span>
					</div>
					<p class="font-mono text-xs font-semibold tracking-wide text-sky-accent">
						{metar.rawOb}
					</p>
				</div>

				<!-- Decoded 2x2 grid -->
				<div class="grid grid-cols-2 gap-3">
					<div class="rounded-xl border border-border-subtle bg-background p-3.5">
						<div
							class="mb-1 flex items-center justify-between font-mono text-[10px] text-txt-secondary uppercase"
						>
							<span>Wind Vector</span>
							<Wind size={14} class="text-sky-accent" />
						</div>
						<div class="font-mono text-lg font-bold text-txt-primary">
							{metar.wdir === 'VRB' ? 'VRB' : metar.wdir !== null ? `${metar.wdir}°` : '—'}
							{metar.wspd !== null ? `@ ${metar.wspd} kt` : ''}
						</div>
						{#if metar.wgst}
							<div class="font-mono text-[11px] text-amber-500">Gusting to {metar.wgst} kt</div>
						{/if}
					</div>

					<div class="rounded-xl border border-border-subtle bg-background p-3.5">
						<div
							class="mb-1 flex items-center justify-between font-mono text-[10px] text-txt-secondary uppercase"
						>
							<span>Visibility</span>
							<Eye size={14} class="text-sky-accent" />
						</div>
						<div class="font-mono text-lg font-bold text-txt-primary">{metar.visib}SM</div>
					</div>

					<div class="rounded-xl border border-border-subtle bg-background p-3.5">
						<div
							class="mb-1 flex items-center justify-between font-mono text-[10px] text-txt-secondary uppercase"
						>
							<span>Temp / Dewpoint</span>
							<Thermometer size={14} class="text-sky-accent" />
						</div>
						<div class="font-mono text-lg font-bold text-txt-primary">
							{metar.temp !== null ? `${Math.round(metar.temp)}°C` : '—'} / {metar.dewp !== null
								? `${Math.round(metar.dewp)}°C`
								: '—'}
						</div>
					</div>

					<div class="rounded-xl border border-border-subtle bg-background p-3.5">
						<div
							class="mb-1 flex items-center justify-between font-mono text-[10px] text-txt-secondary uppercase"
						>
							<span>Altimeter (QNH)</span>
							<Gauge size={14} class="text-sky-accent" />
						</div>
						<div class="font-mono text-lg font-bold text-txt-primary">
							{metar.altim !== null ? `${(metar.altim * 0.02953).toFixed(2)} inHg` : '—'}
						</div>
					</div>
				</div>

				<!-- Cloud layers banner -->
				<div
					class="flex items-center justify-between rounded-xl border border-border-subtle bg-background p-3 font-mono text-xs"
				>
					<span class="text-txt-secondary">Sky Conditions / Ceiling:</span>
					<span class="font-bold text-emerald-500">
						{metar.cover ?? (metar.clouds.length > 0 ? metar.clouds[0].cover : 'CLR')}
						{#if metar.clouds.length > 0 && metar.clouds[0].base !== null}
							(Base {metar.clouds[0].base.toLocaleString()} ft)
						{/if}
					</span>
				</div>
			</div>
		</MetricTile>
	{/if}
</div>
