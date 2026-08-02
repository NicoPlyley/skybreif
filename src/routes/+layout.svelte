<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Moon, PlaneTakeoff, Sun } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { untrack } from 'svelte';
	import { theme } from '$lib/theme.svelte';

	let { children } = $props();

	let isHome = $derived(page.url.pathname === '/');
	let currentTime = $state<Date | null>(null);

	$effect(() => {
		currentTime = new Date();

		let interval: ReturnType<typeof setInterval>;

		const msUntilNextMinute = untrack(() => {
			const now = currentTime!;
			return (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
		});

		const timeout = setTimeout(() => {
			interval = setInterval(() => {
				currentTime = new Date();
			}, 60000);
		}, msUntilNextMinute);

		return () => {
			clearTimeout(timeout);
			if (interval) clearInterval(interval);
		};
	});

	const timeString = $derived(
		currentTime
			? new Intl.DateTimeFormat('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
					timeZoneName: 'short'
				}).format(currentTime)
			: '--:--'
	);

	const zuluString = $derived(
		currentTime
			? new Intl.DateTimeFormat('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					timeZone: 'UTC',
					hour12: false
				}).format(currentTime) + ' Z'
			: '--:-- Z'
	);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<header class="mb-6 w-full border-b border-b-border-subtle bg-surface py-3">
	<div class="container grid grid-cols-2 md:grid-cols-3">
		<!-- Left: Logo & Subtitle -->
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-accent/10 bg-sky-accent/20 text-sky-accent"
			>
				<PlaneTakeoff />
			</div>
			<div class="flex flex-col justify-center">
				<p class="font-bold lg:text-lg">Sky<span class="text-sky-accent">Brief</span></p>
				<p class="hidden text-xs text-txt-secondary lg:block">
					VFR Flight Planning & Weather Dispatch
				</p>
			</div>
		</div>

		<!-- Middle: Clock -->
		<div class="hidden items-center justify-center md:flex">
			<div
				class="inline-flex items-center gap-4 divide-x divide-border-subtle rounded-xl border border-border-subtle bg-surface-hover/80 px-4 py-1.5"
			>
				<div class="pr-4 text-center">
					<p class="text-[10px] font-semibold tracking-wider text-txt-secondary">UTC / ZULU</p>
					<p class="text-sm font-bold text-sky-accent">{zuluString}</p>
				</div>

				<div class="text-center">
					<p class="text-[10px] font-semibold tracking-wider text-txt-secondary">LOCAL TIME</p>
					<p class="font-mono text-sm font-bold text-txt-primary tabular-nums">
						{timeString}
					</p>
				</div>
			</div>
		</div>

		<!-- Right: Actions -->
		<div class="flex items-center justify-end gap-4">
			<nav
				aria-label="Primary"
				class="flex rounded-xl border border-border-subtle bg-background p-1"
			>
				<a
					aria-current={isHome ? 'page' : undefined}
					class="block rounded-lg px-3 py-1.5 {isHome &&
						'border border-sky-accent/30 bg-sky-accent/10 text-sky-accent'}"
					href={resolve('/')}>Airport Lookup</a
				>
				<a
					aria-current={!isHome ? 'page' : undefined}
					class="block rounded-lg px-3 py-1.5 {!isHome &&
						'border border-sky-accent/30 bg-sky-accent/10 text-sky-accent'}"
					href={resolve('/brief')}>Route Briefing</a
				>
			</nav>

			<!-- Dark Mode Toggle -->
			<button
				onclick={() => theme.toggle()}
				aria-label={theme.current === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border-subtle bg-background text-txt-secondary hover:bg-surface-hover"
			>
				{#if theme.current === 'dark'}
					<Sun size={16} />
				{:else}
					<Moon size={16} />
				{/if}
			</button>
		</div>
	</div>
</header>
{@render children()}
