'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lesson } from '@/lib/lessons'
import { ArrowLeft, CheckCircle, Award, Clock, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LessonDetailProps {
  lesson: Lesson
  onBack: () => void
  onComplete: () => void
  isCompleted: boolean
}

export function LessonDetail({ lesson, onBack, onComplete, isCompleted }: LessonDetailProps) {
  const [showSimulation, setShowSimulation] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [simulationSubmitted, setSimulationSubmitted] = useState(false)

  const handleSimulationSubmit = () => {
    setSimulationSubmitted(true)
    if (!isCompleted) {
      onComplete()
    }
  }

  const isSimulationCorrect = lesson.simulation &&
    selectedAnswers.length > 0 &&
    lesson.simulation.correctAnswers.every(answer =>
      selectedAnswers.includes(answer)
    )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-background border-b border-border sticky top-16 md:top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Lessons</span>
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">{lesson.title}</h1>
              <p className="text-muted-foreground">{lesson.description}</p>
            </div>
            {isCompleted && (
              <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg flex items-center gap-2 font-semibold text-sm">
                <CheckCircle className="w-5 h-5" />
                Completed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-semibold text-foreground">{lesson.duration} min</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Learning Points</p>
                  <p className="font-semibold text-foreground">{lesson.learningPoints} pts</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Difficulty</p>
                  <p className="font-semibold text-foreground capitalize">{lesson.difficulty}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Lesson Content */}
          {!showSimulation ? (
            <Card className="p-8">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="space-y-6">
                  {lesson.content.split('\n').filter(line => line.trim()).map((paragraph, idx) => {
                    // Handle headers (lines starting with numbers)
                    if (/^\d+\./.test(paragraph.trim())) {
                      return (
                        <div key={idx}>
                          <h3 className="font-semibold text-foreground">{paragraph.trim()}</h3>
                        </div>
                      )
                    }
                    // Handle bullet lists
                    if (/^[-*•]/.test(paragraph.trim())) {
                      return (
                        <div key={idx} className="flex gap-3">
                          <span className="text-primary">•</span>
                          <p className="text-foreground">{paragraph.trim().substring(1)}</p>
                        </div>
                      )
                    }
                    // Regular paragraphs
                    return <p key={idx} className="text-foreground">{paragraph.trim()}</p>
                  })}
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold text-foreground mb-4">Key Takeaways</h3>
                <ul className="space-y-2">
                  {lesson.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                      <p className="text-foreground">{takeaway}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              {lesson.simulation && (
                <div className="mt-8 space-y-4">
                  <Button
                    onClick={() => setShowSimulation(true)}
                    size="lg"
                    className="w-full"
                  >
                    Test Your Knowledge - Simulation
                  </Button>
                </div>
              )}
            </Card>
          ) : lesson.simulation ? (
            // Simulation View
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Test Your Knowledge</h2>
              <p className="text-muted-foreground mb-6">{lesson.simulation.context}</p>

              {/* WhatsApp Simulation */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg p-6 mb-8 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="space-y-4">
                  {lesson.simulation.whatsappMessages.map((msg, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground">{msg.sender}</span>
                          {msg.isGreen && <span className="text-xs bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded">Verified</span>}
                        </div>
                        <p className="bg-white dark:bg-slate-800 rounded-lg p-3 text-foreground mb-1">
                          {msg.message}
                        </p>
                        <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6 mb-8">
                <h3 className="font-semibold text-foreground">What should you do?</h3>
                {lesson.simulation.correctAnswers.map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (selectedAnswers.includes(answer)) {
                        setSelectedAnswers(selectedAnswers.filter(a => a !== answer))
                      } else {
                        setSelectedAnswers([...selectedAnswers, answer])
                      }
                    }}
                    className={cn(
                      'w-full text-left p-4 border-2 rounded-lg transition-colors',
                      selectedAnswers.includes(answer)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-5 h-5 rounded border-2 flex items-center justify-center',
                          selectedAnswers.includes(answer)
                            ? 'border-green-500 bg-green-500'
                            : 'border-muted-foreground'
                        )}
                      >
                        {selectedAnswers.includes(answer) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-foreground font-medium">{answer}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              {!simulationSubmitted ? (
                <Button
                  onClick={handleSimulationSubmit}
                  disabled={selectedAnswers.length === 0}
                  size="lg"
                  className="w-full"
                >
                  Check Answer
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className={cn(
                    'p-4 rounded-lg border-2',
                    isSimulationCorrect
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                  )}>
                    <p className={cn(
                      'font-semibold mb-2',
                      isSimulationCorrect ? 'text-green-700 dark:text-green-400' : 'text-orange-700 dark:text-orange-400'
                    )}>
                      {isSimulationCorrect ? '✓ Excellent!' : '✓ Good try!'}
                    </p>
                    <p className="text-foreground mb-3">{lesson.simulation.explanation}</p>
                    {isSimulationCorrect && (
                      <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg font-semibold text-sm">
                        +{lesson.learningPoints} Learning Points
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowSimulation(false)
                        setSelectedAnswers([])
                        setSimulationSubmitted(false)
                      }}
                    >
                      Back to Lesson
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={onBack}
                    >
                      Next Lesson
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
