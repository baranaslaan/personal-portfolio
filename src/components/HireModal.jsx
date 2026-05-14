import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

// Submissions go through our serverless proxy (/api/contact). The Web3Forms
// access key lives on the server only — never exposed in the client bundle.
const ENDPOINT = '/api/contact'

const emptyForm = {
  name: '',
  email: '',
  company: '',
  projectType: '',
  budget: '',
  timeline: '',
  message: '',
  _botcheck: '',
}

// Vercel Edge functions cap inbound request size at ~4.5 MB. Keep total
// attachment payload comfortably under that.
const MAX_FILES = 2
const MAX_FILE_SIZE = 3 * 1024 * 1024
const ACCEPT = '.pdf,.doc,.docx,.txt,.zip,.fig,.sketch,image/*'

function formatBytes(b) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

export default function HireModal({ open, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(emptyForm)
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('idle') 
  const [error, setError] = useState(null)
  const firstFieldRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm(emptyForm)
    setFiles([])
    setStatus('idle')
    setError(null)
    const t = setTimeout(() => firstFieldRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const isValidEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)

  const addFiles = (incoming) => {
    if (!incoming || incoming.length === 0) return
    const list = Array.from(incoming)
    const rejected = []
    const next = [...files]
    for (const f of list) {
      if (next.length >= MAX_FILES) { rejected.push(`${f.name} (limit ${MAX_FILES})`); continue }
      if (f.size > MAX_FILE_SIZE)   { rejected.push(`${f.name} (>3 MB)`); continue }
      if (next.some(x => x.name === f.name && x.size === f.size)) continue
      next.push(f)
    }
    setFiles(next)
    setError(rejected.length ? `Skipped: ${rejected.join(', ')}` : null)
  }
  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx))
  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer?.files)
  }
  const onDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = (e) => { e.preventDefault(); setDragging(false) }

  const canSubmit =
    form.name.trim().length > 1 &&
    isValidEmail(form.email) &&
    form.projectType !== '' &&
    form.message.trim().length > 10 &&
    status !== 'sending'

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    if (form._botcheck) { setStatus('success'); return }

    setStatus('sending')
    setError(null)

    const fd = new FormData()
    // access_key is injected by the /api/contact serverless function — do
    // not send it from the client.
    fd.append('subject',    `New hire request from ${form.name}`)
    fd.append('from_name',  form.name)
    fd.append('replyto',    form.email)
    fd.append('name',       form.name)
    fd.append('email',      form.email)
    fd.append('company',    form.company || '—')
    fd.append('project_type', form.projectType)
    fd.append('budget',     form.budget   || '—')
    fd.append('timeline',   form.timeline || '—')
    fd.append('message',    form.message)
    files.forEach((f, i) => fd.append(`attachment_${i + 1}`, f, f.name))

    try {
      const res = await fetch(ENDPOINT, { method: 'POST', body: fd })
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.success) {
        setStatus('success')
      } else {
        setStatus('error')
        setError(json.message || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setStatus('error')
      setError(err.message || 'Network error. Please try again.')
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="hire"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hire-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="hire__panel"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="hire__close"
              onClick={onClose}
              aria-label={t('hireModal.closeLabel')}
              title={t('hireModal.closeLabel')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>

            {status !== 'success' ? (
              <>
                <header className="hire__header">
                  <p className="kicker"><span className="kicker__line" />{t('hireModal.kicker')}</p>
                  <h2 id="hire-title" className="h-display hire__title">
                    {t('hireModal.title')}<span className="hire__title-dot">.</span>
                  </h2>
                  <p className="hire__lede">
                    {t('hireModal.lede')}
                  </p>
                </header>

                <form className="hire__form" onSubmit={onSubmit} noValidate>
                  <input
                    type="text"
                    name="_botcheck"
                    value={form._botcheck}
                    onChange={set('_botcheck')}
                    tabIndex={-1}
                    autoComplete="off"
                    className="hire__honeypot"
                    aria-hidden="true"
                  />

                  <div className="hire__grid">
                    <Field label={t('hireModal.nameLabel')} required>
                      <input
                        ref={firstFieldRef}
                        type="text"
                        value={form.name}
                        onChange={set('name')}
                        placeholder={t('hireModal.namePlaceholder')}
                        autoComplete="name"
                        required
                      />
                    </Field>

                    <Field label={t('hireModal.emailLabel')} required>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set('email')}
                        placeholder={t('hireModal.emailPlaceholder')}
                        autoComplete="email"
                        required
                      />
                    </Field>

                    <Field label={t('hireModal.companyLabel')} hint={t('hireModal.companyHint')}>
                      <input
                        type="text"
                        value={form.company}
                        onChange={set('company')}
                        placeholder={t('hireModal.companyPlaceholder')}
                        autoComplete="organization"
                      />
                    </Field>

                    <Field label={t('hireModal.projectTypeLabel')} required>
                      <select value={form.projectType} onChange={set('projectType')} required>
                        <option value="">{t('hireModal.projectTypeSelect')}</option>
                        <option value="full-time">{t('hireModal.projectTypes.fulltime')}</option>
                        <option value="contract">{t('hireModal.projectTypes.contract')}</option>
                        <option value="freelance">{t('hireModal.projectTypes.freelance')}</option>
                        <option value="consulting">{t('hireModal.projectTypes.consulting')}</option>
                        <option value="other">{t('hireModal.projectTypes.other')}</option>
                      </select>
                    </Field>

                    <Field label={t('hireModal.budgetLabel')} hint={t('hireModal.companyHint')}>
                      <select value={form.budget} onChange={set('budget')}>
                        <option value="">{t('hireModal.budgetSelect')}</option>
                        <option value="<5k">{t('hireModal.budgets.under5k')}</option>
                        <option value="5-15k">{t('hireModal.budgets.5-15k')}</option>
                        <option value="15-30k">{t('hireModal.budgets.15-30k')}</option>
                        <option value="30k+">{t('hireModal.budgets.over30k')}</option>
                        <option value="tbd">{t('hireModal.budgets.tbd')}</option>
                      </select>
                    </Field>

                    <Field label={t('hireModal.timelineLabel')} hint={t('hireModal.companyHint')}>
                      <select value={form.timeline} onChange={set('timeline')}>
                        <option value="">{t('hireModal.timelineSelect')}</option>
                        <option value="asap">{t('hireModal.timelines.asap')}</option>
                        <option value="1mo">{t('hireModal.timelines.1mo')}</option>
                        <option value="1-3mo">{t('hireModal.timelines.1-3mo')}</option>
                        <option value="3mo+">{t('hireModal.timelines.3moplus')}</option>
                        <option value="flexible">{t('hireModal.timelines.flexible')}</option>
                      </select>
                    </Field>
                  </div>

                  <Field label={t('hireModal.descriptionLabel')} required hint={t('hireModal.descriptionHint')}>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={set('message')}
                      placeholder={t('hireModal.descriptionPlaceholder')}
                      required
                    />
                  </Field>

                  <Field label={t('hireModal.attachmentsLabel')} hint={t('hireModal.attachmentsHint')}>
                    <div
                      className={`hire__dropzone ${dragging ? 'is-dragging' : ''} ${files.length ? 'has-files' : ''}`}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                    >
                      {files.length === 0 ? (
                        <button
                          type="button"
                          className="hire__dropzone-trigger"
                          onClick={() => fileInputRef.current?.click()}
                          aria-label="Choose files to attach"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                          </svg>
                          <span className="hire__dropzone-main">
                            <strong>{t('hireModal.attachText')}</strong> {t('hireModal.attachHint')}
                          </span>
                          <span className="hire__dropzone-hint">
                            {t('hireModal.attachHint')}
                          </span>
                        </button>
                      ) : (
                        <ul className="hire__files">
                          {files.map((f, i) => (
                            <li key={`${f.name}-${f.size}-${i}`} className="hire__file">
                              <span className="hire__file-icon" aria-hidden="true">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                  <polyline points="14 2 14 8 20 8" />
                                </svg>
                              </span>
                              <span className="hire__file-name" title={f.name}>{f.name}</span>
                              <span className="hire__file-size">{formatBytes(f.size)}</span>
                              <button
                                type="button"
                                className="hire__file-remove"
                                onClick={() => removeFile(i)}
                                aria-label={`Remove ${f.name}`}
                                title="Remove"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                </svg>
                              </button>
                            </li>
                          ))}
                          {files.length < MAX_FILES && (
                            <li className="hire__file-add">
                              <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                              >
                                {t('hireModal.addMore')}
                              </button>
                            </li>
                          )}
                        </ul>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ACCEPT}
                        onChange={(e) => { addFiles(e.target.files); e.target.value = '' }}
                        className="hire__file-input"
                        tabIndex={-1}
                      />
                    </div>
                  </Field>

                  {status === 'error' && (
                    <div className="hire__alert hire__alert--error" role="alert">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error}
                    </div>
                  )}

                  <div className="hire__actions">
                    <p className="hire__privacy">
                      {t('hireModal.privacy')}
                    </p>
                    <button
                      type="submit"
                      className="btn btn-primary hire__submit"
                      disabled={!canSubmit}
                    >
                      {status === 'sending' ? (
                        <>
                          <span className="hire__spinner" aria-hidden="true" />
                          {t('hireModal.sending')}
                        </>
                      ) : (
                        <>
                          {t('hireModal.send')}
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="hire__success" role="status">
                <div className="hire__success-icon" aria-hidden="true">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h2 className="h-display hire__title">{t('hireModal.successTitle')}</h2>
                <p className="hire__lede">
                  {t('hireModal.successLede', { name: form.name?.split(' ')[0] || t('hireModal.successThere') })}
                </p>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  {t('hireModal.close')}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, hint, required, children }) {
  return (
    <label className="hire__field">
      <span className="hire__label">
        {label}
        {required && <span className="hire__required" aria-hidden="true">*</span>}
        {hint && !required && <span className="hire__hint">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
