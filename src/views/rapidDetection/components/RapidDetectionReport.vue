<template>
  <div class="report-paper" ref="reportRef">
    <!-- 报告页眉标题 -->
    <div class="report-header">
      <h1>检测报告</h1>
      <h2 class="sub-title">Test Report</h2>
    </div>

    <!-- 报告简要封面信息 -->
    <div class="cover-info">
      <div class="top-fields">
        <p>报告编号：{{ data.recordCode || '--' }}</p>
        <p>样品名称：{{ data.sample?.sampleName || '--' }}</p>
        <p>报告日期：{{ data.detectionDate || data.testDate ? (data.detectionDate || data.testDate).split(' ')[0] : '--' }}</p>
      </div>
      <div class="org-container">
        <div class="org-line">
        {{ data.detectionOrgName || '--' }}
        <el-icon v-if="editable" class="edit-icon"><Edit /></el-icon>
      </div>
      </div>
    </div>

    <!-- 详细报表区块 -->
    <div class="report-main-table">
      <div v-if="overallStatusLabel" class="result-stamp" :class="overallStatusLabel">
        {{ overallStatusLabel }}
      </div>

      <div class="field-list-grid">
        <div class="f-row">
          <span class="f-label">样品编号：</span>
          <span class="f-value">{{ data.sample?.sampleCode }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">样品名称：</span>
          <span class="f-value">{{ data.sample?.sampleName }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">样品产地：</span>
          <span class="f-value">{{ data.sample?.productionArea }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">抽检区域：</span>
          <span class="f-value">{{ data.detectionArea }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">生产主体：</span>
          <span class="f-value">{{ data.subjectName || '--' }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">样品来源：</span>
          <span class="f-value">{{ Array.isArray(data.sample?.sampleSource) ? data.sample.sampleSource.join(', ') : data.sample?.sampleSource }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">样品状态：</span>
          <span class="f-value" :class="overallStatusValue === '阳性' ? 'text-red' : 'text-green'">{{ overallStatusValue }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">检测机构：</span>
          <span class="f-value">{{ data.detectionOrgName }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">检测人员：</span>
          <span class="f-value">{{ data.detector }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">检测日期：</span>
          <span class="f-value">{{ data.detectionDate ? formatDate(data.detectionDate, 'YYYY-MM-DD HH:mm:ss') : '--' }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">检测方法：</span>
          <span class="f-value">{{ data.detectionMethod }}</span>
        </div>
        <div class="f-row">
          <span class="f-label">检测依据：</span>
          <span class="f-value">{{ data.detectStandard }}</span>
        </div>
      </div>

      <h4 class="table-caption">检测结果：</h4>
      <table class="native-report-table">
        <thead>
          <tr>
            <th>通道</th>
            <th>检测项目</th>
            <th>检测值 (T/C值)</th>
            <th>浓度值(单位ppb)</th>
            <th>检测结果</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in results" :key="index">
            <td>{{ item.cardChannel || (index + 1) }}</td>
            <td>{{ item.codeName }}</td>
            <td>{{ item.result }}</td>
            <td>{{ item.concentration || '<500.00' }}</td>
            <td :class="item.status?.includes('阳') ? 'text-red' : 'text-green'">{{ item.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Edit } from '@element-plus/icons-vue';
import html2canvas from 'html2canvas';
import { ElMessage, ElLoading } from 'element-plus';
import { formatDate } from '@/utils/formatTime';

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  results: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: true
  }
});

const reportRef = ref(null);

const overallStatusValue = computed(() => {
    if (!props.results || props.results.length === 0) return '待检测';
    const hasAbnormal = props.results.some(item => item.status?.includes('异常'));
    if (hasAbnormal) return '异常';
    const isPositive = props.results.some(item => item.status?.includes('阳') || item.status?.includes('不合格'));
    return isPositive ? '阳性' : '阴性';
});

const overallStatusLabel = computed(() => {
    if (overallStatusValue.value === '异常' || overallStatusValue.value === '待检测') return '';
    return overallStatusValue.value === '阳性' ? '阳性' : '阴性';
});

const handleDownload = async () => {
    if (!reportRef.value) return;
    const loading = ElLoading.service({ text: '正在生成带水印报告...' });
    try {
        const canvas = await html2canvas(reportRef.value, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            onclone: (clonedDoc) => {
                const reportElement = clonedDoc.querySelector('.report-paper');
                if (reportElement) {
                    const wCanvas = clonedDoc.createElement('canvas');
                    wCanvas.width = 300;
                    wCanvas.height = 200;
                    const ctx = wCanvas.getContext('2d');
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '20px Arial';
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
                    ctx.translate(150, 100);
                    ctx.rotate(-Math.PI / 6);
                    ctx.fillText('壹拾检测', 0, 0);

                    const watermarkDiv = clonedDoc.createElement('div');
                    Object.assign(watermarkDiv.style, {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${wCanvas.toDataURL()})`,
                        backgroundRepeat: 'repeat',
                        pointerEvents: 'none',
                        zIndex: '9999'
                    });
                    reportElement.appendChild(watermarkDiv);
                }
            }
        });
        const link = document.createElement('a');
        link.download = `检测报告_${props.data.recordCode || new Date().getTime()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        ElMessage.success('报告下载成功');
    } catch (e) {
        console.error('导出失败', e);
        ElMessage.error('导出失败');
    } finally {
        loading.close();
    }
};

defineExpose({
    handleDownload
});
</script>

<style lang="scss" scoped>
.report-paper {
    background: #fff;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 20mm 15mm;
    box-shadow: 0 0 20px rgba(0,0,0,0.05);
    position: relative;
    color: #333;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    border-radius: 4px;

    .report-header {
        text-align: center;
        margin-bottom: 240px;
        h1 {
            font-size: 28px;
            font-weight: 700;
            color: #000;
            margin: 0;
            letter-spacing: 2px;
        }
        .sub-title {
            font-size: 32px;
            font-weight: 700;
            color: #000;
            margin-top: 5px;
            font-family: "Arial", sans-serif;
        }
    }

    .cover-info {
        margin-bottom: 40px;
        padding-left: 60px;
        
        .top-fields {
            margin-bottom: 30px;
            p {
                margin: 10px 0;
                font-size: 16px;
                color: #333;
            }
        }

        .org-container {
            text-align: center;
            .org-line {
                font-size: 16px;
                font-weight: 500;
                padding: 0 10px;
                border-bottom: none;
                display: inline-flex;
                align-items: center;
                gap: 10px;
                min-width: 320px;
                justify-content: center;
                
                .edit-icon {
                    font-size: 18px;
                    color: #666;
                }
            }
        }
    }

    .report-main-table {
        position: relative;
        padding-top: 20px;

        .result-stamp {
            width: 100px;
            height: 100px;
            border: 3px double #f56c6c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            font-weight: 800;
            color: #f56c6c;
            transform: rotate(-20deg);
            position: absolute;
            right: 40px;
            top: -10px;
            background: rgba(255, 255, 255, 0.9);
            z-index: 10;
            letter-spacing: 2px;
            
            &.阴性 {
                border-color: #67c23a;
                color: #67c23a;
            }
        }

        .field-list-grid {
            border-top: 1.5px solid #eee;
            
            .f-row {
                display: flex;
                border-bottom: 1.5px solid #eee;
                font-size: 15px;
                min-height: 44px;
                align-items: center;

                .f-label {
                    width: 140px;
                    padding: 10px 15px;
                    color: #333;
                    font-weight: 500;
                }

                .f-value {
                    flex: 1;
                    padding: 10px 15px;
                    color: #333;
                }
                
                .text-red { color: #f56c6c; font-weight: bold; }
                .text-green { color: #67c23a; font-weight: bold; }
            }
        }

        .table-caption {
            display: flex;
            width: 120px;
            margin: 30px 0 15px 0;
            font-size: 18px;
            font-weight: 700;
            color: #000;
        }

        .native-report-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #eee;
            
            th, td {
                border: 1.5px solid #eee;
                padding: 12px 8px;
                text-align: center;
                font-size: 14px;
                color: #333;
            }
            
            th {
                background: #fff;
                font-weight: 700;
                color: #000;
            }
            
            .text-red { color: #f56c6c; font-weight: bold; }
            .text-green { color: #67c23a; font-weight: bold; }
        }
    }
}
</style>
