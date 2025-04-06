<template>
    <div class="chart-container w-full max-w-[1500px] min-h-[600px] flex flex-col items-center justify-center px-4">
        <!-- <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
            Price Per Square Meter by Distance to MRT Stations
        </h3> -->
        <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
            {{ title }}
        </h3>
        <div id="scatter-chart" ref="chartWrapper" class="w-full relative">
            <canvas ref="canvas" class="absolute top-0 left-0 w-full h-full"></canvas>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import {
    ref,
    watch,
    onMounted,
    defineComponent,
    computed
} from "vue";
import { useDataStore } from "@/stores/dataStore";

export default defineComponent({
    name: "ScatterPlotMrtDist",
    props: {
        mode: {
            type: String,
            default: 'all',
        },
    },
    setup(props, { expose }) {
        const canvas = ref(null);
        const chartWrapper = ref(null);
        const width = ref(800);
        const height = ref(500);
        const margin = { top: 50, right: 120, bottom: 90, left: 70 };
        const store = useDataStore();
        const filteredData = ref([]);
        const currentMode = ref(props.mode);
        const transitionProgress = ref(1);
        const title = computed(() => {
            if (props.mode === 'underground') {
                return "Price Per Square Meter by Distance to MRT Stations (Underground)";
            } else if (props.mode === 'above') {
                return "Price Per Square Meter by Distance to MRT Stations (Above Ground)";
            }
            return "Price Per Square Meter by Distance to MRT Stations";
        });

        let animationFrameId = null;
        let previousTrend = [];
        let currentTrend = [];

        // const setDimensions = () => {
        //     if (chartWrapper.value) {
        //         const rect = chartWrapper.value.getBoundingClientRect();
        //         width.value = rect.width - margin.left - margin.right;
        //         height.value = rect.height - margin.top - margin.bottom;
        //     }
        // };

        const setDimensions = () => {
            if (chartWrapper.value) {
                const rect = chartWrapper.value.getBoundingClientRect();
                width.value = rect.width > 0 ? rect.width - margin.left - margin.right : 800;
                height.value = rect.height > 0 ? rect.height - margin.top - margin.bottom : 500;
            }
        };


        const animateTransition = () => {
            const startTime = performance.now();

            const animate = (now) => {
                const elapsed = now - startTime;
                const duration = 600;
                transitionProgress.value = Math.min(1, elapsed / duration);
                drawScatterPlot(filteredData.value);

                if (transitionProgress.value < 1) {
                    animationFrameId = requestAnimationFrame(animate);
                } else {
                    currentMode.value = props.mode;
                }
            };

            cancelAnimationFrame(animationFrameId);
            animationFrameId = requestAnimationFrame(animate);
        };

        watch(() => props.mode, (newMode, oldMode) => {

            if (newMode !== oldMode) {
                currentMode.value = oldMode;
                transitionProgress.value = 0;
                previousTrend = [];
                currentTrend = [];
                animateTransition();
            }
        });

        const drawAxes = (ctx, xScale, yScale) => {
            ctx.save();
            ctx.strokeStyle = "#666";
            ctx.fillStyle = "#444";
            ctx.lineWidth = 1;
            ctx.font = "10px sans-serif";

            const xTicks = xScale.ticks(10);
            const yTicks = yScale.ticks(6);

            xTicks.forEach((tick) => {
                const x = xScale(tick);
                ctx.beginPath();
                ctx.moveTo(x, height.value + margin.top);
                ctx.lineTo(x, height.value + margin.top + 6);
                ctx.stroke();
                ctx.fillText(tick.toFixed(0), x - 10, height.value + margin.top + 16);
            });

            yTicks.forEach((tick) => {
                const y = yScale(tick);
                ctx.beginPath();
                ctx.moveTo(margin.left - 6, y);
                ctx.lineTo(margin.left, y);
                ctx.stroke();
                ctx.textAlign = "right";
                ctx.fillText(tick.toFixed(0), margin.left - 8, y + 3);
            });

            ctx.beginPath();
            ctx.moveTo(margin.left, margin.top);
            ctx.lineTo(margin.left, height.value + margin.top);
            ctx.lineTo(width.value + margin.left, height.value + margin.top);
            ctx.stroke();

            ctx.save();
            ctx.fillStyle = "#4b5563";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(
                "Distance to MRT (meters)",
                margin.left + width.value / 2,
                height.value + margin.top + 40
            );
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "#4b5563";
            ctx.font = "bold 12px sans-serif";
            ctx.translate(margin.left - 60, margin.top + height.value / 2);
            ctx.rotate(-Math.PI / 2);
            ctx.textAlign = "center";
            ctx.fillText("Price Per Square Meter (SGD)", 0, 0);
            ctx.restore();
        };

        const drawScatterPlot = (rawData) => {
            if (!rawData.length) {
            }

            if (!canvas.value || !rawData.length) return;

            const ctx = canvas.value.getContext("2d");
            const dpr = window.devicePixelRatio || 1;
            const totalWidth = width.value + margin.left + margin.right;
            const totalHeight = height.value + margin.top + margin.bottom;

            canvas.value.width = totalWidth * dpr;
            canvas.value.height = totalHeight * dpr;
            console.log("Canvas pixel size:", canvas.value.width, canvas.value.height);
            canvas.value.style.width = `${totalWidth}px`;
            canvas.value.style.height = `${totalHeight}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, totalWidth, totalHeight);

            const x = d3.scaleLinear()
                .domain([0, d3.max(rawData, d => d.mrtDist)])
                .range([margin.left, width.value + margin.left])
                .nice();

            const y = d3.scaleLinear()
                .domain([0, d3.max(rawData, d => d.pricePerSqm)])
                .range([height.value + margin.top, margin.top])
                .nice();

            drawAxes(ctx, x, y);

            ctx.save();
            rawData.forEach((d) => {
                const dimAlpha = 0.02;       // 👈 adjust this to control dimness
                const highlightAlpha = 0.75;
                const baseAlpha = 0.6;
                const isPrev = d.mrtType.toLowerCase() === currentMode.value;
                const isNew = d.mrtType.toLowerCase() === props.mode;
                const prevAlpha = currentMode.value === 'all' ? baseAlpha : (isPrev ? highlightAlpha : dimAlpha);
                const newAlpha = props.mode === 'all' ? baseAlpha : (isNew ? highlightAlpha : dimAlpha);
                const blendedAlpha = prevAlpha * (1 - transitionProgress.value) + newAlpha * transitionProgress.value;

                ctx.beginPath();
                ctx.arc(x(d.mrtDist), y(d.pricePerSqm), 3, 0, 2 * Math.PI);
                ctx.fillStyle = "#1f77b4";
                ctx.globalAlpha = blendedAlpha;
                ctx.fill();
            });
            ctx.restore();


            const maxDist = d3.max(rawData, d => d.mrtDist);
            const binSize = 300;
            const thresholds = d3.range(0, maxDist + binSize, binSize);

            previousTrend = getTrendData(rawData, currentMode.value, thresholds);
            currentTrend = getTrendData(rawData, props.mode, thresholds);

            if (previousTrend.length && currentTrend.length) {
                const maxLen = Math.max(previousTrend.length, currentTrend.length);
                const blendedTrend = [];

                for (let i = 0; i < maxLen; i++) {
                    const prev = previousTrend[i] || previousTrend[previousTrend.length - 1];
                    const curr = currentTrend[i] || currentTrend[currentTrend.length - 1];

                    blendedTrend.push({
                        dist: prev.dist * (1 - transitionProgress.value) + curr.dist * transitionProgress.value,
                        price: prev.price * (1 - transitionProgress.value) + curr.price * transitionProgress.value
                    });
                }

                if (blendedTrend.length) {
                    ctx.beginPath();
                    ctx.moveTo(x(blendedTrend[0].dist), y(blendedTrend[0].price));
                    for (let i = 1; i < blendedTrend.length; i++) {
                        ctx.lineTo(x(blendedTrend[i].dist), y(blendedTrend[i].price));
                    }
                    ctx.strokeStyle = "crimson";
                    ctx.lineWidth = 2.7;
                    ctx.setLineDash([10, 3]);
                    ctx.stroke();
                    ctx.setLineDash([]);
                }
            }

        };


        const getTrendData = (data, mode, thresholds) => {
            const filtered = mode === 'all'
                ? data
                : data.filter(d => d.mrtType.toLowerCase() === mode);

            const binned = d3.bin()
                .value(d => d.mrtDist)
                .thresholds(thresholds)(filtered);

            return binned
                .filter(bin => bin.length > 0)
                .map(bin => {
                    const center = (bin.x0 + bin.x1) / 2;
                    const medianPrice = d3.median(bin, d => d.pricePerSqm);
                    return { dist: center, price: medianPrice };
                });
        };


        const resizeAndRedraw = () => {
            setDimensions();
            drawScatterPlot(filteredData.value);
        };
        expose({ resizeAndRedraw });

        watch(
            () => store.isDataLoaded,
            (ready) => {
                if (ready) {
                    const raw = store.sampledChartData;
                    filteredData.value = raw.filter(
                        (d) => d.mrtDist && d.pricePerSqm && d.yearsRemaining
                    ).map((d) => ({
                        mrtDist: parseFloat(d.mrtDist),
                        pricePerSqm: parseFloat(d.pricePerSqm),
                        yearsRemaining: parseFloat(d.yearsRemaining),
                        mrtType: d.mrtType,
                    })).filter(
                        (d) =>
                            !isNaN(d.mrtDist) &&
                            !isNaN(d.pricePerSqm) &&
                            !isNaN(d.yearsRemaining)
                    );
                    resizeAndRedraw();
                }
            },
            { immediate: true }
        );

        onMounted(() => {
            const observer = new ResizeObserver(() => {
                if (chartWrapper.value?.offsetParent !== null) {
                    resizeAndRedraw();
                }
            });

            if (chartWrapper.value) {
                observer.observe(chartWrapper.value);

                // Trigger first draw only when visible
                requestAnimationFrame(() => {
                    const rect = chartWrapper.value.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        resizeAndRedraw();
                    }
                });
            }

        });

        return {
            canvas,
            chartWrapper,
            title,
        };
    },
});
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: auto;
}

#scatter-chart {
    width: 100%;
    height: 500px;
    position: relative;
}

canvas {
    position: absolute;
    top: 0;
    left: 0;
    display: block;
}
</style>
