<template>
    <section class="pt-40 w-full min-h-screen py-20 bg-gray-50 flex items-center justify-center">
        <div class="w-full max-w-7xl px-6 mx-auto flex flex-col lg:flex-row gap-12 items-center justify-center">
        <div data-section-factors="before" class="h-[20vh]" />

        <div class="w-full px-6 mx-auto grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 min-h-screen">
            <!-- Left: Sticky Description -->
            <div class="w-full max-w-lg mx-auto">
                <div class="lg:sticky lg:top-1/2 lg:transform lg:-translate-y-1/2 fixed lg:static bottom-4 left-1/2 -translate-x-1/2 lg:translate-x-0 z-20"
                    :class="['transition-opacity duration-300', { 'opacity-0 pointer-events-none': !showBox, 'opacity-100': showBox }]">
                    <div
                        class="border rounded-t-xl lg:rounded-lg backdrop-blur-[6.5px] p-6 space-y-6 bg-white relative overflow-hidden shadow-md w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] lg:w-auto h-[30vh] lg:h-auto">
                        <h2 class="text-sm sm:text-base font-bold uppercase tracking-tight mb-3">
                            {{ currentStep.header }}
                        </h2>
                        <div ref="descScrollRef" class="overflow-y-auto h-full pr-1 lg:pb-0 pb-10">
                            <div class="space-y-4 text-sm sm:text-base leading-relaxed text-gray-700">
                                <p v-for="(para, idx) in currentStep.description" :key="idx" v-html="para"></p>
                            </div>
                            <div
                                class="absolute bottom-0 left-0 w-full h-2 overflow-hidden rounded-b-[calc(1rem-1px)] bg-gray-200">
                                <div class="h-full bg-rose-500" :style="{ width: progress + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right: Factors Animation -->
            <div class="relative" :style="{ height: `${steps.length * 115}vh` }">
                <div class="sticky top-0 w-full h-screen flex flex-col items-center justify-center">
                    <!-- Legend -->
                    <transition name="fade-fade">
                        <div v-if="currentStep.layout === 'split'"
                            class="mb-4 flex items-center gap-4 text-xs text-gray-600">
                            <div class="flex items-center gap-1">
                                <span
                                    class="w-3 h-3 rounded-full bg-blue-300 border border-blue-400 transition-all"></span>
                                Macro Factors
                            </div>
                            <div class="flex items-center gap-1">
                                <span
                                    class="w-3 h-3 rounded-full bg-green-300 border border-green-400 transition-all"></span>
                                Micro Factors
                            </div>
                        </div>
                    </transition>

                    <div ref="factorContainerRef" class="relative w-full max-w-xs mx-auto min-h-[675px]">
                        <transition name="fade-fade">
                            <div v-if="currentStep.layout === 'ranked'"
                                class="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-500 text-center uppercase">
                                Most Influential Factor
                            </div>
                        </transition>

                        <transition name="fade-fade">
                            <div v-if="currentStep.layout === 'ranked'"
                                class="absolute top-[calc(76px*9+4px)] left-1/2 -translate-x-1/2 text-xs text-gray-500 text-center uppercase">
                                Least Influential Factor
                            </div>
                        </transition>

                        <transition-group name="fade-move" tag="div">
                            <div v-for="factor in layoutFactors" :key="factor.label"
                                :ref="el => factorRefs.set(factor.label, el)"
                                class="absolute transition-all duration-700 ease-in-out p-4 rounded-xl border shadow-sm flex items-center justify-between gap-3 w-full"
                                :class="[
                                    currentStep.layout === 'ranked'
                                        ? currentStep.highlighted.includes(factor.label)
                                            ? 'bg-rose-100 border-rose-300 text-rose-700 font-semibold'
                                            : 'bg-white border-gray-200 text-gray-800'
                                        : factor.scale === 'macro'
                                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                                            : 'bg-green-100 border-green-300 text-green-800'
                                ]">
                                <div class="flex items-center gap-3">
                                    <div class="text-xl">{{ factor.icon }}</div>
                                    <div class="text-sm sm:text-base">{{ factor.label }}</div>
                                </div>
                            </div>
                        </transition-group>
                    </div>
                </div>

                <!-- Scroll Triggers -->
                <div class="absolute inset-0 pointer-events-none">
                    <div v-for="(_, i) in steps" :key="i" :data-stepindex-trigger="i" class="h-[99vh]" />
                </div>
                <div data-section-factors="after" class="h-[20vh]" />
            </div>
        </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount, watchEffect } from 'vue';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger, Flip);

const currentStepIndex = ref(0);
const descScrollRef = ref(null);
const showBox = ref(true);
const factorRefs = new Map();
const progress = ref(0);
const triggers = ref([]);
const isBefore = ref(true);
const isAfter = ref(false);

const allFactors = [
    { label: 'Government Policy', icon: '📜', tier: 1, scale: 'macro', rank: 1 },
    { label: 'Planning Area', icon: '🗺️', tier: 1, scale: 'macro', rank: 2 },
    { label: 'Electoral Boundaries', icon: '🗳️', tier: 3, scale: 'macro', rank: 9 },
    { label: 'Demographics (Age)', icon: '📊', tier: 3, scale: 'macro', rank: 8 },
    { label: 'Flat Type & Size', icon: '📐', tier: 1, scale: 'micro', rank: 3 },
    { label: 'Storey Level', icon: '🏢', tier: 1, scale: 'micro', rank: 4 },
    { label: 'Proximity to MRT', icon: '🚇', tier: 2, scale: 'micro', rank: 5 },
    { label: 'Proximity to Schools', icon: '🏫', tier: 2, scale: 'micro', rank: 7 },
    { label: 'Years Remaining on Lease', icon: '📄', tier: 2, scale: 'micro', rank: 6 },
];

const steps = [
    {
        header: 'Macro vs. Micro Factors',
        description: [
            '<span class="font-semibold">All resale pricing factors fall broadly into two categories.</span>',
            '<span class="font-semibold">Macro factors</span> shape systemic housing dynamics at the national or regional level, like policy, location, and demographics. They affect prices across large areas and are often slow-moving but powerful.',
            '<span class="font-semibold">Micro factors</span>, on the other hand, reflect specific flat-level features that buyers compare directly like size, floor level, or MRT proximity. These tend to create price differences within the same estate or block.'
        ],
        highlighted: [],
        layout: 'split'
    },
    {
        header: 'Most to Least Influential',
        description: [
            '<span class="font-semibold">We ranked the factors by how strongly they influence resale prices, from foundational drivers to minor considerations.</span>',
            'While <span class="font-semibold">macro factors</span> often define price boundaries at a systemic level, <span class="font-semibold">micro traits</span> explain variations within neighborhoods or even floors.',
            'This tiered view helps clarify which signals matter most to buyers and policymakers, and which ones simply fine-tune value.'
        ],
        highlighted: [],
        layout: 'ranked'
    },
    {
        header: '🥇 Top Tier — Structural Price Drivers',
        description: [
            '<span class="font-semibold">These factors define the foundation of housing value.</span> They represent core systemic conditions that apply across the entire market, regardless of buyer type or timing.',
            'Their influence is <span class="font-semibold">broad, deep, and long-lasting</span> — shaping everything from eligibility to desirability. When these change, the whole market shifts.',
            'For instance, <span class="font-semibold">Government Policy</span> rewrites affordability rules, while <span class="font-semibold">Planning Area</span> embeds geographic value. Flat <span class="font-semibold">Type & Size</span> and <span class="font-semibold">Storey Level</span> directly reflect buyer priorities and property fundamentals.'
        ],
        highlighted: ['Government Policy', 'Planning Area', 'Flat Type & Size', 'Storey Level'],
        layout: 'ranked'

    },

    {
        header: '🥈 Middle Tier — Conditional Influence',
        description: [
            '<span class="font-semibold">These factors enhance or constrain value, but their impact depends on context.</span>',
            'They influence pricing significantly, <span class="font-semibold">but not always equally</span>. The effects can vary based on location, buyer profile, or specific traits of the flat.',
            'For example, <span class="font-semibold">MRT proximity</span> boosts value, but above-ground lines near flats may reduce appeal due to noise.',
            '<span class="font-semibold"> Lease remaining</span> affects resale prices significantly <span class="font-semibold">below the 60-year mark</span>, where financing restrictions kick in which reduces demand. Yet flats with <span class="font-semibold">65–90 years remaining</span> can still retain strong value if they’re in good locations with appealing layouts or amenities.', 'Lastly, <span class="font-semibold">School proximity</span> adds premium, but mostly for families with school-age children.'
        ],
        highlighted: ['Proximity to MRT', 'Years Remaining on Lease', 'Proximity to Schools'],
        layout: 'ranked'


    },

    {
        header: '🥉 Lower Tier — Indirect or Long-Term Effects',
        description: [
            '<span class="font-semibold">These factors influence buyer sentiment or planning, but have weak or fading impact on prices today.</span>',
            'They are <span class="font-semibold">rarely deal-makers or deal-breakers</span>. Instead, they shape housing policy or demand slowly over time.',
            '<span class="font-semibold">Demographics</span> shift preferences subtly, like increasing demand for smaller units. <span class="font-semibold">Electoral Boundaries</span> once influenced resale prices but now show minimal effect due to parity in infrastructure and amenities.'
        ],
        highlighted: ['Demographics (Age)', 'Electoral Boundaries'],
        layout: 'ranked'

    }
];

const currentStep = computed(() => steps[currentStepIndex.value]);

const layoutFactors = computed(() => {
    return currentStep.value.layout === 'split'
        ? [...allFactors.filter(f => f.scale === 'macro'), ...allFactors.filter(f => f.scale === 'micro')]
        : [...allFactors].sort((a, b) => a.rank - b.rank);
});

const updatePositions = async () => {
    await nextTick();
    const elements = Array.from(factorRefs.values()).filter(Boolean);
    const state = Flip.getState(elements);
    layoutFactors.value.forEach((factor, i) => {
        const el = factorRefs.get(factor.label);
        if (el) {
            el.style.position = 'absolute';
            el.style.top = `${i * 76}px`;
            el.style.left = '0';
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
        triggers.value.push(
            ScrollTrigger.create({
                trigger: beforeEl,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => (isBefore.value = false),
                onEnterBack: () => (isBefore.value = true),
            })
        );
    }

    if (afterEl) {
        triggers.value.push(
            ScrollTrigger.create({
                trigger: afterEl,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => (isAfter.value = true),
                onEnterBack: () => (isAfter.value = false),
            })
        );
    }

    ScrollTrigger.refresh();
});

watch(() => currentStepIndex.value, () => {
    if (descScrollRef.value) descScrollRef.value.scrollTop = 0;
});

watchEffect(() => {
    showBox.value = currentStepIndex.value >= 0 && currentStepIndex.value < steps.length;
});

onBeforeUnmount(() => {
    triggers.value.forEach(t => t?.kill());
    triggers.value = [];
});
</script>

<style scoped>
.fade-move-enter-active,
.fade-move-leave-active,
.fade-fade-enter-active,
.fade-fade-leave-active {
    transition: all 0.4s ease;
}

.fade-move-enter-from,
.fade-move-leave-to,
.fade-fade-enter-from,
.fade-fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
}
</style>