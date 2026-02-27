import { ref, reactive, onMounted } from 'vue'

interface UseTableDataConfig {
    fetchApi: (params: any) => Promise<{ rows: any[], total: number }>
    defaultQuery?: any
    immediate?: boolean
}

export const useTableData = (config: UseTableDataConfig) => {
    const tableData = ref<any[]>([])
    const loading = ref(false)
    const total = ref(0)
    
    const pagination = reactive({
        pageNum: 1,
        pageSize: 10
    })

    const queryParams = reactive({
        ...(config.defaultQuery || {})
    })

    const fetchData = async () => {
        loading.value = true
        try {
            const params = {
                pageNo: pagination.pageNum,
                pageSize: pagination.pageSize,
                ...queryParams
            }
            const res = await config.fetchApi(params)
            tableData.value = res.rows
            total.value = res.total
        } catch (error) {
            console.error('Fetch table data failed:', error)
        } finally {
            loading.value = false
        }
    }

    const resetQuery = () => {
        if (config.defaultQuery) {
            Object.keys(queryParams).forEach(key => {
                queryParams[key] = config.defaultQuery[key]
            })
        }
        pagination.pageNum = 1
        fetchData()
    }

    if (config.immediate) {
        onMounted(() => {
            fetchData()
        })
    }

    return {
        tableData,
        loading,
        total,
        pagination,
        queryParams,
        fetchData,
        resetQuery
    }
}
