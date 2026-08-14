/**
 * AdminSettings — /admin/settings
 *
 * Full settings editor with three tabs:
 *   Contact  — phone, email, address, hours, social links, ofsted, tagline
 *   Hero     — heading, eyebrow, subtitle, CTA labels, accent word
 *   About    — story paragraphs, mission quote, bio paragraphs, bio quote,
 *              preview title/subtitle, highlights, values
 *
 * All changes are saved to Firestore via merge writes so the public site
 * updates immediately.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  Phone, Clock, Globe, ArrowRight, AlignLeft,
  Type, Image, CheckCircle, AlertTriangle, Save, Loader2, Upload,
} from 'lucide-react'
import PageHeader from '@components/admin/PageHeader'
import {
  DEFAULT_CONTACT, DEFAULT_HERO, DEFAULT_ABOUT,
  subscribeToContact, subscribeToHero, subscribeToAbout,
  saveContactSettings, saveHeroSettings, saveAboutSettings,
} from '@services/settings'
import { uploadFile } from '@services/firebase/storage'
import type {
  ContactSettings, HeroSettings, AboutSettings,
  SaveState,
} from '@appTypes/settings'

// ---------------------------------------------------------------------------
// Small shared UI helpers
// ---------------------------------------------------------------------------

function FormField({
  label, id, type = 'text', value, onChange, disabled, hint, rows,
}: {
  label: string
  id: string
  type?: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
  hint?: string
  rows?: number
}) {
  const cls = 'admin-input admin-input--no-icon'
  return (
    <div className="admin-form-group">
      <label htmlFor={id} className="admin-form-label">{label}</label>
      {rows ? (
        <textarea
          id={id} rows={rows} className={cls} value={value}
          onChange={(e) => onChange(e.target.value)} disabled={disabled}
        />
      ) : (
        <input
          id={id} type={type} className={cls} value={value}
          onChange={(e) => onChange(e.target.value)} disabled={disabled}
        />
      )}
      {hint && <p className="admin-field-hint">{hint}</p>}
    </div>
  )
}

function SaveBar({ state, onSave, disabled }: { state: SaveState; onSave: () => void; disabled?: boolean }) {
  return (
    <div className="settings-save-bar">
      {state.phase === 'success' && (
        <span className="settings-save-feedback settings-save-feedback--ok">
          <CheckCircle size={14} /> Saved
        </span>
      )}
      {state.phase === 'error' && (
        <span className="settings-save-feedback settings-save-feedback--err">
          <AlertTriangle size={14} /> {state.error}
        </span>
      )}
      <button
        type="button"
        id="settings-save-btn"
        onClick={onSave}
        disabled={disabled || state.phase === 'saving'}
        className="cms-btn-primary"
      >
        {state.phase === 'saving'
          ? <><Loader2 size={14} className="admin-spin" /> Saving…</>
          : <><Save size={14} /> Save Changes</>
        }
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Contact
// ---------------------------------------------------------------------------

function ContactTab() {
  const [form, setForm] = useState<ContactSettings>(DEFAULT_CONTACT)
  const [saveState, setSaveState] = useState<SaveState>({ phase: 'idle', error: null })

  useEffect(() => {
    return subscribeToContact((data) => setForm(data))
  }, [])

  const set = useCallback((field: string) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val })), [])

  const setNested = useCallback((parent: 'hours' | 'social', field: string) => (val: string) =>
    setForm((f) => ({
      ...f,
      [parent]: { ...(f[parent] as Record<string, string>), [field]: val },
    })), [])

  async function handleSave() {
    setSaveState({ phase: 'saving', error: null })
    try {
      const { updatedAt: _, ...patch } = form
      await saveContactSettings(patch)
      setSaveState({ phase: 'success', error: null })
      setTimeout(() => setSaveState({ phase: 'idle', error: null }), 3000)
    } catch (err) {
      setSaveState({ phase: 'error', error: err instanceof Error ? err.message : 'Save failed' })
    }
  }

  const busy = saveState.phase === 'saving'

  return (
    <div className="settings-tab-content">
      <div className="settings-form-grid">
        {/* Contact Details */}
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <Phone size={15} /> Contact Details
          </h3>
          <FormField label="Phone number" id="contact-phone" value={form.phone} onChange={set('phone')} disabled={busy} />
          <FormField label="Email address" id="contact-email" type="email" value={form.email} onChange={set('email')} disabled={busy} />
          <FormField label="Address" id="contact-address" value={form.address} onChange={set('address')} disabled={busy} />
          <FormField label="Tagline" id="contact-tagline" value={form.tagline} onChange={set('tagline')} hint="Short strapline shown in search results and meta tags." disabled={busy} />
          <FormField label="Ofsted number" id="contact-ofsted" value={form.ofsted} onChange={set('ofsted')} hint="Leave blank if not yet registered." disabled={busy} />
        </section>

        {/* Business Hours */}
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <Clock size={15} /> Business Hours
          </h3>
          <FormField
            label="Weekday hours"
            id="contact-hours-weekdays"
            value={form.hours.weekdays}
            onChange={setNested('hours', 'weekdays')}
            hint="e.g. Monday – Thursday 8:00 am – 6:00 pm, Friday 8:00 am – 5:00 pm"
            disabled={busy}
          />
          <FormField
            label="Hours note"
            id="contact-hours-notes"
            value={form.hours.notes}
            onChange={setNested('hours', 'notes')}
            hint="Optional note shown below the hours (e.g. holiday care)."
            disabled={busy}
          />
        </section>

        {/* Social Links */}
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <Globe size={15} /> Social Links
          </h3>
          <FormField label="Facebook URL" id="contact-facebook" value={form.social.facebook} onChange={setNested('social', 'facebook')} disabled={busy} />
          <FormField label="Instagram URL" id="contact-instagram" value={form.social.instagram} onChange={setNested('social', 'instagram')} disabled={busy} />
        </section>
      </div>

      <SaveBar state={saveState} onSave={handleSave} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: Hero
// ---------------------------------------------------------------------------

function HeroTab() {
  const [form, setForm] = useState<HeroSettings>(DEFAULT_HERO)
  const [saveState, setSaveState] = useState<SaveState>({ phase: 'idle', error: null })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    return subscribeToHero((data) => setForm(data))
  }, [])

  const set = useCallback((field: keyof HeroSettings) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val })), [])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const { downloadURL } = await uploadFile('hero', file, (p) => setUploadProgress(p))
      setForm((f) => ({ ...f, bgImageUrl: downloadURL }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaveState({ phase: 'saving', error: null })
    try {
      const { updatedAt: _, ...patch } = form
      await saveHeroSettings(patch)
      setSaveState({ phase: 'success', error: null })
      setTimeout(() => setSaveState({ phase: 'idle', error: null }), 3000)
    } catch (err) {
      setSaveState({ phase: 'error', error: err instanceof Error ? err.message : 'Save failed' })
    }
  }

  const busy = saveState.phase === 'saving' || uploading

  return (
    <div className="settings-tab-content">
      <div className="settings-form-grid">
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <Type size={15} /> Copy
          </h3>
          <FormField
            label="Eyebrow text"
            id="hero-eyebrow"
            value={form.eyebrow}
            onChange={set('eyebrow')}
            hint="Small label above the heading (e.g. London-Based Childminding)."
            disabled={busy}
          />
          <FormField
            label="Main heading"
            id="hero-heading"
            value={form.heading}
            onChange={set('heading')}
            disabled={busy}
          />
          <FormField
            label="Accent word"
            id="hero-accent"
            value={form.accentWord}
            onChange={set('accentWord')}
            hint="One word within the heading to highlight in pink. Must match exactly."
            disabled={busy}
          />
          <FormField
            label="Subtitle"
            id="hero-subtitle"
            value={form.subtitle}
            onChange={set('subtitle')}
            rows={3}
            disabled={busy}
          />
        </section>

        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <ArrowRight size={15} /> Buttons
          </h3>
          <FormField label="Primary CTA label" id="hero-cta-primary" value={form.ctaPrimary} onChange={set('ctaPrimary')} hint="Pink button (links to /contact)." disabled={busy} />
          <FormField label="Secondary CTA label" id="hero-cta-secondary" value={form.ctaSecondary} onChange={set('ctaSecondary')} hint="Glass button (links to /about)." disabled={busy} />
        </section>

        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <Image size={15} /> Background Image
          </h3>
          <FormField
            label="Background image URL"
            id="hero-bg-image"
            value={form.bgImageUrl}
            onChange={set('bgImageUrl')}
            hint="Leave blank to use the default hero image. Paste a Firebase Storage URL or a /images/ path."
            disabled={busy}
          />
          <div className="admin-form-group mt-3">
            <label className="admin-form-label">Or upload image file to Firebase Storage</label>
            <div className="flex items-center gap-3">
              <label className="cms-btn-secondary cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} />
                {uploading ? `Uploading (${uploadProgress}%)` : 'Upload File'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={busy}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      <SaveBar state={saveState} onSave={handleSave} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab: About
// ---------------------------------------------------------------------------

function AboutTab() {
  const [form, setForm] = useState<AboutSettings>(DEFAULT_ABOUT)
  const [saveState, setSaveState] = useState<SaveState>({ phase: 'idle', error: null })
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    return subscribeToAbout((data) => setForm(data))
  }, [])

  const set = useCallback((field: keyof AboutSettings) => (val: string) =>
    setForm((f) => ({ ...f, [field]: val })), [])

  // Story paragraphs — stored as array, edited as newline-separated textarea
  const storyText = form.storyParagraphs.join('\n\n')
  const bioParagraphsText = form.bioParagraphs.join('\n\n')

  function setStory(val: string) {
    setForm((f) => ({ ...f, storyParagraphs: val.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) }))
  }
  function setBio(val: string) {
    setForm((f) => ({ ...f, bioParagraphs: val.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean) }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadProgress(0)
    try {
      const { downloadURL } = await uploadFile('about', file, (p) => setUploadProgress(p))
      setForm((f) => ({ ...f, aboutImageUrl: downloadURL }))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleSave() {
    setSaveState({ phase: 'saving', error: null })
    try {
      const { updatedAt: _, ...patch } = form
      await saveAboutSettings(patch)
      setSaveState({ phase: 'success', error: null })
      setTimeout(() => setSaveState({ phase: 'idle', error: null }), 3000)
    } catch (err) {
      setSaveState({ phase: 'error', error: err instanceof Error ? err.message : 'Save failed' })
    }
  }

  const busy = saveState.phase === 'saving' || uploading

  return (
    <div className="settings-tab-content">
      <div className="settings-form-grid">

        {/* About Preview (home page) */}
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <AlignLeft size={15} /> About Preview (Home Page)
          </h3>
          <FormField label="Preview title" id="about-preview-title" value={form.previewTitle} onChange={set('previewTitle')} disabled={busy} />
          <FormField label="Preview subtitle" id="about-preview-subtitle" value={form.previewSubtitle} onChange={set('previewSubtitle')} rows={2} disabled={busy} />
        </section>

        {/* Story */}
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <AlignLeft size={15} /> About Page — Story
          </h3>
          <div className="admin-form-group">
            <label htmlFor="about-story" className="admin-form-label">Story paragraphs</label>
            <textarea
              id="about-story"
              rows={10}
              className="admin-input admin-input--no-icon"
              value={storyText}
              onChange={(e) => setStory(e.target.value)}
              disabled={busy}
            />
            <p className="admin-field-hint">Separate paragraphs with a blank line.</p>
          </div>
          <FormField label="Mission quote" id="about-mission" value={form.missionQuote} onChange={set('missionQuote')} rows={3} hint="Displayed as a blockquote on the About page." disabled={busy} />
        </section>

        {/* Bio */}
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <AlignLeft size={15} /> Meet Your Childminder
          </h3>
          <FormField label="Name / title" id="about-bio-name" value={form.bioName} onChange={set('bioName')} disabled={busy} />
          <div className="admin-form-group">
            <label htmlFor="about-bio-paragraphs" className="admin-form-label">Bio paragraphs</label>
            <textarea
              id="about-bio-paragraphs"
              rows={8}
              className="admin-input admin-input--no-icon"
              value={bioParagraphsText}
              onChange={(e) => setBio(e.target.value)}
              disabled={busy}
            />
            <p className="admin-field-hint">Separate paragraphs with a blank line.</p>
          </div>
          <FormField label="Bio quote" id="about-bio-quote" value={form.bioQuote} onChange={set('bioQuote')} rows={2} hint="Closing blockquote in the Meet Your Childminder section." disabled={busy} />
        </section>

        {/* About image */}
        <section className="settings-form-section">
          <h3 className="settings-form-section-title">
            <Image size={15} /> About Image
          </h3>
          <FormField
            label="Image URL"
            id="about-image"
            value={form.aboutImageUrl}
            onChange={set('aboutImageUrl')}
            hint="Leave blank to use the default image. Paste a Firebase Storage URL or /images/ path."
            disabled={busy}
          />
          <div className="admin-form-group mt-3">
            <label className="admin-form-label">Or upload image file to Firebase Storage</label>
            <div className="flex items-center gap-3">
              <label className="cms-btn-secondary cursor-pointer inline-flex items-center gap-2">
                <Upload size={14} />
                {uploading ? `Uploading (${uploadProgress}%)` : 'Upload File'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={busy}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      <SaveBar state={saveState} onSave={handleSave} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TABS = [
  { id: 'contact', label: 'Contact',    icon: Phone,     component: ContactTab },
  { id: 'hero',    label: 'Hero',       icon: Type,      component: HeroTab    },
  { id: 'about',   label: 'About',      icon: AlignLeft, component: AboutTab   },
] as const

type TabId = typeof TABS[number]['id']

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('contact')
  const ActiveComponent = TABS.find((t) => t.id === activeTab)!.component

  return (
    <div className="cms-page">
      <PageHeader
        title="Settings"
        subtitle="Edit the content and contact details displayed on the public website."
      />

      {/* Tab bar */}
      <div className="settings-tab-bar" role="tablist" aria-label="Settings sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`settings-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`settings-tabpanel-${id}`}
            onClick={() => setActiveTab(id)}
            className={`settings-tab-btn ${activeTab === id ? 'settings-tab-btn--active' : ''}`}
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panel */}
      <div
        id={`settings-tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`settings-tab-${activeTab}`}
      >
        <ActiveComponent />
      </div>
    </div>
  )
}
