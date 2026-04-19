<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>中国物流监控系统 - Vue 3 高级版</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Maptalks -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/maptalks/dist/maptalks.css">
    <script src="https://cdn.jsdelivr.net/npm/maptalks/dist/maptalks.min.js"></script>
    <!-- ECharts -->
    <script src="https://cdn.jsdelivr.net/npm/echarts@4.9.0/dist/echarts.min.js"></script>
    <!-- Maptalks.E3 -->
    <script src="https://cdn.jsdelivr.net/npm/maptalks.e3/dist/maptalks.e3.min.js"></script>
    <!-- Vue 3 -->
    <script src="https://cdn.jsdelivr.net/npm/vue@3.3.4/dist/vue.global.prod.js"></script>
    
    <style>
        body { margin: 0; padding: 0; overflow: hidden; background-color: #020617; }
        #map-container { width: 100vw; height: 100vh; background-color: #020617; }
        
        .glass-panel {
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(56, 189, 248, 0.3);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
        }
        
        /* ECharts 层穿透点击 */
        .maptalks-e3-layer { pointer-events: none; }
        
        /* 动画 */
        .fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
        .fade-enter-from, .fade-leave-to { opacity: 0; }
    </style>
</head>
<body>

    <div id="app">
        <!-- 地图容器 -->
        <div id="map-container" ref="mapRef"></div>

        <!-- UI Overlay -->
        <div class="fixed top-6 left-6 z-30 space-y-4 pointer-events-none">
            <div class="glass-panel p-6 rounded-3xl w-84 pointer-events-auto border-t-2 border-t-sky-500/50">
                <!-- 动态标题 -->
                <div class="flex items-center gap-3 mb-2">
                    <div class="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_12px_#38bdf8] animate-pulse"></div>
                    <h1 class="text-white text-xl font-bold tracking-tight">{{ ui.title }}</h1>
                </div>
                <p class="text-sky-400/80 text-[10px] uppercase tracking-[0.2em] mb-6 font-semibold">{{ ui.subtitle }}</p>
                
                <!-- 动态统计 -->
                <div class="space-y-5">
                    <div class="flex justify-between items-end">
                        <div>
                            <span class="text-slate-400 text-[11px] block mb-1">活跃节点</span>
                            <span class="text-white font-mono text-3xl font-bold">{{ ui.nodeCount }}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-slate-400 text-[11px] block mb-1">负载状态</span>
                            <span :class="ui.isDrilled ? 'text-amber-400' : 'text-emerald-400'" class="font-mono text-xl font-bold">
                                {{ ui.status }}
                            </span>
                        </div>
                    </div>
                    
                    <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full bg-sky-500 transition-all duration-1000" :style="{ width: ui.loadPercent + '%' }"></div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div class="bg-slate-900/50 p-3 rounded-2xl border border-sky-500/10 text-center">
                            <p class="text-[9px] text-slate-500 uppercase">实时订单</p>
                            <p class="text-sm text-sky-400 font-bold">{{ ui.orders }}</p>
                        </div>
                        <div class="bg-slate-900/50 p-3 rounded-2xl border border-sky-500/10 text-center">
                            <p class="text-[9px] text-slate-500 uppercase">评分</p>
                            <p class="text-sm text-emerald-400 font-bold">9.8</p>
                        </div>
                    </div>
                </div>

                <!-- 下钻返回按钮 -->
                <transition name="fade">
                    <button v-if="ui.isDrilled" @click="rollUp" 
                        class="mt-6 w-full py-3 bg-sky-500/20 border border-sky-500/50 text-sky-400 text-xs font-bold rounded-xl hover:bg-sky-500/30 transition-all flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        返回全国视野
                    </button>
                </transition>
            </div>
            
            <button @click="resetView" class="w-full glass-panel py-3 text-sky-400 text-[11px] font-bold rounded-xl hover:bg-sky-500/10 transition-all pointer-events-auto uppercase tracking-widest">
                {{ ui.isDrilled ? '锁定当前区域' : '重置全图中心' }}
            </button>
        </div>
    </div>

    <script>
        const { createApp, ref, onMounted, reactive, nextTick } = Vue;

        createApp({
            setup() {
                const mapRef = ref(null);
                const state = reactive({
                    map: null,
                    baseLayer: null,
                    provinceLayer: null,
                    e3Layer: null,
                    chinaFullGeo: null
                });

                const ui = reactive({
                    title: '中国物流监控中心',
                    subtitle: 'National Hub Matrix',
                    nodeCount: 42,
                    status: 'NORMAL',
                    loadPercent: 88,
                    orders: '128.5k',
                    isDrilled: false
                });

                // 业务数据
                const chinaHubs = {
                    "北京": [116.4074, 39.9042], "上海": [121.4737, 31.2304], "广州": [113.2644, 23.1292],
                    "深圳": [114.0579, 22.5431], "成都": [104.0657, 30.6595], "武汉": [114.3055, 30.5928],
                    "西安": [108.9401, 34.3416], "沈阳": [123.4290, 41.7967], "乌鲁木齐": [87.6177, 43.7928]
                };

                const domesticRoutes = [
                    { from: "北京", to: "上海" }, { from: "北京", to: "广州" },
                    { from: "北京", to: "成都" }, { from: "上海", to: "武汉" },
                    { from: "西安", to: "乌鲁木齐" }, { from: "广州", to: "沈阳" }
                ];

                onMounted(() => {
                    initMap();
                });

                const initMap = async () => {
                    // 1. 初始化 Maptalks
                    state.map = new maptalks.Map(mapRef.value, {
                        center: [106.5, 37.5],
                        zoom: 4.5,
                        minZoom: 4,
                        maxZoom: 12,
                        pitch: 0,
                        maxExtent: new maptalks.Extent(73, 15, 135, 55),
                        background: { fill: '#020617' }
                    });

                    // 2. 底图
                    state.baseLayer = new maptalks.TileLayer('base', {
                        urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                        subdomains: ['a', 'b', 'c', 'd'],
                        cssFilter: 'sepia(100%) hue-rotate(190deg) brightness(0.9) contrast(1.2) saturate(1.5)',
                        zIndex: 0
                    }).addTo(state.map);

                    // 3. 省份图层
                    state.provinceLayer = new maptalks.VectorLayer('province-layer', { zIndex: 5 }).addTo(state.map);

                    // 4. 加载数据并设置掩模
                    try {
                        const res = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
                        state.chinaFullGeo = await res.json();
                        
                        const geometries = maptalks.GeoJSON.toGeometry(state.chinaFullGeo);
                        state.baseLayer.setMask(geometries[0]);

                        geometries.forEach(geo => {
                            geo.setSymbol({
                                'polygonFill': 'transparent',
                                'lineColor': '#0ea5e9',
                                'lineWidth': 1,
                                'lineOpacity': 0.2
                            });

                            geo.on('mouseenter', (e) => {
                                e.target.updateSymbol({ 'polygonFill': 'rgba(14, 165, 233, 0.05)', 'lineOpacity': 0.6 });
                                state.map.setCursor('pointer');
                            });
                            geo.on('mouseleave', (e) => {
                                e.target.updateSymbol({ 'polygonFill': 'transparent', 'lineOpacity': 0.2 });
                                state.map.setCursor('default');
                            });
                            geo.on('click', (e) => drillDown(e.target));

                            geo.addTo(state.provinceLayer);
                        });
                    } catch (e) {
                        console.error("GeoJSON Load Error", e);
                    }

                    // 5. 初始化 ECharts
                    initECharts();
                };

                const initECharts = () => {
                    const option = {
                        animation: false,
                        GLMap: {},
                        series: [
                            {
                                type: 'lines',
                                coordinateSystem: 'GLMap',
                                zlevel: 1,
                                effect: { show: true, period: 3, trailLength: 0.4, color: '#38bdf8', symbolSize: 4 },
                                lineStyle: { normal: { color: '#38bdf8', width: 0, curveness: 0.3 } },
                                data: domesticRoutes.map(r => ({ coords: [chinaHubs[r.from], chinaHubs[r.to]] }))
                            },
                            {
                                type: 'effectScatter',
                                coordinateSystem: 'GLMap',
                                zlevel: 3,
                                rippleEffect: { brushType: 'stroke', scale: 4 },
                                label: {
                                    normal: {
                                        show: true, position: 'right', formatter: '{b}',
                                        textStyle: { color: '#94a3b8', fontSize: 11, fontWeight: 'bold' }
                                    }
                                },
                                itemStyle: { normal: { color: '#fbbf24' } },
                                data: Object.keys(chinaHubs).map(name => ({
                                    name: name, value: chinaHubs[name].concat([100])
                                }))
                            }
                        ]
                    };

                    state.e3Layer = new maptalks.E3Layer('e3', option).addTo(state.map);
                    
                    // 确保 ECharts 渲染对齐
                    setTimeout(() => {
                        const ins = state.e3Layer.getEChartsInstance();
                        if(ins) ins.resize();
                    }, 1000);
                };

                const drillDown = (geometry) => {
                    const provinceName = geometry.getProperties().name;
                    
                    // 更新底图掩模
                    state.baseLayer.setMask(geometry);

                    // 平滑缩放
                    state.map.animateTo({
                        center: geometry.getCenter(),
                        zoom: (['内蒙古自治区', '新疆维吾尔自治区', '西藏自治区'].includes(provinceName)) ? 5 : 7,
                        pitch: 0
                    }, { duration: 800 });

                    // 更新 UI 响应式状态
                    ui.title = provinceName + '物流枢纽';
                    ui.subtitle = 'Regional Hub Analysis';
                    ui.isDrilled = true;
                    ui.status = 'ACTIVE';
                    ui.nodeCount = 1;
                    ui.orders = '12.4k';

                    // 隐藏非选中区域
                    state.provinceLayer.getGeometries().forEach(g => {
                        if(g !== geometry) g.hide();
                        else g.updateSymbol({ 'lineOpacity': 1, 'lineWidth': 2 });
                    });
                };

                const rollUp = () => {
                    const nationalMask = maptalks.GeoJSON.toGeometry(state.chinaFullGeo)[0];
                    state.baseLayer.setMask(nationalMask);

                    state.map.animateTo({
                        center: [106.5, 37.5],
                        zoom: 4.5,
                        pitch: 0
                    }, { duration: 1000 });

                    // 重置 UI 状态
                    ui.title = '中国物流监控中心';
                    ui.subtitle = 'National Hub Matrix';
                    ui.isDrilled = false;
                    ui.status = 'NORMAL';
                    ui.nodeCount = 42;
                    ui.orders = '128.5k';

                    state.provinceLayer.getGeometries().forEach(g => {
                        g.show();
                        g.updateSymbol({ 'lineOpacity': 0.2, 'lineWidth': 1 });
                    });
                };

                const resetView = () => {
                    if (ui.isDrilled) return;
                    rollUp();
                };

                return { mapRef, ui, rollUp, resetView };
            }
        }).mount('#app');
    </script>
</body>
</html>