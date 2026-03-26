<!--
Sync Impact Report:
- Version change: 0.0.0 -> 1.0.0
- Modified principles: 
  - [PRINCIPLE_1_NAME] -> I. 业务驱动设计 (Business-Driven Design)
  - [PRINCIPLE_2_NAME] -> II. 前端架构标准体系 (Frontend Architecture Standards)
  - [PRINCIPLE_3_NAME] -> III. 数据闭环与溯源完整性 (Data Traceability & Integrity)
  - [PRINCIPLE_4_NAME] -> IV. 性能与交互体验优先 (Performance & UX First)
  - [PRINCIPLE_5_NAME] -> V. 基础设施复用 (Infrastructure Reusability)
- Added sections: 
  - 技术栈与合规约束 (Technology & Compliance)
  - 开发工作流规范 (Development Workflow)
- Removed sections: N/A
- Templates requiring updates: N/A
- Follow-up TODOs: 无
-->

# 农产品质量安全管理平台 Constitution

## Core Principles

### I. 业务驱动设计 (Business-Driven Design)
系统核心必须紧紧围绕“主体建档、质量检测（快检/抽查）、合格证开具与产品溯源”四大核心业务展开。任何架构演进和模块划分必须直接服务于农业监管和追溯的安全闭环，避免与业务脱节的过度设计。

### II. 前端架构标准体系 (Frontend Architecture Standards)
必须严格遵循选定的技术栈基线：采用 Vue3 (Composition API) 结合 Vite 构建；基础组件严格限定为 Element Plus，数据可视化大屏及统计分析统一采用 Echarts。高度贴合芋道源码体系的开发范式，确保技术栈的纯粹性。

### III. 数据闭环与溯源完整性 (Data Traceability & Integrity)
检测结果、合格证出具等关键业务数据的流转必须保持唯一性和准确性。对于核心的检测报告打印、下载等功能，必须保障数据脱敏输出和原始数据防篡改机制，确保每一张合格证或追溯码均能完整映射从田间到餐桌的全链路档案。

### IV. 性能与交互体验优先 (Performance & UX First)
面对涉农用户及大量操作（如快速批量开具合格证、报告生成下载），必须提供稳定流畅的用户体验。高频交互须支持异步防抖与加载反馈，大体积报告或数据导出应具备异步处理与进度提示。

### V. 基础设施复用 (Infrastructure Reusability)
严禁重复造轮子。新开发模块必须优先复用芋道源码底层提供的权限管控（RBAC）、数据字典（Dict）、通用工具 Hook 以及通用页面模板，保持系统风格一致并降低后续维护成本。

## 技术栈与合规约束 (Technology & Compliance)

- **核心框架**: Vue3 + Vite
- **UI 及可视化**: Element Plus + Echarts + WangEditor
- **底座支撑**: 基于芋道管理后台体系
- **业务标准**: 需符合国家《农产品质量安全法》对主体备案、检测记录和合格证的数据格式与上报规范。报告打印功能需兼容主流浏览器及移动终端。

## 开发工作流规范 (Development Workflow)

所有新功能开发需遵循 Spec-Kit 定义的规范流程。从需求定义（Spec）出发，完成计划制定（Plan）和任务拆解（Tasks）后，方可进入实施环节。代码合并前，核心业务模块必须包含必要的自动化或验收测试验证，尤其是针对检测报告的出具核心逻辑。

## Governance

本宪章为《农产品质量安全管理平台》前端研发与演进的最高指导原则。任何试图偏离上述技术栈（如引入第二套 UI 库或图表库）或违背数据协同工作流的行为，均需提交变更说明并由核心技术成员审核批准。

**Version**: 1.0.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-26
