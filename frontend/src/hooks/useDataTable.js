import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'
import api from '../services/api.js'

export const useDataTable = (endpoint, { defaultLimit = 100, initialFilters = {} } = {}) => {
  const [page, setPage] = useState(1)
  const [limit] = useState(defaultLimit)
  const [filters, setFilters] = useState(initialFilters)
  const [search, setSearch] = useState('')

  const queryKey = useMemo(
    () => [endpoint, page, limit, filters, search],
    [endpoint, page, limit, filters, search],
  )

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = {
        page,
        limit,
        ...filters,
      }
      if (search) params.search = search

      const { data: response } = await api.get(endpoint, { params })
      return response
    },
    placeholderData: keepPreviousData,
  })

  const updateFilter = useCallback((key, value) => {
    setPage(1)
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setPage(1)
    setFilters(initialFilters)
    setSearch('')
  }, [initialFilters])

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? page,
    pageSize: data?.pageSize ?? limit,
    totalPages: data?.totalPages ?? 0,
    appliedFilters: data?.filters ?? filters,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    page,
    setPage,
    search,
    setSearch: (value) => {
      setPage(1)
      setSearch(value)
    },
    filters,
    updateFilter,
    resetFilters,
  }
}
