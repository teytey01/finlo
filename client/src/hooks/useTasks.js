import { useState, useCallback } from 'react'

const BASE = '/api/tasks'
const COL_BASE = '/api/columns'

export function useTasks() {
  const [tasks, setTasks]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true); setError(null)
    try {
      const qs = new URLSearchParams()
      if (params.search)   qs.set('search',   params.search)
      if (params.status)   qs.set('status',   params.status)
      if (params.priority) qs.set('priority', params.priority)
      if (params.sort)     qs.set('sort',     params.sort)
      const url = qs.toString() ? `${BASE}?${qs}` : BASE
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch tasks')
      setTasks(await res.json())
    } catch {
      setError('Fin ran into a wave. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  const createTask = useCallback(async (payload) => {
    const res  = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    let data
    try { data = await res.json() } catch { throw new Error('Server returned invalid response. Check attachment sizes.') }
    if (!res.ok) throw new Error(data.error || 'Failed to create task')
    return data
  }, [])

  const updateTask = useCallback(async (id, payload) => {
    const res  = await fetch(`${BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    let data
    try { data = await res.json() } catch { throw new Error('Server returned invalid response. Check attachment sizes.') }
    if (!res.ok) throw new Error(data.error || 'Failed to update task')
    return data
  }, [])

  const toggleTask = useCallback(async (id) => {
    const res  = await fetch(`${BASE}/${id}/toggle`, { method: 'PATCH' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to toggle task')
    return data
  }, [])

  const moveTask = useCallback(async (id, payload) => {
    const res  = await fetch(`${BASE}/${id}/move`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to move task')
    return data
  }, [])

  const deleteTask = useCallback(async (id) => {
    const res  = await fetch(`${BASE}/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete task')
    return data
  }, [])

  return { tasks, loading, error, fetchTasks, createTask, updateTask, toggleTask, moveTask, deleteTask }
}

export function useColumns() {
  const [columns, setColumns]   = useState([])
  const [colLoading, setColLoad] = useState(false)

  const fetchColumns = useCallback(async () => {
    setColLoad(true)
    try {
      const res = await fetch(COL_BASE)
      if (!res.ok) throw new Error()
      setColumns(await res.json())
    } catch { /* silently fail */ } finally { setColLoad(false) }
  }, [])

  const createColumn = useCallback(async (payload) => {
    const res  = await fetch(COL_BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }, [])

  const updateColumn = useCallback(async (id, payload) => {
    const res  = await fetch(`${COL_BASE}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }, [])

  const reorderColumns = useCallback(async (order) => {
    const res  = await fetch(`${COL_BASE}/reorder`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order }) })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    setColumns(data)
  }, [])

  const deleteColumn = useCallback(async (id) => {
    const res  = await fetch(`${COL_BASE}/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    return data
  }, [])

  return { columns, colLoading, fetchColumns, createColumn, updateColumn, reorderColumns, deleteColumn }
}
