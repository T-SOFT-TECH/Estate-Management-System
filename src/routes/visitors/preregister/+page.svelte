<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types'; // PageData for load, ActionData for form
  import { onMount } from 'svelte';

  export let form: ActionData; // From server-side action submission, if any
  // export let data: PageData; // Data from load function (currently empty but could hold session/user if needed)

  // Form field bindings
  let visitor_name = form?.visitor_name ?? '';
  let expected_date = form?.expected_date ?? '';
  let expected_time = form?.expected_time ?? '';
  let vehicle_plate = form?.vehicle_plate ?? '';

  // Reactive updates if form data comes back after submission with errors
  $: if (form?.visitor_name !== undefined) visitor_name = form.visitor_name;
  $: if (form?.expected_date !== undefined) expected_date = form.expected_date;
  $: if (form?.expected_time !== undefined) expected_time = form.expected_time ?? '';
  $: if (form?.vehicle_plate !== undefined) vehicle_plate = form.vehicle_plate ?? '';

  // Set min date for date picker to today
  let minDate: string;
  onMount(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    minDate = `${yyyy}-${mm}-${dd}`;
    if (!expected_date) { // Set initial value for date if not already set (e.g. from form error)
        expected_date = minDate;
    }
  });

</script>

<svelte:head>
  <title>Pre-register Visitor - Estate Management</title>
</svelte:head>

<div class="container mx-auto p-6">
  <h1 class="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-8 text-center">
    Pre-register a Visitor
  </h1>

  {#if form?.message}
    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6 max-w-lg mx-auto" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{form.message}</span>
    </div>
  {/if}
  {#if form?.success_message} <!-- Assuming you might add a success message to ActionData -->
    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6 max-w-lg mx-auto" role="alert">
      <strong class="font-bold">Success!</strong>
      <span class="block sm:inline">{form.success_message}</span>
    </div>
  {/if}


  <form
    method="POST"
    use:enhance
    class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-lg mx-auto"
  >
    <div class="mb-6">
      <label for="visitor_name" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
        Visitor's Name <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        id="visitor_name"
        name="visitor_name"
        bind:value={visitor_name}
        class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        required
      />
      {#if form?.errors?.visitor_name}
        <p class="text-red-500 text-xs italic mt-1">{form.errors.visitor_name[0]}</p>
      {/if}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <label for="expected_date" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          Expected Date <span class="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="expected_date"
          name="expected_date"
          bind:value={expected_date}
          min={minDate}
          class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
        {#if form?.errors?.expected_date}
          <p class="text-red-500 text-xs italic mt-1">{form.errors.expected_date[0]}</p>
        {/if}
      </div>
      <div>
        <label for="expected_time" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
          Expected Time (Optional)
        </label>
        <input
          type="time"
          id="expected_time"
          name="expected_time"
          bind:value={expected_time}
          class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {#if form?.errors?.expected_time}
          <p class="text-red-500 text-xs italic mt-1">{form.errors.expected_time[0]}</p>
        {/if}
      </div>
    </div>

    <div class="mb-6">
      <label for="vehicle_plate" class="block text-gray-700 dark:text-gray-300 font-bold mb-2">
        Vehicle Plate (Optional)
      </label>
      <input
        type="text"
        id="vehicle_plate"
        name="vehicle_plate"
        bind:value={vehicle_plate}
        class="shadow appearance-none border dark:border-gray-600 rounded w-full py-3 px-4 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {#if form?.errors?.vehicle_plate}
        <p class="text-red-500 text-xs italic mt-1">{form.errors.vehicle_plate[0]}</p>
      {/if}
    </div>

    <div class="flex items-center justify-between mt-8">
      <button
        type="submit"
        class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out w-full md:w-auto"
      >
        Pre-register Visitor
      </button>
      <a href="/visitors" class="inline-block align-baseline font-bold text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 md:ml-4 mt-4 md:mt-0">
        View My Pre-registrations
      </a>
    </div>
  </form>
</div>
