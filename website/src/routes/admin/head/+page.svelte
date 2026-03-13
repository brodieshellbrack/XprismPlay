<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { Shield01Icon, UserCheck01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';
	import { toast } from 'svelte-sonner';

	let usernameToAction = $state('');
	let actionLoading = $state(false);

	async function toggleAdmin(makeAdmin: boolean) {
		if (!usernameToAction.trim()) return;

		actionLoading = true;
		try {
			const response = await fetch('/api/admin/head/toggle-admin', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: usernameToAction.trim(), makeAdmin })
			});

			if (response.ok) {
				const data = await response.json();
				toast.success(data.message);
				usernameToAction = ''; // Reset input on success
			} else {
				const error = await response.json();
				toast.error(error.message || 'Failed to update user');
			}
		} catch (e) {
			toast.error('Failed to communicate with the server');
		} finally {
			actionLoading = false;
		}
	}
</script>

<div class="container mx-auto max-w-4xl py-6">
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<HugeiconsIcon icon={Shield01Icon} class="h-5 w-5 text-orange-500" />
				Head Admin Panel
			</Card.Title>
			<Card.Description>Manage administrator privileges for standard users.</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="max-w-md space-y-4">
				<div>
					<label for="username" class="mb-2 block text-sm font-medium">Target Username</label>
					<Input
						id="username"
						bind:value={usernameToAction}
						placeholder="Enter username (without @)"
						required
					/>
				</div>
				<div class="flex gap-4 pt-2">
					<Button
						onclick={() => toggleAdmin(true)}
						disabled={!usernameToAction.trim() || actionLoading}
						class="flex-1 bg-orange-500 text-white hover:bg-orange-600"
					>
						<HugeiconsIcon icon={UserCheck01Icon} class="mr-2 h-4 w-4" />
						Make Admin
					</Button>
					<Button
						variant="destructive"
						onclick={() => toggleAdmin(false)}
						disabled={!usernameToAction.trim() || actionLoading}
						class="flex-1"
					>
						<HugeiconsIcon icon={Cancel01Icon} class="mr-2 h-4 w-4" />
						Revoke Admin
					</Button>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
