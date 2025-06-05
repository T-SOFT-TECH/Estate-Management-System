<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PageData } from './$types'; // Imports types from +page.server.ts
  import type { Building } from '$lib/types/database';
  import { onMount } from 'svelte';
  import type { SupabaseClient } from '@supabase/supabase-js';

  export let data: PageData; // Data from +page.server.ts

  let buildings: Building[] = [];
  let componentError: string | null = null; // For client-side errors like delete
  let supabase: SupabaseClient;

  $: ({ buildings, error: serverError } = data);
  $: supabase = $page.data.supabase; // Get Supabase client from layout data for client-side operations

  // Use serverError from load function if present
  $: if (serverError && !componentError) componentError = serverError;


  async function deleteBuilding(buildingId: string, buildingName: string) {
    if (!supabase) {
      componentError = 'Supabase client not available.';
      return;
    }
    if (confirm(`Are you sure you want to delete the building "${buildingName}"? This action cannot be undone.`)) {
      const { error: deleteError } = await supabase
        .from('buildings')
        .delete()
        .eq('id', buildingId);

      if (deleteError) {
        console.error('Error deleting building:', deleteError);
        componentError = `Failed to delete building: ${deleteError.message}`;
      } else {
        componentError = null;
        // Refresh the data by invalidating the load function's dependency
        // Supabase SSR setup uses 'supabase:auth' for auth-related invalidation.
        // For custom data, you might define a specific string or just invalidate all.
        // Or, update list client-side for responsiveness:
        buildings = buildings.filter(b => b.id !== buildingId);
        // await invalidate((url) => url.pathname === '/admin/buildings'); // More targeted invalidation
        await invalidate('app:admin_buildings'); // Custom invalidation key, if setup in +layout.server.ts or root
        // For now, simple client-side removal is quickest.
        // A full invalidate() or invalidate('supabase:auth') might be too broad if not managed carefully.
        // Let's use a more targeted approach or rely on server-side redirect/refresh if preferred.
        // For now, client-side removal and a success message or small notification would be good.
      }
    }
  }
</script>

<svelte:head>
  <title>Admin: Manage Buildings</title>
</svelte:head>

<div class="container mx-auto p-6">
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-200">Manage Buildings</h1>
    <a href="/admin/buildings/new" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
      Add New Building
    </a>
  </div>

  {#if componentError}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{componentError}</span>
    </div>
  {/if}

  {#if !buildings || buildings.length === 0}
    {#if !componentError} <!-- Only show "no buildings" if there wasn't an error -->
        <p class="text-gray-600 dark:text-gray-400">No buildings found. Add one to get started!</p>
    {/if}
  {:else}
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table class="min-w-full leading-normal">
        <thead>
          <tr class="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            <th class="px-5 py-3">Name</th>
            <th class="px-5 py-3">Address</th>
            <th class="px-5 py-3">Floors</th>
            <th class="px-5 py-3">Created At</th>
            <th class="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each buildings as building (building.id)}
            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{building.name}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{building.address || 'N/A'}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{building.number_of_floors || 'N/A'}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">
                {new Date(building.created_at).toLocaleDateString()}
              </td>
              <td class="px-5 py-4 text-sm text-right">
                <a href="/admin/buildings/{building.id}/edit" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 mr-3 font-medium">Edit</a>
                <button
                  on:click={() => deleteBuilding(building.id, building.name)}
                  class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
