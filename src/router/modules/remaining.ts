import { Layout } from '@/utils/routerHelper'

const { t } = useI18n()
/**
 * redirect: noredirect        当设置 noredirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'          设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * meta : {
 hidden: true              当设置 true 的时候该路由不会再侧边栏出现 如404，login等页面(默认 false)

 alwaysShow: true          当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式，
 只有一个时，会将那个子路由当做根路由显示在侧边栏，
 若你想不管路由下面的 children 声明的个数都显示你的根路由，
 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，
 一直显示根路由(默认 false)

 title: 'title'            设置该路由在侧边栏和面包屑中展示的名字

 icon: 'svg-name'          设置该路由的图标

 noCache: true             如果设置为true，则不会被 <keep-alive> 缓存(默认 false)

 breadcrumb: false         如果设置为false，则不会在breadcrumb面包屑中显示(默认 true)

 affix: true               如果设置为true，则会一直固定在tag项中(默认 false)

 noTagsView: true          如果设置为true，则不会出现在tag中(默认 false)

 activeMenu: '/dashboard'  显示高亮的路由路径

 followAuth: '/dashboard'  跟随哪个路由进行权限过滤

 canTo: true               设置为true即使hidden为true，也依然可以进行路由跳转(默认 false)
 }
 **/
const remainingRouter: AppRouteRecordRaw[] = [
  {
    path: '/redirect',
    component: Layout,
    name: 'Redirect',
    children: [
      {
        path: '/redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/Redirect/Redirect.vue'),
        meta: {}
      }
    ],
    meta: {
      hidden: true,
      noTagsView: true
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/index',
    name: 'Home',
    meta: {},
    children: [
      {
        path: 'index',
        component: () => import('@/views/Home/Index.vue'),
        name: 'Index',
        meta: {
          title: t('router.home'),
          icon: 'ep:home-filled',
          noCache: false,
          affix: true
        }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'UserInfo',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'profile',
        component: () => import('@/views/Profile/Index.vue'),
        name: 'Profile',
        meta: {
          canTo: true,
          hidden: true,
          noTagsView: false,
          icon: 'ep:user',
          title: t('common.profile')
        }
      },
      {
        path: 'notify-message',
        component: () => import('@/views/system/notify/my/index.vue'),
        name: 'MyNotifyMessage',
        meta: {
          canTo: true,
          hidden: true,
          noTagsView: false,
          icon: 'ep:message',
          title: '我的站内信'
        }
      }
    ]
  },
  {
    path: '/dict',
    component: Layout,
    name: 'dict',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'type/data/:dictType',
        component: () => import('@/views/system/dict/data/index.vue'),
        name: 'SystemDictData',
        meta: {
          title: '字典数据',
          noCache: true,
          hidden: true,
          canTo: true,
          icon: '',
          activeMenu: '/system/dict'
        }
      }
    ]
  },

  {
    path: '/codegen',
    component: Layout,
    name: 'CodegenEdit',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'edit',
        component: () => import('@/views/infra/codegen/EditTable.vue'),
        name: 'InfraCodegenEditTable',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:edit',
          title: '修改生成配置',
          activeMenu: 'infra/codegen/index'
        }
      }
    ]
  },
  {
    path: '/job',
    component: Layout,
    name: 'JobL',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'job-log',
        component: () => import('@/views/infra/job/logger/index.vue'),
        name: 'InfraJobLog',
        meta: {
          noCache: true,
          hidden: true,
          canTo: true,
          icon: 'ep:edit',
          title: '调度日志',
          activeMenu: 'infra/job/index'
        }
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/Login/Login.vue'),
    name: 'Login',
    meta: {
      hidden: true,
      title: t('router.login'),
      noTagsView: true
    }
  },
  {
    path: '/register',
    component: () => import('@/views/Login/register.vue'),
    name: 'Register',
    meta: {
      hidden: true,
      title: '注册',
      noTagsView: true
    }
  },
  {
    path: '/forgotPassword',
    component: () => import('@/views/Login/forgot-password.vue'),
    name: 'ForgotPassword',
    meta: {
      hidden: true,
      title: '忘记密码',
      noTagsView: true
    }
  },
  {
    path: '/reset-password',
    component: () => import('@/views/Login/reset-password.vue'),
    name: 'ResetPassword',
    meta: {
      hidden: true,
      title: '重置密码',
      noTagsView: true
    }
  },
  {
    path: '/403',
    component: () => import('@/views/Error/403.vue'),
    name: 'NoAccess',
    meta: {
      hidden: true,
      title: '403',
      noTagsView: true
    }
  },
  {
    path: '/404',
    component: () => import('@/views/Error/404.vue'),
    name: 'NoFound',
    meta: {
      hidden: true,
      title: '404',
      noTagsView: true
    }
  },
  {
    path: '/500',
    component: () => import('@/views/Error/500.vue'),
    name: 'Error',
    meta: {
      hidden: true,
      title: '500',
      noTagsView: true
    }
  },
  {
    path: '/member',
    component: Layout,
    name: 'MemberCenter',
    meta: { hidden: true },
    children: [
      {
        path: 'user/detail/:id',
        name: 'MemberUserDetail',
        meta: {
          title: '会员详情',
          noCache: true,
          hidden: true
        },
        component: () => import('@/views/member/user/detail/index.vue')
      }
    ]
  },
  {
    path: '/fastCheckPlan',
    component: Layout,
    name: 'FastCheckPlan',
    meta: { hidden: true },
    children: [
      {
        path: 'scheme',
        component: () => import('@/views/fastCheckPlan/scheme/index.vue'),
        name: 'CheckScheme',
        meta: { title: '快检方案管理', activeMenu: '/fastCheckPlan/scheme' }
      },
      {
        path: 'schemeCreate',
        component: () => import('@/views/fastCheckPlan/scheme/createScheme.vue'),
        name: 'CheckSchemeCreate',
        meta: { title: '创建方案', activeMenu: '/fastCheckPlan/scheme' }
      },
      {
        path: 'schemeTask',
        component: () => import('@/views/fastCheckPlan/scheme/schemeTask.vue'),
        name: 'CheckSchemeTask',
        meta: { title: '任务分配', activeMenu: '/fastCheckPlan/scheme' }
      },
      {
        path: 'createSchemeTask',
        component: () => import('@/views/fastCheckPlan/scheme/createSchemeTask.vue'),
        name: 'CreateSchemeTask',
        meta: { title: '创建任务', activeMenu: '/fastCheckPlan/scheme' }
      },
      {
        path: 'task',
        component: () => import('@/views/fastCheckPlan/task/index.vue'),
        name: 'CheckTask',
        meta: { title: '快检任务接收', activeMenu: '/fastCheckPlan/task' }
      },
      {
        path: 'taskAllocate',
        component: () => import('@/views/fastCheckPlan/task/taskAllocate.vue'),
        name: 'CheckTaskAllocate',
        meta: { title: '任务转派', activeMenu: '/fastCheckPlan/task' }
      }
    ]
  },
  // 2-建档备案
  {
    path: '/filing',
    component: Layout,
    name: 'Filing',
    meta: { hidden: true },
    children: [
      {
        path: 'filingForm',
        component: () => import('@/views/filing/filingForm.vue'),
        name: 'FilingForm',
        meta: { title: '主体建档表单', activeMenu: '/filing/subject' }
      },
      {
        path: 'filingSuccess',
        component: () => import('@/views/filing/filingSuccess.vue'),
        name: 'FilingSuccess',
        meta: { title: '备案成功', activeMenu: '/filing/subject' }
      },
      {
        path: 'subject',
        component: () => import('@/views/filing/subject/index.vue'),
        name: 'FilingSubject',
        meta: { title: '主体建档', activeMenu: '/filing/subject' },
      },
      {
        path: 'subjectBatch',
        component: () => import('@/views/filing/subject/batchFiling.vue'),
        name: 'FilingSubjectBatch',
        meta: { title: '批量建档', activeMenu: '/filing/subject' }
      },
      {
        path: 'subjectCreate',
        component: () => import('@/views/filing/subject/create.vue'),
        name: 'FilingSubjectCreate',
        meta: { title: '主体建档', activeMenu: '/filing/subject' }
      },
      {
        path: 'subjectDetail',
        component: () => import('@/views/filing/subject/productDetail.vue'),
        name: 'FilingSubjectDetail',
        meta: { title: '主体详情', activeMenu: '/filing/subject' }
      },
      {
        path: 'product',
        component: () => import('@/views/filing/product/index.vue'),
        name: 'FilingProduct',
        meta: { title: '产品建档', activeMenu: '/filing/product' }
      },
      {
        path: 'productBatch',
        component: () => import('@/views/filing/product/batchCreate.vue'),
        name: 'FilingProductBatch',
        meta: { title: '批量建档', activeMenu: '/filing/product' }
      },
      {
        path: 'productCreate',
        component: () => import('@/views/filing/product/create.vue'),
        name: 'FilingProductCreate',
        meta: { title: '产品建档', activeMenu: '/filing/product' }
      },
      {
        path: 'productDetail',
        component: () => import('@/views/filing/product/productDetail.vue'),
        name: 'FilingProductDetail',
        meta: { title: '产品详情', activeMenu: '/filing/product' }
      },
    ]
  },
  // 快速检测
  {
    path: '/rapidDetection',
    component: Layout,
    name: 'RapidDetection',
    meta: { hidden: true },
    children: [
      {
        path: 'task',
        component: () => import('@/views/rapidDetection/task/index.vue'),
        name: 'RapidTask',
        meta: { title: '任务检测管理', activeMenu: '/rapidDetection/task' }
      },
      {
        path: 'taskDetection',
        component: () => import('@/views/rapidDetection/task/taskDetection.vue'),
        name: 'RapidTaskDetection',
        meta: { title: '任务检测', activeMenu: '/rapidDetection/task' }
      },
      {
        path: 'taskResult',
        component: () => import('@/views/rapidDetection/task/taskResult.vue'),
        name: 'RapidTaskResult',
        meta: { title: '任务结果', activeMenu: '/rapidDetection/task' }
      },
      {
        path: 'self',
        component: () => import('@/views/rapidDetection/self/index.vue'),
        name: 'RapidSelf',
        meta: { title: '自主检测管理', activeMenu: '/rapidDetection/self' }
      },
      {
        path: 'create',
        component: () => import('@/views/rapidDetection/rapidDetectionCreate.vue'),
        name: 'RapidDetectionCreate',
        meta: { title: '检测录入', activeMenu: '/rapidDetection/self' }
      },
      {
        path: 'batchImportData',
        component: () => import('@/views/rapidDetection/batchImportData.vue'),
        name: 'RapidBatchImportData',
        meta: { title: '检测批量导入', activeMenu: '/rapidDetection/self' }
      },
    ]
  },
  // 合格证
  {
    path: '/certificate',
    component: Layout,
    name: 'Certificate',
    meta: { hidden: true },
    children: [
      {
        path: 'issue',
        component: () => import('@/views/certificate/issue/index.vue'),
        name: 'CertificateIssue',
        meta: { title: '合格证开具', activeMenu: '/certificate/issue' }
      },
      {
        path: 'issue/create',
        component: () => import('@/views/certificate/issue/createIssue.vue'),
        name: 'CertificateCreate',
        meta: { title: '合格证开具详细', activeMenu: '/certificate/issue' }
      },
      {
        path: 'issue/detail/:id',
        component: () => import('@/views/certificate/issue/issueDetail.vue'),
        name: 'CertificateDetail',
        meta: { hidden: true, title: '合格证详情', activeMenu: '/certificate/issue' }
      },
      {
        path: 'verify',
        component: () => import('@/views/certificate/verify/index.vue'),
        name: 'CertificateVerify',
        meta: { title: '合格证查验', activeMenu: '/certificate/verify' }
      },
      {
        path: 'verify/detail',
        component: () => import('@/views/certificate/verify/verifyDetail.vue'),
        name: 'CertificateVerifyDetail',
        meta: { hidden: true, title: '合格证查验-本平台', activeMenu: '/certificate/verify' }
      },
      {
        path: 'verify/other',
        component: () => import('@/views/certificate/verify/verifyOther.vue'),
        name: 'CertificateVerifyOther',
        meta: { hidden: true, title: '合格证查验-其他平台', activeMenu: '/certificate/verify' }
      },
      {
        path: 'jurisdiction',
        component: () => import('@/views/certificate/jurisdiction/index.vue'),
        name: 'CertificateJurisdiction',
        meta: { title: '辖区合格证', activeMenu: '/certificate/jurisdiction' }
      },
    ]
  },
  {
    path: '/productTraceability',
    component: Layout,
    name: 'ProductTraceability',
    meta: { hidden: true },
    children: [
      {
        path: 'index',
        component: () => import('@/views/productTraceability/index.vue'),
        name: 'ProductTraceabilityIndex',
        meta: { title: '产品溯源', activeMenu: '/productTraceability' }
      }
    ]
  },
  // 标准指标查询
  {
    path: '/standard',
    component: Layout,
    name: 'Standard',
    meta: { hidden: true },
    children: [
      {
        path: 'limit',
        component: () => import('@/views/standard/limit/index.vue'),
        name: 'StandardLimit',
        meta: { title: '国标限量', activeMenu: '/standard/limit' }
      },
      {
        path: 'recommend',
        component: () => import('@/views/standard/recommend/index.vue'),
        name: 'StandardRecommend',
        meta: { title: '指标推荐', activeMenu: '/standard/recommend' }
      },
      {
        path: 'manage',
        component: () => import('@/views/standard/manage/index.vue'),
        name: 'StandardManage',
        meta: { title: '指标限量管理', activeMenu: '/standard/manage' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/Error/404.vue'),
    name: '',
    meta: {
      title: '404',
      hidden: true,
      breadcrumb: false
    }
  },
  {
    path: '/iot',
    component: Layout,
    name: 'IOT',
    meta: {
      hidden: true
    },
    children: [
      {
        path: 'product/product/detail/:id',
        name: 'IoTProductDetail',
        meta: {
          title: '产品详情',
          noCache: true,
          hidden: true,
          activeMenu: '/iot/device/product'
        },
        component: () => import('@/views/iot/product/product/detail/index.vue')
      },
      {
        path: 'device/detail/:id',
        name: 'IoTDeviceDetail',
        meta: {
          title: '设备详情',
          noCache: true,
          hidden: true,
          activeMenu: '/iot/device/device'
        },
        component: () => import('@/views/iot/device/device/detail/index.vue')
      },
      {
        path: 'ota/operation/firmware/detail/:id',
        name: 'IoTOtaFirmwareDetail',
        meta: {
          title: '固件详情',
          noCache: true,
          hidden: true,
          activeMenu: '/iot/operation/ota/firmware'
        },
        component: () => import('@/views/iot/ota/firmware/detail/index.vue')
      }
    ]
  }
]

export default remainingRouter
