<template>
    <div class="loading-screen" v-if="!isLoadingComplete">
        <div class="loading-content">
          <p class="text-base font-extrabold section-title">{{ loadingStatus }}</p>
        <div class="progress-container">
            <div 
            class="progress-bar" 
            :style="{ width: loadingProgress + '%' }"
            ></div>
        </div>
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
      const loadingStatus = ref('Loading Experience...');
  
      const preRenderCharts = [
        {
          name: "Transactions Chart",
          renderMethod: async() => {
            const chartContainer = document.createElement('div');
            chartContainer.style.display = "none";
            document.body.appendChild(chartContainer);

            const { default: LineChartTransaction } = await import('@/components/LineChartTransaction.vue');
            const app = createApp(LineChartTransaction);
            const vm = app.mount(chartContainer);
            app.unmount();
            document.body.removeChild(chartContainer);
          }
        },
        { 
          name: 'Median Chart', 
          renderMethod: async () => {
            const chartContainer = document.createElement('div');
            chartContainer.style.display = "none";
            document.body.appendChild(chartContainer);
        
            const { default: LineChartMedian } = await import('@/components/LineChartMedian.vue');
            const app = createApp(LineChartMedian);
            const vm = app.mount(chartContainer);
            app.unmount();
            document.body.removeChild(chartContainer);
          }
        },
        {
          name: 'Scatter Plot Storey Levels',
          renderMethod: async () => {
            const chartContainer = document.createElement('div');
            chartContainer.style.display = "none";
            document.body.appendChild(chartContainer);
        
            const { default: ScatterPlotStories } = await import('@/components/ScatterPlotStoreyGroup.vue');
            const app = createApp(ScatterPlotStories, { preloadMode: true});
            const vm = app.mount(chartContainer);
            app.unmount();
            document.body.removeChild(chartContainer);
          }
        },
        // {
        //   name: 'Line Chart Floor Group',
        //   renderMethod: async () => {
        //     const chartContainer = document.createElement('div');
        //     chartContainer.style.display = "none";
        //     document.body.appendChild(chartContainer);
        
        //     const { default: LineChartFloorGroup } = await import('@/components/LineChartStoreyGroup.vue');
        //     const app = createApp(LineChartFloorGroup);
        //     app.mount(chartContainer);
        //   },
        // },
        {
          name: "Flat Type Line Chart",
          renderMethod: async() => {
            const chartContainer = document.createElement('div');
            chartContainer.style.display = "none";
            document.body.appendChild(chartContainer);

            const { default: LineChartFlatType } = await import('@/components/LineChartFlatType.vue');
            const app = createApp(LineChartFlatType);
            const vm = app.mount(chartContainer);
            app.unmount();
            document.body.removeChild(chartContainer);
          }
        },
        {
          name: "Flat Type Scatter Plot",
          renderMethod: async() => {
            const chartContainer = document.createElement('div');
            chartContainer.style.display = "none";
            document.body.appendChild(chartContainer);

            const { default: ScatterPlotFlatType } = await import('@/components/ScatterPlotFlatType.vue');
            const app = createApp(ScatterPlotFlatType);
            const vm = app.mount(chartContainer);
            app.unmount();
            document.body.removeChild(chartContainer);
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
            const vm = app.mount(chartContainer);
            app.unmount();
            document.body.removeChild(chartContainer);
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
            const vm = app.mount(chartContainer);
            app.unmount();
            document.body.removeChild(chartContainer);
          }
        }
      ];
  
      const preloadAllData = async () => {
        try {
          await dataStore.loadData();
  
          for (let [index, chart] of preRenderCharts.entries()) {
            loadingStatus.value = `Preparing ${chart.name}...`;
            await chart.renderMethod();
            
            loadingProgress.value = Math.round(
              ((index + 1) / preRenderCharts.length) * 100
            );
          }
  
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
    background-color: rgb(242, 242, 242) / 1;
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
    width: 300px;
    background-color: #e0e8f0;
    border-radius: 10px;
    margin: 20px 0;
    overflow: hidden;
  }
  
  .progress-bar {
    height: 10px;
    background-color: hsl(353 75% 53%);
    transition: width 0.5s ease;
  }
  </style>