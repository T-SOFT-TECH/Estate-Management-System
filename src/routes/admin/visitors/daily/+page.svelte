<script lang="ts">
  import type { PageData } from './$types';
  // import { enhance } from '$app/forms'; // Needed if check-in action is added
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let data: PageData;

  // For date picker
  let selectedDisplayDate = data.selectedDate; // Initialize with date from server

  function handleDateChange(event: Event) {
    const newDate = (event.target as HTMLInputElement).value;
    if (newDate) {
      selectedDisplayDate = newDate;
      goto(`/admin/visitors/daily?date=${newDate}`, { keepFocus: true, invalidateAll: false });
      // invalidateAll: false might not re-run load if only query param changes.
      // A specific invalidation key or letting SvelteKit manage might be needed,
      // or ensure the load function depends on `url`. Default SvelteKit behavior should re-run load for URL changes.
    }
  }
</script>

<svelte:head>
  <title>Admin: Daily Visitor Log - {data.selectedDate}</title>
</svelte:head>

<div class="container mx-auto p-6">
  <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
    <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-200">
      Daily Visitor Pre-registrations
    </h1>
    <div class="flex items-center gap-2">
      <label for="view_date" class="text-sm font-medium text-gray-700 dark:text-gray-300">View Date:</label>
      <input
        type="date"
        id="view_date"
        name="view_date"
        bind:value={selectedDisplayDate}
        on:change={handleDateChange}
        class="border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 focus:ring-blue-500 focus:border-blue-500 rounded-md shadow-sm p-2"
      />
    </div>
  </div>

  <p class="text-xl text-gray-600 dark:text-gray-400 mb-6">
    Displaying visitors for: <span class="font-semibold">{new Date(data.selectedDate + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
  </p>

  {#if data.error}
    <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow" role="alert">
      <p class="font-bold">Error Loading Data:</p>
      <p>{data.error}</p>
    </div>
  {:else if !data.daily_registrations || data.daily_registrations.length === 0}
    <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 text-center">
       <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="mt-2 text-xl font-medium text-gray-900 dark:text-gray-100">No Pre-registered Visitors</h3>
      <p class="mt-1 text-gray-500 dark:text-gray-400">There are no 'pending' or 'active' visitor pre-registrations for the selected date.</p>
    </div>
  {:else}
    <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <table class="min-w-full leading-normal">
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Visitor Name</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Time</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Vehicle Plate</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Resident (Email)</th>
            <th class="px-5 py-3 border-b-2 border-gray-200 dark:border-gray-600 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
            <!-- Add Check-in column/button if implementing stretch goal -->
          </tr>
        </thead>
        <tbody>
          {#each data.daily_registrations as reg (reg.id)}
            <tr class="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-150">
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{reg.visitor_name}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{reg.expected_time || 'Any Time'}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">{reg.vehicle_plate || 'N/A'}</td>
              <td class="px-5 py-4 text-sm text-gray-900 dark:text-gray-100">
                {reg.resident?.email || reg.resident_user_id}
              </td>
              <td class="px-5 py-4 text-sm">
                <span class="px-2 py-1 font-semibold leading-tight rounded-full"
                  class:text-yellow-700={reg.status === 'pending'}
                  class:bg-yellow-100={reg.status === 'pending'}
                  class:dark:bg-yellow-600={reg.status === 'pending'}
                  class:dark:text-yellow-100={reg.status === 'pending'}
                  class:text-teal-700={reg.status === 'active'}
                  class:bg-teal-100={reg.status === 'active'}
                  class:dark:bg-teal-600={reg.status === 'active'}
                  class:dark:text-teal-100={reg.status === 'active'}
                >
                  {reg.status.charAt(0).toUpperCase() + reg.status.slice(1)}
                </span>
              </td>
              <!-- Check-in button cell -->
              <!--
              <td class="px-5 py-4 text-sm">
                {#if reg.status === 'pending'}
                  <form method="POST" action="?/checkInVisitor" use:enhance>
                    <input type="hidden" name="preregistration_id" value={reg.id} />
                    <button type="submit" class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium">
                      Check-In
                    </button>
                  </form>
                {/if}
              </td>
              -->
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>
