<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { drawLineChart, type ChartPoint } from '../../utils/chart'

const props = defineProps<{ points: ChartPoint[]; color: string }>()

const canvas = ref<HTMLCanvasElement>()

function draw() {
  if (canvas.value) drawLineChart(canvas.value, props.points, props.color)
}

onMounted(draw)
watch(() => props.points, draw)
</script>

<template>
  <div class="trend-chart">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<style scoped>
.trend-chart {
  width: 100%;
  height: 200px;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
