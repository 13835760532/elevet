<template>
    <div class="success-container">
        <div class="success-card">
            <!-- 顶部标题 -->
            <div class="page-header">账号备案</div>

            <!-- 成功状态区 -->
            <div class="status-section">
                <div class="success-icon-wrapper">
                    <div class="success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                            stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                </div>
                <h1 class="status-title">备案提交成功！</h1>
                <p class="status-desc">
                    你的备案信息已提交成功。可使用<router-link to="/index" class="link-text">跳转主页</router-link>开展检测工作
                </p>
            </div>

            <!-- 分隔线 -->
            <div class="divider"></div>

            <!-- 功能引导区 -->
            <div class="features-section">
                <h2 class="section-title">备案完成可使用下列功能</h2>

                <div class="business-grid">
                    <div class="business-card">
                        <div class="card-icon blue-bg">
                            <svg-icon icon-class="list" class-name="card-svg" />
                        </div>
                        <div class="card-info">
                            <h3 class="card-title">快检任务</h3>
                            <p class="card-desc">方案创建 | 任务拆分 | 任务监控 | 检测结果</p>
                        </div>
                    </div>

                    <div class="business-card">
                        <div class="card-icon light-blue-bg border-blue">
                            <svg-icon icon-class="edit" class-name="card-svg" />
                        </div>
                        <div class="card-info">
                            <h3 class="card-title">快速检测</h3>
                            <p class="card-desc">样品录入 | AI判读 | 检测结果 | 检测报告</p>
                        </div>
                    </div>

                    <div class="business-card">
                        <div class="card-icon blue-bg">
                            <svg-icon icon-class="clipboard" class-name="card-svg" />
                        </div>
                        <div class="card-info">
                            <h3 class="card-title">合格证管理</h3>
                            <p class="card-desc">合格证开具 | 查验 | 存证</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
.success-container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    min-height: calc(100vh - 84px);
    background: linear-gradient(180deg, #D9EFFF 0%, #FFFFFF 100%);
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    padding: 40px 20px;
}

.success-card {
    width: 100%;
    max-width: 1000px;
    background: #fff;
    border-radius: 40px;
    padding: 40px 60px 80px 60px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    position: relative;
}

.page-header {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 40px;
    text-align: left;
}

/* 状态区 */
.status-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 60px;

    .success-icon-wrapper {
        width: 120px;
        height: 120px;
        background-color: #f0fdf4;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 30px;

        .success-icon {
            width: 60px;
            height: 60px;
            background-color: #22c55e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            padding: 12px;

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .status-title {
        font-size: 40px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0 0 20px 0;
    }

    .status-desc {
        font-size: 16px;
        color: #666;
        margin: 0;

        .link-text {
            color: #1a56ff;
            text-decoration: none;
            font-weight: 500;
            margin: 0 4px;

            &:hover {
                text-decoration: underline;
            }
        }
    }
}

.divider {
    width: 100%;
    height: 1px;
    border-top: 1px dashed #e5e7eb;
    margin-bottom: 50px;
}

/* 功能引导区 */
.features-section {
    text-align: left;

    .section-title {
        font-size: 18px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 40px;
    }

    .business-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;

        .business-card {
            display: flex;
            align-items: center;
            gap: 16px;

            .card-icon {
                width: 64px;
                height: 64px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;

                .card-svg {
                    width: 32px;
                    height: 32px;
                    color: #fff;
                }

                &.blue-bg {
                    background-color: #1a56ff;
                }

                &.light-blue-bg {
                    background-color: #fff;

                    &.border-blue {
                        border: 2px solid #1a56ff;

                        .card-svg {
                            color: #1a56ff;
                        }
                    }
                }
            }

            .card-info {
                .card-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin: 0 0 8px 0;
                }

                .card-desc {
                    font-size: 13px;
                    color: #666;
                    line-height: 1.4;
                    margin: 0;
                }
            }
        }
    }
}

/* 响应式适配 */
@media (max-width: 900px) {
    .business-grid {
        grid-template-columns: 1fr !important;
        gap: 20px !important;
    }

    .success-card {
        padding: 30px 20px 60px 20px;
        border-radius: 10px;
    }

    .status-title {
        font-size: 28px !important;
    }
}
</style>
