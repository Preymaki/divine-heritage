import { Link } from 'react-router-dom'
import { ArrowRight, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary-50)] flex items-center justify-center mx-auto mb-6">
          <Home size={32} className="text-[var(--color-primary-400)]" />
        </div>
        <h1 className="font-[var(--font-family-heading)] font-bold text-5xl text-[var(--color-primary-500)] mb-3">
          404
        </h1>
        <h2 className="font-[var(--font-family-heading)] font-semibold text-2xl text-[var(--color-text-primary)] mb-3">
          Page Not Found
        </h2>
        <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-8">
          The requested page could not be found. Navigate back to explore Divine Heritage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            id="404-go-home"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-xl text-sm transition-all duration-200 group"
          >
            Back to Home
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/contact"
            id="404-contact"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[var(--color-primary-500)] text-[var(--color-primary-500)] hover:bg-[var(--color-primary-50)] font-semibold rounded-xl text-sm transition-all duration-200"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  )
}
