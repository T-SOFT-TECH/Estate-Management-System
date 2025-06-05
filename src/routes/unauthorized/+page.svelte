<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let countdown = 5;

  onMount(() => {
    const timer = setInterval(() => {
      countdown--;
      if (countdown === 0) {
        clearInterval(timer);
        goto('/'); // Redirect to home page
      }
    }, 1000);

    return () => clearInterval(timer);
  });
</script>

<svelte:head>
  <title>Unauthorized Access - Estate Management</title>
</svelte:head>

<div class="container mx-auto p-4 text-center">
  <div class="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-700 text-red-700 dark:text-red-200 p-6 rounded-md shadow-md max-w-md mx-auto mt-10">
    <h1 class="text-2xl font-bold mb-4">Unauthorized Access</h1>
    <p class="mb-2">You do not have the necessary permissions to view the requested page.</p>
    <p class="mb-4">If you believe this is an error, please contact an administrator.</p>
    <p class="text-sm">Redirecting to the homepage in {countdown} second{countdown === 1 ? '' : 's'}...</p>
  </div>

  <div class="mt-8">
    <a href="/" class="text-blue-600 dark:text-blue-400 hover:underline">Go to Homepage Now</a>
  </div>
</div>

<style>
  /* Additional page-specific styles can go here if Tailwind isn't sufficient */
  .container {
    min-height: 70vh; /* Ensure it takes up substantial viewport height */
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
