import { useState } from 'react'
import { useSettings } from '../context/SettingsContext'
import {
  IconUser, IconBell, IconCheckCircle, IconSave,
  IconRefresh, IconSettings, IconClipboard
} from '../components/Icons'
import { DolphinSVG } from '../components/DolphinMascot'

// ── Reusable UI pieces ──────────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked
          ? 'linear-gradient(135deg, var(--color-neon-blue), #7c3aed)'
          : 'var(--color-surface-2)',
        border: checked ? 'none' : '1px solid var(--color-border)',
        cursor: 'pointer', position: 'relative',
        transition: 'all 0.25s',
        boxShadow: checked ? '0 0 10px rgba(0,212,255,0.4)' : 'none',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 2,
        left: checked ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: '#fff', transition: 'left 0.25s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )
}

function SettingRow({ label, desc, children, last = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 0',
      borderBottom: last ? 'none' : '1px solid var(--color-border)',
      gap: 16,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 2 }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{desc}</div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 14, padding: '0 24px', marginBottom: 20,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontSize: 14, fontWeight: 700, color: '#fff',
        padding: '18px 0 16px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <span style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{icon}</span>
        {title}
      </div>
      {children}
    </div>
  )
}

// ── Settings page ────────────────────────────────────────────────────────────

const ACCENT_SWATCHES = [
  { color: '#00d4ff', label: 'Cyan'   },
  { color: '#7c3aed', label: 'Purple' },
  { color: '#00ff9f', label: 'Green'  },
  { color: '#ff4466', label: 'Pink'   },
  { color: '#f59e0b', label: 'Amber'  },
]

export default function Settings() {
  const { settings, save, reset } = useSettings()
  const [flash, setFlash] = useState(false)

  // Local draft — user edits locally, saves on click
  const [draft, setDraft] = useState({ ...settings })
  const set = (key, val) => setDraft(d => ({ ...d, [key]: val }))

  // Live-apply visual settings immediately on change
  const liveSet = (key, val) => {
    set(key, val)
    save({ [key]: val })
  }

  const handleSave = () => {
    save(draft)
    setFlash(true)
    setTimeout(() => setFlash(false), 2500)
  }

  const handleReset = () => {
    reset()
    setDraft({ ...settings }) // settings will update from context after reset
    setTimeout(() => setDraft(s => ({ ...s })), 50)
  }

  return (
    <div style={{ maxWidth: 680 }}>

      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-header-title">Settings</div>
          <div className="page-header-sub">Changes to appearance apply instantly</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={handleReset} style={{ gap: 8 }}>
            <IconRefresh size={14} color="currentColor" />
            Reset to Defaults
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ gap: 8, minWidth: 130 }}
          >
            {flash
              ? <><IconCheckCircle size={14} color="#fff" /> Saved!</>
              : <><IconSave size={14} color="#fff" /> Save Changes</>
            }
          </button>
        </div>
      </div>

      {/* ── Profile ── */}
      <SectionCard title="Profile" icon={<IconUser size={15} color="var(--color-neon-blue)" />}>
        <SettingRow label="Display Name" desc="Shown in the sidebar and greeting">
          <input
            className="form-input" style={{ width: 190, padding: '8px 12px' }}
            value={draft.displayName}
            onChange={e => set('displayName', e.target.value)}
            onBlur={e => save({ displayName: e.target.value })}
          />
        </SettingRow>
        <SettingRow label="Role / Title" desc="Shown below your name in the sidebar">
          <input
            className="form-input" style={{ width: 190, padding: '8px 12px' }}
            value={draft.role}
            onChange={e => set('role', e.target.value)}
            onBlur={e => save({ role: e.target.value })}
          />
        </SettingRow>
        <SettingRow label="Email" desc="Your contact email (display only)" last>
          <input
            className="form-input" style={{ width: 190, padding: '8px 12px' }}
            type="email"
            value={draft.email}
            onChange={e => set('email', e.target.value)}
            onBlur={e => save({ email: e.target.value })}
          />
        </SettingRow>
      </SectionCard>

      {/* ── Appearance ── */}
      <SectionCard title="Appearance" icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-neon-blue)" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      }>
        <SettingRow label="Theme" desc="Switch between dark variants — applies immediately">
          <div style={{ display: 'flex', gap: 8 }}>
            {['dark', 'darker'].map(t => (
              <button
                key={t} type="button"
                onClick={() => liveSet('theme', t)}
                style={{
                  padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  background: settings.theme === t
                    ? 'linear-gradient(135deg, var(--color-neon-blue), #7c3aed)'
                    : 'var(--color-surface-2)',
                  border: settings.theme === t ? 'none' : '1px solid var(--color-border)',
                  color: settings.theme === t ? '#fff' : 'var(--color-text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Accent Color" desc="Neon highlight color — applies immediately">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {ACCENT_SWATCHES.map(({ color, label }) => (
              <button
                key={color} type="button" title={label}
                onClick={() => liveSet('accentColor', color)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: color,
                  border: settings.accentColor === color ? '3px solid #fff' : '3px solid transparent',
                  cursor: 'pointer',
                  boxShadow: settings.accentColor === color ? `0 0 12px ${color}` : 'none',
                  transition: 'all 0.2s',
                  outline: 'none',
                }}
              />
            ))}
          </div>
        </SettingRow>

        <SettingRow label="Compact View" desc="Tighter padding on task cards — applies immediately" last>
          <Toggle
            checked={settings.compactView}
            onChange={v => liveSet('compactView', v)}
          />
        </SettingRow>
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard title="Notifications" icon={<IconBell size={15} color="var(--color-neon-blue)" />}>
        <SettingRow label="Due Today Alerts" desc="Fin shows a warning card for tasks due today">
          <Toggle checked={settings.notifDueToday} onChange={v => liveSet('notifDueToday', v)} />
        </SettingRow>
        <SettingRow label="Overdue Alerts" desc="Fin shows a warning card for past-due tasks">
          <Toggle checked={settings.notifOverdue} onChange={v => liveSet('notifOverdue', v)} />
        </SettingRow>
        <SettingRow label="Completion Toast" desc="Show a message when you complete a task">
          <Toggle checked={settings.notifCompleted} onChange={v => liveSet('notifCompleted', v)} />
        </SettingRow>
        <SettingRow label="Fin's Tips on Dashboard" desc="Show Fin's inline advice card on the dashboard" last>
          <Toggle checked={settings.finTips} onChange={v => liveSet('finTips', v)} />
        </SettingRow>
      </SectionCard>

      {/* ── Task Defaults ── */}
      <SectionCard title="Task Defaults" icon={<IconClipboard size={15} color="var(--color-neon-blue)" />}>
        <SettingRow label="Default Priority" desc="Pre-selected priority in the new task form">
          <select
            className="sort-select"
            value={settings.defaultPriority}
            onChange={e => liveSet('defaultPriority', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </SettingRow>
        <SettingRow label="Default Category" desc="Pre-selected category in the new task form">
          <select
            className="sort-select"
            value={settings.defaultCategory}
            onChange={e => liveSet('defaultCategory', e.target.value)}
          >
            {['Work', 'Personal', 'Study', 'Other'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </SettingRow>
        <SettingRow label="Auto-Archive Completed Tasks" desc="Hide completed tasks older than 7 days from all views" last>
          <Toggle checked={settings.autoArchive} onChange={v => liveSet('autoArchive', v)} />
        </SettingRow>
      </SectionCard>

      {/* ── About ── */}
      <SectionCard title="About Finlo" icon={<IconSettings size={15} color="var(--color-neon-blue)" />}>
        <div style={{ padding: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <DolphinSVG size={52} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', textShadow: '0 0 12px rgba(0,212,255,0.4)' }}>
                Finlo
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-neon-blue)', marginTop: 2 }}>
                Every task creates a ripple.
              </div>
            </div>
            <div style={{
              marginLeft: 'auto', padding: '4px 12px',
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 20, fontSize: 12, color: 'var(--color-neon-blue)',
            }}>
              v1.0.0
            </div>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            Finlo is a full-stack task management app built with React&nbsp;+&nbsp;Vite on the
            frontend and Express&nbsp;+&nbsp;SQLite on the backend. Fin — your personal dolphin
            assistant — keeps you on track with smart alerts and deadline reminders.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {['React 18', 'Vite 5', 'Express 4', 'better-sqlite3', 'Recharts'].map(tech => (
              <span key={tech} style={{
                padding: '4px 12px',
                background: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
                borderRadius: 20, fontSize: 12,
                color: 'var(--color-text-secondary)',
              }}>{tech}</span>
            ))}
          </div>

          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
            "Fin the dolphin — always swimming toward your goals."
          </p>
        </div>
      </SectionCard>
    </div>
  )
}
