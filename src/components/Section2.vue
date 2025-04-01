<template>
    <section class="w-full min-h-screen py-20 bg-white">
        <div data-section2="before-steps" class="h-[1vh]"></div>
        <div
            class="w-full px-6 mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12"
        >
            <div class="w-full max-w-lg mx-auto">
                <div
                    class="xl:sticky xl:top-64 fixed bottom-3 left-0 right-0 z-10 px-4 xl:px-0"
                    :class="['transition-opacity duration-300', { 'opacity-0 pointer-events-none': !showBox, 'opacity-100': showBox }]"
                >
                    <div
                        class="border rounded-lg backdrop-blur-[6.5px] p-6 space-y-6 bg-white relative overflow-hidden shadow-md"
                    >
                        <h2
                            class="text-sm sm:text-base font-bold uppercase tracking-tight mb-3 section-title"
                        >
                            Affordability
                        </h2>

                        <div class="space-y-3">
                            <p class="flex items-center gap-2 uppercase text-xs md:text-sm font-semibold tracking-wide">
                                {{ currentStep.title }}
                            </p>
                            <div class="space-y-4 text-xs md:text-sm leading-relaxed">
                                <p
                                    v-for="(para, idx) in currentStep.description"
                                    :key="idx"
                                    v-html = "para"
                                >
                                </p>
                            </div>

                            <div
                                class="absolute bottom-0 left-0 w-full h-2 overflow-hidden rounded-b-[calc(1rem-1px)] bg-gray-200"
                            >
                                <div
                                    class="h-full"
                                    style="background-color: hsl(353 75% 53%)"
                                    :style="{ width: progress + '%' }"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
            class="flex-1 relative"
            :style="{ height: `${steps.length * 115}vh` }"
            >
                <div class="sticky top-12 xl:top-28 w-full flex justify-center">
                    <div class="relative w-full h-[500px] max-w-[1000px]">
                    <LineChartAffordabilityIndex
                        ref="lineChartAffordabilityIndexChartRef"
                        v-show="currentStepIndex === 0"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-100"
                    />

                    <!-- <LineChartStoreyGroup
                        ref="storeyLineChartRef"
                        v-show="currentStepIndex === 1 || currentStepIndex === 2"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    /> -->

                    <LineChartMedianIncomeAndMedianResale
                        ref="lineChartMedianIncomeAndMedianResaleChartRef"
                        v-show="currentStepIndex === 1"
                        class="absolute inset-0 transition-opacity duration-500 ease-in-out opacity-0"
                    />
                    </div>
                </div>

                <div class="absolute inset-0 pointer-events-none">
                    <div class="space-y-[1vh]">
                    <div
                        v-for="(step, index) in steps"
                        :key="index"
                        :data-section2="index"
                        class="h-[99vh]"
                    ></div>
                    </div>

                    <div data-section2="after-steps" class="h-[1vh]"></div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import LineChartAffordabilityIndex from './LineChartAffordabilityIndex.vue';
import LineChartMedianIncomeAndMedianResale from './LineChartMedianIncomeAndMedianResale.vue';
import { ref, computed, onMounted, watch, onBeforeUnmount, watchEffect } from 'vue';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const currentStepIndex = ref(0);
const progress = ref(0);
const triggers = ref([]);
const showBox = ref(true);
const isPastLastSection = ref(false);
const storeyScatterChartRef = ref(null);
const storeyLineChartRef = ref(null);
const flatTypeLineChartRef = ref(null);
const flatTypeScatterChartRef = ref(null);
const boxPlotPricePerSqmChartRef = ref(null);
const boxPlotElectoralBoundariesChartRef = ref(null);
const lineChartAffordabilityIndexChartRef = ref(null);
const lineChartMedianIncomeAndMedianResaleChartRef = ref(null);
const hasDrawnLineChart = ref(false);
const isAfterSteps = ref(false);
const isBeforeSteps = ref(true);

const steps = [
    {
        number: 1,
        title: "HDB Resale Affordability Index",
        description: [
           "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],

        years: [
            1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000,
            2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011,
            2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022,
            2023,
        ],
    },
    {
        number: 2,
        title: "Median Income vs Resale Price",
        description: [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi in tincidunt lorem. Nulla dapibus risus et tristique aliquam. Nulla sodales magna ac risus porttitor, vitae molestie lorem bibendum. Praesent nec lacinia erat, eget lacinia lacus. Donec congue odio eget porta maximus. Donec vitae ex ac risus iaculis.",
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam vestibulum, justo id egestas aliquet, purus elit pellentesque risus, sed vulputate metus ex ac lorem. Vivamus a gravida ante. Aenean rutrum pulvinar dictum. Integer bibendum bibendum est, sed eleifend mauris sodales ac. In hendrerit erat sed.",
        ],
        years: [1990, 1991, 1992, 1993, 1994],
    },
];

const currentStep = computed(() => steps[currentStepIndex.value]);

onMounted(() => {
  steps.forEach((step, index) => {
    const triggerElement = document.querySelector(`[data-section2="${index}"]`);

    if (triggerElement) {
      const trigger = ScrollTrigger.create({
        trigger: triggerElement,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
          currentStepIndex.value = index;
        },
        onEnterBack: () => {
          currentStepIndex.value = index;
        },
        onUpdate: (self) => {
          progress.value = Math.round(self.progress * 100);
        }
      });

      triggers.value.push(trigger);
    }
  });

  const afterStepsTrigger = document.querySelector('[data-section2="after-steps"]');
  if (afterStepsTrigger) {
    const trigger = ScrollTrigger.create({
      trigger: afterStepsTrigger,
      start: "top center",
      end: "bottom center",
      onEnter: () => {
        isAfterSteps.value = true;
      },
      onEnterBack: () => {
        isAfterSteps.value = false;
      }
    });
    triggers.value.push(trigger);
  }
  
  const beforeStepsTrigger = document.querySelector('[data-section2="before-steps"]');
  if (beforeStepsTrigger) {
    const trigger = ScrollTrigger.create({
        trigger: beforeStepsTrigger,
        start: "top center",
        end: "bottom center",
        onEnter: () => {
            isBeforeSteps.value = false;
        },
        onEnterBack: () => {
            isBeforeSteps.value = true;
        }
    });
    triggers.value.push(trigger);
  }

  ScrollTrigger.refresh();
});

watchEffect(() => {
    showBox.value = !isBeforeSteps.value && !isAfterSteps.value;
});

onBeforeUnmount(() => {
    triggers.value.forEach((trigger) => trigger?.kill());
    triggers.value = [];
});

watch(currentStepIndex, (newIndex) => {
  const showLineChartAffordabilityIndex = newIndex === 0;
  const showLineChartMedianIncomeAndMedianResale = newIndex === 1;

  gsap.to(lineChartAffordabilityIndexChartRef.value?.$el, {
    opacity: showLineChartAffordabilityIndex ? 1 : 0,
    duration: 0.3,
    ease: 'power2.out',
  });

  gsap.to(lineChartMedianIncomeAndMedianResaleChartRef.value?.$el, {
    opacity: showLineChartMedianIncomeAndMedianResale ? 1 : 0,
    duration: 0.3,
    ease: 'power2.out',
  });

});
</script>