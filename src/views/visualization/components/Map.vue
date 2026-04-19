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

// 使用 glob 动态加载地理数据，Vite 建议 glob 模式使用相对路径以保证可靠性
const geoFiles = import.meta.glob('../../../assets/data/map/geo/*.json')



defineOptions({ name: 'VisualizationMap' })

const mapRef = ref<HTMLElement | null>(null)
const state = reactive({
  map: null as any,
  baseLayer: null as any,
  provinceLayer: null as any,
  e3Layer: null as any,
  chinaFullGeo: null as any
})

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

const domesticRoutes = [
  { from: "北京", to: "上海" }, { from: "北京", to: "广州" },
  { from: "北京", to: "成都" }, { from: "上海", to: "武汉" },
  { from: "西安", to: "乌鲁木齐" }, { from: "广州", to: "沈阳" }
]

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
    if (!geometry.encodeOffsets) return feature;
    
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
  console.log('[Map] Initializing ECharts layer...')

  const option = {
    animation: false,
    GLMap: {},
    series: [
      {
        name: 'Route Path',
        type: 'lines',
        coordinateSystem: 'GLMap',
        zlevel: 1,
        effect: { show: true, period: 4, trailLength: 0.4, color: '#38bdf8', symbolSize: 3 },
        lineStyle: { normal: { color: '#38bdf8', width: 0.5, opacity: 0.1, curveness: 0.3 } },
        data: domesticRoutes.map(r => ({ coords: [chinaHubs[r.from], chinaHubs[r.to]] }))
      },
      {
        name: 'Hub Points',
        type: 'effectScatter',
        coordinateSystem: 'GLMap',
        zlevel: 3,
        rippleEffect: { brushType: 'stroke', scale: 4 },
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
    console.log('[Map] E3Layer added to map.')
    
    setTimeout(() => {
      const ins = state.e3Layer.getEChartsInstance()
      if(ins) {
        ins.resize()
        console.log('[Map] ECharts instance resized.')
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

const drillDown = async (geometry: any) => {
  const provinceName = geometry.getProperties().name
  const entry = mapIndex.find((item) => item.name === provinceName || provinceName.startsWith(item.name))
  const code = entry ? entry.code : null

  if (!code) return

  console.log(`[Map] Drilling down to ${provinceName} (${code})...`)
  
  // 1. 隐藏全国层的所有几何体
  state.provinceLayer.getGeometries().forEach(g => g.hide())
  // 找到并隐藏对应的 shadowLayer 内部几何体
  const shadowLayer = state.map.getLayer('shadow-layer')
  if (shadowLayer) shadowLayer.getGeometries().forEach(g => g.hide())

  try {
    const matchKey = findGeoLoader(code)
    if (matchKey) {
      const module: any = await geoFiles[matchKey]()
      let geoJson = JSON.parse(JSON.stringify(module.default))
      if (geoJson.features) {
        geoJson.features = geoJson.features.map(decodeFeature)
      }

      // 2. 创建下钻详情图层
      let detailLayer = state.map.getLayer('detail-layer')
      if (detailLayer) detailLayer.clear()
      else detailLayer = new maptalks.VectorLayer('detail-layer', { zIndex: 6 }).addTo(state.map)

      const geometries = maptalks.GeoJSON.toGeometry(geoJson)
      
      // 3. 设置底图遮罩 (使用当前省份的所有地市集合)
      if (geometries && geometries.length > 0) {
        state.baseLayer.setMask(new maptalks.GeometryCollection(geometries))
        
        geometries.forEach(geo => {
          geo.setSymbol({
            'polygonFill': 'rgba(2, 6, 23, 0.4)',
            'lineColor': '#22d3ee',
            'lineWidth': 1,
            'lineOpacity': 0.5,
            'shadowBlur': 10,
            'shadowColor': '#22d3ee'
          })
          geo.addTo(detailLayer)
          
          geo.on('mouseenter', (e: any) => {
            e.target.updateSymbol({ 'polygonFill': 'rgba(34, 211, 238, 0.1)', 'lineOpacity': 0.8 })
          })
          geo.on('mouseleave', (e: any) => {
            e.target.updateSymbol({ 'polygonFill': 'rgba(2, 6, 23, 0.4)', 'lineOpacity': 0.5 })
          })
        })
      }
    }
  } catch (err) {
    console.warn('[Map] Load local geojson failed', err)
    state.baseLayer.setMask(geometry)
  }

  // 4. 平滑缩放
  state.map.animateTo({
    center: geometry.getCenter(),
    zoom: ['内蒙古自治区', '新疆维吾尔自治区', '西藏自治区'].includes(provinceName) ? 5.5 : 7.5,
    pitch: 0
  }, { duration: 800 })

  // 更新 UI 状态
  ui.title = provinceName + '监控中心'
  ui.subtitle = 'Regional Hub Monitoring'
  ui.isDrilled = true
  ui.status = 'ACTIVE'
}


const rollUp = () => {
  console.log('[Map] Rolling up to national view...')
  
  // 1. 恢复全国遮罩
  applyChinaMask()

  // 2. 隐藏详情图层，显示全国图层
  const detailLayer = state.map.getLayer('detail-layer')
  if (detailLayer) detailLayer.clear()
  
  state.provinceLayer.getGeometries().forEach(g => g.show())
  const shadowLayer = state.map.getLayer('shadow-layer')
  if (shadowLayer) shadowLayer.getGeometries().forEach(g => g.show())

  // 3. 视角回归
  state.map.animateTo({
    center: [106.5, 37.5],
    zoom: 4.5,
    pitch: 0
  }, { duration: 1000 })

  // 4. 重置 UI 状态
  ui.title = '中国物流监控中心'
  ui.subtitle = 'National Hub Matrix'
  ui.isDrilled = false
  ui.status = 'NORMAL'
}

const resetView = () => {
  if (ui.isDrilled) return
  rollUp()
}

// 提取应用全国遮罩的逻辑
const applyChinaMask = () => {
  if (state.chinaFullGeo && state.baseLayer) {
    const geometries = maptalks.GeoJSON.toGeometry(state.chinaFullGeo)
    if (geometries && geometries.length > 0) {
      state.baseLayer.setMask(new maptalks.GeometryCollection(geometries))
      console.log('[Map] China mask applied.')
    }
  }
}

const initMap = async () => {
  if (!mapRef.value) return

  // 确保 echarts 在全局可用
  ;(window as any).echarts = echarts
  state.map = new maptalks.Map(mapRef.value, {
    center: [106.5, 37.5],
    zoom: 4.5,
    minZoom: 4,
    maxZoom: 12,
    pitch: 0,
    maxExtent: new maptalks.Extent(73, 15, 135, 55),
    background: { fill: '#020617' }
  })

  // 1. 底图 - 使用卫星图作为基础纹理，叠加滤镜实现“地形感”
  state.baseLayer = new maptalks.TileLayer('base', {
    urlTemplate: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    zIndex: 0,
    cssFilter: 'brightness(0.6) contrast(1.2) saturate(0.5) hue-rotate(180deg) invert(10%)'
  }).addTo(state.map)

  // 2. 3D 阴影图层 (用于模拟厚度)
  const shadowLayer = new maptalks.VectorLayer('shadow-layer', { 
    zIndex: 4,
    enableSimplify: false
  }).addTo(state.map)

  // 3. 省份图层
  state.provinceLayer = new maptalks.VectorLayer('province-layer', { 
    zIndex: 5,
    enableSimplify: false
  }).addTo(state.map)

  // 4. 加载数据并渲染
  try {
    const chinaKey = findGeoLoader('china')
    if (chinaKey) {
      const module: any = await geoFiles[chinaKey]()
      let rawData = JSON.parse(JSON.stringify(module.default))
      if (rawData.features) {
        rawData.features = rawData.features.map(decodeFeature)
      }
      state.chinaFullGeo = rawData
    }
    
    if (state.chinaFullGeo) {
      const geometries = maptalks.GeoJSON.toGeometry(state.chinaFullGeo)
      if (geometries && geometries.length > 0) {
        applyChinaMask()

        geometries.forEach((geo: any) => {
          // 阴影层 (偏移一点点产生 3D 感)
          const shadowGeo = geo.copy()
          shadowGeo.setSymbol({
            'polygonFill': '#083344',
            'lineColor': '#0891b2',
            'lineWidth': 2,
            'shadowBlur': 10,
            'shadowColor': '#0891b2'
          })
          // 视觉偏移
          shadowGeo.translate(0.05, -0.05)
          shadowGeo.addTo(shadowLayer)

          // 顶层
          geo.setSymbol({
            'polygonFill': 'rgba(2, 6, 23, 0.6)',
            'lineColor': '#22d3ee',
            'lineWidth': 1.5,
            'lineOpacity': 0.8,
            'shadowBlur': 15,
            'shadowColor': '#22d3ee'
          })

          geo.on('mouseenter', (e: any) => {
            e.target.updateSymbol({ 
              'polygonFill': 'rgba(34, 211, 238, 0.15)', 
              'lineColor': '#ffffff',
              'shadowBlur': 25 
            })
            state.map.setCursor('pointer')
            showTooltip(e)
          })
          geo.on('mouseleave', (e: any) => {
            e.target.updateSymbol({ 
              'polygonFill': 'rgba(2, 6, 23, 0.6)', 
              'lineColor': '#22d3ee',
              'shadowBlur': 15 
            })
            state.map.setCursor('default')
            hideTooltip()
          })
          geo.on('click', (e: any) => drillDown(e.target))

          geo.addTo(state.provinceLayer)
        })
      }
    }
  } catch (e) {
    console.error("GeoJSON Load Error", e)
  }

  initECharts()
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

const showTooltip = (e: any) => {
  const props = e.target.getProperties()
  tooltipData.name = props.name
  tooltipData.show = true
  const pos = state.map.coordinateToContainerPoint(e.coordinate)
  tooltipData.x = pos.x + 20
  tooltipData.y = pos.y - 120
}

const hideTooltip = () => {
  tooltipData.show = false
}

onMounted(async () => {
  await nextTick()
  setTimeout(() => {
    initMap()
  }, 100)
})

onUnmounted(() => {
  if (state.map) {
    state.map.remove()
  }
})
</script>

<template>
  <div class="map-wrapper">
    <!-- 地图容器 -->
    <div id="map-container" ref="mapRef"></div>

    <!-- 自定义 Tooltip -->
    <div
      v-if="tooltipData.show"
      class="map-tooltip fixed z-50 pointer-events-none transition-all duration-200"
      :style="{ left: tooltipData.x + 'px', top: tooltipData.y + 'px' }"
    >
      <div
        class="tooltip-content p-4 rounded-xl border border-cyan-400/50 bg-[#0c1e2dcc] backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.3)]"
      >
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
          class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#0c1e2dcc] border-r border-b border-cyan-400/50 rotate-45"
        ></div>
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

    <!-- UI Overlay -->
    <div class="absolute top-6 left-6 z-30 space-y-4 pointer-events-none">
      <div
        class="glass-panel p-6 rounded-3xl w-84 pointer-events-auto border-t-2 border-t-sky-500/50 relative overflow-hidden group"
      >
        <!-- 扫描线装饰 -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent -translate-y-full animate-[scan_4s_linear_infinite]"
        ></div>

        <!-- 动态标题 -->
        <div class="flex items-center gap-3 mb-2 relative">
          <div class="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-pulse"></div>
          <h1 class="text-white text-xl font-bold tracking-tight">{{ ui.title }}</h1>
        </div>
        <p class="text-sky-400/80 text-[10px] uppercase tracking-[0.2em] mb-6 font-semibold">{{
          ui.subtitle
        }}</p>

        <!-- 动态统计 -->
        <div class="space-y-5 relative">
          <div class="flex justify-between items-end">
            <div>
              <span class="text-slate-400 text-[11px] block mb-1">活跃节点</span>
              <span class="text-white font-mono text-3xl font-bold">{{ ui.nodeCount }}</span>
            </div>
            <div class="text-right">
              <span class="text-slate-400 text-[11px] block mb-1">负载状态</span>
              <span
                :class="
                  ui.status === 'NORMAL'
                    ? 'text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]'
                    : 'text-amber-400'
                "
                class="font-mono text-xl font-bold transition-all"
              >
                {{ ui.status }}
              </span>
            </div>
          </div>

          <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden p-[1px]">
            <div
              class="h-full bg-gradient-to-r from-sky-600 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-1000"
              :style="{ width: ui.loadPercent + '%' }"
            ></div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div
              class="bg-slate-900/60 p-3 rounded-2xl border border-sky-500/15 text-center transition-all hover:bg-slate-900/80"
            >
              <p class="text-[9px] text-slate-500 uppercase tracking-tighter">实时订单</p>
              <p class="text-sm text-sky-400 font-bold group-hover:scale-110 transition-transform">{{
                ui.orders
              }}</p>
            </div>
            <div
              class="bg-slate-900/60 p-3 rounded-2xl border border-sky-500/15 text-center transition-all hover:bg-slate-900/80"
            >
              <p class="text-[9px] text-slate-500 uppercase tracking-tighter">综合评分</p>
              <p class="text-sm text-emerald-400 font-bold group-hover:scale-110 transition-transform"
                >9.8</p
              >
            </div>
          </div>
        </div>

        <!-- 下钻返回按钮 -->
        <transition name="fade">
          <button
            v-if="ui.isDrilled"
            @click="rollUp"
            class="mt-6 w-full py-3 bg-sky-500/20 border border-sky-500/50 text-sky-400 text-xs font-bold rounded-xl hover:bg-sky-500/30 transition-all flex items-center justify-center gap-2 relative z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            返回全国视野
          </button>
        </transition>
      </div>

      <button
        @click="resetView"
        class="w-full glass-panel py-3 text-sky-400 text-[11px] font-bold rounded-xl hover:bg-sky-500/10 transition-all pointer-events-auto uppercase tracking-widest border border-cyan-500/20"
      >
        {{ ui.isDrilled ? '锁定当前区域' : '重置全图中心' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  /* 深空星云背景渐变 */
  background: radial-gradient(circle at center, #0b1e33 0%, #020617 70%),
    linear-gradient(135deg, #020617 0%, #0b1e33 30%, #020617 60%, #081a2e 100%);
  background-blend-mode: screen;
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
  from { transform: translateY(-100%); }
  to { transform: translateY(200%); }
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
