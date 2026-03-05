<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', sans-serif;
}
</style>
