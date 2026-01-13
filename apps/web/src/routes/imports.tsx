import { useEffect, useMemo, useState, type ChangeEvent } from 'react'

import { API_ENDPOINTS, formatBytes, ImportJob, PageHeader, Panel, statusTone } from './shared'

const POLL_STATUSES = new Set(['uploading', 'converting', 'queued'])

export function ImportsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [job, setJob] = useState<ImportJob | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pollError, setPollError] = useState<string | null>(null)

  const progressPercent = useMemo(() => {
    if (!job?.totalBytes) return null
    const received = job.bytesReceived ?? 0
    return Math.min(100, Math.round((received / job.totalBytes) * 100))
  }, [job?.bytesReceived, job?.totalBytes])

  useEffect(() => {
    if (!job?.id || !POLL_STATUSES.has(job.status)) return

    const interval = window.setInterval(() => {
      void (async () => {
        try {
          const response = await fetch(`${API_ENDPOINTS.imports}/${job.id}`)
          if (!response.ok) {
            throw new Error('Failed to fetch job status')
          }
          const data = (await response.json()) as ImportJob
          setJob(data)
          setPollError(null)
        } catch (pollingError) {
          setPollError(
            pollingError instanceof Error ? pollingError.message : 'Unable to refresh status'
          )
        }
      })()
    }, 1000)

    return () => window.clearInterval(interval)
  }, [job?.id, job?.status])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null
    setFile(nextFile)
    setError(null)
  }

  const handleSubmit = () => {
    void (async () => {
      if (!file) {
        setError('Select a CSV file to start the import.')
        return
      }

      setIsSubmitting(true)
      setError(null)
      setPollError(null)
      setJob(null)

      try {
        const response = await fetch(API_ENDPOINTS.imports, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/csv',
          },
          body: file,
        })

        if (!response.ok) {
          throw new Error('Import request failed. Check the API and retry.')
        }

        const data = (await response.json()) as ImportJob
        setJob(data)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Something went wrong during upload.'
        )
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  const statusMessage = job?.error || job?.message

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Operations import console"
        description="Upload CSVs to hydrate parking transactions and billing history."
        actions={
          <span className="rounded-full border border-white/10 bg-slate-900/50 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
            POST {API_ENDPOINTS.imports}
          </span>
        }
      />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="File intake" description="CSV only, direct to imports service.">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">File selection</p>
                <h3 className="font-display text-xl text-slate-100">
                  {file ? file.name : 'Parking_Transactions.csv'}
                </h3>
              </div>
              <div className="text-right text-sm text-slate-400">
                {file ? formatBytes(file.size) : 'CSV only'}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <label className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-white/20 bg-slate-950/50 px-4 py-4 text-sm text-slate-300">
                <span>{file ? file.name : 'Choose the transaction CSV'}</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                  Browse
                </span>
                <input
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!file || isSubmitting}
                className="inline-flex items-center justify-center rounded-xl bg-amber-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
              >
                {isSubmitting ? 'Uploading…' : 'Start import'}
              </button>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {error}
              </div>
            )}

            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Payload</p>
                <p className="mt-2 text-lg text-slate-100">
                  {file ? formatBytes(file.size) : 'Awaiting file'}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Transport</p>
                <p className="mt-2 text-lg text-slate-100">
                  {isSubmitting ? 'Streaming' : 'Ready'}
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Import status" description="Watch ingestion and validation.">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Job</p>
                <h3 className="text-xl text-slate-100">
                  {job ? `Job ${job.id}` : 'No active import'}
                </h3>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusTone(
                  job?.status
                )}`}
              >
                {job?.status ?? 'Idle'}
              </span>
            </div>

            {job ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-300">
                    <span>Upload progress</span>
                    <span>
                      {formatBytes(job.bytesReceived)} / {formatBytes(job.totalBytes)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div
                      className="h-2 rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${progressPercent ?? 8}%` }}
                    />
                  </div>
                  {progressPercent !== null && (
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                      {progressPercent}% complete
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Processed rows
                    </p>
                    <p className="mt-2 text-2xl text-slate-100">{job.processedRows ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                      Failed rows
                    </p>
                    <p className="mt-2 text-2xl text-slate-100">{job.failedRows ?? '—'}</p>
                  </div>
                </div>

                {job.status === 'failed' && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {statusMessage ?? 'Import failed. Review the CSV and retry.'}
                  </div>
                )}

                {pollError && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {pollError}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/60 px-4 py-6 text-sm text-slate-300">
                Start an import to watch bytes, rows, and status updates in real time.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  )
}
