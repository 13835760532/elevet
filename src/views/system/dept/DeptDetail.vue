<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
    <div v-loading="loading">
      <el-descriptions border :column="2" class="detail-descriptions">
        <el-descriptions-item label="机构名称" :span="2">
          {{ deptData.name || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="生产经营企业">
          <dict-tag :type="DICT_TYPE.SYSTEM_DEPT_TYPE" :value="deptData.deptType" />
          <span v-if="!deptData.deptType && deptData.deptType !== 0">--</span>
        </el-descriptions-item>
        <el-descriptions-item label="机构行政级别">
          {{ formatAreaLevel(deptData.areaLevel) }}
        </el-descriptions-item>
        <el-descriptions-item label="所属行政区划" :span="2">
          {{ formatArea() || deptData.address || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          {{ deptData.contactName || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ deptData.contactPhone || deptData.phone || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="所属行业" :span="2">
          <dict-tag :type="DICT_TYPE.AGRI_INDUSTRY" :value="deptData.industry" />
          <span v-if="!deptData.industry">--</span>
        </el-descriptions-item>
        <el-descriptions-item label="组织机构代码" :span="2">
          {{ deptData.socialCreditCode || '--' }}
        </el-descriptions-item>

        <el-descriptions-item label="营业执照/资质" :span="2">
          <div v-if="deptData.businessLicenseUrl || deptData.certImageUrls" class="image-wrapper">
            <el-image style="width: 100px; height: 100px" :src="deptData.businessLicenseUrl || deptData.certImageUrls"
              :preview-src-list="[deptData.businessLicenseUrl || deptData.certImageUrls]" fit="cover"
              class="rounded-image" />
          </div>
          <span v-else>--</span>
        </el-descriptions-item>

        <el-descriptions-item label="身份证正面">
          <div v-if="deptData.idCardFrontUrl" class="image-wrapper">
            <el-image style="width: 100px; height: 100px" :src="deptData.idCardFrontUrl"
              :preview-src-list="[deptData.idCardFrontUrl]" fit="cover" class="rounded-image" />
          </div>
          <span v-else>--</span>
        </el-descriptions-item>

        <el-descriptions-item label="身份证反面">
          <div v-if="deptData.idCardBackUrl" class="image-wrapper">
            <el-image style="width: 100px; height: 100px" :src="deptData.idCardBackUrl"
              :preview-src-list="[deptData.idCardBackUrl]" fit="cover" class="rounded-image" />
          </div>
          <span v-else>--</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关 闭</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { DICT_TYPE } from '@/utils/dict'
import * as DeptApi from '@/api/system/dept'
import * as AreaApi from '@/api/system/area'
import * as OrganizationApi from '@/api/agri/organization/index'

defineOptions({ name: 'SystemDeptDetail' })

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('机构详情') // 弹窗的标题
const loading = ref(false) // 数据加载中

const deptData = ref<any>({})
const areaMap = ref<Record<string, string>>({})

/** 初始化字典 */
const initAreaMap = async () => {
  if (Object.keys(areaMap.value).length > 0) return
  try {
    const tree = await AreaApi.getAreaTree()
    /**\n     * buildMap：将页面使用的数据在不同结构或展示口径之间转换。该方法不直接驱动页面跳转，返回值供调用方继续组装或渲染。\n     */
    const buildMap = (nodes: any[]) => {
      if (!nodes) return
      for (const node of nodes) {
        areaMap.value[String(node.id)] = node.name
        if (node.children && node.children.length > 0) {
          buildMap(node.children)
        }
      }
    }
    buildMap(tree)
  } catch (error) {
    console.error('获取地区树失败:', error)
  }
}

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  loading.value = true
  deptData.value = {}
  try {
    initAreaMap() // 并发初始化地区
    // 从全新的机构详情整合查询接口异步索取字段信息
    deptData.value = await OrganizationApi.getDeptWithFiling(id)
  } finally {
    loading.value = false
  }
}

defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 格式化区域 */
const formatArea = () => {
  const data = deptData.value
  const parts = []
  if (data.provinceCode && areaMap.value[String(data.provinceCode)]) parts.push(areaMap.value[String(data.provinceCode)])
  if (data.cityCode && areaMap.value[String(data.cityCode)]) parts.push(areaMap.value[String(data.cityCode)])
  if (data.districtCode && areaMap.value[String(data.districtCode)]) parts.push(areaMap.value[String(data.districtCode)])
  return parts.length > 0 ? parts.join('-') : ''
}

/** 格式化行政级别 */
const formatAreaLevel = (level: number) => {
  if (level === 1) return '省级'
  if (level === 2) return '市级'
  if (level === 3) return '区县级'
  return '--'
}
</script>

<style lang="scss" scoped>
.detail-descriptions {
  :deep(.el-descriptions__label) {
    width: 140px;
    font-weight: bold;
    color: var(--el-text-color-primary);
  }
}

.image-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;

  .rounded-image {
    border-radius: 6px;
    border: 1px solid var(--el-border-color-light);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
