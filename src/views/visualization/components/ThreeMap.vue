<template>
  <div class="three-map-wrapper">
    <canvas ref="canvasRef" class="three-map-canvas"></canvas>
    <div ref="labelsRef" class="label-layer"></div>

    <div v-if="webglError" class="webgl-error">
      <div>{{ webglError }}</div>
      <small v-if="webglDebugInfo">{{ webglDebugInfo }}</small>
    </div>

    <button v-if="drilled" class="back-button" type="button" @click="goHome()">
      <span>←</span>
      {{ backButtonText }}
    </button>

    <div v-show="tooltip.show" class="map-tooltip" :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      <b>{{ tooltip.name }}</b>
      <div class="tooltip-line" v-for="item in tooltipLines" :key="item.label">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
      <div v-if="isFastMapMode" class="tooltip-note"
        style="margin-top: 6px; font-size: 11px; color: rgba(220, 235, 255, 0.65); text-align: left; padding: 0 4px;">
        （阳性检测项/检测项总量）
      </div>
    </div>

    <div class="map-legend">
      <div class="legend-title">{{ legendTitle }}</div>
      <div class="legend-list">
        <div v-for="item in legendItems" :key="item.label" class="legend-item">
          <i :style="{ background: item.color }"></i>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import * as THREE from 'three'
import { geoBounds, geoMercator } from 'd3-geo'
import earcut from 'earcut'
import chinaLiteSafeGeo from '@/assets/data/map/geo/china-lite-safe.json'
import terrainTextureUrl from '@/assets/imgs/echarts/province_fill_bright.png'
import {
  getCertificateMap,
  type CertificateMapItemVO,
  type DashboardCertificateMapRespVO
} from '@/api/agri/dashboard/certificate'
import { getFastMap, type FastMapDataRespVO } from '@/api/agri/dashboard/fast'
import { getDashboardMapData, type MapDataRespVO } from '@/api/agri/dashboard'
import { getTaskMap, type TaskMapDataRespVO } from '@/api/agri/dashboard/task'
import {
  getBigScreenConfig,
  getBigScreenQueryParams,
  getBigScreenUserDeptAreaParams,
  subscribeBigScreenRefresh,
  getCachedAreaLevel,
  isMunicipality
} from './bigscreen/config'
import { cachedBigScreenRequest } from './bigscreen/requestCache'

defineOptions({ name: 'VisualizationThreeMap' })

const props = withDefaults(
  defineProps<{
    mode?: 'default' | 'certificate' | 'fast' | 'task'
    certificateTab?: string
    taskLabel?: string
  }>(),
  {
    mode: 'default',
    certificateTab: '开具',
    taskLabel: '任务下发'
  }
)
const emit = defineEmits<{
  (e: 'renderer-error', message: string): void
}>()

type GeoFeature = {
  type: 'Feature'
  id?: string | number
  properties?: Record<string, any>
  geometry?: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: any
    encodeOffsets?: any
  }
}

type GeoJson = {
  type: 'FeatureCollection'
  features: GeoFeature[]
}

type RegionGroup = THREE.Group & {
  userData: {
    feature: GeoFeature
    value: number
    item?: MapDataItem
  }
}

type MapDataItem = CertificateMapItemVO | FastMapDataRespVO | TaskMapDataRespVO | MapDataRespVO

type LevelState = {
  geoId: string
}

type HomeScopeState = {
  level: LevelState
  drillLevel: 0 | 1 | 2
  regionParams: { provinceName?: string; cityName?: string }
  label: string
}

type LabelItem = {
  el: HTMLDivElement
  position: THREE.Vector3
}

const REMOTE_GEO_BASE_URL = import.meta.env.DEV
  ? '/__geo_proxy/assets/data/map/geo'
  : '/assets/data/map/geo'
const HOME_LEVEL: LevelState = {
  geoId: ''
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const labelsRef = ref<HTMLDivElement | null>(null)
const loading = ref(true)
const webglError = ref('')
const webglDebugInfo = ref('')
const drilled = ref(false)
const homeScopeLabel = ref('全国')
const tooltip = reactive({
  show: false,
  x: 0,
  y: 0,
  name: '',
  value: 0,
  lines: [] as Array<{ label: string; value: string | number }>
})

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.OrthographicCamera | null = null
let mapGroup: THREE.Group | null = null
let glowGroup: THREE.Group | null = null
let lineGroup: THREE.Group | null = null
let raycaster: THREE.Raycaster | null = null
let resizeObserver: ResizeObserver | null = null
let frameId = 0
let currentGeo: GeoJson | null = null
let hovered: RegionGroup | null = null
let currentLevel: LevelState = HOME_LEVEL
let currentDrillLevel: 0 | 1 | 2 = 0
let currentRegionParams: { provinceName?: string; cityName?: string } = {}
let homeScope: HomeScopeState = {
  level: HOME_LEVEL,
  drillLevel: 0,
  regionParams: {},
  label: '全国'
}
let dataRequestSeq = 0
let renderSeq = 0
let disposed = false
let webglContextLost = false
let labelItems: LabelItem[] = []
let pickableMeshes: THREE.Object3D[] = []

const geoCache = new Map<string, GeoJson>()
const pointer = new THREE.Vector2()
const clock = new THREE.Clock()
const textureLoader = new THREE.TextureLoader()
let terrainTexture: THREE.Texture | null = null

const getRendererSize = () => {
  const canvas = canvasRef.value
  const container = canvas?.parentElement
  return {
    width: container?.clientWidth || canvas?.clientWidth || window.innerWidth,
    height: container?.clientHeight || canvas?.clientHeight || window.innerHeight
  }
}

const isCertificateMode = computed(() => props.mode === 'certificate')
const isFastMapMode = computed(() => props.mode === 'fast')
const isTaskMapMode = computed(() => props.mode === 'task')
const isDashboardMode = computed(() => props.mode === 'default')

const tooltipLabel = computed(() => {
  if (isCertificateMode.value) return props.certificateTab === '存证' ? '存证数量' : '开具数量'
  if (isFastMapMode.value) return '检测样本量'
  if (isTaskMapMode.value) return props.taskLabel
  return '样品量'
})

const tooltipLines = computed(() =>
  tooltip.lines.length ? tooltip.lines : [{ label: tooltipLabel.value, value: tooltip.value }]
)

const backButtonText = computed(() => `返回${homeScopeLabel.value || '全国'}`)

const legendTitle = computed(() => {
  if (isCertificateMode.value) return props.certificateTab === '存证' ? '存证分布' : '开具分布'
  if (isFastMapMode.value) return '检测样本分布'
  if (isTaskMapMode.value) return `${props.taskLabel}分布`
  return '任务完成量（项次）'
})

const legendItems = [
  { label: '300~499', color: '#60D1FA' },
  { label: '200~299', color: '#4DA8E1' },
  { label: '100~199', color: '#3C84C7' },
  { label: '50~99', color: '#2F66AE' },
  { label: '30~49', color: '#254C94' },
  { label: '10~29', color: '#1D367C' },
  { label: '1~9', color: '#172662' },
  { label: '0', color: '#11184A' }
]

const getTerrainTexture = () => {
  if (terrainTexture) return terrainTexture
  terrainTexture = textureLoader.load(terrainTextureUrl)
  terrainTexture.wrapS = THREE.RepeatWrapping
  terrainTexture.wrapT = THREE.RepeatWrapping
  terrainTexture.repeat.set(2.2, 1.7)
  terrainTexture.offset.set(0.08, 0.12)
  terrainTexture.colorSpace = THREE.SRGBColorSpace
  return terrainTexture
}

// 程序化生成不规则发光纹理：多层偏移渐变 + 噪点扰动，模拟自然光晕
let radialGlowTexture: THREE.Texture | null = null
const getRadialGlowTexture = () => {
  if (radialGlowTexture) return radialGlowTexture
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 简易伪随机数生成器（固定种子，保证每次一致）
  let seed = 42
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }

  // 黑色底
  ctx.fillStyle = 'rgba(0, 0, 0, 1)'
  ctx.fillRect(0, 0, size, size)

  // 叠加多层偏移径向渐变，产生不规则的光斑分布
  ctx.globalCompositeOperation = 'lighter'
  const layers = [
    // 主光源：略微偏离中心
    { cx: 0.48, cy: 0.52, r: 0.42, alpha: 0.7 },
    { cx: 0.55, cy: 0.45, r: 0.35, alpha: 0.5 },
    // 次级光源：分散在不同位置
    { cx: 0.35, cy: 0.38, r: 0.28, alpha: 0.35 },
    { cx: 0.62, cy: 0.6, r: 0.25, alpha: 0.3 },
    { cx: 0.4, cy: 0.65, r: 0.22, alpha: 0.25 },
    // 小型随机光点
    { cx: 0.3, cy: 0.55, r: 0.15, alpha: 0.2 },
    { cx: 0.65, cy: 0.35, r: 0.18, alpha: 0.22 },
    { cx: 0.5, cy: 0.3, r: 0.2, alpha: 0.18 },
  ]

  layers.forEach(({ cx, cy, r, alpha }) => {
    const x = cx * size
    const y = cy * size
    const radius = r * size
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    const a1 = Math.round(alpha * 255)
    const a2 = Math.round(alpha * 0.5 * 255)
    gradient.addColorStop(0, `rgba(220, 245, 255, ${alpha})`)
    gradient.addColorStop(0.3, `rgba(150, 220, 255, ${alpha * 0.6})`)
    gradient.addColorStop(0.65, `rgba(60, 160, 230, ${alpha * 0.2})`)
    gradient.addColorStop(1, 'rgba(0, 80, 180, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  })

  // 叠加噪点扰动：使像素级的亮度不均匀，增加有机质感
  const imageData = ctx.getImageData(0, 0, size, size)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 30
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)

  // 高斯模糊柔化噪点边缘（用多次半透明重绘模拟）
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 0.4
  for (let pass = 0; pass < 3; pass++) {
    ctx.drawImage(canvas, -1, -1, size + 2, size + 2)
  }
  ctx.globalAlpha = 1

  radialGlowTexture = new THREE.CanvasTexture(canvas)
  radialGlowTexture.needsUpdate = true
  return radialGlowTexture
}

const decodeFeature = (feature: GeoFeature) => {
  const geometry = feature.geometry
  if (!geometry || !geometry.encodeOffsets) return feature

  const scale = 1024
  const { type, coordinates, encodeOffsets } = geometry

  const decodePart = (coordinate: string, encodeOffset: number[]) => {
    const result: number[][] = []
    let prevX = encodeOffset[0]
    let prevY = encodeOffset[1]
    for (let i = 0; i < coordinate.length; i += 2) {
      let x = coordinate.charCodeAt(i) - 64
      let y = coordinate.charCodeAt(i + 1) - 64
      x = x & 1 ? ~(x >> 1) : x >> 1
      y = y & 1 ? ~(y >> 1) : y >> 1
      x += prevX
      y += prevY
      prevX = x
      prevY = y
      result.push([x / scale, y / scale])
    }
    return result
  }

  if (type === 'Polygon') {
    geometry.coordinates = coordinates.map((c: string, i: number) => decodePart(c, encodeOffsets[i]))
  } else if (type === 'MultiPolygon') {
    geometry.coordinates = coordinates.map((polygons: string[], i: number) =>
      polygons.map((c: string, j: number) => decodePart(c, encodeOffsets[i][j]))
    )
  }
  delete geometry.encodeOffsets
  return feature
}

const cloneAndDecodeGeo = (geo: GeoJson) => {
  const nextGeo = structuredClone(geo) as GeoJson
  nextGeo.features?.forEach(decodeFeature)
  return nextGeo
}

const loadHomeGeo = () => cloneAndDecodeGeo(chinaLiteSafeGeo as GeoJson)

const getProvinceFeatureCode = (areaCode?: string | number) => {
  const value = String(areaCode || '').trim()
  return /^\d{2}/.test(value) ? `${value.slice(0, 2)}0000` : ''
}

const findChinaFeatureByCode = (provinceCode?: string) => {
  const code = String(provinceCode || '').trim()
  if (!code) return undefined
  return loadHomeGeo().features?.find((feature) => {
    const featureCode = String(
      feature?.id || feature?.properties?.adcode || feature?.properties?.code || ''
    ).trim()
    return featureCode === code
  })
}

const resolveInitialHomeScope = (): HomeScopeState => {
  const config = getBigScreenConfig()
  const userDeptAreaParams = getBigScreenUserDeptAreaParams()
  const provinceCode = getProvinceFeatureCode(userDeptAreaParams.areaCode || config.areaCode)
  const feature = findChinaFeatureByCode(provinceCode)
  if (!feature) {
    return {
      level: HOME_LEVEL,
      drillLevel: 0,
      regionParams: {},
      label: '全国'
    }
  }

  const featureProps = feature.properties || {}
  const geoId = String(feature.id || featureProps.geoId || featureProps.adcode || provinceCode).trim()
  const provinceName = String(featureProps.name || config.provinceName || '').trim()
  if (!geoId || !provinceName) {
    return {
      level: HOME_LEVEL,
      drillLevel: 0,
      regionParams: {},
      label: '全国'
    }
  }

  return {
    level: { geoId },
    drillLevel: 1,
    regionParams: { provinceName },
    label: provinceName
  }
}

const getHomeScopeKey = (scope: HomeScopeState) =>
  [scope.level.geoId, scope.drillLevel, scope.regionParams.provinceName || '', scope.regionParams.cityName || ''].join('|')

const syncHomeScope = () => {
  const previousKey = getHomeScopeKey(homeScope)
  homeScope = resolveInitialHomeScope()
  homeScopeLabel.value = homeScope.label
  return previousKey !== getHomeScopeKey(homeScope)
}

const loadDetailGeo = async (geoId: string) => {
  const cacheKey = geoId
  if (geoCache.has(cacheKey)) return cloneAndDecodeGeo(geoCache.get(cacheKey) as GeoJson)
  const response = await fetch(`${REMOTE_GEO_BASE_URL}/${geoId}.json`)
  if (!response.ok) throw new Error(`Load detail geojson failed: ${response.status}`)
  const geo = (await response.json()) as GeoJson
  geoCache.set(cacheKey, geo)
  return cloneAndDecodeGeo(geo)
}

const normalizeRegionName = (name?: string | number | null) =>
  String(name || '')
    .trim()
    .replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g, '')

const formatRegionLabel = (name: string) => normalizeRegionName(name)

const getFeatureCandidates = (featureProps: any) => {
  const name = String(featureProps?.name || '').trim()
  const shortName = normalizeRegionName(name)
  return Array.from(new Set([name, shortName].filter(Boolean)))
}

const getAreaCandidates = (item: MapDataItem) =>
  [item.areaName, item.provinceName, item.cityName, item.districtName]
    .filter(Boolean)
    .map((name) => String(name).trim())

const createMapDataIndex = (list: MapDataItem[]) => {
  const index = new Map<string, MapDataItem>()
  list.forEach((item) => {
    getAreaCandidates(item).forEach((name) => {
      index.set(name, item)
      index.set(normalizeRegionName(name), item)
    })
  })
  return index
}

const getMatchedMapItem = (geoProps: any, dataIndex: Map<string, MapDataItem>) => {
  const candidates = getFeatureCandidates(geoProps)
  for (const name of candidates) {
    const matched = dataIndex.get(name) || dataIndex.get(normalizeRegionName(name))
    if (matched) return matched
  }
  return undefined
}

const getItemValue = (item?: MapDataItem) => {
  if (isFastMapMode.value) return Number((item as FastMapDataRespVO | undefined)?.sampleCount || 0)
  if (isDashboardMode.value) return Number((item as MapDataRespVO | undefined)?.sampleCount || 0)
  if (isTaskMapMode.value) {
    return Number((item as TaskMapDataRespVO | undefined)?.taskIssuedCount || 0)
  }
  return Number((item as CertificateMapItemVO | undefined)?.count || 0)
}

const formatRate = (value?: number) => `${Number(value || 0).toFixed(0)}%`

const createTooltipLines = (item?: MapDataItem, value = 0) => {
  if (isCertificateMode.value) {
    return [{ label: tooltipLabel.value, value }]
  }
  if (isFastMapMode.value) {
    const data = item as FastMapDataRespVO | undefined
    return [
      { label: '检测样品量', value: Number(data?.sampleCount || 0) },
      { label: '检测项总量', value: Number((data as any)?.detectionItemCount || (data as any)?.detectionCount || (data as any)?.totalCount || 0) },
      { label: '检测阳性率', value: formatRate(data?.positiveRate) }
    ]
  }
  if (isTaskMapMode.value) {
    const data = item as TaskMapDataRespVO | undefined
    return [
      { label: props.taskLabel, value: Number(data?.taskIssuedCount || 0) },
      { label: '任务完成', value: Number(data?.taskCompletedCount || 0) },
      { label: '任务完成率', value: formatRate(data?.taskCompletionRate) }
    ]
  }
  const data = item as MapDataRespVO | undefined
  return [
    { label: '样品量', value: `${Number(data?.sampleCount || 0)}（批次）` },
    { label: '检测项次', value: `${Number(data?.detectionItemCount || 0)}（项次）` },
    { label: '阳性率', value: formatRate(data?.positiveRate) }
  ]
}

const loadCurrentMapData = async () => {
  const requestId = ++dataRequestSeq
  const params = {
    ...getBigScreenQueryParams(),
    provinceName: currentRegionParams.provinceName,
    cityName: currentRegionParams.cityName,
    areaLevel: currentDrillLevel === 1 ? '1' : currentDrillLevel === 2 ? '2' : undefined
  }
  try {
    let data: unknown = []
    if (isCertificateMode.value) {
      const certData = await cachedBigScreenRequest('three-map-certificate', params, () =>
        getCertificateMap(params)
      )
      data =
        props.certificateTab === '存证'
          ? (certData as DashboardCertificateMapRespVO)?.verificationList || []
          : (certData as DashboardCertificateMapRespVO)?.issueList || []
    } else if (isFastMapMode.value) {
      data = await cachedBigScreenRequest('three-map-fast', params, () => getFastMap(params))
    } else if (isTaskMapMode.value) {
      data = await cachedBigScreenRequest('three-map-task', params, () => getTaskMap(params))
    } else {
      const rawParams = { ...params }
      let areaLevel = getCachedAreaLevel() || (currentDrillLevel === 2 ? '2' : '1')
      let cityName = rawParams.cityName
      if (isMunicipality(rawParams.provinceName)) {
        cityName = rawParams.provinceName
        areaLevel = '3'
      }

      data = await cachedBigScreenRequest('three-map-dashboard', rawParams, () =>
        getDashboardMapData({
          ...rawParams,
          cityName,
          areaLevel
        })
      )
    }
    if (disposed || requestId !== dataRequestSeq) return []
    return Array.isArray(data) ? (data as MapDataItem[]) : []
  } catch (error) {
    console.error('[ThreeMap] load map data failed:', error)
    return []
  }
}

const getPolygons = (feature: GeoFeature) => {
  const { type, coordinates } = feature.geometry || {}
  if (type === 'Polygon') return [coordinates]
  if (type === 'MultiPolygon') return coordinates
  return []
}

const createProjection = (geo: GeoJson) => {
  const bounds = geoBounds(geo as any)
  const center: [number, number] = [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2
  ]
  return geoMercator().center(center).scale(1).translate([0, 0])
}

const projectRing = (
  ring: number[][],
  projection: ReturnType<typeof geoMercator>,
  scale: number
) =>
  ring
    .map((coord) => projection(coord as [number, number]))
    .filter((point): point is [number, number] => !!point && Number.isFinite(point[0]) && Number.isFinite(point[1]))
    .map(([x, y]) => [x * scale, -y * scale] as [number, number])

const buildPolygonGeometry = (
  polygon: number[][][],
  projection: ReturnType<typeof geoMercator>,
  scale: number
) => {
  const vertices: number[] = []
  const holes: number[] = []
  const rings: Array<Array<[number, number]>> = []

  polygon.forEach((ring, ringIndex) => {
    const projected = projectRing(ring, projection, scale)
    if (projected.length < 3) return
    if (ringIndex > 0) holes.push(vertices.length / 2)
    projected.forEach(([x, y]) => {
      vertices.push(x, y)
    })
    rings.push(projected)
  })

  if (vertices.length < 6) return null
  const indices = earcut(vertices, holes, 2)
  const position: number[] = []
  const uv: number[] = []
  indices.forEach((index) => {
    const x = vertices[index * 2]
    const y = vertices[index * 2 + 1]
    position.push(x, y, 0)
    uv.push(x * 0.008 + 0.5, -y * 0.008 + 0.5)
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2))
  geometry.computeVertexNormals()
  return {
    geometry,
    rings,
    triangles: indices.length / 3
  }
}

const createRegionMaterial = (value: number) => {
  const intensity = Math.min(value / 800, 1)
  const color = new THREE.Color(0x146fbb).lerp(new THREE.Color(0x1ba0ee), 0.18 + intensity * 0.16)
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    side: THREE.DoubleSide
  })
}

const createTerrainOverlayMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: 0x72c6ff,
    map: getTerrainTexture(),
    transparent: true,
    opacity: 1,
    depthWrite: false,
    side: THREE.DoubleSide
  })

const createGlowMaterial = (opacity = 0.2, color = 0x37ffc2) =>
  new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })

// 区域内发光材质：使用不规则渐变纹理 + 叠加混合，产生柔和的内部光晕
const createInnerGlowMaterial = (intensity: number = 0.5) =>
  new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x30d5ff).lerp(new THREE.Color(0x80eeff), intensity * 0.5),
    map: getRadialGlowTexture(),
    transparent: true,
    opacity: 0.25 + intensity * 0.17,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })

// 为每个区域创建以其中心为原点的发光几何体（让径向渐变纹理正确居中映射）
const createCenteredGlowGeometry = (sourceGeometry: THREE.BufferGeometry) => {
  const geo = sourceGeometry.clone()
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
  // 计算该区域几何体的包围盒中心和尺寸
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i)
    const y = posAttr.getY(i)
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const span = Math.max(maxX - minX, maxY - minY) || 1
  // 以区域中心为原点重新计算 UV，映射到 [0,1] 范围
  const uvArray = new Float32Array(posAttr.count * 2)
  for (let i = 0; i < posAttr.count; i++) {
    uvArray[i * 2] = (posAttr.getX(i) - cx) / span + 0.5
    uvArray[i * 2 + 1] = (posAttr.getY(i) - cy) / span + 0.5
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2))
  return geo
}

const createDepthMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: 0x031a3d,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
    side: THREE.DoubleSide
  })

const createLineMaterial = (variant: 'inner' | 'rim' | 'halo' | 'haloSoft' | 'active' = 'inner') => {
  const config = {
    inner: { color: 0x1b8dbf, opacity: 0.5 },
    rim: { color: 0x47ffd0, opacity: 0.9 },
    halo: { color: 0x38ffc3, opacity: 0.42 },
    haloSoft: { color: 0x2ae8ff, opacity: 0.2 },
    active: { color: 0xfffbac, opacity: 1 }
  }[variant]
  return new THREE.LineBasicMaterial({
    color: config.color,
    transparent: true,
    opacity: config.opacity,
    blending: THREE.AdditiveBlending
  })
}

const setLineState = (line: THREE.Object3D, active: boolean) => {
  const material = (line as THREE.Line).material as THREE.LineBasicMaterial
  material.color.set(active ? 0xfffbac : 0x1b8dbf)
  material.opacity = active ? 1 : 0.5
}

const disposeObject = (object: THREE.Object3D) => {
  object.traverse((child: any) => {
    child.geometry?.dispose?.()
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose?.())
    else child.material?.dispose?.()
  })
}

const clearGroup = (group: THREE.Group | null) => {
  if (!group) return
  while (group.children.length) {
    const child = group.children.pop()
    if (child) disposeObject(child)
  }
}

const clearLabels = () => {
  labelItems = []
  if (labelsRef.value) labelsRef.value.innerHTML = ''
}

const addOutline = (
  rings: Array<Array<[number, number]>>,
  z: number,
  material: THREE.LineBasicMaterial,
  targetGroup: THREE.Group,
  scale = 1,
  pulse = false
) => {
  rings.forEach((ring) => {
    if (ring.length < 2) return
    const points = ring.map(([x, y]) => new THREE.Vector3(x * scale, y * scale, z))
    points.push(points[0].clone())
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const line = new THREE.Line(geometry, material)
    line.userData.pulse = pulse
    line.userData.baseOpacity = material.opacity
    targetGroup.add(line)
  })
}

const addLabel = (
  feature: GeoFeature,
  projection: ReturnType<typeof geoMercator>,
  scale: number
) => {
  const cp = feature.properties?.cp
  const name = feature.properties?.name
  if (!cp || !name || !labelsRef.value) return
  const point = projection(cp)
  if (!point) return
  const el = document.createElement('div')
  el.className = 'map-label'
  el.textContent = formatRegionLabel(name)
  labelsRef.value.appendChild(el)
  labelItems.push({
    el,
    position: new THREE.Vector3(point[0] * scale, -point[1] * scale, 4)
  })
}

const updateLabels = () => {
  if (!camera || !renderer) return
  const width = renderer.domElement.clientWidth || window.innerWidth
  const height = renderer.domElement.clientHeight || window.innerHeight
  labelItems.forEach((item) => {
    const projected = item.position.clone().project(camera as THREE.Camera)
    item.el.style.left = `${(projected.x * 0.5 + 0.5) * width}px`
    item.el.style.top = `${(-projected.y * 0.5 + 0.5) * height}px`
    item.el.style.display = projected.z > 1 ? 'none' : 'block'
  })
}

const fitCameraToGeo = (
  geo: GeoJson,
  projection: ReturnType<typeof geoMercator>,
  scale: number
) => {
  if (!camera || !canvasRef.value) return
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  geo.features.forEach((feature) => {
    getPolygons(feature).forEach((polygon) => {
      polygon.forEach((ring) => {
        projectRing(ring, projection, scale).forEach(([x, y]) => {
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
          minY = Math.min(minY, y)
          maxY = Math.max(maxY, y)
        })
      })
    })
  })

  const { width, height } = getRendererSize()
  const aspect = width / Math.max(height, 1)
  const geoWidth = Math.max(maxX - minX, 1)
  const geoHeight = Math.max(maxY - minY, 1)
  const padding = 1.08
  const viewHeight = Math.max(geoHeight * padding, (geoWidth * padding) / aspect)
  const viewWidth = viewHeight * aspect
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2

  camera.left = centerX - viewWidth / 2
  camera.right = centerX + viewWidth / 2
  camera.top = centerY + viewHeight / 2
  camera.bottom = centerY - viewHeight / 2
  camera.updateProjectionMatrix()
}

const renderGeo = async (geo: GeoJson, level: LevelState) => {
  if (!mapGroup || !glowGroup || !lineGroup) return
  const renderId = ++renderSeq
  clearGroup(mapGroup)
  clearGroup(glowGroup)
  clearGroup(lineGroup)
  clearLabels()
  pickableMeshes = []
  currentGeo = geo
  currentLevel = level
  drilled.value = currentDrillLevel > homeScope.drillLevel

  const dataList = await loadCurrentMapData()
  if (disposed || renderId !== renderSeq) return
  const dataIndex = createMapDataIndex(dataList)
  const projection = createProjection(geo)
  const scale = 120

  fitCameraToGeo(geo, projection, scale)

  geo.features.forEach((feature) => {
    const geoProps = feature.properties || {}
    const matched = getMatchedMapItem(geoProps, dataIndex)
    const value = getItemValue(matched)
    const region = new THREE.Group() as RegionGroup
    region.userData.feature = feature
    region.userData.value = value
    region.userData.item = matched
    const regionMaterial = createRegionMaterial(value)
    const lineMaterial = createLineMaterial('inner')

    getPolygons(feature).forEach((polygon) => {
      const built = buildPolygonGeometry(polygon, projection, scale)
      if (!built) return

      const mesh = new THREE.Mesh(built.geometry, regionMaterial)
      mesh.userData.surface = true
      mesh.userData.baseOpacity = 1
      mesh.userData.hoverOpacity = 1
      mesh.userData.region = region
      mesh.userData.feature = feature
      region.add(mesh)
      pickableMeshes.push(mesh)

      const terrainMesh = new THREE.Mesh(built.geometry.clone(), createTerrainOverlayMaterial())
      terrainMesh.position.z = 0.8
      terrainMesh.userData.baseOpacity = 1
      terrainMesh.userData.hoverOpacity = 1
      region.add(terrainMesh)

      // 区域内发光层：叠加在表面上方，径向渐变以区域中心为原点
      const innerGlowIntensity = Math.min(value / 600, 1)
      const glowGeo = createCenteredGlowGeometry(built.geometry)
      const innerGlowMesh = new THREE.Mesh(glowGeo, createInnerGlowMaterial(innerGlowIntensity))
      innerGlowMesh.position.z = 1.2
      innerGlowMesh.userData.innerGlow = true
      innerGlowMesh.userData.baseOpacity = 0.25 + innerGlowIntensity * 0.17
      innerGlowMesh.userData.hoverOpacity = 0.4 + innerGlowIntensity * 0.15
      region.add(innerGlowMesh)

      const depthMesh = new THREE.Mesh(built.geometry.clone(), createDepthMaterial())
      depthMesh.position.set(0, -2.8, -9)
      depthMesh.scale.set(1.018, 1.018, 1)
      glowGroup?.add(depthMesh)

      const glowMesh = new THREE.Mesh(built.geometry.clone(), createGlowMaterial(0.16, 0x39ffc0))
      glowMesh.position.z = -5
      glowMesh.scale.set(1.022, 1.022, 1)
      glowMesh.userData.pulse = true
      glowMesh.userData.baseOpacity = 0.16
      glowGroup?.add(glowMesh)

      const softGlowMesh = new THREE.Mesh(built.geometry.clone(), createGlowMaterial(0.08, 0x2feaff))
      softGlowMesh.position.z = -7
      softGlowMesh.scale.set(1.05, 1.05, 1)
      softGlowMesh.userData.pulse = true
      softGlowMesh.userData.baseOpacity = 0.08
      glowGroup?.add(softGlowMesh)

      addOutline(built.rings, 6, lineMaterial, region)
      addOutline(built.rings, 2, createLineMaterial('rim'), lineGroup as THREE.Group, 1.006)
      addOutline(built.rings, -3, createLineMaterial('halo'), glowGroup as THREE.Group, 1.018, true)
      addOutline(built.rings, -6, createLineMaterial('haloSoft'), glowGroup as THREE.Group, 1.034, true)
    })

    mapGroup?.add(region)
    addLabel(feature, projection, scale)
  })

  tooltip.show = false
}

const initThree = () => {
  const canvas = canvasRef.value
  if (!canvas) return false
  webglContextLost = false
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    const { width, height } = getRendererSize()
    renderer.setSize(width, height, false)

    scene = new THREE.Scene()
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000)
    camera.position.set(0, 0, 180)
    camera.lookAt(0, 0, 0)
    raycaster = new THREE.Raycaster()
    mapGroup = new THREE.Group()
    glowGroup = new THREE.Group()
    lineGroup = new THREE.Group()
    scene.add(glowGroup, mapGroup, lineGroup)
    return true
  } catch (error) {
    const canvasCount = document.querySelectorAll('canvas').length
    const maptalksCount = document.querySelectorAll('.maptalks-wrapper, .maptalks-canvas-layer').length
    const message = error instanceof Error ? error.message : 'WebGL 初始化失败'
    webglError.value = `当前浏览器无法创建 WebGL 上下文，请关闭其它大屏/地图标签后刷新`
    webglDebugInfo.value = `${message}；canvas=${canvasCount}；maptalks=${maptalksCount}`
    console.error('[ThreeMap] WebGL init failed:', {
      error,
      canvasCount,
      maptalksCount
    })
    emit('renderer-error', webglError.value)
    return false
  }
}

const handleContextLost = (event: Event) => {
  event.preventDefault()
  webglContextLost = true
  webglError.value = 'WebGL 上下文已丢失，请关闭其它大屏/地图标签后刷新'
}

const handleContextRestored = () => {
  if (!webglContextLost) return
  webglError.value = ''
  webglDebugInfo.value = ''
  void goHome(true)
}

const getIntersectedRegion = (event: MouseEvent) => {
  if (!canvasRef.value || !raycaster || !camera || !mapGroup) return null
  const rect = canvasRef.value.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  raycaster.setFromCamera(pointer, camera)
  const hits = raycaster.intersectObjects(pickableMeshes, false)
  return (hits[0]?.object?.userData?.region as RegionGroup | undefined) || null
}

const canDrillFurther = () =>
  (!isCertificateMode.value && !isTaskMapMode.value) || currentDrillLevel < 2

const setHovered = (region: RegionGroup | null) => {
  if (hovered === region) return
  // 标记离开旧区域
  if (hovered) {
    hovered.userData.hoverTarget = 0
  }
  hovered = region
  if (!hovered) {
    tooltip.show = false
    // 所有区域恢复正常
    mapGroup?.children.forEach((r: any) => {
      r.userData.hoverTarget = 0
      r.userData.dimTarget = 0
    })
    return
  }
  // 标记进入新区域，其余区域标记为暗化
  hovered.userData.hoverTarget = 1
  mapGroup?.children.forEach((r: any) => {
    r.userData.dimTarget = r === hovered ? 0 : 1
  })
}

const handlePointerMove = (event: MouseEvent) => {
  const region = getIntersectedRegion(event)
  setHovered(region)
  if (!region) return
  tooltip.name = region.userData.feature.properties?.name || '--'
  tooltip.value = region.userData.value
  tooltip.lines = createTooltipLines(region.userData.item, region.userData.value)
  tooltip.x = event.offsetX
  tooltip.y = event.offsetY
  tooltip.show = true
}

const handlePointerLeave = () => {
  setHovered(null)
}

const drillToFeature = async (feature?: GeoFeature) => {
  const geoId = String(feature?.id || feature?.properties?.geoId || '').trim()
  if (!geoId || loading.value || !canDrillFurther()) return
  const previousDrillLevel = currentDrillLevel
  const previousRegionParams = { ...currentRegionParams }
  loading.value = true
  try {
    if (currentDrillLevel === 0) {
      currentRegionParams = { provinceName: feature?.properties?.name || '' }
      currentDrillLevel = 1
    } else if (currentDrillLevel === 1) {
      currentRegionParams = {
        ...currentRegionParams,
        cityName: feature?.properties?.name || ''
      }
      currentDrillLevel = 2
    }
    const geo = await loadDetailGeo(geoId)
    await renderGeo(geo, {
      geoId
    })
  } catch (error) {
    currentDrillLevel = previousDrillLevel
    currentRegionParams = previousRegionParams
    console.error('[ThreeMap] drill failed:', error)
  } finally {
    loading.value = false
  }
}

const handleClick = () => {
  if (hovered) void drillToFeature(hovered.userData.feature)
}

const goHome = async (force = false) => {
  if (loading.value && !force) return
  loading.value = true
  currentDrillLevel = homeScope.drillLevel
  currentRegionParams = { ...homeScope.regionParams }
  currentLevel = homeScope.level
  try {
    const geo = currentLevel.geoId ? await loadDetailGeo(currentLevel.geoId) : loadHomeGeo()
    await renderGeo(geo, currentLevel)
  } finally {
    loading.value = false
  }
}

const resizeRenderer = () => {
  if (!renderer || !canvasRef.value) return
  const { width, height } = getRendererSize()
  if (width <= 0 || height <= 0) return
  renderer.setSize(width, height, false)
  if (currentGeo) {
    const projection = createProjection(currentGeo)
    fitCameraToGeo(currentGeo, projection, 120)
  }
  updateLabels()
}

const animate = () => {
  if (!renderer || !scene || !camera) return
  frameId = requestAnimationFrame(animate)
  const elapsed = clock.getElapsedTime()
  const dt = Math.min(clock.getDelta(), 0.05)
  const lerpSpeed = 6 // 插值速度

  if (glowGroup) {
    glowGroup.position.z = Math.sin(elapsed * 1.2) * 0.6
    glowGroup.children.forEach((child: any, index) => {
      if (child.material && child.userData.pulse) {
        const baseOpacity = Number(child.userData.baseOpacity || 0.1)
        child.material.opacity =
          baseOpacity + Math.sin(elapsed * 1.6 + index * 0.08) * baseOpacity * 0.18
      }
    })
  }

  // 区域交互动画：平滑过渡 hover/dim 状态
  if (mapGroup) {
    mapGroup.children.forEach((region: any) => {
      // 平滑插值 hover 进度 (0→1)
      const hTarget = region.userData.hoverTarget ?? 0
      const hCurrent = region.userData.hoverProgress ?? 0
      const hNew = hCurrent + (hTarget - hCurrent) * Math.min(lerpSpeed * dt, 1)
      region.userData.hoverProgress = hNew

      // 平滑插值 dim 进度 (0→1)
      const dTarget = region.userData.dimTarget ?? 0
      const dCurrent = region.userData.dimProgress ?? 0
      const dNew = dCurrent + (dTarget - dCurrent) * Math.min(lerpSpeed * dt, 1)
      region.userData.dimProgress = dNew

      // hover 时区域微微上浮
      region.position.z = hNew * 3

      region.children?.forEach((child: any) => {
        if (!child.material) return

        if (child.userData.innerGlow) {
          // 内发光层：呼吸 + hover 增亮
          const base = Number(child.userData.baseOpacity || 0.25)
          const hoverBoost = hNew * 0.18
          const breath = Math.sin(elapsed * 0.8) * base * 0.2
          child.material.opacity = base + breath + hoverBoost
        } else if (child.userData.surface) {
          // 表面层：hover 提亮，dim 微暗
          const base = Number(child.userData.baseOpacity ?? 1)
          const dimFactor = 1 - dNew * 0.15
          child.material.opacity = base * dimFactor
        } else if (child.isLine) {
          // 边界线：hover 时高亮
          const mat = child.material as THREE.LineBasicMaterial
          if (hNew > 0.01) {
            mat.color.lerp(new THREE.Color(0xfffbac), hNew * 0.8)
            mat.opacity = 0.5 + hNew * 0.5
          } else {
            mat.color.lerp(new THREE.Color(0x1b8dbf), Math.min(lerpSpeed * dt, 1))
            mat.opacity = 0.5
          }
        }
      })
    })
  }

  renderer.render(scene, camera)
  updateLabels()
}

const reloadCurrentLevel = async () => {
  if (!currentGeo) return
  loading.value = true
  try {
    await renderGeo(currentGeo, currentLevel)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.mode,
  async () => {
    syncHomeScope()
    await nextTick()
    resizeRenderer()
    void goHome(true)
  }
)

watch(
  () => props.certificateTab,
  () => {
    if (isCertificateMode.value) void reloadCurrentLevel()
  }
)

onMounted(async () => {
  await nextTick()
  if (!initThree()) {
    loading.value = false
    return
  }
  canvasRef.value?.addEventListener('mousemove', handlePointerMove)
  canvasRef.value?.addEventListener('mouseleave', handlePointerLeave)
  canvasRef.value?.addEventListener('click', handleClick)
  canvasRef.value?.addEventListener('webglcontextlost', handleContextLost)
  canvasRef.value?.addEventListener('webglcontextrestored', handleContextRestored)
  window.addEventListener('resize', resizeRenderer)
  if (typeof ResizeObserver !== 'undefined' && canvasRef.value?.parentElement) {
    resizeObserver = new ResizeObserver(resizeRenderer)
    resizeObserver.observe(canvasRef.value.parentElement)
  }
  syncHomeScope()
  await goHome(true)
  animate()
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  const homeScopeChanged = syncHomeScope()
  if (homeScopeChanged || currentDrillLevel <= homeScope.drillLevel) {
    void goHome(true)
    return
  }
  void reloadCurrentLevel()
})

onBeforeUnmount(() => {
  disposed = true
  dataRequestSeq += 1
  renderSeq += 1
  disposeRefresh()
  if (frameId) cancelAnimationFrame(frameId)
  canvasRef.value?.removeEventListener('mousemove', handlePointerMove)
  canvasRef.value?.removeEventListener('mouseleave', handlePointerLeave)
  canvasRef.value?.removeEventListener('click', handleClick)
  canvasRef.value?.removeEventListener('webglcontextlost', handleContextLost)
  canvasRef.value?.removeEventListener('webglcontextrestored', handleContextRestored)
  window.removeEventListener('resize', resizeRenderer)
  resizeObserver?.disconnect()
  resizeObserver = null
  clearGroup(mapGroup)
  clearGroup(glowGroup)
  clearGroup(lineGroup)
  if (renderer) {
    renderer.dispose()
  }
  renderer = null
  scene = null
  camera = null
  mapGroup = null
  glowGroup = null
  lineGroup = null
  raycaster = null
  pickableMeshes = []
  clearLabels()
})
</script>

<style scoped lang="scss">
.three-map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  z-index: 5;
  background:
    radial-gradient(circle at 48% 48%, rgba(24, 182, 194, 0.12), rgba(2, 8, 22, 0) 38%),
    linear-gradient(180deg, #04101e 0%, #020914 56%, #01060d 100%);

  &::before,
  &::after {
    position: absolute;
    inset: 0;
    content: '';
    pointer-events: none;
  }

  &::before {
    z-index: 0;
    background:
      url('@/assets/imgs/echarts/province_fill_bright.png') center / cover no-repeat,
      radial-gradient(circle at 52% 52%, rgba(25, 236, 205, 0.1), transparent 42%);
    mix-blend-mode: screen;
    opacity: 0.42;
  }

  &::after {
    z-index: 1;
    background:
      linear-gradient(105deg, rgba(255, 255, 255, 0.04) 0 1px, transparent 1px 210px),
      radial-gradient(circle at 50% 55%, transparent 0 34%, rgba(0, 0, 0, 0.2) 62%, rgba(0, 0, 0, 0.42) 100%);
    opacity: 0.74;
  }
}

.three-map-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: block;
}

.label-layer {
  position: absolute;
  inset: 0;
  z-index: 5;
  pointer-events: none;
}

.label-layer :deep(.map-label) {
  position: absolute;
  color: rgba(238, 253, 255, 0.92);
  font-size: 12px;
  font-weight: 600;
  text-shadow:
    0 0 8px rgba(33, 211, 255, 0.88),
    0 1px 3px rgba(0, 0, 0, 0.86);
  transform: translate(-50%, -50%);
  white-space: nowrap;
}

.webgl-error {
  position: absolute;
  inset: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  background: rgba(1, 11, 25, 0.88);
  color: #b4f3ff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0;
  text-align: center;

  small {
    max-width: 80%;
    color: rgba(171, 219, 232, 0.72);
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0;
    line-height: 1.6;
  }
}

.back-button {
  position: absolute;
  right: 16px;
  top: 14px;
  z-index: 12;
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(88, 228, 255, 0.46);
  background:
    linear-gradient(180deg, rgba(20, 86, 128, 0.72), rgba(6, 31, 58, 0.7)),
    rgba(5, 24, 48, 0.82);
  color: #e8fcff;
  cursor: pointer;
  font-size: 12px;
  box-shadow: 0 0 20px rgba(37, 211, 255, 0.16);

  &:disabled {
    opacity: 0.42;
    cursor: default;
  }
}

.map-tooltip {
  position: absolute;
  z-index: 9999;
  min-width: 188px;
  padding: 10px 14px 11px;
  border: 1px solid rgba(115, 245, 255, 0.76);
  background:
    linear-gradient(180deg, rgba(31, 134, 150, 0.72), rgba(9, 56, 77, 0.82)),
    rgba(3, 24, 52, 0.86);
  box-shadow:
    inset 0 0 18px rgba(106, 255, 235, 0.24),
    0 0 18px rgba(66, 247, 227, 0.34);
  color: #effcff;
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 53px));

  &::before {
    position: absolute;
    left: 50%;
    bottom: -48px;
    width: 1px;
    height: 48px;
    background: linear-gradient(180deg, rgba(122, 249, 255, 0.8), rgba(255, 235, 0, 0.78));
    box-shadow: 0 0 10px rgba(94, 242, 255, 0.64);
    content: '';
  }

  &::after {
    position: absolute;
    left: calc(50% - 7px);
    bottom: -60px;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 190, 0.94);
    border-radius: 50%;
    background: #ffe800;
    box-shadow:
      0 0 0 3px rgba(23, 177, 185, 0.58),
      0 0 16px rgba(255, 232, 0, 0.7);
    content: '';
  }

  b {
    display: block;
    margin-bottom: 4px;
    color: rgba(235, 255, 255, 0.92);
    font-size: 12px;
    font-weight: 600;
  }

  span {
    color: rgba(229, 255, 255, 0.88);
    font-size: 13px;
  }

  .tooltip-line {
    display: grid;
    grid-template-columns: auto auto;
    gap: 18px;
    align-items: center;
    min-width: 190px;
    padding-top: 2px;
  }

  strong {
    color: #e7ffff;
    font-size: 14px;
    font-family: 'DIN Alternate', Arial, sans-serif;
    font-weight: 700;
    text-align: right;
  }
}

.map-legend {
  position: absolute;
  right: 20px;
  bottom: 22px;
  z-index: 12;
  min-width: 96px;
  padding: 9px 10px 10px;
  border: 1px solid rgba(69, 255, 198, 0.5);
  background: linear-gradient(180deg, rgba(3, 28, 41, 0.46), rgba(1, 13, 24, 0.28));
  box-shadow:
    inset 0 0 22px rgba(44, 255, 204, 0.08),
    0 0 16px rgba(38, 236, 205, 0.1);
  pointer-events: none;
}

.legend-title {
  margin-bottom: 8px;
  color: rgba(81, 230, 255, 0.92);
  font-size: 14px;
  font-weight: 600;
}

.legend-list {
  display: grid;
  gap: 5px;
}

.legend-item {
  display: grid;
  grid-template-columns: 18px 1fr;
  align-items: center;
  gap: 6px;
  color: rgba(185, 235, 234, 0.78);
  font-size: 10px;

  i {
    width: 9px;
    height: 9px;
    box-shadow: 0 0 8px rgba(54, 245, 202, 0.34);
  }
}
</style>
