

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number,
  panX: number,
  panY: number,
  gridSize = 20,
  lightColor = '#ccc',
  boldColor = '#999'
) {
  ctx.save()
  ctx.translate(panX, panY)
  ctx.scale(scale, scale)

  const logicalWidth = width / scale
  const logicalHeight = height / scale

  let step = gridSize
  const minPixelSpacing = 20
  while (step * scale < minPixelSpacing) {
    step *= 2
  }

  const startX = Math.floor(-panX / scale / step) * step
  const startY = Math.floor(-panY / scale / step) * step
  const endX = startX + logicalWidth + step
  const endY = startY + logicalHeight + step

  for (let x = startX; x < endX; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, endY)
    ctx.strokeStyle = (x / step) % 5 === 0 ? boldColor : lightColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let y = startY; y < endY; y += step) {
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(endX, y)
    ctx.strokeStyle = (y / step) % 5 === 0 ? boldColor : lightColor
    ctx.lineWidth = 1
    ctx.stroke()
  }

  ctx.restore()
}
