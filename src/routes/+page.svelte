<script lang="ts">
	import { MetricTile } from '$lib/components';
	import { Search } from '@lucide/svelte';
	import { AirportSearch } from '$lib/components';
</script>

<div class="container">
	<MetricTile title="Airport METAR Inspector" icon={Search}>
		<div>
			<AirportSearch />
		</div>
	</MetricTile>
</div>
