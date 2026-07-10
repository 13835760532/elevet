<template>
  <div class="page-container yy-detail-container">
    <!-- 顶部标题区 -->
    <PageHeader :title="isEdit ? '编辑机构' : '新建机构'" :desc="isEdit ? '修改机构信息' : '录入机构信息'" />

    <div class="page-scrollable">
      <div class="content-card form-card">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="institution-form">
          <!-- 机构名称 -->
          <el-form-item label="机构名称" prop="name">
            <el-input v-model="formData.name" placeholder="输入机构名称" />
          </el-form-item>

          <!-- 上级机构 -->
          <!-- <el-form-item label="上级机构" prop="parentId">
            <el-tree-select
              v-model="formData.parentId"
              :data="deptTree"
              :props="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="选择上级机构"
              clearable
              check-strictly
              filterable
              class="full-width"
            />
          </el-form-item> -->

          <!-- 所属行业 -->
          <!-- <el-form-item label="所属行业" prop="industry">
            <el-select v-model="formData.industry" placeholder="选择所属行业" class="full-width">
              <el-option v-for="dict in industryOptions" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item> -->
          <!-- 建档类型 -->
          <el-form-item label="建档类型" prop="subjectType">
            <el-select v-model="formData.subjectType" placeholder="选择建档类型" class="full-width"
              @change="handleSubjectTypeChange">
              <el-option v-for="dict in filingSubjectTypeOptions" :key="dict.value" :label="dict.label"
                :value="dict.value" />
            </el-select>
          </el-form-item>
          <!-- 机构类型 -->
          <el-form-item label="机构类型" prop="deptType">
            <el-select v-model="formData.deptType" placeholder="选择机构类型" class="full-width">
              <el-option label="监管机构" :value="1" />
              <el-option label="检测机构" :value="2" />
              <el-option label="生产经营企业（企业/类型）" :value="3" />
              <el-option label="系统机构管理" :value="4" />
            </el-select>
          </el-form-item>



          <!-- 机构行政级别 -->
          <!-- <el-form-item label="机构行政级别" prop="adminLevel">
            <el-select v-model="formData.adminLevel" placeholder="选择机构行政级别" class="full-width">
              <el-option label="省级" :value="1" />
              <el-option label="市级" :value="2" />
              <el-option label="区县级" :value="3" />
            </el-select>
          </el-form-item> -->

          <!-- 机构行政层级范围 -->
          <el-form-item label="机构行政层级范围" prop="adminCoverage">
            <AreaCascader v-model="selectedRowId" :check-strictly="true" :emit-path="false" placeholder="请选择机构行政层级范围"
              class="full-width" @select="handleAreaSelect" />
          </el-form-item>

          <!-- 所属地区 -->
          <el-form-item label="地址" prop="region">
            <el-input v-model="formData.region" placeholder="输入公司的地址信息" />
          </el-form-item>

          <!-- 联系人 -->
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="formData.contact" placeholder="输入机构联系人信息" />
          </el-form-item>

          <!-- 联系电话 -->
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="输入机构联系人电话" />
          </el-form-item>

          <!-- 信用代码 -->
          <el-form-item v-if="isNonPersonalSubjectType" label="信用代码" prop="creditCode">
            <el-input v-model="formData.creditCode" placeholder="输入信用代码" style="width: 400px;" />
          </el-form-item>

          <!-- 营业执照 / 机构资质上传（OCR 识别） -->
          <el-form-item v-if="isNonPersonalSubjectType" label="营业执照 / 机构资质" prop="businessLicenseUrl">
            <div class="ocr-upload-wrapper">
              <UploadImg v-model="formData.businessLicenseUrl" :limit="1"
                @change="(val) => !val && (formData.creditCode = '')"
                :http-request="(options) => handleOcrUpload(options, 1)" />
              <div class="ocr-tip">上传营业执照或机构资质，系统可自动识别信用代码</div>
            </div>
          </el-form-item>

          <el-form-item v-if="isPersonalSubjectType" label="身份证" prop="idCardFrontUrl">
            <div class="id-card-upload-row">
              <div class="ocr-upload-wrapper">
                <UploadImg v-model="formData.idCardFrontUrl" :limit="1"
                  @change="(val) => !val && (formData.creditCode = '')"
                  :http-request="(options) => handleOcrUpload(options, 2)" />
                <div class="ocr-tip">身份证正面</div>
              </div>
              <div class="ocr-upload-wrapper">
                <UploadImg v-model="formData.idCardBackUrl" :limit="1"
                  :http-request="(options) => handleOcrUpload(options, 3)" />
                <div class="ocr-tip">身份证反面</div>
              </div>
            </div>
          </el-form-item>

          <el-form-item v-if="isPersonalSubjectType" label="身份证代码" prop="creditCode">
            <el-input v-model="formData.creditCode" placeholder="输入身份证代码" style="width: 400px;" />
          </el-form-item>

          <!-- 底部按钮 -->
          <div class="form-footer">
            <el-button type="primary" class="btn-submit" @click="handleSubmit">保存</el-button>
            <el-button class="btn-cancel" @click="handleCancel">取消</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '@/components/PageHeader/index.vue'
import { UploadImg } from '@/components/UploadFile'
import * as DeptApi from '@/api/system/dept'
import * as SubjectApi from '@/api/agri/subject/index'
import * as OrganizationApi from '@/api/agri/organization/index'
import AreaCascader from '@/components/AreaCascader/index.vue'
import { useMessage } from '@/hooks/web/useMessage'
import { useDict } from '@/hooks/web/useDict'
import { handleTree } from '@/utils/tree'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const formRef = ref()
const { options: filingSubjectTypeOptions } = useDict('agri_filing_subject_type', 'int')
const { options: industryOptions } = useDict('agri_industry', 'str')

const id = route.query.id ? Number(route.query.id) : undefined
const isEdit = !!id
const PERSONAL_SUBJECT_TYPE = 2

const formData = reactive({
  name: '',
  parentId: undefined as number | undefined,
  industry: '',
  deptType: undefined as number | undefined,
  subjectType: undefined as number | undefined,
  adminLevel: undefined as number | undefined,
  region: '',
  contact: '',
  phone: '',
  creditCode: '',
  businessLicenseUrl: '',
  idCardFrontUrl: '',
  idCardBackUrl: ''
})

const formRules = {
  name: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  deptType: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
  subjectType: [{ required: true, message: '请选择建档类型', trigger: 'change' }],
  contact: [{ required: true, message: '请输入机构联系人信息', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入机构联系人电话', trigger: 'blur' }]
}

const selectedRowId = ref<number | string | undefined>()
const areaInfo = ref<any>({})
const deptTree = ref<any[]>([])
const isPersonalSubjectType = computed(() => Number(formData.subjectType) === PERSONAL_SUBJECT_TYPE)
const isNonPersonalSubjectType = computed(() => formData.subjectType !== undefined && !isPersonalSubjectType.value)

const clearPersonalCertificateFields = () => {
  formData.idCardFrontUrl = ''
  formData.idCardBackUrl = ''
}

const clearNonPersonalCertificateFields = () => {
  formData.businessLicenseUrl = ''
}

const handleSubjectTypeChange = (val: number | string) => {
  formData.creditCode = ''
  if (Number(val) === PERSONAL_SUBJECT_TYPE) {
    clearNonPersonalCertificateFields()
  } else {
    clearPersonalCertificateFields()
  }

  if (Number(val) === 1) {
    formData.deptType = 3
  }

  formRef.value?.clearValidate?.(['creditCode', 'businessLicenseUrl', 'idCardFrontUrl', 'idCardBackUrl'])
}

/**
 * 处理地区选择事件
 */
const handleAreaSelect = (data: any) => {
  areaInfo.value = data
}

/**
 * 获取机构树
 */
const getDeptTree = async () => {
  try {
    const data = await DeptApi.getSimpleDeptList()
    const tree = handleTree(data)
    if (id) {
      // 编辑模式下，禁用自身及子节点，防止循环引用
      disableNodeAndChildren(tree, id)
    }
    deptTree.value = tree
  } catch (error) {
    console.error('获取机构树失败:', error)
  }
}

/**
 * 递归禁用节点及其子节点
 */
const disableNodeAndChildren = (nodes: any[], targetId: number) => {
  for (const node of nodes) {
    if (node.id === targetId) {
      node.disabled = true
      markChildrenDisabled(node.children)
      return true
    }
    if (node.children && disableNodeAndChildren(node.children, targetId)) {
      return true
    }
  }
  return false
}

const markChildrenDisabled = (nodes: any[]) => {
  if (!nodes) return
  for (const node of nodes) {
    node.disabled = true
    markChildrenDisabled(node.children)
  }
}

onMounted(async () => {
  getDeptTree()
  if (id) {
    try {
      const data = await DeptApi.getDept(id)
      formData.name = data.name || ''
      // formData.parentId = data.parentId === 0 ? undefined : data.parentId
      formData.industry = data.industry || ''
      formData.deptType = data.deptType
      formData.subjectType = data.subjectType || data.deptType
      formData.adminLevel = data.areaLevel
      formData.region = data.address || ''
      formData.contact = data.contactName || ''
      formData.phone = data.contactPhone || ''
      formData.creditCode = data.socialCreditCode || ''
      formData.businessLicenseUrl = data.businessLicenseUrl || data.certImageUrls || ''
      formData.idCardFrontUrl = data.idCardFrontUrl || ''
      formData.idCardBackUrl = data.idCardBackUrl || ''

      // 初始化行政区域选择
      selectedRowId.value = data.areaCode
      areaInfo.value = {
        provinceCode: data.provinceCode,
        cityCode: data.cityCode,
        districtCode: data.districtCode
      }
    } catch (error) {
      console.error('获取机构详情失败:', error)
    }
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    // 校验行政区域选择
    if (!selectedRowId.value) {
      message.warning('请选择机构行政层级范围')
      return
    }

    const data = {
      name: formData.name,
      parentId: formData.parentId || 0,
      sort: 0,
      status: 0,
      deptType: formData.deptType,
      subjectType: formData.subjectType,
      industry: formData.industry,
      areaLevel: formData.adminLevel,
      areaCode: String(selectedRowId.value),
      provinceCode: String(areaInfo.value.provinceCode || ''),
      cityCode: String(areaInfo.value.cityCode || ''),
      districtCode: String(areaInfo.value.districtCode || ''),
      address: formData.region,
      contactName: formData.contact,
      contactPhone: formData.phone,
      socialCreditCode: formData.creditCode,
      businessLicenseUrl: formData.businessLicenseUrl,
      idCardFrontUrl: formData.idCardFrontUrl,
      idCardBackUrl: formData.idCardBackUrl
    } as any

    if (id) {
      data.id = id
      await DeptApi.updateDept(data)
      message.success('更新机构成功')
    } else {
      await OrganizationApi.createDeptWithFiling(data)
      message.success('新建机构成功')
    }
    router.back()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

const handleCancel = () => {
  router.back()
}

/**
 * OCR 识别上传
 */
const handleOcrUpload = async (options: any, imageType: number) => {
  try {
    const data = await SubjectApi.ocrUpload({
      file: options.file,
      imageType
    })

    if (imageType === 1) {
      formData.businessLicenseUrl = data.imageUrl
      formRef.value?.validateField?.('businessLicenseUrl')
      if (data.socialCreditCode) {
        formData.creditCode = data.socialCreditCode
        formRef.value?.validateField?.('creditCode')
        message.success('已自动识别信用代码')
      }
    } else if (imageType === 2) {
      formData.idCardFrontUrl = data.imageUrl
      formRef.value?.validateField?.('idCardFrontUrl')
      if (data.idCard) {
        formData.creditCode = data.idCard
        formRef.value?.validateField?.('creditCode')
        message.success('已自动识别身份证号')
      }
    } else if (imageType === 3) {
      formData.idCardBackUrl = data.imageUrl
      formRef.value?.validateField?.('idCardBackUrl')
    }

    // 返回符合 UploadImg 组件期望的数据结构
    return { data: data.imageUrl }
  } catch (error) {
    console.error('OCR 识别失败', error)
    message.error('证件识别失败，请检查图片是否清晰')
    throw error
  }
}
</script>

<style lang="scss" scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.page-scrollable {
  flex: 1;
  overflow-y: auto;
}

.form-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 40px 60px;
}

.institution-form {

  :deep(.el-form-item__label) {
    font-weight: bold;
    color: #333;
    padding-bottom: 8px;
  }

  .el-input,
  .el-select,
  :deep(.area-cascader),
  AreaCascader {
    width: 400px !important;
  }
}

.full-width {
  width: 400px !important;
}

.highlight-blue {
  color: #00B3ED;
  font-weight: 500;
}

.highlight-purple {
  color: #722ed1;
  font-weight: 500;
}

.highlight-pink {
  color: #eb2f96;
  font-weight: 500;
}

.credit-code-row {
  display: flex;
  align-items: center;
  gap: 16px;

  .credit-input {
    width: 400px;
  }

  .upload-btn {
    border-color: #00B3ED;
    color: #00B3ED;
  }
}

.ocr-upload-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  .ocr-tip {
    font-size: 12px;
    color: #999;
  }
}

.id-card-upload-row {
  display: flex;
  gap: 20px;
}

.form-footer {
  margin-top: 40px;
  display: flex;
  gap: 16px;

  .btn-submit {
    width: 120px;
    background-color: #00B3ED;
    border-color: #00B3ED;
  }

  .btn-cancel {
    width: 120px;
  }
}
</style>
