<template>
  <div class="page-container yy-detail-container">
    <PageHeader title="新建分发关系" desc="建立账户下的分发关系及名单目录。" />

    <div class="page-scrollable">
      <div class="content-card">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="distribution-form">
          <div class="section-title">层级基本信息</div>

          <el-form-item label="层级关系" prop="name" required>
            <el-input v-model="formData.name" placeholder="输入层级关系名称" class="w-500" />
          </el-form-item>

          <el-form-item label="层级类型" prop="relationType" required>
            <el-select v-model="formData.relationType" placeholder="请选择层级类型" class="w-500">
              <el-option v-for="dict in relationTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="输入层级">
            <div class="input-wrap flex-align-center">
              <el-input-number v-model="formData.maxLevel" :min="1" :max="7" class="w-120" />
              <el-button type="primary" @click="generateLevels" class="ml-10 btn-new">新建</el-button>
            </div>
            <div class="tip ml-20">最多输入7个层级</div>
          </el-form-item>

          <div class="hierarchy-section">
            <div class="hierarchy-table">
              <el-table :data="formData.levels" border style="width: 100%" header-cell-class-name="custom-header">
                <el-table-column label="层级排序" prop="levelSort" width="100" align="center" />
                <!-- 行政管理体系特有列 -->
                <el-table-column v-if="isAdminSystem" label="层级级别" prop="levelGrade" min-width="150">
                  <template #default="scope">
                    <el-select v-model="scope.row.levelGrade" placeholder="请选择" class="full-width" size="small">
                      <el-option v-for="dict in levelGradeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
                    </el-select>
                  </template>
                </el-table-column>
                
                <!-- 公共列：层级名称 -->
                <el-table-column label="层级名称" prop="levelName" min-width="160">
                  <template #default="scope">
                    <el-input v-model="scope.row.levelName" placeholder="输入名称" size="small" />
                  </template>
                </el-table-column>
                
                <!-- 行政管理体系特有列：选择行政区域 -->
                <el-table-column v-if="isAdminSystem" label="选择行政区域" prop="region" min-width="120" align="center">
                  <template #default="scope">
                    <span class="action-btn text-blue" @click="handleSetScope(scope.row)">设定范围</span>
                  </template>
                </el-table-column>
                
                <!-- 公共列：范围内的机构 / 涉及机构用户总数 -->
                <el-table-column label="范围内的机构" width="120" align="center">
                  <template #default="scope">
                    <span class="count-link" @click="handleManageInstitution(scope.row)">
                      {{ scope.row.institutionCount || 0 }} 关联机构
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="涉及机构用户数" prop="userCount" width="150" align="center">
                  <template #default="scope">
                    {{ scope.row.userCount || 0 }}
                  </template>
                </el-table-column>
                
                <!-- 自定义体系特有列：新增账户 -->
                <el-table-column v-if="isCustomSystem" label="" width="120" align="center">
                  <template #default>
                    <span class="action-btn text-gray">新增账户</span>
                  </template>
                </el-table-column>

                <!-- 操作列 -->
                <el-table-column label="操作" :width="isCustomSystem ? 300 : 260" align="center">
                  <template #default="scope">
                    <template v-if="isCustomSystem">
                      <span class="action-btn text-black" @click="addSameLevel(scope.$index)">新增同层级</span>
                      <span class="action-btn text-blue" @click="addSubLevel(scope.$index)">新增子层级</span>
                      <span class="action-btn text-red" @click="removeLevel(scope.$index)">删除层级</span>
                    </template>
                    <template v-else>
                      <span class="action-btn text-red" @click="addSameLevel(scope.$index)">新增同层级</span>
                      <span class="action-btn text-red" @click="addSubLevel(scope.$index)">新增子层级</span>
                      <span class="action-btn text-red" @click="removeLevel(scope.$index)">删除层级</span>
                    </template>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="form-footer mt-40">
            <el-button type="primary" @click="handleSubmit" :loading="loading" class="btn-submit">保存</el-button>
            <el-button @click="handleCancel" class="btn-cancel">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>
    
    
    <!-- 机构用户弹窗 -->
    <InstitutionUserDialog ref="institutionDialogRef" />
    
    <!-- 设定行政层级范围弹窗 -->
    <AdminScopeDialog ref="adminScopeDialogRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader/index.vue'
import AreaCascader from '@/components/AreaCascader/index.vue'
import InstitutionUserDialog from './components/InstitutionUserDialog.vue'
import AdminScopeDialog from './components/AdminScopeDialog.vue'
import { useMessage } from '@/hooks/web/useMessage'
import { useDict } from '@/hooks/web/useDict'
import { useUserStore } from '@/store/modules/user'
import * as DistributionApi from '@/api/agri/distribution'

defineOptions({ name: 'DistributionRelationCreate' })

const router = useRouter()
const route = useRoute()
const message = useMessage()
const { options: relationTypeOptions, getLabel: getRelationTypeLabel } = useDict('dist_relation_type', 'str')
const { options: levelGradeOptions } = useDict('dist_level_grade', 'str')
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)

const id = route.query.id

const formData = reactive({
  name: '',
  relationType: 'admin_area',
  maxLevel: 5,
  status: 1,
  ownerType: 1,
  ownerId: 0,
  levels: [
    { levelSort: 1, levelGrade: '省', levelName: '河南省', region: [], areaCode: '' },
    { levelSort: 2, levelGrade: '市', levelName: '焦作市', region: [], areaCode: '' },
    { levelSort: 3, levelGrade: '区', levelName: '沁阳市', region: [], areaCode: '' },
    { levelSort: 4, levelGrade: '镇', levelName: '大虹桥乡镇', region: [], areaCode: '' },
    { levelSort: 5, levelGrade: '村', levelName: '龙源社区', region: [], areaCode: '' }
  ]
})

const isCustomSystem = computed(() => {
  const label = getRelationTypeLabel(formData.relationType)
  return formData.relationType === 'customManagement' || label === '自定义管理体系' || label === '自定义体系' || formData.relationType === '自定义体系'
})

const isAdminSystem = computed(() => {
  const label = getRelationTypeLabel(formData.relationType)
  return formData.relationType === 'admin_area' || label === '行政管理体系' || formData.relationType === '行政管理体系'
})

const formRules = {
  name: [{ required: true, message: '请输入层级关系名称', trigger: 'blur' }],
  relationType: [{ required: true, message: '请选择层级类型', trigger: 'change' }]
}

const institutionDialogRef = ref()
const adminScopeDialogRef = ref()

const handleManageInstitution = (row: any) => {
  const params = {
    relationId: id,
    relationType: formData.relationType
  }
  institutionDialogRef.value?.open(row.levelName || row.levelGrade || '层级', params)
}

const handleSetScope = (row: any) => {
  adminScopeDialogRef.value?.open((code: string) => {
    row.areaCode = code
    message.success('设定范围成功')
  })
}

const generateLevels = () => {
  if (formData.maxLevel > 7) {
    formData.maxLevel = 7
  }
  const newLevels = []
  for (let i = 1; i <= formData.maxLevel; i++) {
    newLevels.push({
      levelSort: i,
      levelGrade: '',
      levelName: '',
      region: [],
      areaCode: ''
    })
  }
  formData.levels = newLevels
}

const addSameLevel = (index: number) => {
  if (formData.levels.length >= 7) {
    message.warning('最多只能输入7个层级')
    return
  }
  formData.levels.splice(index + 1, 0, {
    levelSort: 0,
    levelGrade: '',
    levelName: '',
    region: [],
    areaCode: ''
  })
  reorderLevels()
}

const addSubLevel = (index: number) => {
  if (formData.levels.length >= 7) {
    message.warning('最多只能输入7个层级')
    return
  }
  formData.levels.splice(index + 1, 0, {
    levelSort: 0,
    levelGrade: '',
    levelName: '',
    region: [],
    areaCode: ''
  })
  reorderLevels()
}

const removeLevel = (index: number) => {
  if (formData.levels.length <= 1) {
    message.warning('至少保留一个层级')
    return
  }
  formData.levels.splice(index, 1)
  reorderLevels()
}

const reorderLevels = () => {
  formData.levels.forEach((item, idx) => {
    item.levelSort = idx + 1
  })
  formData.maxLevel = formData.levels.length
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        // 自动设置 Owner 为当前用户所属部门
        formData.ownerId = userStore.getUser?.deptId || 1
        formData.ownerType = 1 // 固定为部门

        // 构造符合协议的 submitData，剔除多余的辅助字段
        const submitData = {
          id: id ? Number(id) : undefined,
          name: formData.name,
          ownerType: formData.ownerType,
          ownerId: formData.ownerId,
          relationType: formData.relationType,
          maxLevel: formData.maxLevel,
          status: formData.status,
          levels: formData.levels.map(lvl => ({
            id: lvl.id,
            levelSort: lvl.levelSort,
            levelGrade: lvl.levelGrade,
            levelName: lvl.levelName,
            areaCode: lvl.areaCode
          }))
        }

        if (id) {
          await DistributionApi.updateDistribution({ ...submitData, id: Number(id) })
          message.success('修改成功')
        } else {
          await DistributionApi.createDistribution(submitData as any)
          message.success('创建成功')
        }
        router.back()
      } catch (error) {
        console.error(error)
      } finally {
        loading.value = false
      }
    }
  })
}

const handleCancel = () => {
  router.back()
}

const loadDetail = async () => {
  if (!id) return
  try {
    const data = await DistributionApi.getDistribution(Number(id))
    if (data) {
      formData.name = data.name || ''
      formData.relationType = data.relationType || 'admin_area'
      formData.maxLevel = data.maxLevel || 5
      formData.status = data.status ?? 1
      formData.ownerType = data.ownerType ?? 1
      formData.ownerId = data.ownerId ?? 0
      
      if (data.levels && data.levels.length > 0) {
        formData.levels = data.levels.map((lvl: any) => ({
          ...lvl,
          region: []
        }))
      }
    }
  } catch (error) {
    console.error('Failed to load distribution relation detail:', error)
  }
}

onMounted(() => {
  loadDetail()
})
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  background: transparent;
}

.page-scrollable {
  flex: 1;
  overflow-y: auto;
}

.content-card {
  width: 100%;
  margin: 0 auto;
  padding: var(--page-container-padding);
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  padding-left: 10px;
  border-left: 4px solid #00B3ED;
}

.distribution-form {
  max-width: 1200px;
  margin: 0 auto;
}

.hierarchy-section {
  margin-top: 10px;
}

.w-500 {
  width: 500px;
}

.w-120 {
  width: 120px;
}

.flex-align-center {
  display: flex;
  align-items: center;
}

.btn-new {
  background-color: #00B3ED;
  border-color: #00B3ED;
}

.tip {
  font-size: 12px;
  color: #999;
}

.ml-20 {
  margin-left: 20px;
}

.count-link {
  color: #00B3ED;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.action-btn {
  cursor: pointer;
  margin: 0 8px;
  font-size: 13px;

  &:hover {
    opacity: 0.8;
  }
}

.text-gray {
  color: #999;
}
.text-black {
  color: #333;
}
.text-blue {
  color: #00B3ED;
}
.text-red {
  color: #f56c6c;
}

.form-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
}

.btn-submit {
  width: 120px;
  height: 44px;
  background: #00B3ED;
  border-color: #00B3ED;
  border-radius: 4px;
}

.btn-cancel {
  width: 120px;
  height: 44px;
  background: #cdd0d6;
  border-color: #cdd0d6;
  color: #fff;
  border-radius: 4px;

  &:hover,
  &:focus {
    background: #b0b4be;
    border-color: #b0b4be;
    color: #fff;
  }
}

.ml-10 {
  margin-left: 10px;
}

.mt-20 {
  margin-top: 20px;
}

.mt-40 {
  margin-top: 40px;
}

.mr-5 {
  margin-right: 5px;
}

:deep(.custom-header) {
  background-color: #fff !important;
  color: #333;
  font-weight: 600;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table) {
  --el-table-border-color: #ebeef5;
  border-top: 1px solid #ebeef5;
}
</style>
