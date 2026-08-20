import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../services/api.js'

export const useUploadHistory = () => {
  return useQuery({
    queryKey: ['upload-history'],
    queryFn: async () => {
      const { data } = await api.get('/api/upload-history')
      return data
    },
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some(
        (item) => item.processing_status === 'pending' || item.processing_status === 'processing',
      )
      return hasProcessing ? 2000 : false
    },
  })
}

export const useFileUpload = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ logPlusFile, vrLearningFile, onProgress }) => {
      const formData = new FormData()
      formData.append('log_plus', logPlusFile)
      formData.append('vr_learning', vrLearningFile)

      const { data } = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (!event.total) return
          const percent = Math.round((event.loaded * 100) / event.total)
          onProgress?.(percent)
        },
      })

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upload-history'] })
      queryClient.invalidateQueries({ queryKey: ['/api/data/mandatory-2026'] })
      queryClient.invalidateQueries({ queryKey: ['/api/data/mandatory-2026'] })
      queryClient.invalidateQueries({ queryKey: ['/api/data/log-plus'] })
      queryClient.invalidateQueries({ queryKey: ['/api/data/vr-learning'] })
    },
  })
}
