<script setup>
import Title from "../components/Title.vue";
import Dashboard from "@/components/Dashboard.vue";
import Section1 from "../components/Section1.vue";
import Section2 from "../components/Section2.vue";
import FactorsOverview from "../components/FactorsOverview.vue";
import Conclusion from "../components/Conclusion.vue";
import Section3 from "../components/Section3.vue";
import OverallConclusion from "../components/OverallConclusion.vue";
</script>

<template>
    <main>
        <Title />
        <Section1 />
        <Section2 />
        <FactorsOverview />
        <Section3 />
        <Conclusion />
        <OverallConclusion />
        <Dashboard />
    </main>
</template>
