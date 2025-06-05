<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores'; // To get supabase client from layout data
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import type { Building } from '$lib/types/database';
  import type { SupabaseClient } from '@supabase/supabase-js';

  // $: supabase = $page.data.supabase; // Get Supabase client reactively

  let buildings: Building[] = [];
  let loadingData = true; // Renamed from 'loading' to be specific to data fetching
  let error: string | null = null;
  // sessionLoading is implicitly handled by userStore.loading or $page.data.session presence

  let supabaseClient: SupabaseClient;

  $: {
    if ($page.data.supabase) {
      supabaseClient = $page.data.supabase;
      // Trigger fetch only if user is authenticated and client is available
      if ($userStore.user && $userStore.session && supabaseClient) {
        fetchBuildings();
      }
    }
  }

  onMount(() => {
    // This onMount is now primarily for reacting to userStore changes
    // or if initial fetch needs to be explicitly managed here.
    // The reactive block for supabaseClient and $userStore.user should handle most cases.

    const userUnsubscribe = userStore.subscribe(value => {
      if (!value.loading) { // When userStore is done loading initial auth state
        if (!value.user || !value.session) {
          goto('/login?redirect=/buildings');
        } else {
          // If supabaseClient is already available, and buildings haven't been fetched yet
          if (supabaseClient && buildings.length === 0 && loadingData) {
             fetchBuildings();
          }
        }
      }
    });

    // Initial check if everything is ready
    if (!$userStore.loading && $userStore.user && supabaseClient && buildings.length === 0 && loadingData) {
        fetchBuildings();
    }


    return () => {
      userUnsubscribe();
    };
  });

  async function fetchBuildings() {
    if (!supabaseClient) {
      error = "Supabase client not available.";
      loadingData = false;
      return;
    }
    try {
      loadingData = true;
      error = null;
      const { data: fetchedData, error: fetchError } = await supabaseClient
        .from('buildings')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) {
        console.error('Error fetching buildings:', fetchError);
        error = fetchError.message;
      } else {
        buildings = fetchedData as Building[];
      }
    } catch (e: any) {
      console.error('Exception fetching buildings:', e);
      error = e.message || 'An unexpected error occurred.';
    } finally {
      loadingData = false;
    }
  }
</script>

<svelte:head>
  <title>All Buildings - Estate Management</title>
</svelte:head>

<div class="container mx-auto p-4">
  <h1 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Buildings</h1>

  {#if sessionLoading || ($userStore.loading && buildings.length === 0)}
    <p class="text-gray-600 dark:text-gray-400">Loading user session and buildings...</p>
  {:else if !$userStore.user}
     <!-- This state should be handled by redirect, but as a fallback -->
    <p class="text-red-500">You must be logged in to view this page. Redirecting to login...</p>
  {:else if loading && buildings.length === 0}
    <p class="text-gray-600 dark:text-gray-400">Fetching buildings list...</p>
  {:else if error}
    <p class="text-red-500">Error fetching buildings: {error}</p>
  {:else if buildings.length === 0}
    <p class="text-gray-600 dark:text-gray-400">No buildings found. (Admins can add new buildings)</p>
    <!-- TODO: Link to add building page for admins -->
  {:else}
    <ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each buildings as building (building.id)}
        <li class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2">
              <a href="/buildings/{building.id}" class="text-blue-600 dark:text-blue-400 hover:underline">
                {building.name}
              </a>
            </h2>
            <p class="text-gray-700 dark:text-gray-300 mb-1">
              <strong>Address:</strong> {building.address || 'N/A'}
            </p>
            <p class="text-gray-700 dark:text-gray-300">
              <strong>Floors:</strong> {building.number_of_floors || 'N/A'}
            </p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 p-4 text-right">
             <a href="/buildings/{building.id}" class="text-sm text-blue-500 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-100 font-medium">
                View Details &rarr;
              </a>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
