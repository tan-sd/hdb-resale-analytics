<template>
    <div
        class="chart-container relative flex flex-col items-center justify-center"
    >
        <h3 class="text-sm mb-1 text-center tracking-wide font-semibold">
            HDB Resale Prices by Flat Type and Floor Area
        </h3>
        <div
            id="scatter-canvas-wrapper"
            ref="chartWrapper"
            class="w-full h-full relative"
        >
            <canvas
                ref="canvas"
                class="absolute top-0 left-0 w-full h-full"
            ></canvas>
        </div>
    </div>
</template>

<script>
import * as d3 from "d3";
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from "vue";
import { useDataStore } from "@/stores/dataStore";

export default {
    name: "ScatterPlotFlatType",
    setup() {
        const canvas = ref(null);
        const chartWrapper = ref(null);
        const width = ref(800);
        const height = ref(500);
        const margin = { top: 20, right: 120, bottom: 60, left: 80 };

        const hueOrder = [
            "1 ROOM",
            "2 ROOM",
            "3 ROOM",
            "4 ROOM",
            "5 ROOM",
            "EXECUTIVE",
            "MULTI-GENERATION",
        ];
        const color = d3
            .scaleOrdinal()
            .domain(hueOrder)
            .range(d3.schemeTableau10);

        const dataStore = useDataStore();
        const latestData = ref([]);

        const setDimensions = () => {
            if (chartWrapper.value) {
                const rect = chartWrapper.value.getBoundingClientRect();
                width.value = rect.width - margin.left - margin.right;
                height.value = rect.height - margin.top - margin.bottom;
            }
        };

        const getSampledData = (data, sampleRate) => {
            const sampleSize = Math.floor(data.length * sampleRate);
            const sampled = [];
            for (let i = 0; i < sampleSize; i++) {
                const idx = Math.floor(Math.random() * data.length);
                sampled.push(data[idx]);
            }
            return sampled;
        };

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
                ctx.fillText(
                    tick.toFixed(0),
                    x - 10,
                    height.value + margin.top + 16
                );
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
                "Floor Area (sqm)",
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
            ctx.fillText("Resale Price", 0, 0);

            ctx.restore();
        };

        const drawScatterPlot = (rawData) => {
            requestIdleCallback(() => {
                const data = getSampledData(rawData, 0.02);
                const ctx = canvas.value.getContext("2d");
                const dpr = window.devicePixelRatio || 1;

                const totalWidth = width.value + margin.left + margin.right;
                const totalHeight = height.value + margin.top + margin.bottom;

                canvas.value.width = totalWidth * dpr;
                canvas.value.height = totalHeight * dpr;
                canvas.value.style.width = `${totalWidth}px`;
                canvas.value.style.height = `${totalHeight}px`;
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                ctx.clearRect(0, 0, totalWidth, totalHeight);

                const x = d3
                    .scaleLinear()
                    .domain(d3.extent(data, (d) => d.FloorArea))
                    .range([margin.left, width.value + margin.left])
                    .nice();

                const y = d3
                    .scaleLinear()
                    .domain([0, d3.max(data, (d) => d.ResalePrice)])
                    .range([height.value + margin.top, margin.top])
                    .nice();

                // Draw axes
                drawAxes(ctx, x, y);

                // Plot circles
                ctx.save();
                data.forEach((d) => {
                    ctx.beginPath();
                    ctx.arc(
                        x(d.FloorArea),
                        y(d.ResalePrice),
                        3,
                        0,
                        2 * Math.PI
                    );
                    ctx.fillStyle = color(d.FlatType);
                    ctx.globalAlpha = 0.6;
                    ctx.fill();
                });
                ctx.restore();

                // Regression line
                const [xMean, yMean] = [
                    d3.mean(data, (d) => d.FloorArea),
                    d3.mean(data, (d) => d.ResalePrice),
                ];
                const slope =
                    d3.sum(
                        data,
                        (d) => (d.FloorArea - xMean) * (d.ResalePrice - yMean)
                    ) / d3.sum(data, (d) => (d.FloorArea - xMean) ** 2);
                const intercept = yMean - slope * xMean;
                const xRange = d3.extent(data, (d) => d.FloorArea);
                const lineStart = [
                    x(xRange[0]),
                    y(slope * xRange[0] + intercept),
                ];
                const lineEnd = [
                    x(xRange[1]),
                    y(slope * xRange[1] + intercept),
                ];

                ctx.beginPath();
                ctx.moveTo(...lineStart);
                ctx.lineTo(...lineEnd);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Legend
                const flatTypes = hueOrder.filter((type) =>
                    data.some((d) => d.FlatType === type)
                );
                const rowHeight = 20;
                const legendPadding = 10;
                const legendWidth = 140;
                const legendHeight =
                    flatTypes.length * rowHeight + legendPadding;
                const legendX = width.value + margin.left - legendWidth - 20;
                const legendY = height.value + margin.top - legendHeight - 10;

                ctx.save();
                ctx.fillStyle = "white";
                ctx.globalAlpha = 0.95;
                ctx.strokeStyle = "#d1d5db";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(legendX, legendY, legendWidth, legendHeight, 6);
                ctx.fill();
                ctx.stroke();
                ctx.restore();

                flatTypes.forEach((type, i) => {
                    const centerY =
                        legendY + legendPadding + i * rowHeight + rowHeight / 2;
                    const circleX = legendX + 12;
                    const circleRadius = 5;

                    ctx.beginPath();
                    ctx.arc(circleX, centerY, circleRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = color(type);
                    ctx.fill();

                    ctx.fillStyle = "#4b5563";
                    ctx.font = "10px sans-serif";
                    ctx.textBaseline = "middle";
                    ctx.textAlign = "left";
                    ctx.fillText(type, circleX + circleRadius + 6, centerY);
                });
            });
        };

        const handleResize = () => {
            requestAnimationFrame(() => {
                setDimensions();
                if (latestData.value.length) drawScatterPlot(latestData.value);
            });
        };

        onMounted(async () => {
            await nextTick();
            setDimensions();
            window.addEventListener("resize", handleResize);

            watch(
                () => dataStore.isDataLoaded,
                async (ready) => {
                    if (ready) {
                        await nextTick();
                        if (!canvas.value) return;

                        const raw = dataStore.chartData;
                        const data = raw
                            .filter(
                                (d) =>
                                    d["Floor Area Sqm"] &&
                                    d["Resale Price"] &&
                                    d["Flat Type"]
                            )
                            .map((d) => ({
                                FloorArea: parseFloat(d["Floor Area Sqm"]),
                                ResalePrice: parseFloat(
                                    d["Resale Price Adj 2024"]
                                ),
                                FlatType: d["Flat Type"],
                            }))
                            .filter(
                                (d) =>
                                    !isNaN(d.FloorArea) && !isNaN(d.ResalePrice)
                            );

                        latestData.value = data;
                        drawScatterPlot(data);
                    }
                },
                { immediate: true }
            );
        });

        onBeforeUnmount(() => {
            window.removeEventListener("resize", handleResize);
        });

        return {
            canvas,
            chartWrapper,
            handleResize,
        };
    },
};
</script>

<style scoped>
.chart-container {
    width: 100%;
    height: 100%;
}

#scatter-canvas-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
