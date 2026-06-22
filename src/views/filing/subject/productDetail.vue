<template>
    <div class="page-container yy-detail-container" v-loading="loading">
        <PageHeader title="主体建档" desc="查看产品主体的详细档案信息。" />

        <div class="page-scrollable">

            <!-- 详情卡片容器 -->
            <div class="content-card">
                <div class="card-header">
                    <span class="header-title">主体基本信息</span>
                    <div class="header-actions">
                        <button v-if="!isRevealed" type="button" class="sensitive-toggle" @click="handleVerifyClick">
                            <el-icon>
                                <View />
                            </el-icon>
                            <span>隐藏信息查看</span>
                        </button>
                        <button v-else type="button" class="sensitive-toggle is-active" @click="handleHideSensitive">
                            <el-icon>
                                <Hide />
                            </el-icon>
                            <span>隐藏敏感信息</span>
                        </button>
                    </div>
                </div>

                <!-- 详情数据列表 -->
                <div class="detail-list">
                    <!-- 建档类型 -->
                    <div class="detail-row">
                        <div class="label">*建档类型：</div>
                        <div class="value">{{ subjectInfo.type ? getFilingTypeLabel(subjectInfo.type) : '--' }}</div>
                    </div>

                    <!-- 主体名称 -->
                    <div class="detail-row">
                        <div class="label">*主体名称：</div>
                        <div class="value">{{ subjectInfo.name || '--' }}</div>
                    </div>

                    <!-- 主体类型 -->
                    <div class="detail-row">
                        <div class="label">*主体类型：</div>
                        <div class="value">{{ subjectInfo.category ? getCategoryLabel(subjectInfo.category) : '--' }}
                        </div>
                    </div>

                    <!-- 主营产品 -->
                    <div class="detail-row">
                        <div class="label">*主营产品：</div>
                        <div class="value">{{ subjectInfo.mainProducts || '--' }}</div>
                    </div>

                    <!-- 所属地区 -->
                    <div class="detail-row">
                        <div class="label">*所属地区：</div>
                        <div class="value">{{ [subjectInfo.provinceCode, subjectInfo.cityCode,
                        subjectInfo.districtCode].filter(Boolean).join('') || '--' }}</div>
                    </div>

                    <!-- 详细地址 -->
                    <div class="detail-row">
                        <div class="label">*详细地址：</div>
                        <div class="value">{{ subjectInfo.address || '--' }}</div>
                    </div>

                    <!-- 联系人 -->
                    <div class="detail-row">
                        <div class="label">*联系人：</div>
                        <div class="value">{{ subjectInfo.contactName || '--' }}</div>
                    </div>

                    <!-- 联系电话 -->
                    <div class="detail-row">
                        <div class="label">*联系电话：</div>
                        <div class="value">
                            <span>{{ isRevealed ? sensitiveInfo.contactPhone : maskPhone(subjectInfo.contactPhone)
                            }}</span>
                        </div>
                    </div>

                    <!-- 生产规模 -->
                    <div class="detail-row">
                        <div class="label">*生产规模：</div>
                        <div class="value">{{ subjectInfo.productionScale ? (subjectInfo.productionScale + ' ' +
                            getAgriUnitLabel(subjectInfo.productionScaleUnit)) : '--' }}</div>
                    </div>

                    <!-- 营业执照 -->
                    <div class="detail-row" v-if="subjectInfo.type === 1">
                        <div class="label">*营业执照：</div>
                        <div class="value">
                            <div class="img-preview-group">
                                <div class="preview-box">
                                    <el-icon v-if="!subjectInfo.businessLicenseUrl">
                                        <Picture />
                                    </el-icon>
                                    <template v-else>
                                        <el-image :src="subjectInfo.businessLicenseUrl"
                                            :preview-src-list="[subjectInfo.businessLicenseUrl]" class="preview-img"
                                            fit="cover" :preview-teleported="true" />
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 信用代码 -->
                    <div class="detail-row" v-if="subjectInfo.type === 1">
                        <div class="label">*信用代码：</div>
                        <div class="value">
                            <span>{{ isRevealed ? sensitiveInfo.socialCreditCode :
                                maskCode(subjectInfo.socialCreditCode) }}</span>
                        </div>
                    </div>

                    <!-- 身份证号 (仅个人) -->
                    <div class="detail-row" v-if="subjectInfo.type === 2">
                        <div class="label">*身份证号：</div>
                        <div class="value">
                            <span>{{ isRevealed ? sensitiveInfo.idCard : maskIdCard(subjectInfo.idCard) }}</span>
                        </div>
                    </div>

                    <!-- 身份证 -->
                    <div class="detail-row" v-if="subjectInfo.type === 2">
                        <div class="label">身份证：</div>
                        <div class="value">
                            <div class="img-preview-group">
                                <div class="id-card-boxes">
                                    <div class="preview-box">
                                        <el-icon v-if="!subjectInfo.idCardFrontUrl">
                                            <Postcard />
                                        </el-icon>
                                        <template v-else>
                                            <el-image :src="subjectInfo.idCardFrontUrl"
                                                :preview-src-list="[subjectInfo.idCardFrontUrl, subjectInfo.idCardBackUrl].filter(Boolean)"
                                                class="preview-img" fit="cover" :preview-teleported="true" />
                                        </template>
                                    </div>
                                    <div class="preview-box">
                                        <el-icon v-if="!subjectInfo.idCardBackUrl">
                                            <Postcard />
                                        </el-icon>
                                        <template v-else>
                                            <el-image :src="subjectInfo.idCardBackUrl"
                                                :preview-src-list="[subjectInfo.idCardFrontUrl, subjectInfo.idCardBackUrl].filter(Boolean)"
                                                :initial-index="subjectInfo.idCardFrontUrl ? 1 : 0" class="preview-img"
                                                fit="cover" :preview-teleported="true" />
                                        </template>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 企业资质 -->
                    <div class="detail-row" v-if="subjectInfo.type === 1">
                        <div class="label">企业资质：</div>
                        <div class="value">
                            <div class="img-preview-group">
                                <template
                                    v-if="subjectInfo.qualificationUrls && parseUrls(subjectInfo.qualificationUrls).length">
                                    <div class="preview-box"
                                        v-for="(url, index) in parseUrls(subjectInfo.qualificationUrls)" :key="index">
                                        <el-image :src="url"
                                            :preview-src-list="parseUrls(subjectInfo.qualificationUrls)"
                                            :initial-index="index" class="preview-img" fit="cover"
                                            :preview-teleported="true" />
                                    </div>
                                </template>
                                <div class="preview-box" v-else>
                                    <el-icon>
                                        <Picture />
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 企业介绍 -->
                    <div class="detail-row no-border" v-if="subjectInfo.type === 1">
                        <div class="label">企业介绍：</div>
                        <div class="value" v-if="subjectInfo.introduction" v-html="subjectInfo.introduction"></div>
                        <div class="value" v-else>--</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 敏感信息核验查看弹窗 -->
        <el-dialog v-model="verifyVisible" width="440px" append-to-body destroy-on-close :show-close="false"
            class="verify-dialog">
            <template #header>
                <div class="verify-dialog-header">
                    <span class="verify-dialog-title">身份核验</span>
                    <button type="button" class="verify-dialog-close" aria-label="关闭" @click="verifyVisible = false">
                        <el-icon>
                            <Close />
                        </el-icon>
                    </button>
                </div>
            </template>
            <el-form :model="verifyForm" :rules="verifyRules" ref="verifyFormRef" label-width="90px">
                <div class="verify-tip mb20">
                    <el-icon class="mr4">
                        <InfoFilled />
                    </el-icon>
                    请输入当前登录账号的密码以查看敏感信息
                </div>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="verifyForm.username" disabled />
                </el-form-item>
                <el-form-item label="登录密码" prop="password">
                    <el-input v-model="verifyForm.password" type="password" show-password placeholder="请输入登录密码"
                        ref="passwordInputRef" @keyup.enter="submitVerify" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="verifyVisible = false" round>取消</el-button>
                    <el-button type="primary" :loading="verifying" @click="submitVerify" round
                        class="submit-btn">确定并查看</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, watch, reactive, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Picture, Postcard, View, Hide, InfoFilled, Close } from '@element-plus/icons-vue';
import { ElMessage, ElLoading } from 'element-plus';
import PageHeader from '@/components/PageHeader/index.vue';
import * as SubjectApi from '@/api/agri/subject/index';
import { useDict } from '@/hooks/web/useDict';
import { getAgriUnitLabel } from '@/utils/agriUnit';
import { useUserStore } from '@/store/modules/user';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const { getLabel: getCategoryLabel } = useDict('agri_subject_category', 'str');
const { getLabel: getFilingTypeLabel } = useDict('agri_filing_type', 'int');

const subjectInfo = ref({});
const loading = ref(false);

// 敏感信息逻辑
const sensitiveInfo = ref({
    contactPhone: '',
    idCard: '',
    socialCreditCode: ''
});
const isRevealed = ref(false);

const verifyVisible = ref(false);
const verifying = ref(false);
const verifyFormRef = ref(null);
const verifyForm = reactive({
    username: userStore.getUser.username,
    password: ''
});

const verifyRules = {
    password: [{ required: true, message: '请输入登录密码', trigger: 'blur' }]
};

const passwordInputRef = ref(null);
const handleVerifyClick = () => {
    verifyForm.password = '';
    verifyVisible.value = true;
    nextTick(() => {
        passwordInputRef.value?.focus();
    });
};

const resetSensitiveInfo = () => {
    sensitiveInfo.value = {
        contactPhone: '',
        idCard: '',
        socialCreditCode: ''
    };
    isRevealed.value = false;
};

const handleHideSensitive = () => {
    resetSensitiveInfo();
    ElMessage.success('敏感信息已隐藏');
};

const submitVerify = async () => {
    if (!verifyFormRef.value) return;
    await verifyFormRef.value.validate(async (valid) => {
        if (!valid) return;
        verifying.value = true;
        try {
            const res = await SubjectApi.getSubjectSensitiveInfo({
                subjectId: Number(route.query.id),
                username: verifyForm.username,
                password: verifyForm.password
            });
            if (res) {
                sensitiveInfo.value = res;
                isRevealed.value = true;
                verifyVisible.value = false;
                ElMessage.success('核验成功，敏感信息已查看');
            }
        } catch (error) {
            console.error('敏感信息核验失败', error);
        } finally {
            verifying.value = false;
        }
    });
};

const parseUrls = (urlsStr) => {
    if (!urlsStr) return [];
    try {
        const parsed = JSON.parse(urlsStr);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return urlsStr.split(',').filter(item => !!item);
    }
};

const loadDetail = async () => {
    const id = route.query.id;
    if (!id) return;
    resetSensitiveInfo();
    loading.value = true;
    try {
        const data = await SubjectApi.getSubject(id);
        subjectInfo.value = data || {};
    } catch (error) {
        console.error('获取主体详情失败', error);
    } finally {
        loading.value = false;
    }
};

watch(() => route.query.id, (newId) => {
    if (newId) {
        loadDetail();
    }
}, { immediate: true });

const handleBack = () => {
    router.back();
};

/**
 * 手机号脱敏：显示前3位和后4位，中间4位打码
 */
const maskPhone = (phone) => {
    const value = String(phone || '');
    if (!value) return '--';
    if (value.length <= 7) return value;
    return value.substring(0, 3) + '****' + value.substring(value.length - 4);
};

/**
 * 身份证脱敏：显示前3位和后4位，隐藏第4至14位
 */
const maskIdCard = (idCard) => {
    const value = String(idCard || '');
    if (!value) return '--';
    if (value.length <= 7) return value;
    return value.substring(0, 3) + '*'.repeat(value.length - 7) + value.substring(value.length - 4);
};

/**
 * 代码/身份证脱敏
 */
const maskCode = (code) => {
    if (!code) return '--';
    if (code.length <= 6) return '******';
    return code.substring(0, 4) + '**********' + code.substring(code.length - 2);
};
</script>

<style lang="scss" scoped>
.page-container {
    display: flex;
    flex-direction: column;
}

.page-scrollable {
    flex: 1;
    overflow-y: auto;
}

/* 内容卡片 */
.content-card {
    width: 100%;
    margin: 0 auto;
    padding: 14px;
    background: #fff;
    backdrop-filter: blur(10px);
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.05);
}

.card-header {
    margin-bottom: 20px;
    display: flex;
    align-items: center !important;
    justify-content: space-between;
    flex-direction: row;
    gap: 16px;

    .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #1F2937;
        position: relative;
        padding-left: 12px;
        line-height: 1.4;

        &::before {
            content: '';
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 16px;
            background: #00B3ED;
            border-radius: 2px;
        }
    }
}

.header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
}

.sensitive-toggle {
    height: 28px;
    padding: 0;
    border-radius: 6px;
    border: 0;
    background: transparent;
    color: #334155;
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    cursor: pointer;

    .el-icon {
        color: #94A3B8;
        font-size: 18px;
    }

    &:hover,
    &:focus-visible,
    &.is-active {
        color: #00B3ED;
        outline: none;

        .el-icon {
            color: #00B3ED;
        }
    }
}

.detail-list {
    border-radius: 8px;
    border: 1px solid #E2E8F0;
    overflow: hidden;
}

.detail-row {
    display: flex;
    border-bottom: 1px solid #E5E7EB;
    min-height: 54px;
    transition: background-color 0.2s ease;

    &:last-child,
    &.no-border {
        border-bottom: none;
    }

    &:hover {
        background-color: #F8FAFC;
    }

    .label {
        width: 160px;
        padding: 16px 24px;
        font-size: 14px;
        color: #475569;
        text-align: right;
        background-color: #F8FAFC;
        border-right: 1px solid #E2E8F0;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }

    .value {
        flex: 1;
        padding: 16px 24px;
        font-size: 14px;
        color: #1E293B;
        display: flex;
        align-items: center;
        line-height: 1.6;
    }
}

.img-preview-group {
    display: flex;
    align-items: center;
    gap: 20px;
}

.preview-box {
    width: 80px;
    height: 50px;
    background: #F8FAFC;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #E2E8F0;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover {
        border-color: #00B3ED;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10;

        .preview-img {
            transform: scale(1.2);
        }

        .el-icon {
            color: #00B3ED;
        }
    }

    .el-icon {
        font-size: 24px;
        color: #94A3B8;
        transition: color 0.3s;
    }

    .preview-img {
        width: 100%;
        height: 100%;
        display: block;
        transition: transform 0.3s ease-in-out;
    }
}

.id-card-boxes {
    display: flex;
    gap: 10px;
}

.mr4 {
    margin-right: 4px;
}

.mb16 {
    margin-bottom: 16px;
}

.mb20 {
    margin-bottom: 20px;
}
</style>

<style lang="scss">
/* 身份核验弹窗全局样式：用于覆盖 Teleport 到 body 下的弹窗组件 */
.verify-dialog.el-dialog,
.verify-dialog .el-dialog {
    width: 440px !important;
    border-radius: 12px !important;
    overflow: hidden;
    background-color: #fff !important;

    .el-dialog__header {
        margin-right: 0 !important;
        padding: 0 !important;
        border-bottom: 1px solid #F1F5F9;
    }

    .verify-dialog-header {
        height: 56px;
        padding: 0 12px 0 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
    }

    .verify-dialog-title {
        font-size: 18px;
        font-weight: 700;
        color: #1F2937;
        line-height: 56px;
    }

    .verify-dialog-close {
        min-width: 44px;
        height: 32px;
        padding: 0;
        border: 0;
        border-radius: 6px;
        background: transparent;
        color: #8A8F99;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        .el-icon {
            font-size: 20px;
        }

        &:hover {
            background: #F3F4F6;
            color: #00B3ED;
        }
    }

    .el-dialog__body {
        padding: 24px !important;
    }

    .el-dialog__footer {
        padding: 12px !important;
        border-top: 1px solid #F1F5F9;
    }

    .el-form-item__label {
        font-weight: 500;
        color: #64748B;
    }

    .submit-btn {
        padding-left: 24px;
        padding-right: 24px;
        background-color: #00B3ED;
        border-color: #00B3ED;

        &:hover {
            opacity: 0.9;
            background-color: #00B3ED;
        }
    }

    /* 内部的提示框样式也放入全局，以应用于 Dialog 内部的 DOM 树 */
    .verify-tip {
        font-size: 13px;
        color: #475569;
        background: #F0F9FF;
        padding: 12px 16px;
        border-radius: 6px;
        border-left: 4px solid #00B3ED;
        display: flex;
        align-items: center;
        line-height: 1.5;

        .el-icon {
            color: #00B3ED;
            font-size: 16px;
            margin-right: 4px;
        }
    }
}
</style>
