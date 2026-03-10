<script lang="ts">
	import {
		Dialog,
		DialogContent,
		DialogHeader,
		DialogTitle,
		DialogDescription
	} from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { signIn } from '$lib/auth-client';
	import { page } from '$app/state';
	import { _ } from 'svelte-i18n';
	async function onConfirm() {
		await signIn.social({
			provider: 'google',
			callbackURL: `${page.url.pathname}?signIn=1`
		});
	}

	let { open = $bindable(false) } = $props<{
		open?: boolean;
	}>();
</script>

<Dialog bind:open>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>{$_('sign_in.form.title')}</DialogTitle>
			<DialogDescription>
				{$_('sign_in.form.description')}
			</DialogDescription>
		</DialogHeader>
		<div class="flex flex-col gap-4 py-2">
			<Button
				class="flex w-full items-center justify-center gap-2"
				variant="outline"
				onclick={() => onConfirm()}
			>
				<img
					class="h-5 w-5"
					src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
					alt="Google"
				/>
				<span>{$_('sign_in.form.services.google')}</span>
			</Button>

			<p class="text-muted-foreground text-center text-xs">
				{$_('sign_in.form.terms.0')}
				<a href="/legal/terms" class="text-primary hover:underline">{$_('sign_in.form.terms.1')}</a>
				{$_('sign_in.form.terms.2')}
				<a href="/legal/privacy" class="text-primary hover:underline"
					>{$_('sign_in.form.terms.3')}</a
				>
			</p>
		</div>
	</DialogContent>
</Dialog>
