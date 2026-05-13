/**
 * 合格证开具流程状态管理
 * 用于在 createIssue、secondIssue、thirdIssue 三个页面间共享数据
 */
import { defineStore } from 'pinia'
import { DEFAULT_AGRI_MEASUREMENT_UNIT } from '@/utils/agriUnit'

export const useCertificateStore = defineStore('certificate', {
    state: () => ({
        // 当前步骤 (1, 2, 3)
        currentStep: 1,

        // Step 1: 产品档案信息
        productInfo: {
            linkProfile: 'yes',
            productNo: '',
            productName: '',
            category: '',
            origin: '',
            batchSize: '',
            unit: DEFAULT_AGRI_MEASUREMENT_UNIT,
            createDate: '',
            entity: '',
            productId: undefined,
            subjectId: undefined,
            linkUpstream: 'no',
            upstreamType: 'platform',
            upstreamCertNo: '',
            p1: true,
            p2: false,
            p3: false
        },

        // Step 2: 开具信息
        issueInfo: {
            issueType: 'buy',
            quantity: 0,
            unit: DEFAULT_AGRI_MEASUREMENT_UNIT,
            basis: ['quality'],
            thirdPartyType: '',
            platformType: '',
            testResultId: ''
        },

        // 生成的合格证信息
        certificate: {
            certNo: '',
            issueDate: '',
            qrCodeUrl: ''
        }
    }),

    actions: {
        // 设置当前步骤
        setStep(step) {
            this.currentStep = step
        },

        // 更新产品信息
        updateProductInfo(data) {
            Object.assign(this.productInfo, data)
        },

        // 更新开具信息
        updateIssueInfo(data) {
            Object.assign(this.issueInfo, data)
        },

        // 生成合格证编号
        generateCertificate() {
            const timestamp = Date.now()
            this.certificate.certNo = `HGZ${timestamp}`
            this.certificate.issueDate = new Date().toLocaleString('zh-CN')
            this.certificate.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${this.certificate.certNo}`
        },

        // 重置所有数据
        resetAll() {
            this.currentStep = 1
            this.productInfo = {
                linkProfile: 'yes',
                productNo: '',
                productName: '',
                category: '',
                origin: '',
                batchSize: '',
                unit: DEFAULT_AGRI_MEASUREMENT_UNIT,
                createDate: '',
                entity: '',
                productId: undefined,
                subjectId: undefined,
                linkUpstream: 'no',
                upstreamType: 'platform',
                upstreamCertNo: '',
                p1: true,
                p2: false,
                p3: false
            }
            this.issueInfo = {
                issueType: 'buy',
                quantity: 0,
                unit: DEFAULT_AGRI_MEASUREMENT_UNIT,
                basis: ['quality'],
                thirdPartyType: '',
                platformType: '',
                testResultId: ''
            }
            this.certificate = {
                certNo: '',
                issueDate: '',
                qrCodeUrl: ''
            }
        }
    }
})
