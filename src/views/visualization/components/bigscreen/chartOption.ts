import echarts from '@/plugins/echarts'

interface CreateBigScreenLineOptionParams {
  labels: string[]
  values: number[]
  formatter?: string | ((value: number) => string)
  rotate?: number
  max?: number
  grid?: {
    left?: number
    right?: number
    top?: number
    bottom?: number
  }
}

const calcAutoMax = (values: number[], formatter?: string | ((value: number) => string)) => {
  const maxValue = Math.max(...values, 0)
  const isPercent = formatter === '{value}%' || typeof formatter === 'function'
  if (!maxValue) return isPercent ? 100 : 100
  if (isPercent && maxValue <= 100) {
    return Math.min(100, Math.ceil(maxValue / 10) * 10)
  }
  return Math.ceil(maxValue * 1.2)
}

export const createBigScreenLineOption = ({
  labels,
  values,
  formatter,
  rotate = 0,
  max,
  grid
}: CreateBigScreenLineOptionParams) => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: 40,
    right: 16,
    top: 18,
    bottom: 28,
    ...grid
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: labels,
    axisLabel: {
      color: '#90b5da',
      fontSize: 11,
      interval: 0,
      rotate
    },
    axisLine: {
      lineStyle: {
        color: '#2d67ac'
      }
    },
    axisTick: {
      show: false
    }
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: max ?? calcAutoMax(values, formatter),
    axisLabel: {
      color: '#90b5da',
      formatter: formatter || '{value}'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(45, 106, 184, 0.35)',
        type: 'dashed'
      }
    },
    axisLine: {
      show: false
    }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        color: '#4deaff',
        width: 2
      },
      itemStyle: {
        color: '#48e8ff',
        borderColor: '#fff',
        borderWidth: 1
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(72, 232, 255, 0.38)' },
          { offset: 1, color: 'rgba(72, 232, 255, 0.03)' }
        ])
      },
      data: values
    }
  ]
})
