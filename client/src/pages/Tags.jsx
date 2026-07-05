import { useState, useMemo } from 'react'
import TaskCard from '../components/TaskCard'
import { IconX } from '../components/Icons'

function TagIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

export default function Tags({ tasks, onToggle, onEdit, onDelete, onRefresh }) {
  const [selectedTag, setSelectedTag] = useState(null)

  // Collect all unique tags with their task counts
  const tagMap = useMemo(() => {
    const map = {}
    tasks.forEach(task => {
      const tags = Array.isArray(task.tags) ? task.tags : []
      tags.forEach(tag => {
        if (!map[tag]) map[tag] = { name: tag, tasks: [] }
        map[tag].tasks.push(task)
      })
    })
    // Sort by task count descending
    return Object.values(map).sort((a, b) => b.tasks.length - a.tasks.length)
  }, [tasks])

  const tasksWithNoTag = tasks.filter(t =>
    !Array.isArray(t.tags) || t.tags.length === 0
  )

  const filteredTasks = selectedTag
    ? (tagMap.find(t => t.name === selectedTag)?.tasks || [])
    : []

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <div className="page-header-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TagIcon size={20} color="var(--color-neon-blue)" />
            Tags
          </div>
          <div className="page-header-sub">
            {tagMap.length} tag{tagMap.length !== 1 ? 's' : ''} across {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Tag cloud */}
      {tagMap.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '40px 24px',
          textAlign: 'center',
          marginBottom: 24,
        }}>
          <div style={{ marginBottom: 12, opacity: 0.4 }}>
            <TagIcon size={40} color="var(--color-neon-blue)" />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
            No tags yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Add tags to your tasks using the Extended tab in the task form.
          </div>
        </div>
      ) : (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '1px', color: 'var(--color-text-secondary)',
            marginBottom: 14,
          }}>
            All Tags — click to filter tasks
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {tagMap.map(({ name, tasks: tagTasks }) => {
              const isActive = selectedTag === name
              // Size the tag chip based on how many tasks it has (min 12px, max 16px)
              const fontSize = Math.min(16, 11 + tagTasks.length)
              return (
                <button
                  key={name}
                  onClick={() => setSelectedTag(isActive ? null : name)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '7px 16px',
                    borderRadius: 999,
                    fontSize,
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.18s',
                    background: isActive
                      ? 'linear-gradient(135deg, var(--color-neon-blue), var(--color-accent-2))'
                      : 'rgba(0,212,255,0.08)',
                    color: isActive ? '#fff' : 'var(--color-neon-blue)',
                    boxShadow: isActive ? 'var(--glow-blue)' : 'none',
                    outline: isActive ? 'none' : '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  <TagIcon size={12} color={isActive ? '#fff' : 'var(--color-neon-blue)'} />
                  {name}
                  <span style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,212,255,0.15)',
                    borderRadius: 20,
                    padding: '1px 7px',
                    fontSize: 10,
                    fontWeight: 700,
                  }}>
                    {tagTasks.length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Filtered task list */}
      {selectedTag && (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>
                Tasks tagged
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                background: 'linear-gradient(135deg, var(--color-neon-blue), var(--color-accent-2))',
                color: '#fff', boxShadow: 'var(--glow-blue)',
              }}>
                <TagIcon size={12} color="#fff" />
                {selectedTag}
              </span>
              <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                — {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => setSelectedTag(null)}
              style={{
                background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
                borderRadius: 8, color: 'var(--color-text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', fontSize: 12, fontWeight: 500,
              }}
            >
              <IconX size={13} /> Clear filter
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onRefresh={onRefresh}
              />
            ))}
          </div>
        </div>
      )}

      {/* Untagged tasks summary */}
      {!selectedTag && tasksWithNoTag.length > 0 && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '16px 20px',
          marginTop: 8,
        }}>
          <div style={{
            fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--color-border)', display: 'inline-block',
            }}/>
            {tasksWithNoTag.length} task{tasksWithNoTag.length !== 1 ? 's have' : ' has'} no tags
          </div>
        </div>
      )}

      {/* Empty state when no tag selected */}
      {!selectedTag && tagMap.length > 0 && (
        <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13, padding: '16px 0' }}>
          Click a tag above to see its tasks.
        </div>
      )}
    </div>
  )
}
