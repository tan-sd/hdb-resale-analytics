<script setup>
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
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