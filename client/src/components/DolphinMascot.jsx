import { useState, useEffect } from 'react'
import { IconAlertTriangle, IconCheckCircle, IconClock, IconWave } from './Icons'

// ─── Dolphin SVG ─────────────────────────────────────────────────────────────
export function DolphinSVG({ size = 80 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow under dolphin */}
      <ellipse cx="60" cy="108" rx="28" ry="6" fill="#00d4ff" opacity="0.12"/>
      {/* Tail flukes */}
      <path d="M22 72 Q6 58 10 78 Q14 88 26 80 Z" fill="#0099bb"/>
      <path d="M22 72 Q6 84 14 96 Q22 92 26 80 Z" fill="#00b8d9"/>
      {/* Main body */}
      <ellipse cx="62" cy="68" rx="36" ry="22" fill="#00d4ff"/>
      <ellipse cx="62" cy="66" rx="34" ry="19" fill="#00c8f0"/>
      {/* Belly highlight */}
      <ellipse cx="56" cy="74" rx="22" ry="11" fill="#b8f0ff" opacity="0.55"/>
      {/* Dorsal fin */}
      <path d="M64 46 Q74 28 82 42 Q76 50 64 50 Z" fill="#00aed6"/>
      {/* Head / snout */}
      <ellipse cx="90" cy="66" rx="10" ry="7" fill="#00d4ff"/>
      {/* Smile */}
      <path d="M83 71 Q88 76 95 71" stroke="#006688" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      {/* Eye */}
      <circle cx="84" cy="62" r="4.5" fill="#0a1628"/>
      <circle cx="85.5" cy="60.5" r="1.6" fill="white"/>
      {/* Shine on body */}
      <ellipse cx="70" cy="56" rx="8" ry="3.5" fill="white" opacity="0.15" transform="rotate(-20 70 56)"/>
      {/* Pectoral fin */}
      <path d="M68 76 Q58 88 52 84 Q56 76 68 76Z" fill="#00b0d0" opacity="0.8"/>
      {/* Glow */}
      <ellipse cx="62" cy="68" rx="36" ry="22" fill="url(#dGlow)" opacity="0.18"/>
      <defs>
        <radialGradient id="dGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="1"/>
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0"/>
        </radialGradient>
      </defs>
    </svg>
  )
}

// ─── Status icon helper ───────────────────────────────────────────────────────
function StatusIcon({ type, accent }) {
  const props = { size: 16, color: accent }
  if (type === 'overdue')   return <IconAlertTriangle {...props} />
  if (type === 'due')       return <IconClock {...props} />
  if (type === 'all-done')  return <IconCheckCircle {...props} />
  return <IconWave {...props} />
}

// ─── Inline Dashboard Card — mirrors the Tarsi layout in the reference ───────
export function FinInlineCard({ notifications, tasks }) {
  const dueToday    = notifications.filter(n => n.notifType === 'due').length
  const overdue     = notifications.filter(n => n.notifType === 'overdue').length
  const allDone     = tasks.length > 0 && tasks.every(t => t.status === 'completed')
  const noTasks     = tasks.length === 0

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Status type drives colour + icon + message
  const getStatus = () => {
    if (noTasks)                       return 'idle'
    if (allDone)                       return 'all-done'
    if (overdue > 0 && dueToday > 0)   return 'overdue'
    if (overdue > 0)                   return 'overdue'
    if (dueToday > 0)                  return 'due'
    return 'clear'
  }

  const status = getStatus()

  const accents = {
    idle:      '#00d4ff',
    clear:     '#00d4ff',
    due:       '#f59e0b',
    overdue:   '#ff4466',
    'all-done':'#00ff9f',
  }
  const accent = accents[status]

  const messages = {
    idle:     "Hi there! I'm Fin. Add your first task and let's make waves.",
    clear:    "You're all caught up. Smooth seas ahead — keep making ripples.",
    'all-done': "You crushed it today! Every task is done. Fin is doing flips.",
    due: dueToday > 0
      ? `You still have ${dueToday} task${dueToday > 1 ? 's' : ''} due today. You've got this — keep swimming.`
      : '',
    overdue: overdue > 0 && dueToday > 0
      ? `${dueToday} task${dueToday > 1 ? 's' : ''} due today and ${overdue} overdue. Let's tackle them together.`
      : `You have ${overdue} overdue task${overdue > 1 ? 's' : ''}. Don't let them sink — let's catch up.`,
  }

  const message = messages[status]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      background: 'var(--color-surface)',
      border: `1px solid ${accent}44`,
      borderRadius: 16,
      marginBottom: 24,
      overflow: 'hidden',
      boxShadow: `0 0 28px ${accent}18`,
      animation: 'fadeInUp 0.4s ease',
    }}>
      {/* Left accent bar */}
      <div style={{
        width: 4,
        background: `linear-gradient(180deg, ${accent} 0%, ${accent}44 100%)`,
        flexShrink: 0,
        boxShadow: `2px 0 12px ${accent}66`,
      }} />

      {/* Dolphin image section — tinted background like Tarsi's green bg */}
      <div style={{
        width: 130,
        flexShrink: 0,
        background: `linear-gradient(135deg, ${accent}18 0%, ${accent}08 100%)`,
        borderRight: `1px solid ${accent}22`,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: '12px 8px 0',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Subtle radial glow behind dolphin */}
        <div style={{
          position: 'absolute',
          width: 100, height: 100,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`,
          bottom: 10, left: '50%',
          transform: 'translateX(-50%)',
        }} />
        <div style={{ animation: 'float 2.2s ease-in-out infinite', position: 'relative', zIndex: 1 }}>
          <DolphinSVG size={100} />
        </div>
      </div>

      {/* Right text section */}
      <div style={{
        flex: 1,
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
      }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <StatusIcon type={status} accent={accent} />
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: accent,
              textShadow: `0 0 8px ${accent}88`,
            }}>
              Fin
            </span>
          </div>
          <span style={{
            fontSize: 11,
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}>
            {greeting}
          </span>
        </div>

        {/* Message */}
        <p style={{
          fontSize: 13,
          color: 'var(--color-text-primary)',
          lineHeight: 1.6,
          fontWeight: 400,
          margin: 0,
          maxWidth: 480,
        }}>
          {message}
        </p>

        {/* Stats pills */}
        {!noTasks && (
          <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
            {dueToday > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 600,
                background: 'rgba(245,158,11,0.12)',
                color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.25)',
              }}>
                <IconClock size={12} color="#f59e0b" />
                {dueToday} due today
              </span>
            )}
            {overdue > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 600,
                background: 'rgba(255,68,102,0.12)',
                color: '#ff4466',
                border: '1px solid rgba(255,68,102,0.25)',
              }}>
                <IconAlertTriangle size={12} color="#ff4466" />
                {overdue} overdue
              </span>
            )}
            {allDone && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 20,
                fontSize: 11, fontWeight: 600,
                background: 'rgba(0,255,159,0.1)',
                color: '#00ff9f',
                border: '1px solid rgba(0,255,159,0.25)',
              }}>
                <IconCheckCircle size={12} color="#00ff9f" />
                All complete
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Floating corner mascot (non-dashboard pages) ────────────────────────────
export default function DolphinMascot({ notifications, tasks }) {
  const [bubbleOpen, setBubbleOpen] = useState(false)
  const [timer, setTimer] = useState(null)

  const dueToday    = notifications.filter(n => n.notifType === 'due').length
  const overdue     = notifications.filter(n => n.notifType === 'overdue').length
  const allDone     = tasks.length > 0 && tasks.every(t => t.status === 'completed')
  const noTasks     = tasks.length === 0

  const getMessage = () => {
    if (noTasks)                     return { text: "Add your first task and let's make waves.", type: 'idle' }
    if (allDone)                     return { text: "Every task is complete. Fin is doing flips!", type: 'all-done' }
    if (dueToday > 0 && overdue > 0) return { text: `${dueToday} due today and ${overdue} overdue.`, type: 'overdue' }
    if (overdue > 0)                 return { text: `${overdue} task${overdue > 1 ? 's' : ''} overdue.`, type: 'overdue' }
    if (dueToday > 0)                return { text: `${dueToday} task${dueToday > 1 ? 's' : ''} due today.`, type: 'due' }
    return { text: "All clear — keep making ripples.", type: 'clear' }
  }

  const { text, type } = getMessage()
  const accent = { idle: '#00d4ff', clear: '#00d4ff', due: '#f59e0b', overdue: '#ff4466', 'all-done': '#00ff9f' }[type]

  useEffect(() => {
    if (notifications.length > 0) {
      setBubbleOpen(true)
      const t = setTimeout(() => setBubbleOpen(false), 5000)
      setTimer(t)
      return () => clearTimeout(t)
    }
  }, [notifications.length])

  const handleClick = () => {
    if (timer) { clearTimeout(timer); setTimer(null) }
    setBubbleOpen(prev => {
      if (!prev) {
        const t = setTimeout(() => setBubbleOpen(false), 5000)
        setTimer(t)
      }
      return !prev
    })
  }

  return (
    <div className="dolphin-mascot">
      {bubbleOpen && (
        <div
          className="speech-bubble"
          style={{ borderColor: `${accent}55`, boxShadow: `0 0 16px ${accent}33, 0 8px 32px rgba(0,0,0,0.4)` }}
        >
          {/* Label */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 7,
          }}>
            <StatusIcon type={type} accent={accent} />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              color: accent,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              textShadow: `0 0 6px ${accent}88`,
            }}>
              Fin
            </span>
          </div>
          {/* Message text — fitted inside bubble */}
          <p style={{
            margin: 0,
            fontSize: 12.5,
            color: 'var(--color-text-primary)',
            lineHeight: 1.55,
            fontWeight: 400,
          }}>
            {text}
          </p>
        </div>
      )}
      <div className="dolphin-wrapper" onClick={handleClick} title="Fin — click me!">
        <DolphinSVG size={72} />
      </div>
    </div>
  )
}
