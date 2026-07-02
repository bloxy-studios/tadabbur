<script lang="ts">
	interface Option {
		value: string;
		label: string;
	}

	let {
		options,
		value,
		onselect
	}: { options: Option[]; value: string; onselect: (value: string) => void } = $props();
</script>

<div class="flex rounded-lg bg-edge-soft p-1">
	{#each options as option (option.value)}
		<button
			type="button"
			class="flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors
				{value === option.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-body'}"
			aria-pressed={value === option.value}
			onclick={() => onselect(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>
