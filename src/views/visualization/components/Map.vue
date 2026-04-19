<script setup lang="ts">
import { ref, onMounted, reactive, nextTick, onUnmounted } from 'vue'
// @ts-ignore
import echarts from '@/plugins/echarts'
// @ts-ignore
import * as maptalks from 'maptalks'
// @ts-ignore
import { E3Layer } from 'maptalks.e3'
import 'maptalks/dist/maptalks.css'
import mapIndex from '@/assets/data/map/map.json'
import fillImg from '@/assets/imgs/echarts/topographic_fill.png'

// 使用 glob 动态加载地理数据，Vite 建议 glob 模式使用相对路径以保证可靠性
const geoFiles = import.meta.glob('../../../assets/data/map/geo/*.json')



defineOptions({ name: 'VisualizationMap' })

const mapRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const HOME_CENTER: [number, number] = [106.5, 37.5]
const HOME_ZOOM = 4.5
const isSwitching = ref(false)
const FAST_MODE = true
const NATIONAL_LABEL_LIMIT = FAST_MODE ? 8 : 20
const DRILL_LABEL_LIMIT = FAST_MODE ? 20 : 30
const MAX_GEO_CACHE = 6
const ENABLE_HOVER_TOOLTIP = true
const state = reactive({
  map: null as any,
  provinceLayer: null as any,
  labelLayer: null as any, // national labels
  detailLabelLayer: null as any, // drill-down labels
  detailLayer: null as any,
  e3Layer: null as any,
  chinaFullGeo: null as any
})

const geoCache = new Map<string, any>()

const ui = reactive({
  title: '中国物流监控中心',
  subtitle: 'National Hub Matrix',
  nodeCount: 42,
  status: 'NORMAL',
  loadPercent: 88,
  orders: '128.5k',
  isDrilled: false
})

// 业务数据
const chinaHubs: Record<string, number[]> = {
  "北京": [116.4074, 39.9042], "上海": [121.4737, 31.2304], "广州": [113.2644, 23.1292],
  "深圳": [114.0579, 22.5431], "成都": [104.0657, 30.6595], "武汉": [114.3055, 30.5928],
  "西安": [108.9401, 34.3416], "沈阳": [123.4290, 41.7967], "乌鲁木齐": [87.6177, 43.7928]
}

// 解码 ECharts 特有的 GeoJSON 压缩格式
const decodeGeoJson = (json: any) => {
  if (!json.encodeOffsets) return json

  const decode = (str: string, offset: number, scale: number) => {
    let out = []
    let prev = 0
    for (let i = 0; i < str.length; i++) {
      let code = str.charCodeAt(i) - 64
      if (code < 0) code += 64

      let res = (code & 1) ? ~(code >> 1) : (code >> 1)
      res += prev
      prev = res
      out.push(res / scale + offset)
    }
    return out
  }

  json.features.forEach((feature: any) => {
    const { geometry, properties } = feature
    const { encodeOffsets } = geometry
    if (encodeOffsets) {
      const scale = 1024
      geometry.coordinates.forEach((rings: any, idx: number) => {
        const offset = encodeOffsets[idx]
        if (geometry.type === 'Polygon') {
          geometry.coordinates[idx] = decodePolygon(rings, offset, scale)
        } else if (geometry.type === 'MultiPolygon') {
          rings.forEach((ring: any, ridx: number) => {
            rings[ridx] = decodePolygon(ring, offset[ridx], scale)
          })
        }
      })
      delete geometry.encodeOffsets
    }
  })
  return json
}

const decodePolygon = (coordinate: any, offset: any, scale: number) => {
  const result = []
  let prevX = offset[0]
  let prevY = offset[1]
  for (let i = 0; i < coordinate.length; i += 2) {
    let x = coordinate.charCodeAt(i) - 64
    let y = coordinate.charCodeAt(i + 1) - 64
    x = (x & 1) ? ~(x >> 1) : (x >> 1)
    y = (y & 1) ? ~(y >> 1) : (y >> 1)
    x += prevX
    y += prevY
    prevX = x
    prevY = y
    result.push([x / scale, y / scale])
  }
  return result
}

// 采用更简洁的解码逻辑
const decodeFeature = (feature: any) => {
  const { geometry } = feature;
  if (!geometry || !geometry.encodeOffsets) return feature;

  const scale = 1024;
  const { type, coordinates, encodeOffsets } = geometry;

  const decodePart = (coordinate: string, encodeOffset: number[]) => {
    const result = [];
    let prevX = encodeOffset[0];
    let prevY = encodeOffset[1];
    for (let i = 0; i < coordinate.length; i += 2) {
      let x = coordinate.charCodeAt(i) - 64;
      let y = coordinate.charCodeAt(i + 1) - 64;
      x = (x & 1) ? ~(x >> 1) : (x >> 1);
      y = (y & 1) ? ~(y >> 1) : (y >> 1);
      x += prevX;
      y += prevY;
      prevX = x;
      prevY = y;
      result.push([x / scale, y / scale]);
    }
    return result;
  };

  if (type === 'Polygon') {
    geometry.coordinates = coordinates.map((c: any, i: number) => decodePart(c, encodeOffsets[i]));
  } else if (type === 'MultiPolygon') {
    geometry.coordinates = coordinates.map((polygons: any, i: number) => {
      return polygons.map((c: any, j: number) => decodePart(c, encodeOffsets[i][j]));
    });
  }
  delete geometry.encodeOffsets;
  return feature;
}


const initECharts = () => {
  if (!state.map) return

  const option = {
    animation: false,
    GLMap: {},
    series: [
      {
        name: 'Hub Points',
        type: 'scatter',
        coordinateSystem: 'GLMap',
        zlevel: 2,
        label: {
          show: true, position: 'right', formatter: '{b}',
          textStyle: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' }
        },
        itemStyle: { color: '#fbbf24' },
        data: Object.keys(chinaHubs).map(name => ({
          name: name, value: chinaHubs[name].concat([100])
        }))
      }
    ]
  }

  try {
    state.e3Layer = new E3Layer('e3', option).addTo(state.map)

    setTimeout(() => {
      const ins = state.e3Layer.getEChartsInstance()
      if (ins) {
        ins.resize()
      }
    }, 1500)
  } catch (e) {
    console.error('[Map] E3Layer Init Error:', e)
  }
}


const findGeoLoader = (code: string) => {
  const keys = Object.keys(geoFiles)
  return keys.find(k => k.endsWith(`/${code}.json`))
}

const loadGeoByCode = async (code: string) => {
  if (geoCache.has(code)) return geoCache.get(code)
  const matchKey = findGeoLoader(code)
  if (!matchKey) return null
  const module: any = await geoFiles[matchKey]()
  const geoJson = module.default
  if (geoJson?.features?.length && !geoJson.__decoded) {
    geoJson.features.forEach((f: any) => decodeFeature(f))
    geoJson.__decoded = true
  }
  if (geoCache.size >= MAX_GEO_CACHE) {
    const keys = Array.from(geoCache.keys())
    const evictKey = keys.find((k) => k !== 'china') ?? keys[0]
    geoCache.delete(evictKey)
  }
  geoCache.set(code, geoJson)
  return geoJson
}

const drillDown = async (geometry: any) => {
  if (isSwitching.value || ui.isDrilled) return
  isSwitching.value = true
  hideTooltip()
  const provinceName = geometry.getProperties().name
  const entry = mapIndex.find((item) => item.name === provinceName || provinceName.startsWith(item.name))
  const code = entry ? entry.code : null

  if (!code) {
    isSwitching.value = false
    return
  }

  // 1. 隐藏全国层的所有几何体
  state.provinceLayer.getGeometries().forEach(g => g.hide())
  if (state.labelLayer) state.labelLayer.hide()

  try {
    const geoJson = await loadGeoByCode(code)
    if (!geoJson) {
      isSwitching.value = false
      return
    }

    if (state.detailLayer) state.detailLayer.clear()
    else {
      state.detailLayer = new maptalks.VectorLayer('detail-layer', {
        zIndex: 6,
        enableSimplify: true,
        simplifyTolerance: 1.2
      }).addTo(state.map)
    }

    const geometries = maptalks.GeoJSON.toGeometry(geoJson)
    if (geometries && geometries.length > 0) {
      if (state.detailLabelLayer) state.detailLabelLayer.clear()

      let labelCount = 0
      geometries.forEach((geo: any) => {
        const props = geo.getProperties()
        geo.setSymbol({
          'polygonPatternFile': fillImg,
          'polygonFill': 'rgba(15, 23, 42, 0.7)',
          'lineColor': '#38bdf8',
          'lineWidth': 1,
          'lineOpacity': 0.6
        })

        // 限制下钻标签数量，避免大量文本渲染导致卡顿
        if (props && props.name && props.cp && labelCount < DRILL_LABEL_LIMIT) {
          labelCount += 1
          new maptalks.Label(props.name.substring(0, 2), props.cp, {
            draggable: false,
            textSymbol: {
              textFaceName: 'sans-serif',
              textFill: '#ffffff',
              textSize: 13,
              textOpacity: 1,
              textWeight: 'bold',
              textDx: 0, textDy: 0
            }
          }).addTo(state.detailLabelLayer)
        }
        geo.addTo(state.detailLayer)
      })
    }
  } catch (err) {
    console.warn('[Map] Load local geojson failed', err)
    isSwitching.value = false
    return
  }

  // 4. 平滑缩放
  state.map.animateTo({
    center: geometry.getCenter(),
    zoom: ['内蒙古自治区', '新疆维吾尔自治区', '西藏自治区'].includes(provinceName) ? 5.5 : 7.5,
    pitch: 0,
    bearing: 0
  }, { duration: 500 })

  // 5. 隐藏 ECharts 业务图层（如全国 Hub）
  if (state.e3Layer) state.e3Layer.hide()

  // 更新 UI 状态
  ui.title = provinceName + '监控中心'
  ui.subtitle = 'Regional Hub Monitoring'
  ui.isDrilled = true
  ui.status = 'ACTIVE'
  isSwitching.value = false
}


const rollUp = () => {
  if (isSwitching.value) return
  isSwitching.value = true
  hideTooltip()


  // 2. 隐藏详情图层，显示全国图层
  if (state.detailLayer) state.detailLayer.clear()
  if (state.detailLabelLayer) state.detailLabelLayer.clear()

  state.provinceLayer.getGeometries().forEach(g => g.show())
  if (state.labelLayer) state.labelLayer.show()

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
  ui.title = '中国物流监控中心'
  ui.subtitle = 'National Hub Matrix'
  ui.isDrilled = false
  ui.status = 'NORMAL'

  if (state.e3Layer) state.e3Layer.show()
  if (state.e3Layer?.getEChartsInstance) {
    const ins = state.e3Layer.getEChartsInstance()
    if (ins) ins.resize()
  }
  isSwitching.value = false
}

const renderNationalLabels = () => {
  if (!state.chinaFullGeo || !state.labelLayer) return
  if (state.labelLayer.getCount && state.labelLayer.getCount() > 0) {
    state.labelLayer.show()
    return
  }
  state.chinaFullGeo.features.slice(0, NATIONAL_LABEL_LIMIT).forEach((feature: any) => {
    const { name, cp } = feature.properties
    if (cp && name) {
      new maptalks.Label(name.substring(0, 2), cp, {
        'draggable': false,
        'textSymbol': {
          'textFaceName': 'sans-serif',
          'textFill': '#ffffff',
          'textSize': 14,
          'textOpacity': 1,
          'textWeight': 'bold',
          'textDx': 0, 'textDy': 0
        }
      }).addTo(state.labelLayer)
    }
  })
}

const resetView = () => {
  if (ui.isDrilled) return
  rollUp()
}

// 提取应用全国遮罩的逻辑
const applyChinaMask = () => {
  // 纯矢量模式下无需对底图切片进行 Mask
}

const initMap = async () => {
  if (!mapRef.value) return

  // 确保 echarts 在全局可用
  ; (window as any).echarts = echarts
  state.map = new maptalks.Map(mapRef.value, {
    center: HOME_CENTER,
    zoom: HOME_ZOOM,
    minZoom: 4,
    maxZoom: 12,
    pitch: 0,
    maxExtent: new maptalks.Extent(73, 15, 135, 55),
    attribution: false,
    background: { fill: '#020617' }
  })

  // 省份图层
  state.provinceLayer = new maptalks.VectorLayer('province-layer', {
    zIndex: 5,
    enableSimplify: true,
    simplifyTolerance: 1.3
  }).addTo(state.map)

  // 4. 标签图层 (最顶层)
  state.labelLayer = new maptalks.VectorLayer('label-layer', {
    zIndex: 100,
    enableSimplify: true
  }).addTo(state.map)
  state.detailLabelLayer = new maptalks.VectorLayer('detail-label-layer', {
    zIndex: 101,
    enableSimplify: true
  }).addTo(state.map)

  // 4. 加载数据并渲染
  try {
    state.chinaFullGeo = await loadGeoByCode('china')

    if (state.chinaFullGeo) {
      const geometries = maptalks.GeoJSON.toGeometry(state.chinaFullGeo)
      if (geometries && geometries.length > 0) {
        applyChinaMask()
        geometries.forEach((geo: any) => {
          // 顶层 - 纯矢量亮青色风格
          geo.setSymbol({
            'polygonPatternFile': fillImg,
            'polygonFill': 'rgba(2, 6, 23, 0.8)',
            'lineColor': '#22d3ee',
            'lineWidth': 1,
            'lineOpacity': 0.8
          })

          if (ENABLE_HOVER_TOOLTIP) {
            geo.on('mouseenter', (e: any) => {
              state.map.setCursor('pointer')
              showTooltip(e)
            })
            geo.on('mousemove', (e: any) => {
              showTooltip(e)
            })
            geo.on('mouseleave', () => {
              state.map.setCursor('default')
              hideTooltip()
            })
          }
          geo.on('click', (e: any) => drillDown(e.target))
          
          geo.addTo(state.provinceLayer)
        })
      }
    }
    renderNationalLabels()
  } catch (e) {
    console.error("GeoJSON Load Error", e)
  }

  setTimeout(() => initECharts(), 80)
}

// Tooltip 相关内容
const tooltipRef = ref<HTMLElement | null>(null)
const tooltipData = reactive({
  name: '',
  show: false,
  x: 0,
  y: 0,
  samples: 565566,
  items: 345456,
  rate: '56%'
})

let tooltipRaf = 0
const showTooltip = (e: any) => {
  if (!ENABLE_HOVER_TOOLTIP) return
  if (tooltipRaf) cancelAnimationFrame(tooltipRaf)
  tooltipRaf = requestAnimationFrame(() => {
    const props = e.target.getProperties()
    tooltipData.name = props.name
    tooltipData.show = true
    const pos = state.map.coordinateToContainerPoint(e.coordinate)
    tooltipData.x = pos.x
    tooltipData.y = pos.y - 10
    tooltipRaf = 0
  })
}

const hideTooltip = () => {
  if (tooltipRaf) {
    cancelAnimationFrame(tooltipRaf)
    tooltipRaf = 0
  }
  tooltipData.show = false
}

onMounted(async () => {
  await nextTick()
  await Promise.all([
    initMap(),
    new Promise((resolve) => setTimeout(resolve, 3000))
  ])
  loading.value = false
})

onUnmounted(() => {
  hideTooltip()
  if (state.map) {
    state.detailLayer?.clear?.()
    state.detailLabelLayer?.clear?.()
    state.labelLayer?.clear?.()
    state.provinceLayer?.clear?.()
    if (state.e3Layer?.getEChartsInstance) {
      const ins = state.e3Layer.getEChartsInstance()
      if (ins) ins.dispose?.()
    }
    geoCache.clear()
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
        <div @click="rollUp"
          class="back-btn glass-panel px-6 py-2 rounded-xl flex items-center gap-2 text-cyan-400 font-bold hover:text-white cursor-pointer transition-all border border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <span class="text-xl">←</span>
          <span>返回全国</span>
        </div>
      </div>
    </transition>

    <!-- 自定义 Tooltip -->
    <div v-if="tooltipData.show"
      class="map-tooltip absolute pointer-events-none transition-all duration-200 transform -translate-x-1/2 -translate-y-full"
      :style="{ left: tooltipData.x + 'px', top: tooltipData.y + 'px', zIndex: 9999 }">
      <div
        class="tooltip-content p-4 rounded-xl border border-cyan-400/50 bg-[#0c1e2dcc] backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.3)]">
        <h3 class="text-white font-bold mb-3 pb-2 border-b border-cyan-400/20 text-lg">{{
          tooltipData.name
          }}</h3>
        <div class="space-y-3">
          <div class="flex justify-between gap-8 items-center">
            <span class="text-cyan-400/80 text-sm">样品量</span>
            <span class="text-white font-mono font-bold text-xl">{{ tooltipData.samples }}</span>
          </div>
          <div class="flex justify-between gap-8 items-center">
            <span class="text-cyan-400/80 text-sm">检测项次</span>
            <span class="text-white font-mono font-bold text-xl">{{ tooltipData.items }}</span>
          </div>
          <div class="flex justify-between gap-8 items-center">
            <span class="text-cyan-400/80 text-sm">检测项阳性率</span>
            <span class="text-white font-mono font-bold text-xl">{{ tooltipData.rate }}</span>
          </div>
        </div>
        <!-- 装饰角 -->
        <div
          class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0c1e2dcc] border-r border-b border-cyan-400/50 rotate-45">
        </div>
      </div>
    </div>

    <!-- 图例 Legend -->
    <div class="absolute bottom-10 right-10 z-30 pointer-events-none">
      <div class="glass-panel p-5 rounded-2xl w-48 border-l-4 border-l-cyan-500">
        <h4 class="text-cyan-400 text-sm font-bold mb-4 tracking-wider uppercase flex items-center gap-2">
          <div class="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
          测量分布
        </h4>
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_5px_#22d3ee]"></div>
            <span class="text-slate-300 text-xs font-mono">300-499</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-sm bg-cyan-500/80"></div>
            <span class="text-slate-300 text-xs font-mono">200-399</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-sm bg-cyan-600/60"></div>
            <span class="text-slate-300 text-xs font-mono">100-299</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-2.5 h-2.5 rounded-sm bg-cyan-800/40"></div>
            <span class="text-slate-300 text-xs font-mono">50-99</span>
          </div>
          <div class="flex items-center gap-3 opacity-50">
            <div class="w-2.5 h-2.5 rounded-sm bg-slate-700"></div>
            <span class="text-slate-500 text-xs font-mono">0-49</span>
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
  /* 深邃科技蓝渐变背景 */
  background: radial-gradient(circle at center, #051932 0%, #020617 80%);
  background-color: #020617;
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
  min-height: 500px;
}

.glass-panel {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
}

.map-tooltip {
  filter: drop-shadow(0 0 15px rgba(34, 211, 238, 0.4));
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
