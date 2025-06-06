<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  export let data: PageData; // From load function in +page.server.ts
  export let form: ActionData; // From cancelRegistration action

  let displayPreregisteredMessage = false;

  onMount(() => {
    const urlParams = new URLSearchParams($page.url.search);
    if (urlParams.has('preregistered')) {
      displayPreregisteredMessage = true;
      // Optional: remove query param from URL without reload
      // window.history.replaceState({}, '', $page.url.pathname);
      setTimeout(() => displayPreregisteredMessage = false, 5000); // Hide after 5s
    }
  });

  // Reactive statement to update list if form action indicates success for a specific ID
  // This provides a more immediate client-side update before load function re-runs.
  // However, relying on SvelteKit's automatic invalidation after form actions is often simpler.
  // For this iteration, we'll primarily rely on the automatic invalidation.
  // $: if (form?.success && form?.cancelledId) {
  //   data.preregistrations = data.preregistrations?.filter(p => p.id !== form.cancelledId) ?? [];
  //   // Or, update status client-side:
  //   // const index = data.preregistrations?.findIndex(p => p.id === form.cancelledId);
  //   // if (index !== -1 && data.preregistrations) data.preregistrations[index].status = 'cancelled';
  // }
</script>

<svelte:head>
  <title>My Pre-registered Visitors</title>
</svelte:head>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-200">My Pre-registered Visitors</h1>
    <a href="/visitors/preregister" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
      Pre-register New Visitor
    </a>
  </div>

  {#if displayPreregisteredMessage}
    <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md shadow" role="alert">
      <p class="font-bold">Success!</p>
      <p>Your visitor has been pre-registered successfully.</p>
    </div>
  {/if}

  {#if form?.message && form?.success === false} <!-- Display general errors from cancel action -->
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
      <p class="font-bold">Error Cancelling Registration:</p>
      <p>{form.message}</p>
    </div>
  {/if}

  {#if form?.message && form?.success === true} <!-- Display success from cancel action -->
    <div class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-md shadow" role="alert">
      <p class="font-bold">Update:</p>
      <p>{form.message}</p>
    </div>
  {/if}

  {#if data.error}
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
      <p class="font-bold">Error Loading Data:</p>
      <p>{data.error}</p>
    </div>
  {:else if !data.preregistrations || data.preregistrations.length === 0}
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-2 text-xl font-medium text-gray-900 dark:text-gray-100">No Pre-registered Visitors</h3>
      <p class="mt-1 text-gray-500 dark:text-gray-400">Get started by pre-registering your first visitor.</p>
      <div class="mt-6">
        <a href="/visitors/preregister" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Pre-register Visitor
        </a>
      </div>
    </div>
  {:else}
    <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table class="min-w-full leading-normal">
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Visitor Name</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Expected Date</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Vehicle Plate</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each data.preregistrations as reg (reg.id)}
            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150">
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{reg.visitor_name}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{new Date(reg.expected_date + 'T00:00:00').toLocaleDateString()}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{reg.expected_time || 'N/A'}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{reg.vehicle_plate || 'N/A'}</td>
              <td class="px-5 py-4 text-sm">
                <span class="px-2 py-1 font-semibold leading-tight rounded-full"
                  class:text-green-700={reg.status === 'active' || reg.status === 'completed'}
                  class:bg-green-100={reg.status === 'active' || reg.status === 'completed'}
                  class:dark:bg-green-700={reg.status === 'active' || reg.status === 'completed'}
                  class:dark:text-green-100={reg.status === 'active' || reg.status === 'completed'}
                  class:text-yellow-700={reg.status === 'pending'}
                  class:bg-yellow-100={reg.status === 'pending'}
                  class:dark:bg-yellow-600={reg.status === 'pending'}
                  class:dark:text-yellow-100={reg.status === 'pending'}
                  class:text-red-700={reg.status === 'cancelled' || reg.status === 'expired'}
                  class:bg-red-100={reg.status === 'cancelled' || reg.status === 'expired'}
                  class:dark:bg-red-700={reg.status === 'cancelled' || reg.status === 'expired'}
                  class:dark:text-red-100={reg.status === 'cancelled' || reg.status === 'expired'}
                >
                  {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                </span>
              </td>
              <td class="px-5 py-4 text-sm">
                {#if reg.status === 'pending'}
                  <form method="POST" action="?/cancelRegistration" use:enhance class="inline">
                    <input type="hidden" name="preregistration_id" value={reg.id} />
                    <button type="submit" class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors duration-150">
                      Cancel
                    </button>
                  </form>
                {:else}
                  <span class="text-gray-500 dark:text-gray-400 italic">No actions</span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
