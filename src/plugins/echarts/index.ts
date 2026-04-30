import echarts from 'echarts'

// 挂载到全局，解决某些插件（如 maptalks.e3）找不到 echarts 的问题
if (typeof window !== 'undefined') {
  ;(window as any).echarts = echarts
}

export default echarts
