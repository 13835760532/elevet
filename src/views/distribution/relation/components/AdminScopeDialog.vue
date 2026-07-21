<template>
  <Dialog v-model="dialogVisible" title="设定行政层级范围" width="1000px">
    <div class="scope-container">
      <table class="custom-scope-table">
        <thead>
          <tr>
            <th width="80"></th>
            <th width="50"></th>
            <th>行政区域代码</th>
            <th>行政区域名称</th>
            <th>城市代码</th>
            <th>城市名称</th>
            <th>区县代码</th>
            <th>区/县名称</th>
            <th>乡镇代码</th>
            <th>乡镇名称</th>
          </tr>
        </thead>
        <tbody>
          <!-- 省维度 -->
          <tr>
            <td class="row-label">省维度</td>
            <td><el-checkbox v-model="scopeData.prov.checked" /></td>
            <td class="color-blue">{{ scopeData.prov.provCode }}</td>
            <td class="color-blue">{{ scopeData.prov.provName }}</td>
            <td class="color-blue">{{ scopeData.prov.cityCode }}</td>
            <td class="color-gray">{{ scopeData.prov.cityName }}</td>
            <td class="color-gray">{{ scopeData.prov.distCode }}</td>
            <td class="color-gray">{{ scopeData.prov.distName }}</td>
            <td class="color-gray">{{ scopeData.prov.townCode }}</td>
            <td class="color-gray">{{ scopeData.prov.townName }}</td>
          </tr>
          <!-- 市维度 -->
          <tr>
            <td class="row-label">市维度</td>
            <td><el-checkbox v-model="scopeData.city.checked" /></td>
            <td class="color-pink">{{ scopeData.city.provCode }}</td>
            <td class="color-pink">{{ scopeData.city.provName }}</td>
            <td class="color-pink">{{ scopeData.city.cityCode }}</td>
            <td class="color-pink">{{ scopeData.city.cityName }}</td>
            <td class="color-pink">{{ scopeData.city.distCode }}</td>
            <td class="color-gray">{{ scopeData.city.distName }}</td>
            <td class="color-gray">{{ scopeData.city.townCode }}</td>
            <td class="color-gray">{{ scopeData.city.townName }}</td>
          </tr>
          <!-- 区/县维度 -->
          <tr>
            <td class="row-label">区/县维度</td>
            <td><el-checkbox v-model="scopeData.dist.checked" /></td>
            <td class="color-purple">{{ scopeData.dist.provCode }}</td>
            <td class="color-purple">{{ scopeData.dist.provName }}</td>
            <td class="color-purple">{{ scopeData.dist.cityCode }}</td>
            <td class="color-purple">{{ scopeData.dist.cityName }}</td>
            <td class="color-purple">{{ scopeData.dist.distCode }}</td>
            <td class="color-purple">{{ scopeData.dist.distName }}</td>
            <td class="color-gray">{{ scopeData.dist.townCode }}</td>
            <td class="color-gray">{{ scopeData.dist.townName }}</td>
          </tr>
          <!-- 乡镇维度 -->
          <tr>
            <td class="row-label">乡镇维度</td>
            <td><el-checkbox v-model="scopeData.town.checked" /></td>
            <td class="color-black">{{ scopeData.town.provCode }}</td>
            <td class="color-black">{{ scopeData.town.provName }}</td>
            <td class="color-black">{{ scopeData.town.cityCode }}</td>
            <td class="color-black">{{ scopeData.town.cityName }}</td>
            <td class="color-black">{{ scopeData.town.distCode }}</td>
            <td class="color-black">{{ scopeData.town.distName }}</td>
            <td class="color-black">{{ scopeData.town.townCode }}</td>
            <td class="color-black">{{ scopeData.town.townName }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">保存</el-button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const dialogVisible = ref(false)

// 按照需求，拿河北省举例数据
const mockHebeiData = {
  prov: { checked: true, provCode: '110000', provName: '河北省', cityCode: '1169', cityName: '-', distCode: '-', distName: '-', townCode: '-', townName: '-' },
  city: { checked: true, provCode: '110000', provName: '河北省', cityCode: '1169', cityName: '保定市', distCode: '211', distName: '-', townCode: '-', townName: '-' },
  dist: { checked: true, provCode: '110000', provName: '河北省', cityCode: '1169', cityName: '保定市', distCode: '211', distName: '乐山县', townCode: '-', townName: '-' },
  town: { checked: true, provCode: '110000', provName: '河北省', cityCode: '1169', cityName: '保定市', distCode: '211', distName: '灵寿县', townCode: '12121222', townName: '额吉淖尔苏木' }
}

const scopeData = reactive(JSON.parse(JSON.stringify(mockHebeiData)))

const callbackFn = ref<Function>()

/**\n * open：为当前页面提供局部业务处理能力，输入来自组件状态或调用方参数，输出供页面后续渲染或业务分支使用。\n */
const open = (cb?: Function) => {
  if (cb) {
    callbackFn.value = cb
  }
  // 每次打开重置为模拟数据
  Object.assign(scopeData, JSON.parse(JSON.stringify(mockHebeiData)))
  dialogVisible.value = true
}

/**\n * handleConfirm：处理页面事件或组件回调。读取当前表单、列表或路由状态后执行对应交互，并同步本组件需要更新的响应式数据。\n */
const handleConfirm = () => {
  // TODO: 这里应根据用户的实际勾选逻辑计算出 areaCode。这里提供一个模拟的计算逻辑
  let selectedCode = ''
  if (scopeData.town.checked) {
    selectedCode = scopeData.town.townCode
  } else if (scopeData.dist.checked) {
    selectedCode = scopeData.dist.distCode
  } else if (scopeData.city.checked) {
    selectedCode = scopeData.city.cityCode
  } else if (scopeData.prov.checked) {
    selectedCode = scopeData.prov.provCode
  }
  
  if (callbackFn.value) {
    callbackFn.value(selectedCode)
  }
  dialogVisible.value = false
}

defineExpose({ open })
</script>

<style scoped lang="scss">
.scope-container {
  padding: 10px 0;
  overflow-x: auto;
}

.custom-scope-table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 13px;
  
  th, td {
    border: 1px solid #ebeef5;
    padding: 12px 8px;
  }
  
  th {
    background-color: #f5f7fa;
    color: #606266;
    font-weight: 600;
  }
  
  .row-label {
    font-weight: 600;
    color: #333;
  }
  
  /* 根据设计图的文字颜色 */
  .color-blue {
    color: #1a54ff;
    font-weight: 500;
  }
  
  .color-pink {
    color: #e83e8c;
    font-weight: 500;
  }
  
  .color-purple {
    color: #6f42c1;
    font-weight: 500;
  }
  
  .color-black {
    color: #333;
    font-weight: 500;
  }
  
  .color-gray {
    color: #333;
  }
}
</style>
