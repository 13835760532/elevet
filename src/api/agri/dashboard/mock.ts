import dayjs from 'dayjs'

const mockMonths = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

interface RegionQueryParams {
  provinceName?: string
  cityName?: string
}

interface ProvinceProfile {
  sampleFactor: number
  rateBias: number
  taskFactor: number
  certificateFactor: number
  fastFactor: number
}

const cityMapSeed = [
  { provinceName: '山东省', cityName: '潍坊市', districtName: '寿光市', areaNameCity: '潍坊市', areaNameDistrict: '潍坊-寿光市', sampleCount: 3520, positiveRate: 3.84 },
  { provinceName: '山东省', cityName: '临沂市', districtName: '兰山区', areaNameCity: '临沂市', areaNameDistrict: '临沂-兰山区', sampleCount: 3310, positiveRate: 3.56 },
  { provinceName: '山东省', cityName: '青岛市', districtName: '黄岛区', areaNameCity: '青岛市', areaNameDistrict: '青岛-黄岛区', sampleCount: 2980, positiveRate: 3.31 },
  { provinceName: '山东省', cityName: '济南市', districtName: '历下区', areaNameCity: '济南市', areaNameDistrict: '济南-历下区', sampleCount: 2740, positiveRate: 3.08 },
  { provinceName: '山东省', cityName: '烟台市', districtName: '芝罘区', areaNameCity: '烟台市', areaNameDistrict: '烟台-芝罘区', sampleCount: 2510, positiveRate: 2.96 },
  { provinceName: '山东省', cityName: '德州市', districtName: '德城区', areaNameCity: '德州市', areaNameDistrict: '德州-德城区', sampleCount: 2280, positiveRate: 2.82 },
  { provinceName: '山东省', cityName: '聊城市', districtName: '东昌府区', areaNameCity: '聊城市', areaNameDistrict: '聊城-东昌府区', sampleCount: 2060, positiveRate: 2.71 },
  { provinceName: '山东省', cityName: '滨州市', districtName: '邹平市', areaNameCity: '滨州市', areaNameDistrict: '滨州-邹平市', sampleCount: 1880, positiveRate: 2.63 },
  { provinceName: '山东省', cityName: '泰安市', districtName: '泰山区', areaNameCity: '泰安市', areaNameDistrict: '泰安-泰山区', sampleCount: 1710, positiveRate: 2.48 },
  { provinceName: '山东省', cityName: '菏泽市', districtName: '牡丹区', areaNameCity: '菏泽市', areaNameDistrict: '菏泽-牡丹区', sampleCount: 1560, positiveRate: 2.32 }
]

const provinceAreaSeedMap: Record<string, typeof cityMapSeed> = {
  山东省: cityMapSeed,
  北京市: [
    { provinceName: '北京市', cityName: '北京市', districtName: '朝阳区', areaNameCity: '北京市', areaNameDistrict: '北京-朝阳区', sampleCount: 2140, positiveRate: 2.26 },
    { provinceName: '北京市', cityName: '北京市', districtName: '海淀区', areaNameCity: '北京市', areaNameDistrict: '北京-海淀区', sampleCount: 1980, positiveRate: 2.14 },
    { provinceName: '北京市', cityName: '北京市', districtName: '昌平区', areaNameCity: '北京市', areaNameDistrict: '北京-昌平区', sampleCount: 1820, positiveRate: 2.38 },
    { provinceName: '北京市', cityName: '北京市', districtName: '通州区', areaNameCity: '北京市', areaNameDistrict: '北京-通州区', sampleCount: 1680, positiveRate: 2.08 },
    { provinceName: '北京市', cityName: '北京市', districtName: '大兴区', areaNameCity: '北京市', areaNameDistrict: '北京-大兴区', sampleCount: 1540, positiveRate: 2.18 },
    { provinceName: '北京市', cityName: '北京市', districtName: '顺义区', areaNameCity: '北京市', areaNameDistrict: '北京-顺义区', sampleCount: 1430, positiveRate: 2.02 }
  ],
  江苏省: [
    { provinceName: '江苏省', cityName: '苏州市', districtName: '吴中区', areaNameCity: '苏州市', areaNameDistrict: '苏州-吴中区', sampleCount: 3080, positiveRate: 2.42 },
    { provinceName: '江苏省', cityName: '南京市', districtName: '江宁区', areaNameCity: '南京市', areaNameDistrict: '南京-江宁区', sampleCount: 2890, positiveRate: 2.36 },
    { provinceName: '江苏省', cityName: '无锡市', districtName: '惠山区', areaNameCity: '无锡市', areaNameDistrict: '无锡-惠山区', sampleCount: 2610, positiveRate: 2.28 },
    { provinceName: '江苏省', cityName: '常州市', districtName: '武进区', areaNameCity: '常州市', areaNameDistrict: '常州-武进区', sampleCount: 2380, positiveRate: 2.31 },
    { provinceName: '江苏省', cityName: '南通市', districtName: '通州区', areaNameCity: '南通市', areaNameDistrict: '南通-通州区', sampleCount: 2190, positiveRate: 2.18 },
    { provinceName: '江苏省', cityName: '徐州市', districtName: '铜山区', areaNameCity: '徐州市', areaNameDistrict: '徐州-铜山区', sampleCount: 2050, positiveRate: 2.24 }
  ],
  广东省: [
    { provinceName: '广东省', cityName: '广州市', districtName: '白云区', areaNameCity: '广州市', areaNameDistrict: '广州-白云区', sampleCount: 3360, positiveRate: 2.72 },
    { provinceName: '广东省', cityName: '佛山市', districtName: '南海区', areaNameCity: '佛山市', areaNameDistrict: '佛山-南海区', sampleCount: 3120, positiveRate: 2.64 },
    { provinceName: '广东省', cityName: '深圳市', districtName: '宝安区', areaNameCity: '深圳市', areaNameDistrict: '深圳-宝安区', sampleCount: 2960, positiveRate: 2.48 },
    { provinceName: '广东省', cityName: '东莞市', districtName: '虎门镇', areaNameCity: '东莞市', areaNameDistrict: '东莞-虎门镇', sampleCount: 2740, positiveRate: 2.58 },
    { provinceName: '广东省', cityName: '惠州市', districtName: '惠城区', areaNameCity: '惠州市', areaNameDistrict: '惠州-惠城区', sampleCount: 2480, positiveRate: 2.41 },
    { provinceName: '广东省', cityName: '中山市', districtName: '火炬开发区', areaNameCity: '中山市', areaNameDistrict: '中山-火炬开发区', sampleCount: 2210, positiveRate: 2.36 }
  ],
  浙江省: [
    { provinceName: '浙江省', cityName: '杭州市', districtName: '余杭区', areaNameCity: '杭州市', areaNameDistrict: '杭州-余杭区', sampleCount: 2980, positiveRate: 2.18 },
    { provinceName: '浙江省', cityName: '宁波市', districtName: '鄞州区', areaNameCity: '宁波市', areaNameDistrict: '宁波-鄞州区', sampleCount: 2760, positiveRate: 2.11 },
    { provinceName: '浙江省', cityName: '温州市', districtName: '瑞安市', areaNameCity: '温州市', areaNameDistrict: '温州-瑞安市', sampleCount: 2590, positiveRate: 2.26 },
    { provinceName: '浙江省', cityName: '嘉兴市', districtName: '桐乡市', areaNameCity: '嘉兴市', areaNameDistrict: '嘉兴-桐乡市', sampleCount: 2360, positiveRate: 2.08 },
    { provinceName: '浙江省', cityName: '绍兴市', districtName: '柯桥区', areaNameCity: '绍兴市', areaNameDistrict: '绍兴-柯桥区', sampleCount: 2210, positiveRate: 2.04 },
    { provinceName: '浙江省', cityName: '台州市', districtName: '温岭市', areaNameCity: '台州市', areaNameDistrict: '台州-温岭市', sampleCount: 2050, positiveRate: 2.12 }
  ]
}

const provinceProfiles: Record<string, ProvinceProfile> = {
  山东省: { sampleFactor: 1, rateBias: 0, taskFactor: 1, certificateFactor: 1, fastFactor: 1 },
  北京市: { sampleFactor: 0.62, rateBias: -0.42, taskFactor: 0.66, certificateFactor: 0.58, fastFactor: 0.64 },
  江苏省: { sampleFactor: 0.91, rateBias: -0.28, taskFactor: 0.94, certificateFactor: 0.96, fastFactor: 0.88 },
  广东省: { sampleFactor: 1.08, rateBias: 0.22, taskFactor: 1.04, certificateFactor: 1.12, fastFactor: 1.06 },
  浙江省: { sampleFactor: 0.86, rateBias: -0.34, taskFactor: 0.9, certificateFactor: 0.93, fastFactor: 0.84 }
}


const categorySeed = [
  { category: '蔬菜', sampleCount: 7420, positiveRate: 3.86 },
  { category: '水果', sampleCount: 4860, positiveRate: 2.94 },
  { category: '粮油', sampleCount: 2680, positiveRate: 1.42 },
  { category: '禽畜', sampleCount: 2140, positiveRate: 1.76 },
  { category: '水产', sampleCount: 1630, positiveRate: 2.18 },
  { category: '茶叶', sampleCount: 920, positiveRate: 4.12 }
]

const productPesticideSeed = [
  { productName: '豇豆', pesticideName: '灭蝇胺', detectionCount: 612, positiveRate: 6.42 },
  { productName: '芹菜', pesticideName: '毒死蜱', detectionCount: 588, positiveRate: 5.96 },
  { productName: '韭菜', pesticideName: '腐霉利', detectionCount: 561, positiveRate: 5.68 },
  { productName: '菠菜', pesticideName: '阿维菌素', detectionCount: 536, positiveRate: 5.33 },
  { productName: '黄瓜', pesticideName: '氟虫腈', detectionCount: 498, positiveRate: 4.91 },
  { productName: '豆角', pesticideName: '灭多威', detectionCount: 472, positiveRate: 4.68 },
  { productName: '白菜', pesticideName: '甲拌磷', detectionCount: 438, positiveRate: 4.26 },
  { productName: '番茄', pesticideName: '吡虫啉', detectionCount: 402, positiveRate: 3.92 },
  { productName: '茄子', pesticideName: '噻虫胺', detectionCount: 378, positiveRate: 3.64 },
  { productName: '生姜', pesticideName: '克百威', detectionCount: 344, positiveRate: 3.38 }
]

const produceSeed = [
  { productName: '芹菜', detectionCount: 1260, positiveRate: 4.82 },
  { productName: '韭菜', detectionCount: 1190, positiveRate: 4.51 },
  { productName: '菠菜', detectionCount: 1130, positiveRate: 4.18 },
  { productName: '豇豆', detectionCount: 1060, positiveRate: 3.96 },
  { productName: '黄瓜', detectionCount: 982, positiveRate: 3.74 },
  { productName: '豆角', detectionCount: 916, positiveRate: 3.48 },
  { productName: '白菜', detectionCount: 844, positiveRate: 3.12 },
  { productName: '茄子', detectionCount: 778, positiveRate: 2.96 },
  { productName: '南瓜', detectionCount: 722, positiveRate: 2.61 },
  { productName: '生姜', detectionCount: 668, positiveRate: 2.38 }
]

const pesticideSeed = [
  { pesticideName: '毒死蜱', detectionCount: 1480, positiveRate: 4.68 },
  { pesticideName: '灭蝇胺', detectionCount: 1360, positiveRate: 4.33 },
  { pesticideName: '阿维菌素', detectionCount: 1280, positiveRate: 4.06 },
  { pesticideName: '腐霉利', detectionCount: 1190, positiveRate: 3.82 },
  { pesticideName: '氟虫腈', detectionCount: 1080, positiveRate: 3.58 },
  { pesticideName: '啶虫脒', detectionCount: 996, positiveRate: 3.21 },
  { pesticideName: '甲拌磷', detectionCount: 914, positiveRate: 2.96 },
  { pesticideName: '噻虫嗪', detectionCount: 852, positiveRate: 2.64 },
  { pesticideName: '克百威', detectionCount: 796, positiveRate: 2.41 },
  { pesticideName: '腈菌唑', detectionCount: 742, positiveRate: 2.18 }
]

const dashboardDetectionTrend = [1180, 1460, 1980, 2460, 2840, 3120, 2980, 2860, 2540, 2210, 1760, 1380]
const dashboardPositiveRateTrend = [2.18, 2.46, 2.84, 3.06, 3.28, 3.54, 3.61, 3.42, 3.08, 2.76, 2.44, 2.22]
const fastSampleTrend = [680, 840, 1100, 1360, 1520, 1660, 1580, 1490, 1320, 1180, 920, 760]
const fastPositiveRateTrend = [1.82, 2.04, 2.36, 2.68, 2.92, 3.11, 3.18, 3.02, 2.74, 2.41, 2.16, 1.94]
const certificateIssueTrend = [860, 940, 1080, 1220, 1360, 1490, 1430, 1380, 1270, 1180, 1010, 920]
const certificateVerificationTrend = [620, 710, 820, 930, 1040, 1120, 1080, 1020, 950, 870, 760, 690]
const certificateTraceTrend = [180, 220, 260, 300, 340, 380, 360, 342, 318, 292, 248, 216]
const taskSampleTrend = [720, 960, 1240, 1460, 1680, 1860, 1790, 1710, 1540, 1360, 1120, 880]
const taskItemTrend = [1260, 1680, 2120, 2480, 2860, 3140, 3020, 2890, 2610, 2280, 1860, 1490]
const taskSamplePositiveRateTrend = [1.46, 1.72, 2.08, 2.34, 2.61, 2.88, 2.94, 2.76, 2.42, 2.11, 1.78, 1.52]
const taskItemPositiveRateTrend = [1.92, 2.18, 2.46, 2.82, 3.16, 3.42, 3.48, 3.22, 2.86, 2.48, 2.16, 1.88]

const calcPositiveCount = (count: number, rate: number) => Math.round((count * rate) / 100)

const normalizeProvinceName = (provinceName?: string) => {
  if (!provinceName) return '山东省'
  if (provinceAreaSeedMap[provinceName]) return provinceName
  const matched = Object.keys(provinceAreaSeedMap).find((key) => provinceName.includes(key.replace('省', '').replace('市', '')))
  return matched || '山东省'
}

const getProvinceProfile = (provinceName?: string) => provinceProfiles[normalizeProvinceName(provinceName)] || provinceProfiles['山东省']

const getAreaSeed = (params?: RegionQueryParams) => {
  const provinceKey = normalizeProvinceName(params?.provinceName)
  const citySeed = provinceAreaSeedMap[provinceKey] || cityMapSeed
  if (!params?.cityName) return citySeed
  const filtered = citySeed.filter((item) => item.cityName === params.cityName || item.areaNameCity === params.cityName)
  return filtered.length ? filtered : citySeed
}

const scaleTrendValues = (values: number[], factor: number) => values.map((item) => Math.round(item * factor))
const shiftRateValues = (values: number[], bias: number) =>
  values.map((item) => Number(Math.max(0.8, item + bias).toFixed(2)))

const buildTrendList = (counts: number[], rates: number[], statType: '1' | '2') =>
  mockMonths.map((month, index) => ({
    month,
    detectionCount: counts[index],
    positiveCount: calcPositiveCount(counts[index], rates[index]),
    positiveRate: rates[index],
    statValue: statType === '2' ? rates[index] : counts[index]
  }))

const pickAreaName = (item: (typeof cityMapSeed)[number], areaLevel: '1' | '2') =>
  areaLevel === '2' ? item.areaNameDistrict : item.areaNameCity

const pickDistrict = (item: (typeof cityMapSeed)[number], areaLevel: '1' | '2') =>
  areaLevel === '2' ? item.districtName : ''

const sortByStatType = <T extends { detectionCount?: number; positiveRate?: number; statValue?: number }>(
  list: T[],
  statType: '1' | '2'
) =>
  [...list].sort((a, b) =>
    statType === '2'
      ? Number(b.positiveRate || 0) - Number(a.positiveRate || 0)
      : Number(b.detectionCount || 0) - Number(a.detectionCount || 0)
  )

export const shouldUseDashboardMock = () => dayjs().month() + 1 < 6

export const resolveDashboardMock = async <T>(factory: () => T): Promise<T> => Promise.resolve(factory())

export const getMockDashboardOverview = (params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  const areaSeed = getAreaSeed(params)
  const sampleCount = areaSeed.reduce((sum, item) => sum + Math.round(item.sampleCount * profile.sampleFactor), 0)
  const avgRate = areaSeed.reduce((sum, item) => sum + Math.max(0.8, item.positiveRate + profile.rateBias), 0) / areaSeed.length
  const taskIssuedCount = Math.round(sampleCount * 0.55 * profile.taskFactor)
  const certificateIssueCount = Math.round(sampleCount * 1.38 * profile.certificateFactor)
  return {
    supervisorCount: Math.max(18, Math.round(126 * profile.sampleFactor)),
    detectionOrgCount: Math.max(10, Math.round(58 * profile.sampleFactor)),
    enterpriseCount: Math.max(120, Math.round(1480 * profile.sampleFactor)),
    taskIssuedCount,
    taskCompletedCount: Math.round(taskIssuedCount * 0.868),
    taskCompletionRate: 86.8,
    sampleCount,
    detectionItemCount: Math.round(sampleCount * 3.11),
    certificateIssueCount,
    certificateVerifyCount: Math.round(certificateIssueCount * 0.84)
  }
}

export const getMockDashboardTrend = (statType: '1' | '2', params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  return buildTrendList(
    scaleTrendValues(dashboardDetectionTrend, profile.sampleFactor),
    shiftRateValues(dashboardPositiveRateTrend, profile.rateBias),
    statType
  )
}

export const getMockRiskAreaTop10 = (areaLevel: '1' | '2', params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  return getAreaSeed(params).map((item, index) => ({
    rank: index + 1,
    provinceName: item.provinceName,
    cityName: item.cityName,
    districtName: pickDistrict(item, areaLevel),
    areaName: pickAreaName(item, areaLevel),
    detectionCount: Math.round(item.sampleCount * profile.sampleFactor),
    positiveCount: calcPositiveCount(Math.round(item.sampleCount * profile.sampleFactor), Math.max(0.8, item.positiveRate + profile.rateBias)),
    positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias).toFixed(2))
  }))
}

export const getMockProductPesticideTop10 = (statType: '1' | '2', params?: RegionQueryParams) =>
  sortByStatType(
    (() => {
      const profile = getProvinceProfile(params?.provinceName)
      return productPesticideSeed.map((item) => ({
        ...item,
        detectionCount: Math.round(item.detectionCount * profile.sampleFactor),
        positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias).toFixed(2))
      }))
    })().map((item) => ({
      ...item,
      rank: 0,
      combineName: `${item.productName}-${item.pesticideName}`,
      positiveCount: calcPositiveCount(item.detectionCount, item.positiveRate),
      statValue: statType === '2' ? item.positiveRate : item.detectionCount
    })),
    statType
  ).map((item, index) => ({ ...item, rank: index + 1 }))

export const getMockProduceRiskTop10 = (statType: '1' | '2', params?: RegionQueryParams) =>
  sortByStatType(
    (() => {
      const profile = getProvinceProfile(params?.provinceName)
      return produceSeed.map((item) => ({
        ...item,
        detectionCount: Math.round(item.detectionCount * profile.sampleFactor),
        positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias).toFixed(2))
      }))
    })().map((item) => ({
      ...item,
      rank: 0,
      positiveCount: calcPositiveCount(item.detectionCount, item.positiveRate),
      statValue: statType === '2' ? item.positiveRate : item.detectionCount
    })),
    statType
  ).map((item, index) => ({ ...item, rank: index + 1 }))

export const getMockPesticideRiskTop10 = (statType: '1' | '2') =>
  sortByStatType(
    (() => {
      const profile = getProvinceProfile(params?.provinceName)
      return pesticideSeed.map((item) => ({
        ...item,
        detectionCount: Math.round(item.detectionCount * profile.sampleFactor),
        positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias).toFixed(2))
      }))
    })().map((item) => ({
      ...item,
      rank: 0,
      positiveCount: calcPositiveCount(item.detectionCount, item.positiveRate),
      statValue: statType === '2' ? item.positiveRate : item.detectionCount
    })),
    statType
  ).map((item, index) => ({ ...item, rank: index + 1 }))

export const getMockDashboardMapData = (areaLevel: '1' | '2', params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  return getAreaSeed(params).map((item) => ({
    provinceName: item.provinceName,
    cityName: item.cityName,
    districtName: pickDistrict(item, areaLevel),
    areaName: pickAreaName(item, areaLevel),
    sampleCount: Math.round(item.sampleCount * profile.sampleFactor),
    detectionItemCount: Math.round(item.sampleCount * profile.sampleFactor * 3.12),
    positiveCount: calcPositiveCount(Math.round(item.sampleCount * profile.sampleFactor), Math.max(0.8, item.positiveRate + profile.rateBias)),
    positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias).toFixed(2))
  }))
}

export const getMockCategoryRisk = (statType: '1' | '2', params?: RegionQueryParams) =>
  sortByStatType(
    (() => {
      const profile = getProvinceProfile(params?.provinceName)
      return categorySeed.map((item) => ({
        ...item,
        sampleCount: Math.round(item.sampleCount * profile.sampleFactor),
        positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias).toFixed(2))
      }))
    })().map((item) => ({
      ...item,
      positiveCount: calcPositiveCount(item.sampleCount, item.positiveRate),
      statValue: statType === '2' ? item.positiveRate : item.sampleCount,
      detectionCount: item.sampleCount
    })),
    statType
  )

export const getMockFastOverview = (params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  return {
    sampleBatchCount: Math.round(3860 * profile.fastFactor),
    detectionItemCount: Math.round(12840 * profile.fastFactor),
    itemPositiveRate: Number(Math.max(0.8, 2.74 + profile.rateBias * 0.8).toFixed(2)),
    enterpriseCount: Math.max(60, Math.round(420 * profile.fastFactor)),
    productVarietyCount: Math.max(20, Math.round(96 * profile.fastFactor))
  }
}

export const getMockFastPositiveRateTrend = (params?: RegionQueryParams) => ({
  xaxis: mockMonths,
  positiveRates: shiftRateValues(fastPositiveRateTrend, getProvinceProfile(params?.provinceName).rateBias * 0.8)
})

export const getMockFastSelfSampleTrend = (params?: RegionQueryParams) => ({
  xaxis: mockMonths,
  sampleCounts: scaleTrendValues(fastSampleTrend, getProvinceProfile(params?.provinceName).fastFactor)
})

export const getMockFastPesticideTop10 = (params?: RegionQueryParams) =>
  getMockPesticideRiskTop10('1', params).map((item) => ({
    rank: item.rank,
    pesticideName: item.pesticideName,
    detectionCount: item.detectionCount,
    positiveCount: item.positiveCount,
    positiveRate: item.positiveRate
  }))

export const getMockFastCategoryTop10 = (statType: '1' | '2', params?: RegionQueryParams) =>
  sortByStatType(
    (() => {
      const profile = getProvinceProfile(params?.provinceName)
      return categorySeed.map((item) => ({
        ...item,
        sampleCount: Math.round(item.sampleCount * profile.fastFactor),
        positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias * 0.8).toFixed(2))
      }))
    })().map((item) => ({
      rank: 0,
      category: item.category,
      detectionCount: Math.round(item.sampleCount * 0.46),
      positiveCount: calcPositiveCount(Math.round(item.sampleCount * 0.46), item.positiveRate),
      positiveRate: item.positiveRate,
      statValue: statType === '2' ? item.positiveRate : Math.round(item.sampleCount * 0.46)
    })),
    statType
  ).map((item, index) => ({ ...item, rank: index + 1 }))

export const getMockFastMap = (areaLevel: '1' | '2', params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  return getAreaSeed(params).map((item) => ({
    areaName: pickAreaName(item, areaLevel),
    provinceName: item.provinceName,
    cityName: item.cityName,
    districtName: pickDistrict(item, areaLevel),
    sampleCount: Math.round(item.sampleCount * 0.42 * profile.fastFactor),
    positiveCount: calcPositiveCount(Math.round(item.sampleCount * 0.42 * profile.fastFactor), Math.max(0.8, item.positiveRate + profile.rateBias * 0.8)),
    positiveRate: Number(Math.max(0.8, item.positiveRate + profile.rateBias * 0.8).toFixed(2))
  }))
}

export const getMockFastCategoryDistribution = (params?: RegionQueryParams) =>
  categorySeed.map((item) => ({
    category: item.category,
    sampleCount: Math.round(item.sampleCount * 0.36 * getProvinceProfile(params?.provinceName).fastFactor)
  }))

export const getMockFastCategoryPesticideTop10 = (params?: RegionQueryParams) =>
  getMockProductPesticideTop10('1', params).map((item) => ({
    rank: item.rank,
    category: item.productName,
    pesticideName: item.pesticideName,
    combineName: item.combineName,
    detectionCount: Math.round(item.detectionCount * 0.62),
    positiveCount: calcPositiveCount(Math.round(item.detectionCount * 0.62), item.positiveRate),
    positiveRate: item.positiveRate
  }))

export const getMockCertificateOverview = (params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  return {
    issueCount: Math.round(12680 * profile.certificateFactor),
    verificationCount: Math.round(9420 * profile.certificateFactor),
    traceCount: Math.round(3680 * profile.certificateFactor),
    issueSubjectCount: Math.max(80, Math.round(860 * profile.certificateFactor)),
    verificationSubjectCount: Math.max(60, Math.round(620 * profile.certificateFactor))
  }
}

export const getMockCertificateServiceTrend = (params?: RegionQueryParams) => ({
  xaxis: mockMonths,
  issueCounts: scaleTrendValues(certificateIssueTrend, getProvinceProfile(params?.provinceName).certificateFactor),
  verificationCounts: scaleTrendValues(certificateVerificationTrend, getProvinceProfile(params?.provinceName).certificateFactor),
  traceCounts: scaleTrendValues(certificateTraceTrend, getProvinceProfile(params?.provinceName).certificateFactor)
})

export const getMockCertificateIssueTop10 = (params?: RegionQueryParams) =>
  ['寿光蔬菜合作社', '泉城果蔬中心', '青禾家庭农场', '临沂优鲜基地', '海川种植基地', '绿源农副产品', '胶州现代农业园', '烟台果蔬联盟', '金穗农业服务社', '泰岳农产公司'].map((subjectName, index) => ({
    rank: index + 1,
    subjectId: index + 1,
    subjectName,
    count: Math.round((920 - index * 58) * getProvinceProfile(params?.provinceName).certificateFactor)
  }))

export const getMockCertificateMap = (areaLevel: '1' | '2', params?: RegionQueryParams) => ({
  issueList: getAreaSeed(params).map((item, index) => ({
    areaName: pickAreaName(item, areaLevel),
    provinceName: item.provinceName,
    cityName: item.cityName,
    districtName: pickDistrict(item, areaLevel),
    count: Math.round((820 - index * 54) * getProvinceProfile(params?.provinceName).certificateFactor)
  })),
  verificationList: getAreaSeed(params).map((item, index) => ({
    areaName: pickAreaName(item, areaLevel),
    provinceName: item.provinceName,
    cityName: item.cityName,
    districtName: pickDistrict(item, areaLevel),
    count: Math.round((610 - index * 41) * getProvinceProfile(params?.provinceName).certificateFactor)
  }))
})

export const getMockCertificateCategoryDistribution = (params?: RegionQueryParams) =>
  [
    { category: '蔬菜', issueCount: 4360 },
    { category: '水果', issueCount: 3320 },
    { category: '粮油', issueCount: 1850 },
    { category: '禽畜', issueCount: 1640 },
    { category: '水产', issueCount: 1510 }
  ].map((item) => ({
    ...item,
    issueCount: Math.round(item.issueCount * getProvinceProfile(params?.provinceName).certificateFactor)
  }))

export const getMockCertificateVerificationTop10 = (params?: RegionQueryParams) =>
  ['寿光流通中心', '青岛西海岸商超', '历下区批发市场', '临沂农产品城', '烟台生鲜中心', '德州市场监管站', '聊城配送中心', '滨州仓配中心', '泰安批发市场', '菏泽便民市场'].map((subjectName, index) => ({
    rank: index + 1,
    subjectId: index + 101,
    subjectName,
    count: Math.round((680 - index * 39) * getProvinceProfile(params?.provinceName).certificateFactor)
  }))

export const getMockCertificateTypeDistribution = (params?: RegionQueryParams) => [
  { certificateType: 1, typeName: '生产者', count: Math.round(6480 * getProvinceProfile(params?.provinceName).certificateFactor) },
  { certificateType: 2, typeName: '收购者', count: Math.round(3920 * getProvinceProfile(params?.provinceName).certificateFactor) },
  { certificateType: 3, typeName: '批发市场', count: Math.round(2280 * getProvinceProfile(params?.provinceName).certificateFactor) }
]

export const getMockTaskOverview = (params?: RegionQueryParams) => {
  const profile = getProvinceProfile(params?.provinceName)
  return {
    taskIssuedCount: Math.round(9620 * profile.taskFactor),
    taskCompletedCount: Math.round(8350 * profile.taskFactor),
    taskCompletionRate: 86.8,
    detectionOrgCount: Math.max(10, Math.round(58 * profile.taskFactor)),
    enterpriseCount: Math.max(120, Math.round(1480 * profile.taskFactor))
  }
}

export const getMockTaskMap = (areaLevel: '1' | '2', params?: RegionQueryParams) =>
  getAreaSeed(params).map((item, index) => ({
    areaName: pickAreaName(item, areaLevel),
    provinceName: item.provinceName,
    cityName: item.cityName,
    districtName: pickDistrict(item, areaLevel),
    taskIssuedCount: Math.round((920 - index * 54) * getProvinceProfile(params?.provinceName).taskFactor),
    taskCompletedCount: Math.round((804 - index * 48) * getProvinceProfile(params?.provinceName).taskFactor),
    taskCompletionRate: Number((((804 - index * 48) / (920 - index * 54)) * 100).toFixed(2))
  }))

export const getMockTaskCategoryDistribution = (params?: RegionQueryParams) =>
  [
    { category: '蔬菜', sampleCount: 3820 },
    { category: '水果', sampleCount: 2240 },
    { category: '粮油', sampleCount: 1360 },
    { category: '茶叶', sampleCount: 980 },
    { category: '禽畜', sampleCount: 1220 }
  ].map((item) => ({
    ...item,
    sampleCount: Math.round(item.sampleCount * getProvinceProfile(params?.provinceName).taskFactor)
  }))

export const getMockTaskAnalysisPage = (pageNo = 1, pageSize = 10, params?: RegionQueryParams) => {
  const cities = getAreaSeed(params)
  const profile = getProvinceProfile(params?.provinceName)
  const fullList = Array.from({ length: 18 }, (_, index) => {
    const sampleCount = Math.round((360 + index * 24) * profile.taskFactor)
    const completionRate = Number((82.4 + (index % 6) * 2.1).toFixed(2))
    return {
      taskId: 1000 + index + 1,
      taskName: `2026年专项抽检任务-${index + 1}`,
      undertakeDeptName: `${cities[index % cities.length]?.cityName || '山东省'}检测中心`,
      sampleCount,
      sampleCompletedCount: Math.round((sampleCount * completionRate) / 100),
      completionRate,
      createTime: `2026-05-${String((index % 28) + 1).padStart(2, '0')} 10:00:00`
    }
  })
  const start = (pageNo - 1) * pageSize
  return {
    total: fullList.length,
    list: fullList.slice(start, start + pageSize)
  }
}

export const getMockTaskVolumeTrend = (params?: RegionQueryParams) => ({
  xaxis: mockMonths,
  sampleCounts: scaleTrendValues(taskSampleTrend, getProvinceProfile(params?.provinceName).taskFactor),
  itemCounts: scaleTrendValues(taskItemTrend, getProvinceProfile(params?.provinceName).taskFactor)
})

export const getMockTaskRiskTrend = (params?: RegionQueryParams) => ({
  xaxis: mockMonths,
  samplePositiveRates: shiftRateValues(taskSamplePositiveRateTrend, getProvinceProfile(params?.provinceName).rateBias * 0.7),
  itemPositiveRates: shiftRateValues(taskItemPositiveRateTrend, getProvinceProfile(params?.provinceName).rateBias * 0.7)
})
