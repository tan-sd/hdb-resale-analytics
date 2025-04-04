<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useDataStore } from './stores/dataStore';
import GlobalLoader from './components/GlobalLoader.vue';

onMounted(() => {
  const dataStore = useDataStore();
  dataStore.loadData();
});
</script>

<template>
  <GlobalLoader>
  <RouterView />
  </GlobalLoader>
</template>

<style scoped>

</style>