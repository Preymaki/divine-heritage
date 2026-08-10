/**
 * UploadProgressBar
 *
 * Animated progress bar for the upload modal.
 * Accepts a 0–100 progress value and an optional phase label.
 */

interface UploadProgressBarProps {
  progress: number
  label?: string
}

export default function UploadProgressBar({ progress, label }: UploadProgressBarProps) {
  return (
    <div className="upload-progress-wrap" role="status" aria-live="polite">
      <div className="upload-progress-header">
        <span className="upload-progress-label">{label ?? 'Uploading…'}</span>
        <span className="upload-progress-pct">{progress}%</span>
      </div>
      <div className="upload-progress-track" aria-hidden="true">
        <div
          className="upload-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
