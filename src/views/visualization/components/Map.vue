<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, onUnmounted, computed, watch } from 'vue'
// @ts-ignore
import echarts from '@/plugins/echarts'
// @ts-ignore
import * as maptalks from 'maptalks'
// @ts-ignore
import 'maptalks/dist/maptalks.css'
import fillImg from '@/assets/imgs/echarts/topographic_fill.png'
import chinaLiteSafeGeo from '@/assets/data/map/geo/china-lite-safe.json'
import {
  getCertificateMap,
  type CertificateMapItemVO,
  type DashboardCertificateMapRespVO
} from '@/api/agri/dashboard/certificate'
import { getFastMap, type FastMapDataRespVO } from '@/api/agri/dashboard/fast'
import { getDashboardMapData, type MapDataRespVO } from '@/api/agri/dashboard'
import { getTaskMap, type TaskMapDataRespVO } from '@/api/agri/dashboard/task'
import { getBigScreenQueryParams, subscribeBigScreenRefresh } from './bigscreen/config'

defineOptions({ name: 'VisualizationMap' })

const props = withDefaults(
  defineProps<{
    mode?: 'default' | 'certificate' | 'fast' | 'task'
    certificateTab?: string
  }>(),
  {
    mode: 'default',
    certificateTab: '开具'
  }
)

const REMOTE_GEO_BASE_URL = import.meta.env.DEV
  ? '/__geo_proxy/assets/data/map/geo'
  : 'http://101.42.184.189:555/assets/data/map/geo'

const mapRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const HOME_CENTER: [number, number] = [107.2, 35.8]
const HOME_ZOOM = 4.75
const isSwitching = ref(false)
const FAST_MODE = true
const DRILL_LABEL_LIMIT = FAST_MODE ? 20 : 30
const ENABLE_HOVER_TOOLTIP = true
const HOVER_TOOLTIP_DELAY = 120
const state = reactive({
  map: null as any,
  glowLayer: null as any,
  provinceLayer: null as any,
  hotspotLayer: null as any,
  labelLayer: null as any, // national labels
  detailLabelLayer: null as any, // drill-down labels
  detailLayer: null as any,
  chinaFullGeo: null as any
})

let remoteGeoCache: any = null
const detailGeoCache = new Map<string, any>()
let nationalLabelRaf = 0
let syncMapDataRaf = 0
let refreshMapDataRaf = 0
let mapDataRequestSeq = 0
let disposed = false
let loadingFallbackTimer: number | null = null
const certificateMapData = ref<DashboardCertificateMapRespVO>({})
const fastMapData = ref<FastMapDataRespVO[]>([])
const dashboardMapData = ref<MapDataRespVO[]>([])
const taskMapData = ref<TaskMapDataRespVO[]>([])
const currentMapList = ref<
  Array<CertificateMapItemVO | FastMapDataRespVO | TaskMapDataRespVO | MapDataRespVO>
>([])
const currentDrillLevel = ref<0 | 1 | 2>(0)
const currentRegionParams = reactive<{
  provinceName?: string
  cityName?: string
}>({})

const ui = reactive({
  title: '全国',
  subtitle: '',
  isDrilled: false
})

type MapDataRequestContext = {
  id: number
  mode?: string
  certificateTab?: string
  drillLevel: 0 | 1 | 2
  provinceName?: string
  cityName?: string
}

const createMapDataRequestContext = (): MapDataRequestContext => ({
  id: ++mapDataRequestSeq,
  mode: props.mode,
  certificateTab: props.certificateTab,
  drillLevel: currentDrillLevel.value,
  provinceName: currentRegionParams.provinceName,
  cityName: currentRegionParams.cityName
})

const isCurrentMapDataRequest = (context: MapDataRequestContext) =>
  !disposed &&
  context.id === mapDataRequestSeq &&
  context.mode === props.mode &&
  context.certificateTab === props.certificateTab &&
  context.drillLevel === currentDrillLevel.value &&
  context.provinceName === currentRegionParams.provinceName &&
  context.cityName === currentRegionParams.cityName

const invalidateMapDataRequests = () => {
  mapDataRequestSeq += 1
}

const setVectorLayerVisible = (layer: any, visible: boolean) => {
  if (!layer) return
  const layerAction = visible ? layer.show : layer.hide
  if (typeof layerAction === 'function') {
    layerAction.call(layer)
    return
  }
  layer.getGeometries?.().forEach((geo: any) => {
    if (visible) geo.show?.()
    else geo.hide?.()
  })
}

// 采用更简洁的解码逻辑
const decodeFeature = (feature: any) => {
  const { geometry } = feature
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
    geometry.coordinates = coordinates.map((c: any, i: number) => decodePart(c, encodeOffsets[i]))
  } else if (type === 'MultiPolygon') {
    geometry.coordinates = coordinates.map((polygons: any, i: number) => {
      return polygons.map((c: any, j: number) => decodePart(c, encodeOffsets[i][j]))
    })
  }
  delete geometry.encodeOffsets
  return feature
}

const isCertificateMode = computed(() => props.mode === 'certificate')
const isFastMapMode = computed(() => props.mode === 'fast')
const isTaskMapMode = computed(() => props.mode === 'task')
const isDashboardMode = computed(() => props.mode === 'default')

type MapLegendItem = {
  label: string
  blockClass: string
}

const createLegendItems = (labels: string[], blockClasses: string[]): MapLegendItem[] =>
  labels.map((label, index) => ({
    label,
    blockClass: blockClasses[index] || `block-${index + 1}`
  }))

const mapLegendTitle = computed(() => {
  if (isCertificateMode.value) return props.certificateTab === '存证' ? '存证分布' : '开具分布'
  if (isFastMapMode.value) return '检测样本分布'
  if (isTaskMapMode.value) return '任务下发分布'
  return '测量分布'
})

const mapLegendItems = computed(() => {
  if (isCertificateMode.value) {
    return createLegendItems(
      ['500+', '200-499', '100-199', '1-99', '0'],
      ['block-1', 'block-2', 'block-3', 'block-4', 'block-8']
    )
  }
  if (isFastMapMode.value) {
    return createLegendItems(
      ['300-499', '200-399', '100-299', '50-199', '30-100', '10-50', '0-10'],
      ['block-1', 'block-2', 'block-3', 'block-4', 'block-5', 'block-6', 'block-8']
    )
  }
  if (isTaskMapMode.value) {
    return createLegendItems(
      ['500+', '200-499', '100-199', '50-99', '1-49', '0'],
      ['block-1', 'block-2', 'block-3', 'block-4', 'block-6', 'block-8']
    )
  }
  return createLegendItems(
    ['500+', '200-499', '100-199', '50-99', '10-49', '0-9'],
    ['block-1', 'block-2', 'block-3', 'block-4', 'block-6', 'block-8']
  )
})

const getAreaCandidates = (
  item: CertificateMapItemVO | FastMapDataRespVO | TaskMapDataRespVO | MapDataRespVO
) =>
  [item.areaName, item.provinceName, item.cityName, item.districtName]
    .filter(Boolean)
    .map((name) => String(name).trim())

const getFeatureCandidates = (featureProps: any) => {
  const name = String(featureProps?.name || '').trim()
  const shortName = name.replace(/省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g, '')
  return Array.from(new Set([name, shortName].filter(Boolean)))
}

const formatRegionLabel = (name: string) => {
  return String(name || '').replace(
    /省|市|壮族自治区|回族自治区|维吾尔自治区|自治区|特别行政区/g,
    ''
  )
}

const getColorByCount = (count: number) => {
  if (isFastMapMode.value) {
    if (count >= 300) return 'rgba(0, 75, 153, 0.9)'
    if (count >= 200) return 'rgba(0, 102, 204, 0.82)'
    if (count >= 100) return 'rgba(0, 128, 255, 0.74)'
    if (count >= 50) return 'rgba(51, 161, 255, 0.66)'
    if (count >= 30) return 'rgba(102, 194, 255, 0.6)'
    if (count >= 10) return 'rgba(153, 227, 255, 0.52)'
    return 'rgba(204, 242, 255, 0.44)'
  }
  if (isTaskMapMode.value) {
    if (count >= 500) return 'rgba(0, 75, 153, 0.9)'
    if (count >= 200) return 'rgba(0, 102, 204, 0.82)'
    if (count >= 100) return 'rgba(0, 128, 255, 0.74)'
    if (count >= 50) return 'rgba(51, 161, 255, 0.66)'
    if (count >= 1) return 'rgba(102, 194, 255, 0.58)'
    return 'rgba(204, 242, 255, 0.32)'
  }
  if (isDashboardMode.value) {
    if (count >= 500) return 'rgba(0, 75, 153, 0.9)'
    if (count >= 200) return 'rgba(0, 102, 204, 0.82)'
    if (count >= 100) return 'rgba(0, 128, 255, 0.74)'
    if (count >= 50) return 'rgba(51, 161, 255, 0.66)'
    if (count >= 10) return 'rgba(102, 194, 255, 0.58)'
    return 'rgba(204, 242, 255, 0.32)'
  }
  if (count >= 500) return 'rgba(34, 211, 238, 0.85)'
  if (count >= 200) return 'rgba(8, 145, 178, 0.72)'
  if (count >= 100) return 'rgba(14, 116, 144, 0.6)'
  if (count >= 1) return 'rgba(21, 94, 117, 0.45)'
  return 'rgba(2, 6, 23, 0.8)'
}

const getActiveMapList = () =>
  isFastMapMode.value
    ? fastMapData.value
    : isDashboardMode.value
      ? dashboardMapData.value
      : isTaskMapMode.value
        ? taskMapData.value
        : props.certificateTab === '存证'
          ? certificateMapData.value.verificationList || []
          : certificateMapData.value.issueList || []

const getGeometryCenter = (geo: any): [number, number] | null => {
  const geoProps = geo.getProperties?.() || {}
  const cp = geoProps.cp
  if (Array.isArray(cp) && cp.length >= 2) return [Number(cp[0]), Number(cp[1])]

  const center = geo.getCenter?.() || geo.getExtent?.()?.getCenter?.()
  if (!center) return null
  if (Array.isArray(center)) return [Number(center[0]), Number(center[1])]
  if (typeof center.toArray === 'function') {
    const centerArray = center.toArray()
    return [Number(centerArray[0]), Number(centerArray[1])]
  }
  if (typeof center.x === 'number' && typeof center.y === 'number') return [center.x, center.y]
  return null
}

const createHotspotSymbol = (size: number, isPeak = false) => ({
  markerType: 'ellipse',
  markerWidth: size,
  markerHeight: size,
  markerFill: isPeak ? 'rgba(255, 221, 36, 0.92)' : 'rgba(51, 232, 255, 0.92)',
  markerLineColor: isPeak ? '#fff67a' : '#bbfbff',
  markerLineWidth: isPeak ? 1.2 : 0.8,
  markerOpacity: 1,
  shadowBlur: isPeak ? 30 : 18,
  shadowColor: isPeak ? 'rgba(255, 218, 34, 0.92)' : 'rgba(40, 226, 255, 0.82)'
})

const renderHotspots = (geometries: any[]) => {
  if (!state.hotspotLayer) return
  state.hotspotLayer.clear()

  const points = geometries
    .map((geo: any) => {
      const geoProps = geo.getProperties?.() || {}
      const count = Number(geoProps.count || 0)
      const coordinate = count > 0 ? getGeometryCenter(geo) : null
      return coordinate ? { coordinate, count } : null
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, ui.isDrilled ? 24 : 18) as Array<{
    coordinate: [number, number]
    count: number
  }>

  const maxCount = points[0]?.count || 0
  points.forEach((point, index) => {
    const isPeak = index === 0 && maxCount > 0
    const ratio = maxCount > 0 ? point.count / maxCount : 0
    const haloSize = isPeak ? 32 : 18 + Math.round(ratio * 10)
    const coreSize = isPeak ? 9 : 5 + Math.round(ratio * 3)

    new maptalks.Marker(point.coordinate, {
      interactive: false,
      symbol: {
        ...createHotspotSymbol(haloSize, isPeak),
        markerFill: isPeak ? 'rgba(255, 224, 48, 0.18)' : 'rgba(43, 224, 255, 0.16)',
        markerLineColor: isPeak ? 'rgba(255, 236, 73, 0.48)' : 'rgba(80, 236, 255, 0.38)',
        markerLineWidth: 1
      }
    }).addTo(state.hotspotLayer)

    new maptalks.Marker(point.coordinate, {
      interactive: false,
      symbol: createHotspotSymbol(coreSize, isPeak)
    }).addTo(state.hotspotLayer)
  })
}

const applyGeometryDataStyle = (geo: any) => {
  const geoProps = geo.getProperties?.() || {}
  const count = Number(geoProps.count || 0)
  geo.setSymbol({
    polygonPatternFile: fillImg,
    polygonFill: getColorByCount(count),
    polygonOpacity: count > 0 ? 0.86 : 0.68,
    lineColor: count > 0 ? '#4ef4ff' : '#1fc7e8',
    lineWidth: count > 0 ? 1.45 : 1.08,
    lineOpacity: count > 0 ? 1 : 0.88,
    shadowBlur: count > 0 ? 22 : 13,
    shadowColor: count > 0 ? 'rgba(55, 237, 255, 0.66)' : 'rgba(22, 197, 234, 0.36)'
  })
}

const applyMapGlowSymbol = (geo: any) => {
  geo.setSymbol({
    polygonFill: '#0bdcff',
    polygonOpacity: 0.1,
    lineColor: '#40f2ff',
    lineWidth: 4.5,
    lineOpacity: 0.64,
    shadowBlur: 52,
    shadowColor: 'rgba(32, 229, 255, 0.98)'
  })
}

const setGeometryHoverState = (geo: any, active: boolean) => {
  if (!geo) return
  if (!active) {
    applyGeometryDataStyle(geo)
    return
  }

  const currentSymbol = geo.getSymbol?.() || {}
  geo.setSymbol({
    ...currentSymbol,
    polygonOpacity: 0.96,
    lineColor: '#bffcff',
    lineWidth: 2.1,
    lineOpacity: 1,
    shadowBlur: 34,
    shadowColor: 'rgba(91, 244, 255, 0.95)'
  })
}

const syncCurrentMapData = (geometries?: any[]) => {
  if (disposed) return
  if (
    !isCertificateMode.value &&
    !isFastMapMode.value &&
    !isTaskMapMode.value &&
    !isDashboardMode.value
  )
    return
  currentMapList.value = getActiveMapList()
  const targetGeometries =
    geometries ||
    (ui.isDrilled
      ? state.detailLayer?.getGeometries?.() || []
      : state.provinceLayer?.getGeometries?.() || [])
  targetGeometries.forEach((geo: any) => {
    const geoProps = geo.getProperties?.() || {}
    const matched = currentMapList.value.find((item) =>
      getFeatureCandidates(geoProps).some((featureName) =>
        getAreaCandidates(item).includes(featureName)
      )
    )
    geo.setProperties({
      ...geoProps,
      count: Number(
        isFastMapMode.value
          ? (matched as FastMapDataRespVO | undefined)?.sampleCount || 0
          : isDashboardMode.value
            ? (matched as MapDataRespVO | undefined)?.sampleCount || 0
            : isTaskMapMode.value
              ? (matched as TaskMapDataRespVO | undefined)?.taskIssuedCount || 0
              : (matched as CertificateMapItemVO | undefined)?.count || 0
      ),
      sampleCount: Number(
        isDashboardMode.value
          ? (matched as MapDataRespVO | undefined)?.sampleCount || 0
          : (matched as FastMapDataRespVO | undefined)?.sampleCount || 0
      ),
      detectionItemCount: Number((matched as MapDataRespVO | undefined)?.detectionItemCount || 0),
      positiveCount: Number(
        isDashboardMode.value
          ? (matched as MapDataRespVO | undefined)?.positiveCount || 0
          : (matched as FastMapDataRespVO | undefined)?.positiveCount || 0
      ),
      positiveRate: Number(
        isDashboardMode.value
          ? (matched as MapDataRespVO | undefined)?.positiveRate || 0
          : (matched as FastMapDataRespVO | undefined)?.positiveRate || 0
      ),
      taskIssuedCount: Number((matched as TaskMapDataRespVO | undefined)?.taskIssuedCount || 0),
      taskCompletedCount: Number(
        (matched as TaskMapDataRespVO | undefined)?.taskCompletedCount || 0
      ),
      taskCompletionRate: Number(
        (matched as TaskMapDataRespVO | undefined)?.taskCompletionRate || 0
      )
    })
    applyGeometryDataStyle(geo)
  })
  renderHotspots(targetGeometries)
}

const scheduleSyncCurrentMapData = (geometries?: any[]) => {
  if (disposed) return
  if (syncMapDataRaf) {
    cancelAnimationFrame(syncMapDataRaf)
  }
  syncMapDataRaf = requestAnimationFrame(() => {
    syncMapDataRaf = 0
    syncCurrentMapData(geometries)
  })
}

const cancelScheduledMapSync = () => {
  if (!syncMapDataRaf) return
  cancelAnimationFrame(syncMapDataRaf)
  syncMapDataRaf = 0
}

const loadRemoteGeoJson = async () => {
  if (remoteGeoCache) return remoteGeoCache
  const geoJson = structuredClone(chinaLiteSafeGeo) as any
  if (geoJson?.features?.length && !geoJson.__decoded) {
    geoJson.features.forEach((f: any) => decodeFeature(f))
    geoJson.__decoded = true
  }
  remoteGeoCache = geoJson
  return geoJson
}

const loadDetailGeoJson = async (geoId: string) => {
  if (detailGeoCache.has(geoId)) return detailGeoCache.get(geoId)
  const requestUrl = `${REMOTE_GEO_BASE_URL}/${geoId}.json`
  const response = await fetch(requestUrl)
  if (!response.ok) {
    throw new Error(`Load detail geojson failed: ${response.status}`)
  }
  const text = await response.text()
  let geoJson: any = null
  try {
    geoJson = JSON.parse(text)
  } catch (error) {
    console.error('[Map] Detail GeoJSON parse failed:', {
      url: requestUrl,
      preview: text.slice(0, 200)
    })
    throw error
  }
  if (geoJson?.features?.length && !geoJson.__decoded) {
    geoJson.features.forEach((f: any) => decodeFeature(f))
    geoJson.__decoded = true
  }
  detailGeoCache.set(geoId, geoJson)
  return geoJson
}

const renderDetailLabels = (features: any[]) => {
  if (!state.detailLabelLayer) return
  state.detailLabelLayer.clear()
  features.slice(0, DRILL_LABEL_LIMIT).forEach((feature: any) => {
    const { name, cp } = feature.properties || {}
    if (cp && name) {
      new maptalks.Label(name, cp, {
        draggable: false,
        interactive: false,
        textSymbol: {
          textFaceName: 'sans-serif',
          textFill: '#f8feff',
          textSize: 12,
          textOpacity: 1,
          textWeight: 'bold',
          textHaloFill: 'rgba(2, 20, 42, 0.96)',
          textHaloRadius: 4
        }
      }).addTo(state.detailLabelLayer)
    }
  })
}

type LoadMapDataOptions = {
  context?: MapDataRequestContext
  sync?: boolean
  geometries?: any[]
}

const loadCertificateMapData = async (options: LoadMapDataOptions = {}) => {
  if (!isCertificateMode.value) return
  const context = options.context || createMapDataRequestContext()
  try {
    const data = await getCertificateMap({
      ...getBigScreenQueryParams(),
      provinceName: context.provinceName,
      cityName: context.cityName,
      areaLevel: context.drillLevel === 1 ? '1' : context.drillLevel === 2 ? '2' : undefined
    })
    if (!isCurrentMapDataRequest(context)) return false
    certificateMapData.value = data || {}
    if (options.sync !== false) scheduleSyncCurrentMapData(options.geometries)
    return true
  } catch (error) {
    if (!isCurrentMapDataRequest(context)) return false
    console.error('[Map] Load certificate map failed:', error)
    certificateMapData.value = {}
    currentMapList.value = []
    return false
  }
}

const loadFastMapData = async (options: LoadMapDataOptions = {}) => {
  if (!isFastMapMode.value) return
  const context = options.context || createMapDataRequestContext()
  try {
    const data = await getFastMap({
      ...getBigScreenQueryParams(),
      provinceName: context.provinceName,
      cityName: context.cityName,
      areaLevel: context.drillLevel === 1 ? '1' : context.drillLevel === 2 ? '2' : undefined
    })
    if (!isCurrentMapDataRequest(context)) return false
    fastMapData.value = Array.isArray(data) ? data : []
    if (options.sync !== false) scheduleSyncCurrentMapData(options.geometries)
    return true
  } catch (error) {
    if (!isCurrentMapDataRequest(context)) return false
    console.error('[Map] Load fast map failed:', error)
    fastMapData.value = []
    currentMapList.value = []
    return false
  }
}

const loadDashboardMapData = async (options: LoadMapDataOptions = {}) => {
  if (!isDashboardMode.value) return
  const context = options.context || createMapDataRequestContext()
  try {
    const data = await getDashboardMapData({
      ...getBigScreenQueryParams(),
      provinceName: context.provinceName,
      cityName: context.cityName,
      areaLevel: context.drillLevel === 2 ? '2' : '1'
    })
    if (!isCurrentMapDataRequest(context)) return false
    dashboardMapData.value = Array.isArray(data) ? data : []
    if (options.sync !== false) scheduleSyncCurrentMapData(options.geometries)
    return true
  } catch (error) {
    if (!isCurrentMapDataRequest(context)) return false
    console.error('[Map] Load dashboard map failed:', error)
    dashboardMapData.value = []
    currentMapList.value = []
    return false
  }
}

const loadTaskMapData = async (options: LoadMapDataOptions = {}) => {
  if (!isTaskMapMode.value) return
  const context = options.context || createMapDataRequestContext()
  try {
    const data = await getTaskMap({
      ...getBigScreenQueryParams(),
      provinceName: context.provinceName,
      cityName: context.cityName,
      areaLevel: context.drillLevel === 1 ? '1' : context.drillLevel === 2 ? '2' : undefined
    })
    if (!isCurrentMapDataRequest(context)) return false
    taskMapData.value = Array.isArray(data) ? data : []
    if (options.sync !== false) scheduleSyncCurrentMapData(options.geometries)
    return true
  } catch (error) {
    if (!isCurrentMapDataRequest(context)) return false
    console.error('[Map] Load task map failed:', error)
    taskMapData.value = []
    currentMapList.value = []
    return false
  }
}

const loadCurrentMapData = (options: LoadMapDataOptions = {}) => {
  if (isCertificateMode.value) return loadCertificateMapData(options)
  if (isFastMapMode.value) return loadFastMapData(options)
  if (isDashboardMode.value) return loadDashboardMapData(options)
  if (isTaskMapMode.value) return loadTaskMapData(options)
  return Promise.resolve(false)
}

const scheduleRefreshCurrentMapData = () => {
  if (disposed) return
  if (refreshMapDataRaf) {
    cancelAnimationFrame(refreshMapDataRaf)
  }
  refreshMapDataRaf = requestAnimationFrame(() => {
    refreshMapDataRaf = 0
    void loadCurrentMapData()
  })
}

const cancelScheduledMapRefresh = () => {
  if (!refreshMapDataRaf) return
  cancelAnimationFrame(refreshMapDataRaf)
  refreshMapDataRaf = 0
}

const drillDown = async (geometry: any) => {
  if (isSwitching.value || !geometry) return
  const properties = geometry.getProperties?.() || {}
  const geoId = String(properties.geoId || properties.adcode || geometry.getId?.() || '').trim()
  if (!geoId) return

  isSwitching.value = true
  hideTooltip()
  invalidateMapDataRequests()

  try {
    const detailGeo = await loadDetailGeoJson(geoId)
    if (!detailGeo?.features?.length) return

    let mapDataPromise: Promise<boolean | undefined> | null = null
    if (
      isCertificateMode.value ||
      isFastMapMode.value ||
      isTaskMapMode.value ||
      isDashboardMode.value
    ) {
      if (currentDrillLevel.value === 0) {
        currentRegionParams.provinceName = properties.name
        delete currentRegionParams.cityName
        currentDrillLevel.value = 1
      } else if (currentDrillLevel.value === 1) {
        currentRegionParams.cityName = properties.name
        currentDrillLevel.value = 2
      }
      mapDataPromise = loadCurrentMapData({
        context: createMapDataRequestContext(),
        sync: false
      })
    }

    if (!state.detailLayer) {
      state.detailLayer = new maptalks.VectorLayer('detail-layer', {
        zIndex: 6,
        enableSimplify: true,
        simplifyTolerance: 0.8
      } as any).addTo(state.map)
    }

    state.detailLayer.clear()
    state.detailLabelLayer?.clear?.()
    state.hotspotLayer?.clear?.()
    setVectorLayerVisible(state.detailLayer, true)
    setVectorLayerVisible(state.detailLabelLayer, true)
    setVectorLayerVisible(state.glowLayer, false)
    setVectorLayerVisible(state.provinceLayer, false)
    setVectorLayerVisible(state.labelLayer, false)

    const detailGeometries = maptalks.GeoJSON.toGeometry(detailGeo)
    detailGeometries.forEach((geo: any) => {
      const geoProps = geo.getProperties?.() || {}
      const featureId = String(geo.getId?.() || geoProps.id || '').trim()
      geo.setProperties({
        ...geoProps,
        geoId: featureId
      })
      geo.setSymbol({
        polygonPatternFile: fillImg,
        polygonFill: 'rgba(3, 42, 67, 0.86)',
        polygonOpacity: 0.88,
        lineColor: '#4ef4ff',
        lineWidth: 1.5,
        lineOpacity: 1,
        shadowBlur: 22,
        shadowColor: 'rgba(71, 242, 255, 0.7)'
      })
      if (ENABLE_HOVER_TOOLTIP) {
        geo.on('mouseenter', (e: any) => {
          state.map.setCursor('pointer')
          setGeometryHoverState(e.target, true)
          showTooltip(e)
        })
        geo.on('mousemove', (e: any) => {
          showTooltip(e)
        })
        geo.on('mouseleave', (e: any) => {
          state.map.setCursor('default')
          setGeometryHoverState(e.target, false)
          hideTooltip()
        })
      }
      if ((!isCertificateMode.value && !isTaskMapMode.value) || currentDrillLevel.value < 2) {
        geo.on('click', (e: any) => drillDown(e.target))
      }
      geo.addTo(state.detailLayer)
    })

    renderDetailLabels(detailGeo.features)
    const extent = state.detailLayer.getExtent?.()
    if (extent) {
      state.map.fitExtent(extent, 0, {
        animation: false,
        padding: { top: 50, right: 50, bottom: 50, left: 50 }
      })
    }

    ui.isDrilled = true
    ui.title = properties.name || '省级详情'
    if (mapDataPromise) {
      void mapDataPromise.then((updated) => {
        if (updated) scheduleSyncCurrentMapData(detailGeometries)
      })
    } else {
      scheduleSyncCurrentMapData(detailGeometries)
    }
  } catch (error) {
    console.error('[Map] Drill down failed:', error)
  } finally {
    isSwitching.value = false
  }
}

const rollUp = () => {
  if (isSwitching.value) return
  isSwitching.value = true
  hideTooltip()
  invalidateMapDataRequests()
  cancelScheduledMapSync()

  // 2. 隐藏详情图层，显示全国图层
  if (state.detailLayer) state.detailLayer.clear()
  if (state.detailLabelLayer) state.detailLabelLayer.clear()
  if (state.hotspotLayer) state.hotspotLayer.clear()

  setVectorLayerVisible(state.detailLayer, false)
  setVectorLayerVisible(state.detailLabelLayer, false)
  setVectorLayerVisible(state.glowLayer, true)
  setVectorLayerVisible(state.provinceLayer, true)
  setVectorLayerVisible(state.labelLayer, true)

  // 3. 视角强制回归（避免偶发放大残留）
  if (typeof state.map.setView === 'function') {
    state.map.setView({
      center: HOME_CENTER,
      zoom: HOME_ZOOM,
      pitch: 0,
      bearing: 0
    })
  } else {
    state.map.setCenterAndZoom(HOME_CENTER, HOME_ZOOM)
    state.map.setPitch(0)
    if (typeof state.map.setBearing === 'function') state.map.setBearing(0)
  }

  // 4. 重置 UI 状态 并重新渲染全国标签，恢复 ECharts 图层
  ui.title = '全国'
  ui.subtitle = ''
  ui.isDrilled = false
  currentDrillLevel.value = 0
  delete currentRegionParams.provinceName
  delete currentRegionParams.cityName

  isSwitching.value = false
  scheduleRefreshCurrentMapData()
}

const renderNationalLabels = () => {
  if (!state.chinaFullGeo || !state.labelLayer) return
  if (state.labelLayer.getCount && state.labelLayer.getCount() > 0) {
    state.labelLayer.show()
    return
  }
  state.chinaFullGeo.features.forEach((feature: any) => {
    const { name, cp } = feature.properties
    if (cp && name) {
      new maptalks.Label(formatRegionLabel(name), cp, {
        draggable: false,
        interactive: false,
        textSymbol: {
          textFaceName: 'sans-serif',
          textFill: '#ffffff',
          textSize: 13,
          textOpacity: 1,
          textWeight: 'bold',
          textHaloFill: 'rgba(2, 17, 39, 0.98)',
          textHaloRadius: 4,
          textDx: 0,
          textDy: 0
        }
      }).addTo(state.labelLayer)
    }
  })
}

const scheduleNationalLabels = () => {
  if (nationalLabelRaf) {
    cancelAnimationFrame(nationalLabelRaf)
  }
  nationalLabelRaf = requestAnimationFrame(() => {
    renderNationalLabels()
    nationalLabelRaf = 0
  })
}

const loadInitialMapData = () => {
  return loadCurrentMapData({ sync: false })
}

// 提取应用全国遮罩的逻辑
const applyChinaMask = () => {
  // 纯矢量模式下无需对底图切片进行 Mask
}

const initMap = async () => {
  if (!mapRef.value) return // 确保 echarts 在全局可用
  ;(window as any).echarts = echarts
  state.map = new maptalks.Map(mapRef.value, {
    center: HOME_CENTER,
    zoom: HOME_ZOOM,
    minZoom: 4,
    maxZoom: 12,
    pitch: 0,
    maxExtent: new maptalks.Extent(73, 15, 135, 55),
    attribution: false,
    background: { fill: '#020b18' }
  } as any)

  state.glowLayer = new maptalks.VectorLayer('china-glow-layer', {
    zIndex: 4,
    enableSimplify: true,
    simplifyTolerance: 1.3,
    geometryEvents: false
  } as any).addTo(state.map)

  // 省份图层
  state.provinceLayer = new maptalks.VectorLayer('province-layer', {
    zIndex: 5,
    enableSimplify: true,
    simplifyTolerance: 1.3
  } as any).addTo(state.map)

  // 4. 标签图层 (最顶层)
  state.labelLayer = new maptalks.VectorLayer('label-layer', {
    zIndex: 100,
    enableSimplify: true,
    geometryEvents: false
  }).addTo(state.map)
  state.detailLabelLayer = new maptalks.VectorLayer('detail-label-layer', {
    zIndex: 101,
    enableSimplify: true,
    geometryEvents: false
  }).addTo(state.map)
  state.detailLayer = new maptalks.VectorLayer('detail-layer', {
    zIndex: 8,
    enableSimplify: true,
    simplifyTolerance: 0.8
  } as any).addTo(state.map)
  state.hotspotLayer = new maptalks.VectorLayer('hotspot-layer', {
    zIndex: 96,
    geometryEvents: false
  } as any).addTo(state.map)

  // 4. 加载数据并渲染
  try {
    const initialMapDataPromise = loadInitialMapData()
    state.chinaFullGeo = await loadRemoteGeoJson()

    if (state.chinaFullGeo) {
      const geometries = maptalks.GeoJSON.toGeometry(state.chinaFullGeo)
      if (geometries && geometries.length > 0) {
        applyChinaMask()
        const glowGeometries = maptalks.GeoJSON.toGeometry(state.chinaFullGeo)
        glowGeometries.forEach((geo: any) => {
          applyMapGlowSymbol(geo)
          geo.addTo(state.glowLayer)
        })
        geometries.forEach((geo: any) => {
          const geoProps = geo.getProperties?.() || {}
          const featureId = String(geo.getId?.() || geoProps.id || '').trim()
          geo.setProperties({
            ...geoProps,
            geoId: featureId
          })
          // 顶层 - 纯矢量亮青色风格
          geo.setSymbol({
            polygonPatternFile: fillImg,
            polygonFill: 'rgba(3, 39, 65, 0.84)',
            polygonOpacity: 0.84,
            lineColor: '#38eaff',
            lineWidth: 1.18,
            lineOpacity: 0.9,
            shadowBlur: 15,
            shadowColor: 'rgba(31, 216, 255, 0.48)'
          })

          if (ENABLE_HOVER_TOOLTIP) {
            geo.on('mouseenter', (e: any) => {
              state.map.setCursor('pointer')
              setGeometryHoverState(e.target, true)
              showTooltip(e)
            })
            geo.on('mousemove', (e: any) => {
              showTooltip(e)
            })
            geo.on('mouseleave', (e: any) => {
              state.map.setCursor('default')
              setGeometryHoverState(e.target, false)
              hideTooltip()
            })
          }
          geo.on('click', (e: any) => drillDown(e.target))

          geo.addTo(state.provinceLayer)
        })
        void initialMapDataPromise.then((updated) => {
          if (updated && !ui.isDrilled) scheduleSyncCurrentMapData(geometries)
        })
        const extent = state.provinceLayer.getExtent?.()
        if (extent) {
          state.map.fitExtent(extent, 0, {
            animation: false,
            padding: { top: 88, right: 268, bottom: 72, left: 288 }
          })
          state.map.panBy([8, 10], { animation: false })
        }
      }
    }
    scheduleNationalLabels()
  } catch (e) {
    console.error('GeoJSON Load Error', e)
  }
}

const tooltipData = reactive({
  name: '',
  show: false,
  x: 0,
  y: 0,
  count: 0,
  samples: 565566,
  items: 345456,
  rate: '56%'
})

let tooltipRaf = 0
let tooltipDelayTimer: number | null = null
let pendingTooltipPayload: {
  name: string
  count: number
  samples: number
  items: number
  rate: string
  x: number
  y: number
} | null = null

const clearTooltipDelay = () => {
  if (tooltipDelayTimer !== null) {
    window.clearTimeout(tooltipDelayTimer)
    tooltipDelayTimer = null
  }
  pendingTooltipPayload = null
}

const getTooltipPayload = (e: any) => {
  if (!e?.target || !state.map) return null
  const props = e.target.getProperties()
  const coordinate = getGeometryCenter(e.target) || [e.coordinate.x, e.coordinate.y]
  const pos = state.map.coordinateToContainerPoint(coordinate)
  const mapSize = state.map.getSize?.()
  const nextX = Math.min(Math.max(pos.x + 34, 12), Number(mapSize?.width || 0) - 198)
  const nextY = Math.min(Math.max(pos.y - 18, 82), Number(mapSize?.height || 0) - 128)
  const samples = Number(isTaskMapMode.value ? props.taskIssuedCount || 0 : props.sampleCount || 0)
  return {
    name: props.name,
    count: Number(props.count || 0),
    samples,
    items: Number(
      isDashboardMode.value ? props.detectionItemCount || 0 : props.taskCompletedCount || 0
    ),
    rate: `${Number(
      isTaskMapMode.value ? props.taskCompletionRate || 0 : props.positiveRate || 0
    ).toFixed(2)}%`,
    x: nextX,
    y: nextY
  }
}

const renderTooltip = (payload: NonNullable<typeof pendingTooltipPayload>) => {
  if (tooltipRaf) cancelAnimationFrame(tooltipRaf)
  tooltipRaf = requestAnimationFrame(() => {
    tooltipData.name = payload.name
    tooltipData.count = payload.count
    tooltipData.samples = payload.samples
    tooltipData.items = payload.items
    tooltipData.rate = payload.rate
    tooltipData.show = true
    tooltipData.x = payload.x
    tooltipData.y = payload.y
    tooltipRaf = 0
  })
}

const showTooltip = (e: any) => {
  if (!ENABLE_HOVER_TOOLTIP) return
  const payload = getTooltipPayload(e)
  if (!payload) return
  if (tooltipData.show) {
    clearTooltipDelay()
    renderTooltip(payload)
    return
  }
  pendingTooltipPayload = payload
  if (tooltipDelayTimer !== null) return
  tooltipDelayTimer = window.setTimeout(() => {
    tooltipDelayTimer = null
    if (pendingTooltipPayload) {
      renderTooltip(pendingTooltipPayload)
      pendingTooltipPayload = null
    }
  }, HOVER_TOOLTIP_DELAY)
}

const hideTooltip = () => {
  clearTooltipDelay()
  if (tooltipRaf) {
    cancelAnimationFrame(tooltipRaf)
    tooltipRaf = 0
  }
  tooltipData.show = false
}

watch(
  () => props.certificateTab,
  () => {
    if (isCertificateMode.value) {
      invalidateMapDataRequests()
      scheduleRefreshCurrentMapData()
    }
  }
)

watch(
  () => props.mode,
  () => {
    if (
      isCertificateMode.value ||
      isFastMapMode.value ||
      isTaskMapMode.value ||
      isDashboardMode.value
    ) {
      invalidateMapDataRequests()
      scheduleRefreshCurrentMapData()
    }
  }
)

onMounted(async () => {
  await nextTick()
  loadingFallbackTimer = window.setTimeout(() => {
    loading.value = false
    loadingFallbackTimer = null
  }, 3000)
  try {
    await initMap()
  } finally {
    if (loadingFallbackTimer !== null) {
      window.clearTimeout(loadingFallbackTimer)
      loadingFallbackTimer = null
    }
    loading.value = false
  }
})

const disposeRefresh = subscribeBigScreenRefresh(() => {
  invalidateMapDataRequests()
  scheduleRefreshCurrentMapData()
})

onUnmounted(() => {
  disposed = true
  invalidateMapDataRequests()
  disposeRefresh()
  if (loadingFallbackTimer !== null) {
    window.clearTimeout(loadingFallbackTimer)
    loadingFallbackTimer = null
  }
  hideTooltip()
  if (nationalLabelRaf) {
    cancelAnimationFrame(nationalLabelRaf)
    nationalLabelRaf = 0
  }
  cancelScheduledMapSync()
  cancelScheduledMapRefresh()
  if (state.map) {
    state.detailLayer?.clear?.()
    state.detailLabelLayer?.clear?.()
    state.labelLayer?.clear?.()
    state.hotspotLayer?.clear?.()
    state.glowLayer?.clear?.()
    state.provinceLayer?.clear?.()
    state.map.remove()
  }
})
</script>

<template>
  <div class="map-wrapper">
    <transition name="fade">
      <div v-if="loading" class="map-loading">
        <div class="loading-ring"></div>
        <p class="loading-text">地图加载中...</p>
      </div>
    </transition>

    <!-- 地图容器 -->
    <div id="map-container" ref="mapRef"></div>

    <!-- 返回全国按钮 -->
    <transition name="fade">
      <div v-if="ui.isDrilled" class="absolute top-20 left-10 z-40">
        <div
          @click="rollUp"
          class="back-btn glass-panel px-6 py-2 rounded-xl flex items-center gap-2 text-cyan-400 font-bold hover:text-white cursor-pointer transition-all border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
        >
          <span class="text-xl">←</span>
          <span>返回全国</span>
        </div>
      </div>
    </transition>

    <!-- 自定义 Tooltip -->
    <div
      v-if="tooltipData.show"
      class="map-tooltip absolute pointer-events-none"
      :style="{ left: tooltipData.x + 'px', top: tooltipData.y + 'px', zIndex: 9999 }"
    >
      <div class="tooltip-content">
        <div v-if="isCertificateMode" class="tooltip-lines">
          <div class="tooltip-line">
            <span>{{ props.certificateTab === '存证' ? '存证数量' : '开具数量' }}</span>
            <b>{{ tooltipData.count }}</b>
          </div>
        </div>
        <div v-else-if="isFastMapMode" class="tooltip-lines">
          <div class="tooltip-line">
            <span>检测样本量</span>
            <b>{{ tooltipData.samples }}</b>
          </div>
          <div class="tooltip-line">
            <span>检测阳性率</span>
            <b>{{ tooltipData.rate }}</b>
          </div>
        </div>
        <div v-else-if="isTaskMapMode" class="tooltip-lines">
          <div class="tooltip-line">
            <span>任务下发</span>
            <b>{{ tooltipData.samples }}</b>
          </div>
          <div class="tooltip-line">
            <span>任务完成</span>
            <b>{{ tooltipData.items }}</b>
          </div>
          <div class="tooltip-line">
            <span>任务完成率</span>
            <b>{{ tooltipData.rate }}</b>
          </div>
        </div>
        <div v-else class="tooltip-lines">
          <div class="tooltip-line">
            <span>样品量</span>
            <b>{{ tooltipData.samples }}（批次）</b>
          </div>
          <div class="tooltip-line">
            <span>检测项次</span>
            <b>{{ tooltipData.items }}（批次）</b>
          </div>
          <div class="tooltip-line">
            <span>阳性率</span>
            <b>{{ tooltipData.rate }}</b>
          </div>
          <div class="tooltip-note">（检测阳性占比）</div>
        </div>
      </div>
    </div>

    <!-- 图例 Legend -->
    <div class="map-legend absolute z-30 pointer-events-none">
      <div class="legend-panel">
        <h4 class="legend-title">{{ mapLegendTitle }}</h4>
        <div class="legend-list">
          <div
            v-for="(item, index) in mapLegendItems"
            :key="item.label"
            class="legend-item"
            :class="{ muted: index === mapLegendItems.length - 1 }"
          >
            <div class="legend-block" :class="item.blockClass"></div>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(2, 10, 28, 0.24), rgba(0, 7, 22, 0.54)),
    radial-gradient(
      ellipse at 48% 51%,
      rgba(23, 130, 181, 0.28) 0%,
      rgba(5, 40, 73, 0.13) 43%,
      rgba(2, 6, 23, 0) 72%
    ),
    radial-gradient(ellipse at 72% 49%, rgba(0, 207, 255, 0.12), rgba(2, 8, 25, 0) 46%),
    url('@/assets/imgs/echarts/1.png') center / cover no-repeat,
    #020b18;
}

.map-wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(1, 8, 24, 0.62), rgba(2, 8, 25, 0) 28%, rgba(1, 8, 24, 0.52)),
    radial-gradient(ellipse at 49% 50%, rgba(51, 218, 255, 0.12), rgba(2, 8, 25, 0) 56%);
  mix-blend-mode: lighten;
}

.map-wrapper::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 50% 48%, rgba(0, 0, 0, 0) 38%, rgba(1, 5, 18, 0.68) 100%),
    linear-gradient(180deg, rgba(1, 8, 24, 0.18), rgba(1, 6, 18, 0.48));
}

#map-container {
  position: relative;
  z-index: 2;
}

.map-loading {
  z-index: 2000;
}

#map-container canvas {
  filter: saturate(1.32) contrast(1.16) brightness(1.04)
    drop-shadow(0 0 18px rgba(30, 218, 255, 0.3));
}

.map-wrapper :deep(.maptalks-attribution) {
  display: none;
}

.map-wrapper :deep(canvas) {
  mix-blend-mode: lighten;
}

.map-wrapper :deep(.maptalks-wrapper) {
  background:
    radial-gradient(ellipse at 48% 48%, rgba(16, 96, 146, 0.1), rgba(2, 8, 25, 0) 58%), transparent;
}

.map-loading {
  position: absolute;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(2, 6, 23, 0.86);
  backdrop-filter: blur(2px);
}

.loading-ring {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid rgba(56, 189, 248, 0.25);
  border-top-color: #22d3ee;
  animation: spin 0.85s linear infinite;
}

.loading-text {
  margin: 0;
  color: #8fd7e9;
  font-size: 14px;
  letter-spacing: 0.5px;
}

#map-container {
  width: 100%;
  height: 100%;
  min-height: 0;
  background: transparent !important;
}

.glass-panel {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
}

.map-tooltip {
  min-width: 176px;
  transform: translate(0, -50%);
  filter: drop-shadow(0 0 18px rgba(42, 229, 255, 0.54));
}

.map-tooltip::after {
  content: '';
  position: absolute;
  right: -10px;
  bottom: 16px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #36efff;
  box-shadow:
    0 0 0 3px rgba(54, 239, 255, 0.18),
    0 0 13px rgba(54, 239, 255, 0.88);
}

.tooltip-content {
  position: relative;
  padding: 14px 16px 13px;
  border: 1px solid rgba(78, 232, 238, 0.62);
  border-radius: 8px;
  background:
    linear-gradient(
      135deg,
      rgba(18, 72, 92, 0.88),
      rgba(5, 32, 55, 0.84) 58%,
      rgba(2, 21, 38, 0.92)
    ),
    rgba(5, 32, 55, 0.88);
  box-shadow:
    inset 0 0 22px rgba(96, 239, 255, 0.22),
    0 0 20px rgba(42, 229, 255, 0.28);
  color: #fff;
  font-size: 13px;
  line-height: 23px;
}

.tooltip-content::after {
  content: '';
  position: absolute;
  left: 46px;
  bottom: -13px;
  width: 0;
  height: 0;
  border: 7px solid transparent;
  border-top-color: rgba(7, 45, 62, 0.92);
  filter: drop-shadow(0 4px 6px rgba(42, 229, 255, 0.32));
}

.tooltip-lines::before {
  content: attr(data-name);
}

.tooltip-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  white-space: nowrap;
}

.tooltip-line span {
  color: rgba(108, 239, 255, 0.76);
}

.tooltip-line b {
  color: #f8ffff;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.42);
}

.tooltip-note {
  color: rgba(238, 255, 255, 0.86);
  white-space: nowrap;
}

.map-legend {
  right: 34px;
  bottom: 28px;
}

.legend-panel {
  width: 66px;
  padding: 0;
  background: transparent;
  box-shadow: none;
}

.legend-title {
  margin: 0 0 4px;
  color: #43cdff;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 3px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 16px;
  font-family: 'Din Alternate', sans-serif;
}

.legend-block {
  width: 6px;
  height: 6px;
  flex: 0 0 6px;
}

.block-1 {
  background: #0e5c37;
}

.block-2 {
  background: #27d07e;
}

.block-3 {
  background: #043e7d;
}

.block-4 {
  background: #19b3e2;
}

.block-5 {
  background: #0b6259;
}

.block-6 {
  background: #1ed9c6;
}

.block-8 {
  background: #d0f3ff;
}

.legend-item.muted {
  opacity: 0.68;
}

@keyframes scan {
  from {
    transform: translateY(-100%);
  }

  to {
    transform: translateY(200%);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ECharts 层穿透点击 */
:deep(.maptalks-e3-layer) {
  pointer-events: none;
}

/* 动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.w-84 {
  width: 21rem;
}
</style>
