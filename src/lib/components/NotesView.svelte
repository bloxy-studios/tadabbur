<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Icon from './Icon.svelte';
</script>

<div class="flex flex-col items-center gap-3 px-6 py-10 text-center">
	<div class="bg-accent-soft text-accent flex h-12 w-12 items-center justify-center rounded-full">
		<Icon name="note" size={22} />
	</div>
	<h3 class="text-body text-sm font-semibold">{m.notes_title()}</h3>
	<p class="text-faint text-xs leading-relaxed">{m.notes_soon()}</p>
</div>
