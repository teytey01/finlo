import { useState, useCallback } from 'react'

const BASE = '/api/tasks'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const qs = new URLSearchParams()
      if (params.search) qs.set('search', params.search)
      if (params.status) qs.set('status', params.status)
      if (params.priority) qs.set('priority', params.priority)
      if (params.sort) qs.set('sort', params.sort)
      const url = qs.toString() ? `${BASE}?${qs}` : BASE
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      setError("Fin ran into a wave. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = useCallback(async (payload) => {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to create task')
    return data
  }, [])

  const updateTask = useCallback(async (id, payload) => {
    const res = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update task')
    return data
  }, [])

  const toggleTask = useCallback(async (id) => {
    const res = await fetch(`${BASE}/${id}/toggle`, { method: 'PATCH' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to toggle task')
    return data
  }, [])

  const deleteTask = useCallback(async (id) => {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete task')
    return data
  }, [])

  return { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, deleteTask }
}
