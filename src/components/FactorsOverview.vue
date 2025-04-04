<template>
  <section
      class="w-full min-h-screen px-4 sm:px-6 lg:px-12 py-16 flex items-center"
      style="background-color: #f2f2f2"
  >
      <div class="flex flex-col lg:flex-row gap-12 w-full max-w-7xl mx-auto items-center justify-center">
          <div class="w-full max-w-xl space-y-4 text-left">
              <h2
                  class="text-base sm:text-lg font-bold uppercase tracking-tight mb-2 text-rose-500"
              >
                  What Influences HDB Resale Prices?
              </h2>
              <p class="text-base sm:text-lg leading-relaxed text-gray-700">
                  We've seen how resale prices evolved over the years—shaped
                  by national trends, policy shifts, and macroeconomic events.
              </p>
              <p class="text-base sm:text-lg leading-relaxed text-gray-700">
                  But beyond time and policy, how do factors like location,
                  layout, and accessibility relate to a flat's value?
              </p>
              <p class="text-base sm:text-lg leading-relaxed text-gray-700">
                  Let's explore
                  <span class="font-semibold">seven potential influences</span>
                  on resale prices—some with strong correlations, others
                  surprising in their absence.
              </p>
          </div>

          <div class="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                  v-for="(factor, i) in factors"
                  :key="i"
                  class="flex items-center gap-4 p-4 sm:p-6 rounded-xl border border-gray-200 bg-gray-50 shadow-sm"
              >
                  <div
                      class="text-white font-bold w-7 h-7 flex items-center justify-center rounded-full text-sm shrink-0"
                      style="background-color: hsl(353 75% 53%)"
                  >
                      {{ i + 1 }}
                  </div>
                  <div class="text-sm sm:text-base font-medium text-gray-800 break-words">
                      {{ factor }}
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>

<script setup>
const factors = [
  "Storey Levels",
  "Flat Types & Sizes",
  "Price per sqm by Planning Area",
  "Amenities & Accessibility",
  "Electoral Boundaries",
  "Lease Remaining",
  "Demographics",
];
</script>