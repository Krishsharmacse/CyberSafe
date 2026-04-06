'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Send, TrendingUp, Users, Eye, Clock, MessageSquare, Flag } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface Report {
  id: string
  type: 'phishing' | 'romance' | 'investment' | 'impersonation' | 'other'
  platform: 'whatsapp' | 'email' | 'sms' | 'call' | 'website'
  title: string
  description: string
  scamIndicators: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  reportedBy: string
  timestamp: string
  views: number
  reports: number
  verified: boolean
}

const mockReports: Report[] = [
  {
    id: '1',
    type: 'phishing',
    platform: 'whatsapp',
    title: 'Fake ICICI Bank OTP Request',
    description: 'Received message claiming to be from ICICI Bank asking to verify OTP for account unlock',
    scamIndicators: ['Urgent language', 'OTP request', 'Suspicious sender'],
    severity: 'critical',
    reportedBy: 'Anonymous',
    timestamp: '2 hours ago',
    views: 1243,
    reports: 89,
    verified: true,
  },
  {
    id: '2',
    type: 'impersonation',
    platform: 'sms',
    title: 'Income Tax Department Threat',
    description: 'SMS threatening legal action for unpaid taxes with demand to call a number',
    scamIndicators: ['Government impersonation', 'Fear tactic', 'Urgent demand'],
    severity: 'high',
    reportedBy: 'Anonymous',
    timestamp: '4 hours ago',
    views: 892,
    reports: 67,
    verified: true,
  },
  {
    id: '3',
    type: 'romance',
    platform: 'whatsapp',
    title: 'Online Dating Scam - Money for Emergency',
    description: 'Person built relationship over weeks then claimed family emergency, asking for money transfer',
    scamIndicators: ['Quick relationship building', 'Emergency excuse', 'Money request'],
    severity: 'high',
    reportedBy: 'Anonymous',
    timestamp: '6 hours ago',
    views: 567,
    reports: 45,
    verified: false,
  },
  {
    id: '4',
    type: 'investment',
    platform: 'email',
    title: 'Crypto Investment Ponzi Scheme',
    description: 'Email promoting guaranteed 200% returns on crypto investment within 30 days',
    scamIndicators: ['Unrealistic returns', 'High pressure', 'Fake testimonials'],
    severity: 'critical',
    reportedBy: 'Anonymous',
    timestamp: '8 hours ago',
    views: 2134,
    reports: 156,
    verified: true,
  },
  {
    id: '5',
    type: 'phishing',
    platform: 'email',
    title: 'Amazon Account Verification Phishing',
    description: 'Email with fake Amazon branding asking to verify account details and update payment method',
    scamIndicators: ['Lookalike domain', 'Account verification request', 'Payment update'],
    severity: 'high',
    reportedBy: 'Anonymous',
    timestamp: '1 day ago',
    views: 3456,
    reports: 298,
    verified: true,
  },
]

const scamTypes = [
  { id: 'phishing', label: 'Phishing' },
  { id: 'romance', label: 'Romance' },
  { id: 'investment', label: 'Investment' },
  { id: 'impersonation', label: 'Impersonation' },
  { id: 'other', label: 'Other' },
]

const platforms = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'email', label: 'Email' },
  { id: 'sms', label: 'SMS' },
  { id: 'call', label: 'Phone Call' },
  { id: 'website', label: 'Website' },
]

export default function ReportPage() {
  const [formData, setFormData] = useState({
    type: 'phishing',
    platform: 'whatsapp',
    title: '',
    description: '',
    indicators: [] as string[],
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setFormData({
        type: 'phishing',
        platform: 'whatsapp',
        title: '',
        description: '',
        indicators: [],
      })
      setSubmitted(false)
    }, 3000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    }
  }

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 dark:border-red-800'
      case 'high':
        return 'border-orange-200 dark:border-orange-800'
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-800'
      default:
        return 'border-blue-200 dark:border-blue-800'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="md:ml-64 mt-16 md:mt-0">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full">
                <Flag className="w-4 h-4" />
                <span className="text-sm font-medium">Community Safety</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground">Report & Learn</h1>
              <p className="text-lg text-muted-foreground">
                Share information about scams to protect the community
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trending">Trending Scams</TabsTrigger>
              <TabsTrigger value="report">Report a Scam</TabsTrigger>
            </TabsList>

            {/* Trending Scams Tab */}
            <TabsContent value="trending" className="space-y-6 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Total Reports</p>
                      <p className="text-2xl font-bold text-foreground">1,234</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                    <div>
                      <p className="text-xs text-muted-foreground">Critical Threats</p>
                      <p className="text-2xl font-bold text-foreground">47</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Contributors</p>
                      <p className="text-2xl font-bold text-foreground">892</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Last 24 Hours</p>
                      <p className="text-2xl font-bold text-foreground">156</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Report Cards */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground">Community Alerts</h2>
                {mockReports.map((report) => (
                  <Card
                    key={report.id}
                    className={cn(
                      'p-6 border-2 cursor-pointer hover:shadow-lg transition-all hover:border-primary/50',
                      getSeverityBorder(report.severity)
                    )}
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn('text-xs font-bold px-3 py-1 rounded-full uppercase', getSeverityColor(report.severity))}>
                              {report.severity}
                            </span>
                            <span className="text-xs font-medium bg-muted text-foreground px-3 py-1 rounded-full">
                              {platforms.find(p => p.id === report.platform)?.label}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">{report.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                        </div>
                        {report.verified && (
                          <div className="text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full whitespace-nowrap">
                            Verified
                          </div>
                        )}
                      </div>

                      {/* Indicators */}
                      <div className="flex flex-wrap gap-2">
                        {report.scamIndicators.map((indicator, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-card border border-border text-foreground px-2 py-1 rounded"
                          >
                            {indicator}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{report.views} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            <span>{report.reports} reports</span>
                          </div>
                          <span>{report.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Report Form Tab */}
            <TabsContent value="report" className="mt-8">
              <Card className="p-8 max-w-3xl">
                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Report a Scam</h2>
                    <p className="text-muted-foreground">
                      Help protect the community by reporting scams you&apos;ve encountered. Your information remains confidential.
                    </p>

                    {/* Scam Type */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Scam Type</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {scamTypes.map((type) => (
                          <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.id as any })}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                              formData.type === type.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                            )}
                          >
                            {type.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">Where did you encounter this?</label>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {platforms.map((plat) => (
                          <button
                            key={plat.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, platform: plat.id as any })}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                              formData.platform === plat.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-foreground'
                            )}
                          >
                            {plat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Subject/Title</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Brief title of the scam"
                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe what happened, what the scammer said, asked for, etc. Do NOT share personal information."
                        rows={5}
                        className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        required
                      />
                    </div>

                    {/* Indicators */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">What were the red flags?</label>
                      <div className="space-y-2">
                        {[
                          'Urgency/pressure tactics',
                          'Request for OTP or password',
                          'Suspicious sender',
                          'Spelling/grammar errors',
                          'Too good to be true offer',
                          'Fake website/email',
                          'Threat or fear-based',
                          'Request for money',
                        ].map((indicator) => (
                          <label key={indicator} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.indicators.includes(indicator)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    indicators: [...formData.indicators, indicator],
                                  })
                                } else {
                                  setFormData({
                                    ...formData,
                                    indicators: formData.indicators.filter(i => i !== indicator),
                                  })
                                }
                              }}
                              className="w-4 h-4 rounded border-input cursor-pointer"
                            />
                            <span className="text-foreground">{indicator}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Privacy Note */}
                    <Card className="p-4 bg-card border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        Your report will be published anonymously. Do not share any personal information, bank account details, or passwords.
                      </p>
                    </Card>

                    {/* Submit */}
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!formData.title || !formData.description}
                      className="w-full gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Report
                    </Button>
                  </form>
                ) : (
                  <div className="text-center space-y-4 py-8">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Thank You!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Your report has been submitted successfully. Our community will review it to help protect others.
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
