import { IconTrash } from './Icons'
import { DolphinSVG } from './DolphinMascot'

export default function ConfirmModal({ task, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-icon">
          <IconTrash size={32} color="var(--color-neon-pink)" />
        </div>
        <h2 className="modal-title">Delete Task?</h2>
        <p className="modal-desc">
          Are you sure you want to delete{' '}
          <strong style={{ color: '#fff' }}>"{task?.title}"</strong>?
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0 16px', opacity: 0.6 }}>
          <DolphinSVG size={48} />
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-neon-blue)', marginBottom: 20 }}>
          Fin will miss it.
        </p>
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onConfirm}>Yes, Delete</button>
          <button className="btn btn-secondary" onClick={onCancel}>Keep It</button>
        </div>
      </div>
    </div>
  )
}
