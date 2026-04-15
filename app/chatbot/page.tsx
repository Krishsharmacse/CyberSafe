'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { MessageSquare, ArrowLeft, Shield, AlertTriangle, Zap, Globe } from 'lucide-react'

const API_BASE = 'http://localhost:8000'

export default function ChatbotPage() {
  const [description, setDescription] = useState('')
  const [affectedSystems, setAffectedSystems] = useState('')
  const [incidentType, setIncidentType] = useState('')
  const [severityLabel, setSeverityLabel] = useState('')
  const [responseText, setResponseText] = useState('')
  const [sections, setSections] = useState<Record<string, string>>({})
  const [sources, setSources] = useState<string[]>([])
  const [helplines, setHelplines] = useState<Record<string, string>>({})
  const [apiStatus, setApiStatus] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const affectedSystemsList = useMemo(
    () => affectedSystems.split(',').map((item) => item.trim()).filter(Boolean),
    [affectedSystems]
  )
  const responseSectionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (responseText && responseSectionRef.current) {
      responseSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [responseText])

  const handleError = (message: string) => {
    setError(message)
    setApiStatus('')
  }

  const checkServer = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setApiStatus('Backend is online and ready.')
    } catch (err) {
      handleError('Unable to reach backend. Make sure the API is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const classifyIncident = async () => {
    if (!description.trim()) {
      handleError('Please enter a description before classifying.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })

      if (!res.ok) {
        const payload = await res.json()
        throw new Error(payload.detail || `Status ${res.status}`)
      }

      const data = await res.json()
      setIncidentType(data.incident_type)
      setSeverityLabel(`${data.severity} - ${data.severity_label}`)
      setApiStatus('Classification complete.')
    } catch (err) {
      handleError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const requestResponse = async () => {
    if (!description.trim()) {
      handleError('Please enter a description before requesting a response.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, affected_systems: affectedSystemsList }),
      })

      if (!res.ok) {
        const payload = await res.json()
        throw new Error(payload.detail || `Status ${res.status}`)
      }

      const data = await res.json()
      setIncidentType(data.incident_type)
      setSeverityLabel(`${data.severity} - ${data.severity_label}`)
      setResponseText(data.response)
      setSections({
        immediate: data.sections.immediate || '',
        containment: data.sections.containment || '',
        recovery: data.sections.recovery || '',
        prevention: data.sections.prevention || '',
        red_flags: data.sections.red_flags || '',
      })
      setSources(data.sources || [])
      setHelplines(data.helplines || {})
      setApiStatus('Incident response generated.')
    } catch (err) {
      handleError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const fetchHelplines = async () => {
    setLoading(true)
    setError('')
    try {
      const query = incidentType ? `?incident_type=${encodeURIComponent(incidentType)}` : ''
      const res = await fetch(`${API_BASE}/helplines${query}`)
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      setHelplines(data.helplines || {})
      setApiStatus('Helplines loaded.')
    } catch (err) {
      handleError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async () => {
    if (!responseText) {
      handleError('Generate a response first before exporting.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          incident_type: incidentType || 'other',
          severity: Number(severityLabel?.split(' ')[0]) || 1,
          affected_systems: affectedSystemsList,
          response: responseText,
          sections,
        }),
      })

      if (!res.ok) {
        const payload = await res.json()
        throw new Error(payload.detail || `Status ${res.status}`)
      }

      const data = await res.json()
      setApiStatus('Export report ready.')
      setResponseText(JSON.stringify(data, null, 2))
    } catch (err) {
      handleError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-3 text-primary mb-4">
              <MessageSquare className="w-8 h-8" />
              <h1 className="text-4xl font-bold">CyberSafe Incident Assistant</h1>
            </div>
            <p className="max-w-2xl text-base text-muted-foreground leading-relaxed">
              Use this chatbot section for post-incident panic handling. Describe what happened and get classification, structured response steps, helplines, and an exportable incident report.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button onClick={checkServer} variant="secondary" className="gap-2">
              <Globe className="w-4 h-4" /> Check Backend
            </Button>
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1">
          <Card className="p-8 bg-card/90 border border-border shadow-xl">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-foreground">Incident Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe what happened in as much detail as possible..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-foreground">Affected Systems (comma separated)</label>
                <input
                  value={affectedSystems}
                  onChange={(event) => setAffectedSystems(event.target.value)}
                  className="w-full rounded-3xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. personal laptop, chrome browser"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Button onClick={classifyIncident} disabled={loading} className="w-full" variant="secondary">
                  {loading ? <Spinner className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {loading ? 'Working...' : 'Classify Incident'}
                </Button>
                <Button onClick={requestResponse} disabled={loading} className="w-full" variant="default">
                  {loading ? <Spinner className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {loading ? 'Processing...' : 'Get Full Response'}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Button onClick={fetchHelplines} disabled={loading} className="w-full" variant="ghost">
                  {loading ? <Spinner className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  {loading ? 'Loading...' : 'Load Helplines'}
                </Button>
                <Button onClick={exportReport} disabled={loading || !responseText} className="w-full" variant="link">
                  {loading ? <Spinner className="w-4 h-4" /> : 'Export Report'}
                </Button>
              </div>

              <div className="rounded-3xl border border-border bg-muted/10 p-5">
                <p className="text-sm text-muted-foreground">Current status:</p>
                <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                  {loading && <Spinner className="w-4 h-4 text-primary" />}
                  <p className="break-words">{loading ? 'Processing request...' : apiStatus || 'No actions taken yet.'}</p>
                </div>
                {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-card/90 border border-border shadow-xl">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">Incident Summary</p>
                <div className="rounded-3xl border border-border bg-background p-4 text-sm text-foreground">
                  <p><span className="font-semibold">Type:</span> {incidentType || '—'}</p>
                  <p><span className="font-semibold">Severity:</span> {severityLabel || '—'}</p>
                  <p><span className="font-semibold">Affected:</span> {affectedSystemsList.join(', ') || 'Not specified'}</p>
                  {responseText ? (
                    <div className="mt-4 rounded-3xl bg-primary/10 border border-primary/20 p-3 text-sm text-primary">
                      <p className="font-semibold">Response ready</p>
                      <p className="text-xs text-muted-foreground">The page will scroll to the result panel automatically.</p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-3xl bg-muted/5 border border-border p-3 text-sm text-muted-foreground">
                      <p>Generate a response to see detailed guidance here.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground">Reference Sources</p>
                <div className="rounded-3xl border border-border bg-background p-4 min-h-[8rem] text-sm text-muted-foreground">
                  {sources.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                      {sources.map((source, idx) => (
                        <li key={`${source}-${idx}`}>{source}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No sources available yet. Generate a response to fetch references.</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">Structured Response</p>
                <div className="space-y-3">
                  {['immediate', 'containment', 'recovery', 'prevention', 'red_flags'].map((key) => (
                    <div key={key} className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground capitalize">{key.replace('_', ' ')}</p>
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">{sections[key] || `No ${key} recommendations yet.`}</pre>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground">Helplines</p>
                <div className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  {Object.keys(helplines).length > 0 ? (
                    <ul className="space-y-2">
                      {Object.entries(helplines).map(([label, phone]) => (
                        <li key={label}>
                          <span className="font-semibold text-foreground">{label}:</span> {phone}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No helplines loaded yet. Click "Load Helplines" to fetch contacts.</p>
                  )}
                </div>
              </div>

              <div ref={responseSectionRef} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Response Output</p>
                    <p className="text-xs text-muted-foreground">The response is shown here after the backend returns results.</p>
                  </div>
                  {loading ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-xs text-primary">
                      <Spinner className="w-3 h-3" /> Waiting for response
                    </div>
                  ) : responseText ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs text-emerald-700">
                      <Zap className="w-3 h-3" /> Response received
                    </div>
                  ) : null}
                </div>
                <pre className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground whitespace-pre-wrap max-h-72 overflow-y-auto shadow-sm transition-all duration-300">
                  {responseText || 'Generated response will appear here.'}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
