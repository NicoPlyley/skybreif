<script lang="ts">
	import type { Icon as IconType } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		icon: typeof IconType;
		children: Snippet;
	}

	let { title, icon: Icon, children }: Props = $props();
</script>

<div class="rounded-2xl border border-border-subtle bg-surface p-5 shadow-md">
	<div class="mb-4 flex items-center gap-2">
		<Icon size={14} class="text-sky-accent" />
		<h2 class="text-xs font-bold tracking-wider text-txt-secondary uppercase">{title}</h2>
	</div>

	{@render children()}
</div>
