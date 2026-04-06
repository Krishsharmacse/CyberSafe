'use client'

import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, AlertCircle, Users, Clock } from 'lucide-react'

const trendData = [
  { month: 'Jan', phishing: 234, romance: 89, investment: 156, impersonation: 201 },
  { month: 'Feb', phishing: 289, romance: 112, investment: 198, impersonation: 245 },
  { month: 'Mar', phishing: 345, romance: 145, investment: 267, impersonation: 312 },
  { month: 'Apr', phishing: 412, romance: 178, investment: 334, impersonation: 389 },
  { month: 'May', phishing: 489, romance: 201, investment: 401, impersonation: 456 },
  { month: 'Jun', phishing: 567, romance: 234, investment: 489, impersonation: 534 },
]

const typeData = [
  { name: 'Phishing', value: 2336, color: '#3b82f6' },
  { name: 'Romance', value: 959, color: '#ec4899' },
  { name: 'Investment', value: 1845, color: '#f59e0b' },
  { name: 'Impersonation', value: 2137, color: '#ef4444' },
]

const platformData = [
  { platform: 'WhatsApp', count: 2456 },
  { platform: 'Email', count: 1834 },
  { platform: 'SMS', count: 1567 },
  { platform: 'Call', count: 923 },
  { platform: 'Website', count: 756 },
]

const topScams = [
  { rank: 1, title: 'Fake Bank OTP Phishing', reports: 456, severity: 'critical', trend: '↑' },
  { rank: 2, title: 'Income Tax Threat Scam', reports: 389, severity: 'critical', trend: '↑' },
  { rank: 3, title: 'Amazon Account Verification', reports: 298, severity: 'high', trend: '↓' },
  { rank: 4, title: 'Crypto Investment Ponzi', reports: 267, severity: 'critical', trend: '↑' },
  { rank: 5, title: 'Romance Scam - Emergency Money', reports: 234, severity: 'high', trend: '↑' },
]

export default function StatsPage() {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
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
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Data & Insights</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground">Scam Statistics</h1>
              <p className="text-lg text-muted-foreground">
                Community trends and data on prevalent scams
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">Total Reports</p>
                </div>
                <div className="text-4xl font-bold text-primary">7,277</div>
                <p className="text-xs text-green-600 dark:text-green-400">↑ 23% this month</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <p className="text-sm font-medium">Active Users</p>
                </div>
                <div className="text-4xl font-bold text-accent">12,456</div>
                <p className="text-xs text-green-600 dark:text-green-400">↑ 34% this month</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm font-medium">Avg. Response Time</p>
                </div>
                <div className="text-4xl font-bold text-secondary">2.3 hrs</div>
                <p className="text-xs text-green-600 dark:text-green-400">↓ 15% improvement</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-sm font-medium">Alerts Published</p>
                </div>
                <div className="text-4xl font-bold text-primary">247</div>
                <p className="text-xs text-green-600 dark:text-green-400">↑ 12 this week</p>
              </div>
            </Card>
          </div>

          {/* Trends Chart */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Scam Reports Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-foreground)',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="phishing" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="romance" stroke="#ec4899" strokeWidth={2} />
                <Line type="monotone" dataKey="investment" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="impersonation" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Scam Type Distribution */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Scam Type Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${value})`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-foreground)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Platform Distribution */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Reports by Platform</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={platformData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis type="number" stroke="var(--color-muted-foreground)" />
                  <YAxis dataKey="platform" type="category" stroke="var(--color-muted-foreground)" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-foreground)',
                    }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Top Scams Table */}
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Top 5 Active Scams This Week</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Scam Title</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Reports</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Severity</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {topScams.map((scam) => (
                    <tr key={scam.rank} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {scam.rank}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium text-foreground">{scam.title}</td>
                      <td className="py-4 px-4 text-foreground">{scam.reports} reports</td>
                      <td className="py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(scam.severity)}`}>
                          {scam.severity}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={scam.trend === '↑' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                          {scam.trend}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Insights */}
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-4">Key Insights</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-foreground">Phishing attacks account for 32% of all reports, with a 24% increase this month</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-foreground">WhatsApp remains the most common attack platform, followed by Email and SMS</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <p className="text-foreground">Investment scams show the highest growth rate (45% month-over-month)</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0" />
                <p className="text-foreground">Saturday and Sunday see 38% more phishing attempts than weekdays</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-foreground">New scams targeting government subsidies emerging in specific regions</p>
              </li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  )
}
