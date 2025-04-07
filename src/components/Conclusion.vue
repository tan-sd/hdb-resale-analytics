<template>
    <section class="pt-40 w-full min-h-screen py-20 bg-gray-50">
      <div data-section-factors="before" class="h-[1vh]" />
  
      <div class="w-full px-6 mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 min-h-screen">
        <!-- Sticky Description -->
        <div class="w-full max-w-lg mx-auto">
          <div
            class="lg:sticky lg:top-1/2 lg:transform lg:-translate-y-1/2 fixed lg:static bottom-4 left-1/2 -translate-x-1/2 lg:translate-x-0 z-20"
            :class="[
              'transition-opacity duration-300',
              {
                'opacity-0 pointer-events-none': !showBox,
                'opacity-100': showBox,
              },
            ]"
          >
            <div class="border rounded-t-xl lg:rounded-lg backdrop-blur-[6.5px] p-6 space-y-6 bg-white relative overflow-hidden shadow-md w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] lg:w-auto h-[30vh] lg:h-auto">
              <h2 class="text-sm sm:text-base font-bold uppercase tracking-tight mb-3 section-title">
                {{ currentStep.header }}
              </h2>
              <div ref="descScrollRef" class="overflow-y-auto h-full pr-1 lg:pb-0 pb-10">
                <div class="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700">
                  <p v-for="(para, idx) in currentStep.description" :key="idx" v-html="para"></p>
                </div>
                <div class="absolute bottom-0 left-0 w-full h-2 overflow-hidden rounded-b-[calc(1rem-1px)] bg-gray-200">
                  <div class="h-full bg-rose-500" :style="{ width: progress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- Factors Column -->
        <div class="relative" :style="{ height: `${steps.length * 115}vh` }">
          <div class="sticky top-0 w-full h-screen flex items-center justify-center">
            <div ref="factorContainerRef" class="relative w-full max-w-xs mx-auto min-h-[600px]">
              <div v-if="currentStep.layout === 'ranked'" class="text-xs text-gray-500 text-center uppercase mb-2">
                Most Influential Factor
              </div>
  
              <transition-group name="fade-move" tag="div">
                <div
                  v-for="factor in allFactors"
                  :key="factor.label"
                  :ref="el => factorRefs.set(factor.label, el)"
                  class="absolute transition-all duration-700 ease-in-out p-4 rounded-xl border shadow-sm flex items-center gap-3 w-full"
                  :class="[
                    currentStep.highlighted.includes(factor.label)
                      ? 'bg-rose-100 border-rose-300 text-rose-700 font-semibold'
                      : 'bg-white border-gray-200 text-gray-800'
                  ]"
                  :style="factorStyles[factor.label]"
                >
                  <div class="text-xl">{{ factor.icon }}</div>
                  <div class="text-sm sm:text-base">{{ factor.label }}</div>
                </div>
              </transition-group>
  
              <div v-if="currentStep.layout === 'ranked'" class="text-xs text-gray-500 text-center uppercase mt-[calc(76px*9+16px)]">
                Least Influential Factor
              </div>
            </div>
          </div>
  
          <!-- Scroll Triggers -->
          <div class="absolute inset-0 pointer-events-none">
            <div v-for="(_, i) in steps" :key="i" :data-stepindex-trigger="i" class="h-[99vh]" />
          </div>
          <div data-section-factors="after" class="h-[1vh]" />
        </div>
      </div>
    </section>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, nextTick, watchEffect, watch, onBeforeUnmount } from 'vue';
  import { gsap } from 'gsap';
  import { Flip } from 'gsap/Flip';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  gsap.registerPlugin(ScrollTrigger, Flip);
  
  const currentStepIndex = ref(0);
  const descScrollRef = ref(null);
  const showBox = ref(true);
  const factorContainerRef = ref(null);
  const factorRefs = new Map();
  const factorStyles = ref({});
  const progress = ref(0);
  const triggers = ref([]);
  const isBefore = ref(true);
  const isAfter = ref(false);
  
  const allFactors = [
    { label: 'Government Policy', icon: '📜', tier: 1, scale: 'macro' },
    { label: 'Planning Area', icon: '🗺️', tier: 1, scale: 'macro' },
    { label: 'Electoral Boundaries', icon: '🗳️', tier: 3, scale: 'macro' },
    { label: 'Demographics (Age)', icon: '📊', tier: 3, scale: 'macro' },
    { label: 'Flat Type & Size', icon: '📐', tier: 1, scale: 'micro' },
    { label: 'Storey Level', icon: '🏢', tier: 1, scale: 'micro' },
    { label: 'Proximity to MRT', icon: '🚇', tier: 2, scale: 'micro' },
    { label: 'Proximity to Schools', icon: '🏫', tier: 2, scale: 'micro' },
    { label: 'Years Remaining on Lease', icon: '📄', tier: 2, scale: 'micro' },
  ];
  
  const steps = [
    { header: 'Macro vs. Micro Factors', description: ['<span class="font-semibold">Macro factors</span> shape systemic forces like policy, location, and demographics. <span class="font-semibold">Micro factors</span> reflect specific features of flats that buyers compare — like size, floor level, or MRT proximity.'], highlighted: [], layout: 'split' },
    { header: 'Most to Least Influential', description: ['Here are the factors sorted by their <span class="font-semibold">influence on resale prices</span>, from strongest to weakest. Macro factors tend to lead, with micro traits offering premiums.'], highlighted: [], layout: 'ranked' },
    { header: '🥇 Top Tier — Strongest Influence', description: ['Systemic drivers like <span class="font-semibold">government policy</span> and <span class="font-semibold">planning area</span> shape trends, while flat traits like <span class="font-semibold">size</span> and <span class="font-semibold">storey level</span> strongly impact value.'], highlighted: ['Government Policy', 'Planning Area', 'Flat Type & Size', 'Storey Level'], layout: 'ranked' },
    { header: '🥈 Middle Tier — Moderate Impact', description: ['Factors like <span class="font-semibold">MRT proximity</span>, <span class="font-semibold">lease years</span>, and <span class="font-semibold">schools</span> matter, but with nuanced and group-specific effects.'], highlighted: ['Proximity to MRT', 'Years Remaining on Lease', 'Proximity to Schools'], layout: 'ranked' },
    { header: '🥉 Lower Tier — Indirect Influence', description: ['<span class="font-semibold">Demographics</span> and <span class="font-semibold">electoral zones</span> shape long-term planning more than prices.'], highlighted: ['Demographics (Age)', 'Electoral Boundaries'], layout: 'ranked' },
  ];
  
  const currentStep = computed(() => steps[currentStepIndex.value]);
  
  const layoutFactors = computed(() => {
    return currentStep.value.layout === 'split'
      ? [...allFactors.filter(f => f.scale === 'macro'), ...allFactors.filter(f => f.scale === 'micro')]
      : [...allFactors].sort((a, b) => a.tier - b.tier);
  });
  
  const updatePositions = async () => {
    await nextTick();
    const state = Flip.getState([...factorRefs.values()]);
    layoutFactors.value.forEach((factor, index) => {
      const el = factorRefs.get(factor.label);
      if (el) {
        el.style.top = `${index * 76}px`;
        el.style.left = '0px';
      }
    });
    Flip.from(state, { duration: 0.8, ease: 'power2.inOut', absolute: true });
  };
  
  onMounted(() => {
    steps.forEach((_, index) => {
      const el = document.querySelector(`[data-stepindex-trigger="${index}"]`);
      if (el) {
        const trigger = ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => { currentStepIndex.value = index; updatePositions(); },
          onEnterBack: () => { currentStepIndex.value = index; updatePositions(); },
          onUpdate: self => progress.value = Math.round(self.progress * 100),
        });
        triggers.value.push(trigger);
      }
    });
  
    const beforeEl = document.querySelector('[data-section-factors="before"]');
    const afterEl = document.querySelector('[data-section-factors="after"]');
  
    if (beforeEl) {
      const trigger = ScrollTrigger.create({
        trigger: beforeEl,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => (isBefore.value = false),
        onEnterBack: () => (isBefore.value = true),
      });
      triggers.value.push(trigger);
    }
  
    if (afterEl) {
      const trigger = ScrollTrigger.create({
        trigger: afterEl,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => (isAfter.value = true),
        onEnterBack: () => (isAfter.value = false),
      });
      triggers.value.push(trigger);
    }
  
    ScrollTrigger.refresh();
  });
  
  watchEffect(() => {
    showBox.value = !isBefore.value && !isAfter.value;
  });
  
  watch(currentStepIndex, () => {
    if (descScrollRef.value) {
      descScrollRef.value.scrollTop = 0;
    }
  });
  
  onBeforeUnmount(() => {
    triggers.value.forEach(t => t?.kill());
    triggers.value = [];
  });
  </script>
  
  <style scoped>
  .fade-move-enter-active,
  .fade-move-leave-active {
    transition: all 0.4s ease;
  }
  .fade-move-enter-from,
  .fade-move-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
  </style>
  