<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores'; // For accessing route parameters
  import { supabase } from '$lib/supabaseClient';
  import { userStore } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import type { Building, Unit } from '$lib/types/database'; // Import types

  let building: Building | null = null;
  let units: Unit[] = [];
  let loadingBuilding = true;
  let loadingUnits = true;
  let error: string | null = null;
  let sessionLoading = true;

  let buildingId: string | null = null;

  onMount(async () => {
    buildingId = $page.params.id;

    const userUnsubscribe = userStore.subscribe(async (value) => {
      sessionLoading = value.loading;
      if (!value.loading) {
        if (!value.user || !value.session) {
          goto(`/login?redirect=/buildings/${buildingId}`);
        } else {
          // User is authenticated, proceed to fetch data
          if (buildingId) {
            await fetchBuildingDetails(buildingId);
            await fetchUnits(buildingId);
          } else {
            error = "Building ID is missing.";
            loadingBuilding = false;
            loadingUnits = false;
          }
        }
      }
    });

    // Initial check
    if (!$userStore.loading && !$userStore.user) {
        goto(`/login?redirect=/buildings/${buildingId}`);
    }

    return () => {
      userUnsubscribe();
    };
  });

  async function fetchBuildingDetails(id: string) {
    try {
      loadingBuilding = true;
      const { data, error: fetchError } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single(); // Expect one row

      if (fetchError) {
        console.error('Error fetching building details:', fetchError);
        error = `Building not found or error: ${fetchError.message}`;
        building = null;
      } else {
        building = data as Building;
      }
    } catch (e: any) {
      console.error('Exception fetching building details:', e);
      error = e.message || 'An unexpected error occurred.';
      building = null;
    } finally {
      loadingBuilding = false;
    }
  }

  async function fetchUnits(id: string) {
    try {
      loadingUnits = true;
      const { data, error: fetchError } = await supabase
        .from('units')
        .select('*')
        .eq('building_id', id)
        .order('unit_number', { ascending: true });

      if (fetchError) {
        console.error('Error fetching units:', fetchError);
        if (!error) error = `Error fetching units: ${fetchError.message}`; // Don't overwrite building error
        units = [];
      } else {
        units = data as Unit[];
      }
    } catch (e: any) {
      console.error('Exception fetching units:', e);
      if (!error) error = e.message || 'An unexpected error occurred fetching units.';
      units = [];
    } finally {
      loadingUnits = false;
    }
  }
</script>

<svelte:head>
  <title>{building ? building.name : 'Building Details'} - Estate Management</title>
</svelte:head>

<div class="container mx-auto p-4">
  {#if sessionLoading || ($userStore.loading && !building && !error)}
    <p class="text-gray-600 dark:text-gray-400">Loading user session and building data...</p>
  {:else if !$userStore.user}
    <p class="text-red-500">You must be logged in to view this page. Redirecting to login...</p>
  {:else if loadingBuilding}
    <p class="text-gray-600 dark:text-gray-400">Loading building details...</p>
  {:else if error && !building}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{error}</span>
    </div>
    <p class="mt-4"><a href="/buildings" class="text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Buildings List</a></p>
  {:else if building}
    <div class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 mb-8">
      <h1 class="text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100">{building.name}</h1>
      <p class="text-lg text-gray-700 dark:text-gray-300 mb-1"><strong>Address:</strong> {building.address || 'N/A'}</p>
      <p class="text-lg text-gray-700 dark:text-gray-300 mb-4"><strong>Number of Floors:</strong> {building.number_of_floors || 'N/A'}</p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Created: {new Date(building.created_at).toLocaleDateString()}</p>
    </div>

    <h2 class="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Units in {building.name}</h2>
    {#if loadingUnits}
      <p class="text-gray-600 dark:text-gray-400">Loading units...</p>
    {:else if units.length === 0}
      <p class="text-gray-600 dark:text-gray-400">No units found for this building.</p>
      <!-- TODO: Link to add unit page for admins -->
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each units as unit (unit.id)}
          <div class="bg-white dark:bg-gray-700 shadow-lg rounded-lg p-5 transition-shadow duration-300 hover:shadow-md">
            <h3 class="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2">Unit: {unit.unit_number}</h3>
            <p class="text-gray-600 dark:text-gray-300"><strong class="font-medium">Type:</strong> {unit.layout_type || 'N/A'}</p>
            <p class="text-gray-600 dark:text-gray-300"><strong class="font-medium">Size:</strong> {unit.size || 'N/A'}</p>
            <p class="text-gray-600 dark:text-gray-300"><strong class="font-medium">Status:</strong> {unit.ownership_status || 'N/A'}</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-3">ID: {unit.id}</p>
          </div>
        {/each}
      </div>
    {/if}
     {#if error && (loadingUnits || units.length > 0)} <!-- Show unit specific error if building loaded but units failed -->
        <p class="text-red-500 mt-4">Error related to units: {error}</p>
     {/if}
    <p class="mt-8">
      <a href="/buildings" class="text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Buildings List</a>
    </p>
  {:else}
     <p class="text-gray-600 dark:text-gray-400">No building data available.</p>
     <p class="mt-4"><a href="/buildings" class="text-blue-600 dark:text-blue-400 hover:underline">&larr; Back to Buildings List</a></p>
  {/if}
</div>
