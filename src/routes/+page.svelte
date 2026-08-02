<script lang="ts">
	import { MetricTile } from '$lib/components';
	import { Search } from '@lucide/svelte';
	import { AirportSearch } from '$lib/components';
	import type { AirportResult } from '$lib/types';

	let selectedAirport = $state<AirportResult | null>(null);
</script>

<div class="container">
	<MetricTile title="Airport METAR Inspector" icon={Search}>
		<div class="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
			<AirportSearch bind:selectedAirport />

			{#if selectedAirport}
				<div
					class="flex flex-wrap items-center gap-4 rounded-2xl border border-border-subtle bg-background px-4 py-3"
				>
					<div class="flex items-center gap-1.5">
						<p class="rounded-xl bg-sky-accent px-3 py-1.5 font-mono text-sm font-bold text-white">
							{selectedAirport.icao}
						</p>
						{#if selectedAirport.iata}
							<p
								class="rounded-xl border border-border-subtle px-3 py-1.5 font-mono text-sm font-bold text-txt-secondary"
							>
								{selectedAirport.iata}
							</p>
						{/if}
					</div>

					<h2 class="text-sm font-medium text-txt-primary">{selectedAirport.name}</h2>

					<div class="ml-auto flex items-baseline gap-1 border-l border-border-subtle pl-4">
						<span class="text-base font-semibold text-txt-primary">
							{selectedAirport.elevation.toLocaleString()}
						</span>
						<span class="text-xs text-txt-secondary">ft</span>
					</div>
				</div>
			{/if}
		</div>
	</MetricTile>
</div>
