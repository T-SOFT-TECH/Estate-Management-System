<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import '../app.css';
</script>

<div class="app-container">
  <header>
    <Nav />
  </header>

  <main>
    <slot />
  </main>

  <footer>
    <p>&copy; {new Date().getFullYear()} Estate Management</p>
  </footer>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    /* Add header-specific styles if needed */
    border-bottom: 1px solid #ddd;
  }

  main {
    flex-grow: 1;
    padding: 1rem; /* Add some padding to the main content area */
  }

  footer {
    text-align: center;
    padding: 1rem;
    background-color: #f0f0f0;
    border-top: 1px solid #ddd;
  }
</style>
