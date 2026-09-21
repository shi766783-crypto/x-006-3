export interface ChartPoint {
  label: string
  value: number
}

/** Draw a minimal line chart on a canvas using only the 2D API. */
export function drawLineChart(
  canvas: HTMLCanvasElement,
  points: ChartPoint[],
  color: string,
): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  const w = rect.width || 320
  const h = rect.height || 180
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, w, h)

  const padX = 28
  const padY = 16
  const plotW = w - padX * 2
  const plotH = h - padY * 2

  if (!points.length) {
    ctx.fillStyle = '#9ca3af'
    ctx.font = '13px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('暂无记录', w / 2, h / 2)
    return
  }

  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const getX = (i: number) =>
    points.length === 1 ? padX + plotW / 2 : padX + (i / (points.length - 1)) * plotW
  const getY = (v: number) => padY + plotH - ((v - min) / range) * plotH

  // Horizontal grid lines
  ctx.strokeStyle = '#e5e7eb'
  ctx.lineWidth = 1
  ctx.setLineDash([3, 3])
  for (let g = 0; g <= 3; g++) {
    const gy = padY + (g / 3) * plotH
    ctx.beginPath()
    ctx.moveTo(padX, gy)
    ctx.lineTo(padX + plotW, gy)
    ctx.stroke()
  }
  ctx.setLineDash([])

  // Line
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.lineJoin = 'round'
  ctx.beginPath()
  points.forEach((p, i) => {
    const px = getX(i)
    const py = getY(p.value)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  })
  ctx.stroke()

  // Dots
  points.forEach((p, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(getX(i), getY(p.value), 3, 0, Math.PI * 2)
    ctx.fill()
  })

  // First / last labels
  ctx.fillStyle = '#6b7280'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(points[0].label, getX(0), padY + plotH + 14)
  if (points.length > 1) {
    ctx.fillText(points[points.length - 1].label, getX(points.length - 1), padY + plotH + 14)
  }
}
