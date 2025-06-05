<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  export let data: PageData; // From load function in +page.server.ts (contains building info)
  export let form: ActionData; // From server-side action submission, if any
</script>

<svelte:head>
  <title>Admin: Add Unit to {data.building.name}</title>
</svelte:head>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
    Add New Unit
  </h1>
  <p class="text-xl text-gray-600 dark:text-gray-400 mb-8">
    For Building: <a href="/buildings/{data.building.id}" class="text-blue-600 hover:underline">{data.building.name}</a>
  </p>

  {#if form?.message}
    <div
      class="px-4 py-3 rounded relative mb-6"
      role="alert"
      class:bg-red-100={!form?.isUniqueConstraintError && form?.message}
      class:border-red-400={!form?.isUniqueConstraintError && form?.message}
      class:text-red-700={!form?.isUniqueConstraintError && form?.message}
      class:bg-yellow-100={form?.isUniqueConstraintError}
      class:border-yellow-400={form?.isUniqueConstraintError}
      class:text-yellow-700={form?.isUniqueConstraintError}
    >
      <strong class="font-bold">
        {#if form?.isUniqueConstraintError}Notice:{:else}Error:{/if}
      </strong>
      <span class="block sm:inline">{form.message}</span>
      {#if form?.isUniqueConstraintError}
        <p class="text-sm">A unit with this number already exists in this building.</p>
      {/if}
    </div>
  {/if}

  <form
    method="POST"
    use:enhance
    class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 max-w-2xl mx-auto"
  >
    <div class="mb-6">
      <label for="unit_number" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
        Unit Number <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="unit_number"
        name="unit_number"
        bind:value={form?.unit_number}
        class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      {#if form?.errors?.unit_number}
        <p class="text-red-500 text-xs italic mt-1">{form.errors.unit_number[0]}</p>
      {/if}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="mb-6">
        <label for="size" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          Size (e.g., 1200 sqft)
        </label>
        <input
          type="text"
          id="size"
          name="size"
          bind:value={form?.size}
          class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {#if form?.errors?.size}
          <p class="text-red-500 text-xs italic mt-1">{form.errors.size[0]}</p>
        {/if}
      </div>

      <div class="mb-6">
        <label for="layout_type" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          Layout Type (e.g., 2BHK)
        </label>
        <input
          type="text"
          id="layout_type"
          name="layout_type"
          bind:value={form?.layout_type}
          class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {#if form?.errors?.layout_type}
          <p class="text-red-500 text-xs italic mt-1">{form.errors.layout_type[0]}</p>
        {/if}
      </div>
    </div>

    <div class="mb-6">
      <label for="ownership_status" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
        Ownership Status (e.g., Owned, Rented)
      </label>
      <input
        type="text"
        id="ownership_status"
        name="ownership_status"
        bind:value={form?.ownership_status}
        class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {#if form?.errors?.ownership_status}
        <p class="text-red-500 text-xs italic mt-1">{form.errors.ownership_status[0]}</p>
      {/if}
    </div>


    <div class="flex items-center justify-between mt-8">
      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
      >
        Add Unit
      </button>
      <a href="/buildings/{data.building.id}" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200">
        Cancel (View Building)
      </a>
    </div>
  </form>
</div>
