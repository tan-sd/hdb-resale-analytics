<template>
    <div class="loading-screen" v-if="!isLoadingComplete">
        <div class="loading-content">
        <h2>Preparing Your Data Visualization</h2>
        <div class="progress-container">
            <div 
            class="progress-bar" 
            :style="{ width: loadingProgress + '%' }"
            ></div>
        </div>
        <p>{{ loadingStatus }}</p>
        </div>
    </div>
    <div v-else>
        <slot></slot>
    </div>
</template>
  
  <script>
  import { ref, onMounted, createApp } from 'vue';
  import { useDataStore } from '@/stores/dataStore';
  
  export default {
    setup(props, { emit }) {
      const dataStore = useDataStore();
      const isLoadingComplete = ref(false);
      const loadingProgress = ref(0);
      const loadingStatus = ref('Initializing...');
  
      const preRenderCharts = [
        {
            name: "Transactions Chart",
            renderMethod: async() => {
                const chartContainer = document.createElement('div');
                chartContainer.style.display = "none";
                document.body.appendChild(chartContainer);

                const { default: LineChartTransaction } = await import('@/components/LineChartTransaction.vue');
                const app = createApp(LineChartTransaction);
                app.mount(chartContainer);
            }
        },
        { 
            name: 'Median Chart', 
            renderMethod: async () => {
            const chartContainer = document.createElement('div');
            chartContainer.style.display = "none";
            // chartContainer.id = 'transactions-chart-prerender';
            document.body.appendChild(chartContainer);
        
            const { default: LineChartMedian } = await import('@/components/LineChartMedian.vue');
            const app = createApp(LineChartMedian);
            app.mount(chartContainer);
          }
        },
        {
            name: "Flat Type Chart",
            renderMethod: async() => {
                const chartContainer = document.createElement('div');
                chartContainer.style.display = "none";
                document.body.appendChild(chartContainer);

                const { default: LineChartFlatType } = await import('@/components/LineChartFlatType.vue');
                const app = createApp(LineChartFlatType);
                app.mount(chartContainer);
            }
        },
        {
            name: "Box Plot Price per Sqm",
            renderMethod: async() => {
                const chartContainer = document.createElement('div');
                chartContainer.style.display = "none";
                document.body.appendChild(chartContainer);

                const { default: BoxPlotPricePerSqm } = await import('@/components/BoxPlotPricePerSqm.vue');
                const app = createApp(BoxPlotPricePerSqm);
                app.mount(chartContainer);
            }
        },
        {
            name: "Dashboard",
            renderMethod: async() => {
                const chartContainer = document.createElement('div');
                chartContainer.style.display = "none";
                document.body.appendChild(chartContainer);

                const { default: Dashboard } = await import('@/components/Dashboard.vue');
                const app = createApp(Dashboard);
                app.mount(chartContainer);
            }
        }
        // Add more chart pre-rendering methods
      ];
  
      const preloadAllData = async () => {
        try {
          // Load all data from dataStore
          await dataStore.loadData();
  
          // Pre-render charts sequentially
          for (let [index, chart] of preRenderCharts.entries()) {
            loadingStatus.value = `Preparing ${chart.name}...`;
            await chart.renderMethod();
            
            // Update progress
            loadingProgress.value = Math.round(
              ((index + 1) / preRenderCharts.length) * 100
            );
          }
  
          // Final setup
          isLoadingComplete.value = true;
          emit('loading-complete');
        } catch (error) {
          console.error('Preloading failed:', error);
          loadingStatus.value = 'Error loading data. Please refresh.';
        }
      };
  
      onMounted(preloadAllData);
  
      return {
        isLoadingComplete,
        loadingProgress,
        loadingStatus
      };
    }
  };
  </script>
  
  <style scoped>
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #f0f4f8;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .loading-content {
    text-align: center;
    max-width: 400px;
  }
  
  .progress-container {
    width: 100%;
    background-color: #e0e8f0;
    border-radius: 10px;
    margin: 20px 0;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 10px;
    background-color: #2c7be5;
    transition: width 0.5s ease;
  }
  </style>