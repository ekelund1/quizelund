<template>
  <KPILevel :model="toplevel" :toplevel="true" />
</template>

<script setup lang="ts">
import KPILevel from '../components/KPILevel.vue'
import { toplevel } from '@/services/KPIServcice'
</script>
