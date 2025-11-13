import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

// ---- ENV (landing-specific node id so it won't clash with dashboard) ----
const FILE_KEY = process.env.FIGMA_FILE_KEY
const NODE_ID  = process.env.FIGMA_LANDING_NODE_ID   // e.g. 12:34
const TOKEN    = process.env.FIGMA_TOKEN

if (!FILE_KEY || !NODE_ID || !TOKEN) {
  console.error('Missing FIGMA_FILE_KEY, FIGMA_LANDING_NODE_ID, or FIGMA_TOKEN')
  process.exit(1)
}

// ---- helpers ----
const toPascal = (s='Section') =>
  s.replace(/[^\w]+/g, ' ')
   .trim()
   .split(/\s+/)
   .map(w => (w ? w[0].toUpperCase() + w.slice(1) : ''))
   .join('')

const toKebab = (s='section') =>
  s.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')

async function getJson(url) {
  const res = await fetch(url, { headers: { 'X-Figma-Token': TOKEN } })
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`)
  return res.json()
}

async function getImageUrl(fileKey, nodeId, format='svg') {
  const url = `https://api.figma.com/v1/images/${fileKey}?ids=${encodeURIComponent(nodeId)}&format=${format}&svg_include_id=true`
  const data = await getJson(url)
  return data.images?.[nodeId] || null
}

async function download(url, outPath) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.mkdir(path.dirname(outPath), { recursive: true })
  await fs.writeFile(outPath, buf)
  return outPath
}

// ---- fetch node ----
const nodes = await getJson(
  `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${encodeURIComponent(NODE_ID)}`
)
const node = nodes?.nodes?.[NODE_ID]?.document
if (!node) throw new Error('Node not found; check FIGMA_LANDING_NODE_ID')

// ---- export frame image (as a tracing reference) ----
const imgUrl = await getImageUrl(FILE_KEY, NODE_ID, 'svg')
let savedImg = null
if (imgUrl) {
  const fname = `frame-${crypto.createHash('md5').update(NODE_ID).digest('hex')}.svg`
  savedImg = await download(imgUrl, path.resolve('src/assets/landing', fname))
  console.log('Saved frame image:', savedImg)
}

// ---- scaffold Vue component (landing-specific) ----
const frameName   = node.name || 'Landing Section'
const CompName    = toPascal(frameName)                 // e.g. "LandingHero"
const fileName    = `${toKebab(frameName)}.vue`         // e.g. "landing-hero.vue"
const sectionClass= `landing-${toKebab(frameName)}`     // e.g. ".landing-landing-hero"

const outDir  = path.resolve('src/components/landing')
await fs.mkdir(outDir, { recursive: true })
const vuePath = path.join(outDir, fileName)

const vue = `\
<template>
  <section class="${sectionClass}">
    <!-- Replace this reference image with real semantic markup -->
    ${savedImg ? `<img src="@/assets/landing/${path.basename(savedImg)}" alt="${(frameName).replace(/"/g,'&quot;')}" />` : '<!-- no exportable image -->'}
  </section>
</template>

<script setup lang="ts">
// Component: ${CompName}
</script>

<style scoped>
.${sectionClass} {
  display: flex;
  flex-direction: column;
}
</style>
`
try {
  await fs.access(vuePath)
  console.log('Exists, skipping:', path.relative(process.cwd(), vuePath))
} catch {
  await fs.writeFile(vuePath, vue, 'utf8')
  console.log('Wrote component:', path.relative(process.cwd(), vuePath))
}

// ---- save raw node JSON for inspection (landing-specific) ----
const metaOut = path.resolve('figma-landing-node.json')
await fs.writeFile(metaOut, JSON.stringify(nodes, null, 2), 'utf8')
console.log('Wrote raw node JSON:', path.relative(process.cwd(), metaOut))

console.log('\nNext:')
console.log('- Open figma-landing-node.json to inspect child frames/text/shapes.')
console.log('- Use Figma Dev Mode → Inspect for exact spacing/typography/radii.')
console.log('- Replace the <img> with real HTML/Tailwind while mapping children.')