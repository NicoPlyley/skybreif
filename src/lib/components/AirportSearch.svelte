<script lang="ts">
	import type { AirportResult } from '$lib/types';
	import { X } from '@lucide/svelte';

	interface Props {
		selectedAirport: AirportResult | null;
	}

	let { selectedAirport = $bindable() }: Props = $props();

	// TODO: Add support for arrow keys and enter to select airport
	let searchTerm = $state('');
	let results = $state<AirportResult[]>([]);
	let searchElement = $state<HTMLDivElement | null>(null);
	let searchIsOpen = $state(false);

	$effect(() => {
		const term = searchTerm.trim();

		if (term.length < 2) {
			searchIsOpen = false;
			results = [];
			return;
		}

		const controller = new AbortController();

		const timer = setTimeout(async () => {
			try {
				const res = await fetch(`/api/airports?q=${encodeURIComponent(term)}`, {
					signal: controller.signal
				});
				results = await res.json();
				searchIsOpen = true;
			} catch (err) {
				if ((err as Error).name !== 'AbortError') {
					console.error('Search failed', err);
				}
			}
		}, 250);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	});

	const handleAirportSelection = (airport: AirportResult): void => {
		selectedAirport = airport;
		results = [];
		searchTerm = '';
	};

	const handleSearchToggle = () => {
		if (results.length >= 1) {
			searchIsOpen = true;
		}
	};

	const removeSelectedAirport = () => {
		selectedAirport = null;
	};

	$effect(() => {
		const handleEscape = (event: KeyboardEvent): void => {
			if (event.key === 'Escape') {
				searchIsOpen = false;
			}
		};

		const validateOutsideEvent = (event: Event) => {
			if (!searchElement || !event.target) {
				return;
			}

			if (event.target instanceof Node && !searchElement.contains(event.target)) {
				searchIsOpen = false;
			}
		};

		const handleTabFocus = (event: FocusEvent): void => {
			validateOutsideEvent(event);
		};

		document.addEventListener('click', validateOutsideEvent);
		document.addEventListener('keyup', handleEscape);
		document.addEventListener('focusin', handleTabFocus);

		return () => {
			document.removeEventListener('click', validateOutsideEvent);
			document.removeEventListener('keyup', handleEscape);
			document.removeEventListener('focusin', handleTabFocus);
		};
	});
</script>

<div class="relative w-full max-w-md" bind:this={searchElement}>
	{#if selectedAirport}
		<div
			class="absolute top-2 bottom-2 left-2 flex items-center gap-2 rounded-xl bg-sky-accent/10 px-3 font-mono text-base font-bold text-sky-accent"
		>
			<span>{selectedAirport.icao}</span>
			<button
				onclick={removeSelectedAirport}
				class="cursor-pointer rounded-full p-0.5 text-sky-accent/70 hover:bg-sky-accent/20 hover:text-sky-accent"
				aria-label="Clear selected airport"
			>
				<X />
			</button>
		</div>
	{/if}

	<input
		onfocusin={handleSearchToggle}
		class="w-full rounded-2xl border border-border-subtle bg-background px-4 py-3.5 text-base tracking-wide text-txt-primary uppercase transition-colors outline-none placeholder:text-txt-secondary/70 focus:border-sky-accent disabled:text-transparent"
		type="text"
		bind:value={searchTerm}
		disabled={!!selectedAirport}
		placeholder={selectedAirport ? '' : 'Search ICAO Code'}
	/>

	{#if searchIsOpen}
		<div
			class="absolute z-20 mt-2 w-full space-y-1 rounded-2xl border border-border-subtle bg-surface p-2 shadow-2xl"
		>
			{#each results as airport (airport.icao)}
				<button
					onclick={() => handleAirportSelection(airport)}
					class="w-full cursor-pointer rounded-xl px-3 py-2.5 text-left hover:bg-surface-hover"
				>
					<span class="block">
						<span class="font-mono font-bold text-sky-accent">{airport.icao}</span>
						<span class="ml-2 text-sm text-txt-secondary">{airport.name}</span>
					</span>
				</button>
			{:else}
				<p class="px-3 py-2.5 text-sm text-txt-secondary">
					No airports found for "{searchTerm.toUpperCase()}"
				</p>
			{/each}
		</div>
	{/if}
</div>
