<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData; // From server-side action submission
</script>

<svelte:head>
  <title>Admin: Add New Building</title>
</svelte:head>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8">Add New Building</h1>

  {#if form?.message && !form?.errors}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{form.message}</span>
    </div>
  {/if}

  <form
    method="POST"
    action="?/createBuilding"
    use:enhance
    class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-2xl mx-auto"
  >
    <div class="mb-6">
      <label for="name" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
        Building Name <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="name"
        name="name"
        bind:value={form?.name}
        class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      {#if form?.errors?.name}
        <p class="text-red-500 text-xs italic mt-1">{form.errors.name[0]}</p>
      {/if}
    </div>

    <div class="mb-6">
      <label for="address" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
        Address
      </label>
      <textarea
        id="address"
        name="address"
        bind:value={form?.address}
        rows="3"
        class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      ></textarea>
      {#if form?.errors?.address}
        <p class="text-red-500 text-xs italic mt-1">{form.errors.address[0]}</p>
      {/if}
    </div>

    <div class="mb-6">
      <label for="numberOfFloors" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
        Number of Floors
      </label>
      <input
        type="number"
        id="numberOfFloors"
        name="numberOfFloors"
        bind:value={form?.numberOfFloors}
        class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        min="0"
      />
      {#if form?.errors?.number_of_floors}
        <p class="text-red-500 text-xs italic mt-1">{form.errors.number_of_floors[0]}</p>
      {/if}
    </div>

    <div class="flex items-center justify-between">
      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
      >
        Create Building
      </button>
      <a href="/admin/buildings" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
        Cancel
      </a>
    </div>
  </form>
</div>
