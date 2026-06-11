import { getPaginationRowModel, getSortedRowModel } from '@tanstack/vue-table'

type UseTablePaginationProps = {
  pageIndex?: number
  pageSize?: number
}

export const useTablePagination = ({ pageIndex, pageSize }: UseTablePaginationProps = {}) => {
  const pagination = ref({
    pageIndex: pageIndex ?? 0,
    pageSize: pageSize ?? 20,
  })

  const globalFilter = ref('')

  return {
    pagination,
    globalFilter,
    getPaginationRowModel,
    getSortedRowModel,
  }
}
