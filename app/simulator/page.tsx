'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUser } from '@/components/user-context'
import { analyzeText } from '@/lib/scam-detector'
import { Terminal, ShieldAlert, Cpu, CheckCircle2, ChevronRight, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SimulatorPage() {
  const { addPoints } = useUser()
  const { setTheme } = useTheme()
  const [payload, setPayload] = useState('')
  const [hasScored, setHasScored] = useState(false)
  const [simulationResult, setSimulationResult] = useState<{
    success: boolean, 
    message: string, 
    aiScore: number,
    feedback: string[]
  } | null>(null)

  // Force dark mode cinematically on enter
  useEffect(() => {
    setTheme('dark')
  }, [setTheme])

  const handleSimulate = () => {
    if (!payload.trim()) return

    const hasLink = payload.toLowerCase().includes('http') || payload.toLowerCase().includes('www') || payload.toLowerCase().includes('.com') || payload.toLowerCase().includes('.org')
    const hasRequest = payload.toLowerCase().includes('password') || payload.toLowerCase().includes('money') || payload.toLowerCase().includes('urgent')

    if (!hasLink && !hasRequest) {
      setSimulationResult({
        success: false,
        message: 'Invalid Payload',
        aiScore: 0,
        feedback: ['Protocol Error: Payload must contain a link, financial request, or credential prompt to be a valid attack vector.']
      })
      setHasScored(false)
      return
    }

    const analysis = analyzeText(payload)
    const score = analysis.riskScore

    let success = false
    let message = ''
    let feedback: string[] = []

    if (score < 30) {
      success = true
      message = 'EVASION SUCCESSFUL'
      feedback = [
        'SYSTEM ALERT: Deep-Phish payload bypassed primary heuristic filters.',
        'By avoiding high-risk vocabulary and masking malicious intent, the payload appears legitimate.',
        'Note: Highly personalized spear-phishing drastically reduces automated detection rates.'
      ]
      if (!hasScored) {
        addPoints(50)
        setHasScored(true)
      }
    } else {
      success = false
      message = 'PAYLOAD INTERCEPTED'
      feedback = analysis.patterns.map(p => `Triggered Rule [${p.name}]: ${p.description}`)
      feedback.push('Recommendation: Decrease artificial urgency and utilize less suspicious domain structures to evade detection.')
      setHasScored(false)
    }

    setSimulationResult({
      success,
      message,
      aiScore: score,
      feedback
    })
  }

  return (
    <div className="min-h-screen bg-background text-emerald-500 font-mono relative overflow-hidden transition-colors duration-1000">

      {/* Matrix Flow Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <Sidebar />
      <main className="md:ml-64 mt-16 md:mt-0 p-4 sm:p-8 relative z-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="bg-card/80 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-none shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden group">
            <Cpu className="absolute -right-10 -bottom-10 w-64 h-64 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Terminal className="w-4 h-4" />
                <span>Bad Actor Environment [Root]</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">DEEP-PHISH SIMULATOR</h1>
              <p className="text-emerald-400/80 max-w-2xl text-lg leading-relaxed">
                Analyze defense systems by assuming the role of an attacker. Craft a highly evasive phishing payload. Target: <span className="font-bold text-emerald-400">Sneak past the CyberSafe AI Detection Engine (Risk Score &lt; 30%).</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-0 border-emerald-500/30 bg-card/80 backdrop-blur-md rounded-none shadow-[0_0_25px_rgba(16,185,129,0.1)] relative overflow-hidden flex flex-col">
              <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-3 flex flex-col sm:flex-row items-center justify-between">
                <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 tracking-widest uppercase">
                  <ChevronRight className="w-5 h-5" /> payload_injector.sh
                </h2>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <textarea
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  className="flex-1 w-full min-h-[250px] bg-transparent border-0 p-0 text-emerald-400 placeholder-emerald-900/50 focus:ring-0 resize-none font-mono text-sm sm:text-base leading-relaxed outline-none"
                  placeholder="> INITIATE PAYLOAD SEQUENCE...&#10;> Example: 'Dear User, suspicious activity detected. Verify account here.'&#10;> Enter target configuration parameters..."
                  spellCheck={false}
                />
                <Button 
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all rounded-none"
                  onClick={handleSimulate}
                >
                  [ Execute Payload ] <Terminal className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>

            <Card className="p-0 border-emerald-500/30 bg-card/80 backdrop-blur-md rounded-none shadow-[0_0_25px_rgba(16,185,129,0.1)]">
               <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-3">
                <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 tracking-widest uppercase">
                  <Cpu className="w-4 h-4" /> CyberSafe AI Response Matrix
                </h2>
              </div>
              <div className="p-6">
                {!simulationResult ? (
                  <div className="h-[280px] flex flex-col items-center justify-center text-emerald-500/30 space-y-4 border border-dashed border-emerald-500/20 bg-emerald-500/5">
                    <ShieldAlert className="w-16 h-16 opacity-50 animate-pulse-fast" />
                    <p className="tracking-widest uppercase text-sm">System Standby. Awaiting Attack Sequence...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className={cn(
                      "p-6 text-center border relative overflow-hidden",
                      simulationResult.success 
                        ? "bg-rose-500/10 border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-rose-500" 
                        : "bg-blue-500/10 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.15)] text-blue-500"
                    )}>
                      <h3 className="text-2xl font-bold tracking-wider mb-2 z-10 relative">
                        {simulationResult.message}
                      </h3>
                      <div className="text-5xl font-mono mt-4 font-bold relative z-10">
                        {simulationResult.aiScore}%
                        <span className="text-base block mt-2 opacity-70 tracking-widest font-normal">CALCULATED RISK SCORE</span>
                      </div>
                      <div className={cn("absolute inset-0 opacity-10 animate-scan", simulationResult.success ? "bg-rose-500" : "bg-blue-500")}></div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-emerald-400 flex items-center gap-2 uppercase tracking-wide text-sm border-b border-emerald-500/20 pb-2">
                        <Info className="w-4 h-4" /> Diagnostic Logs
                      </h4>
                      <ul className="space-y-3">
                        {simulationResult.feedback.map((fb, idx) => (
                          <li key={idx} className="flex gap-3 text-sm text-emerald-200/80 bg-emerald-500/10 border left-l-4 border-emerald-500/30 p-3 rounded-r-md">
                            <span className="text-emerald-400 font-bold">{'>'}</span>
                            <span className="leading-relaxed">{fb}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {simulationResult.success && hasScored && (
                      <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/40 flex items-center gap-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-white tracking-wide uppercase text-sm">Target Exploited</p>
                          <p className="text-sm text-emerald-400 mt-1">+50 Safety Points awarded for infiltrating automated defenses.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

        </div>
      </main>
    </div>
  )
}
