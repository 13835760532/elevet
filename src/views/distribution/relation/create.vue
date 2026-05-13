<template>
  <div class="page-container yy-detail-container">
    <PageHeader title="新建分发关系" desc="建立账户下的分发关系及名单目录。" />

    <div class="page-scrollable">
      <div class="content-card">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" class="distribution-form">
          <div class="section-title">层级基本信息</div>

          <div class="base-info-display mb-30">
            <div class="display-header flex-between mb-15">
              <span class="sub-section-title">基本信息</span>
              <el-button type="primary" plain size="small" @click="dialogVisible = true">编辑基本信息</el-button>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">层级关系名称：</span>
                <span class="value">{{ formData.name || '--' }}</span>
              </div>
              <div class="info-item">
                <span class="label">层级体系类型：</span>
                <span class="value">{{ getRelationTypeLabel(formData.relationType) || '--' }}</span>
              </div>
              <div class="info-item">
                <span class="label">当前层级数量：</span>
                <span class="value">{{ formData.levels.length }} 层</span>
              </div>
            </div>
          </div>

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
                      {{ scope.row.targetCount || 0 }} 关联机构
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="涉及机构用户数" prop="targetCount" width="150" align="center">
                  <template #default="scope">
                    {{ scope.row.targetCount || 0 }}
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
    <InstitutionUserDialog ref="institutionDialogRef" @confirm="handleInstitutionConfirm" />
    
    <!-- 设定行政层级范围弹窗 -->
    <AdminScopeDialog ref="adminScopeDialogRef" />

    <!-- 基本信息设置弹窗 -->
    <el-dialog v-model="dialogVisible" title="设置层级基本信息" width="600px" :close-on-click-modal="false" class="yy-dialog base-info-dialog">
      <template #header>
        <div class="dialog-header">
          <span class="title">设置层级基本信息</span>
          <div class="subtitle">请先配置层级的基本框架，随后再进行具体的机构管理。</div>
        </div>
      </template>
      
      <el-form ref="dialogFormRef" :model="formData" :rules="formRules" label-width="100px" class="dialog-form">
        <el-form-item label="层级关系" prop="name" required>
          <el-input v-model="formData.name" placeholder="请输入层级关系名称（如：区域销售体系）" />
        </el-form-item>

        <el-form-item label="层级类型" prop="relationType" required>
          <el-select v-model="formData.relationType" placeholder="请选择层级类型" class="full-width">
            <el-option v-for="dict in relationTypeOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="输入层级">
          <div class="flex-align-center">
            <el-input-number v-model="formData.maxLevel" :min="1" :max="7" class="w-120" />
            <div class="tip ml-15">最多支持 7 个层级深度</div>
          </div>
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" v-if="id">取消</el-button>
          <el-button type="primary" @click="handleGenerateLevels" class="btn-confirm">
            {{ id ? '保存修改' : '确认并生成层级' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
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
const dialogFormRef = ref(null)
const loading = ref(false)
const dialogVisible = ref(false)

const id = route.query.id

const formData = reactive({
  name: '',
  relationType: 'admin_area',
  maxLevel: 5,
  status: 1,
  remark: '',
  ownerType: 1,
  ownerId: 0,
  levels: [
    { levelSort: 1, levelGrade: '省', levelName: '河南省', region: [], areaCode: '410000', areaLevel: 1, areaName: '河南省' },
    { levelSort: 2, levelGrade: '市', levelName: '焦作市', region: [], areaCode: '410800', areaLevel: 2, areaName: '河南省/焦作市' },
    { levelSort: 3, levelGrade: '区', levelName: '沁阳市', region: [], areaCode: '410882', areaLevel: 3, areaName: '河南省/焦作市/沁阳市' },
    { levelSort: 4, levelGrade: '镇', levelName: '大虹桥乡镇', region: [], areaCode: '', areaLevel: 4, areaName: '河南省/焦作市/沁阳市/大虹桥乡镇' },
    { levelSort: 5, levelGrade: '村', levelName: '龙源社区', region: [], areaCode: '', areaLevel: 5, areaName: '河南省/焦作市/沁阳市/大虹桥乡镇/龙源社区' }
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
const currentRow = ref<any>(null)

const handleManageInstitution = (row: any) => {
  currentRow.value = row
  const params = {
    relationId: id,
    levelId: row.id,
    relationType: formData.relationType,
    areaCode: row.areaCode,
    areaLevel: row.areaLevel || row.levelSort, // 默认使用层级深度作为行政级别参考
    selectedTargets: row.selectedTargets || []
  }
  institutionDialogRef.value?.open(row.levelName || row.levelGrade || '层级', params)
}

const handleInstitutionConfirm = (selectedUsers: any[]) => {
  if (currentRow.value) {
    // 更新 UI 上的关联数量
    currentRow.value.targetCount = selectedUsers.length
    // 保存选中的用户对象（包含 id, deptId 等）
    currentRow.value.selectedTargets = selectedUsers
    message.success(`已成功关联 ${selectedUsers.length} 个机构用户`)
  }
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
      areaCode: '',
      areaLevel: i,
      areaName: ''
    })
  }
  formData.levels = newLevels
}

const handleGenerateLevels = async () => {
  if (!dialogFormRef.value) return
  await (dialogFormRef.value as any).validate((valid: boolean) => {
    if (valid) {
      generateLevels()
      dialogVisible.value = false
    }
  })
}

const addSameLevel = (index: number) => {
  if (formData.levels.length >= 8) {
    message.warning('最多只能输入8个层级')
    return
  }
  formData.levels.splice(index + 1, 0, {
    levelSort: 0,
    levelGrade: '',
    levelName: '',
    region: [],
    areaCode: '',
    areaName: ''
  })
  reorderLevels()
}

const addSubLevel = (index: number) => {
  if (formData.levels.length >= 8) {
    message.warning('最多只能输入8个层级')
    return
  }
  formData.levels.splice(index + 1, 0, {
    levelSort: 0,
    levelGrade: '',
    levelName: '',
    region: [],
    areaCode: '',
    areaName: ''
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
  if (!formData.name || !formData.relationType) {
    message.warning('请先设置层级基本信息')
    dialogVisible.value = true
    return
  }

  if (formRef.value) {
    await (formRef.value as any).validate(async (valid: boolean) => {
      if (valid) {
        loading.value = true
        try {
          // 自动设置 Owner
          formData.ownerId = userStore.getUser?.deptId || 1
          formData.ownerType = 1 

          // 构造提交数据
          const submitData = {
            id: id ? Number(id) : undefined,
            name: formData.name,
            ownerType: formData.ownerType,
            ownerId: formData.ownerId,
            relationType: formData.relationType,
            maxLevel: formData.maxLevel,
            status: formData.status,
            remark: formData.remark,
            levels: formData.levels.map(lvl => ({
              id: lvl.id,
              levelSort: lvl.levelSort,
              levelGrade: lvl.levelGrade,
              levelName: lvl.levelName,
              areaCode: lvl.areaCode,
              areaName: lvl.areaName
            }))
          }

          let savedRelationId = id ? Number(id) : null
          let savedLevels: any[] = []

          // 1. 先保存分发关系基础架构
          if (id) {
            const res = await DistributionApi.updateDistribution({ ...submitData, id: Number(id) }) as any
            savedRelationId = res?.id || savedRelationId
            savedLevels = res?.levels || []
            message.success('基础信息保存成功')
          } else {
            const res = await DistributionApi.createDistribution(submitData as any) as any
            savedRelationId = res?.id
            savedLevels = res?.levels || []
            message.success('基础信息创建成功')
          }
          
          // 如果后端只返回了布尔值或 ID，则重新拉取详情以获取各层级的正式 levelId
          if (savedLevels.length === 0 && savedRelationId) {
            const detail = await DistributionApi.getDistribution(savedRelationId) as any
            savedLevels = detail?.levels || []
          }

          // 2. 提交关联的目标（用户/机构）
          if (savedRelationId && savedLevels.length > 0) {
            let targetSubmitCount = 0
            for (const lvl of formData.levels) {
              // 找到服务器返回的带 ID 的对应层级
              const serverLvl = savedLevels.find(s => s.levelSort === lvl.levelSort)
              const selectedTargets = (lvl as any).selectedTargets
              
              if (serverLvl && selectedTargets && selectedTargets.length > 0) {
                const targetList = selectedTargets.map((target: any) => ({
                  targetType: 2, // 2-机构
                  targetId: target.id,
                  deptId: target.deptId
                }))
                await DistributionApi.addTargetList(savedRelationId, serverLvl.id, targetList)
                targetSubmitCount += selectedTargets.length
              }
            }
            if (targetSubmitCount > 0) {
              message.success(`已成功同步 ${targetSubmitCount} 个目标机构用户`)
            }
          }

          router.back()
        } catch (error) {
          console.error('Submit failed:', error)
        } finally {
          loading.value = false
        }
      }
    })
  }
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
          region: [],
          selectedTargets: lvl.targets || []
        }))
      }
    }
  } catch (error) {
    console.error('Failed to load distribution relation detail:', error)
  }
}

onMounted(() => {
  if (!id) {
    dialogVisible.value = true
  }
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

.base-info-display {
  padding: 20px;
  background: #f8fbff;
  border-radius: 8px;
  border: 1px solid #e1edff;

  .display-header {
    border-bottom: 1px solid #e1edff;
    padding-bottom: 10px;
  }

  .sub-section-title {
    font-size: 15px;
    font-weight: 600;
    color: #409eff;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    padding-top: 10px;

    .info-item {
      .label {
        color: #666;
        font-size: 14px;
      }
      .value {
        color: #333;
        font-weight: 500;
        font-size: 14px;
      }
    }
  }
}

.yy-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    padding: 24px 24px 16px;
    border-bottom: 1px solid #f0f0f0;
  }

  .dialog-header {
    .title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
      display: block;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 13px;
      color: #999;
      font-weight: normal;
    }
  }

  .dialog-form {
    padding: 20px 10px 0;
  }

  .full-width {
    width: 100%;
  }

  .dialog-footer {
    padding-top: 10px;
    .btn-confirm {
      padding: 10px 30px;
      height: auto;
      font-weight: 500;
    }
  }
}

.ml-15 {
  margin-left: 15px;
}

.mb-30 {
  margin-bottom: 30px;
}

.mb-15 {
  margin-bottom: 15px;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
