'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { lessons, categories, difficulties, type Lesson } from '@/lib/lessons'
import { BookOpen, Award, Clock, BarChart3, ArrowRight, CheckCircle, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LessonDetail } from '@/components/lesson-detail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/components/user-context'

export default function LearnPage() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const { completedLessons, points: earnedPoints, markLessonComplete } = useUser()

  const filteredLessons = lessons.filter(lesson => {
    const categoryMatch = filterCategory === 'all' || lesson.category === filterCategory
    const difficultyMatch = filterDifficulty === 'all' || lesson.difficulty === filterDifficulty
    return categoryMatch && difficultyMatch
  })

  const totalPoints = lessons.reduce((sum, lesson) => sum + lesson.learningPoints, 0)

  const handleCompleteLesson = (lessonId: string) => {
    const lesson = lessons.find(l => l.id === lessonId)
    if (lesson) {
      markLessonComplete(lessonId, lesson.learningPoints)
    }
  }

  if (selectedLesson) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-64 mt-16 md:mt-0">
          <LessonDetail
            lesson={selectedLesson}
            onBack={() => setSelectedLesson(null)}
            onComplete={() => handleCompleteLesson(selectedLesson.id)}
            isCompleted={completedLessons.includes(selectedLesson.id)}
          />
        </main>
      </div>
    )
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
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Learn & Practice</span>
              </div>
              <h1 className="text-4xl font-bold text-foreground">Learning Center</h1>
              <p className="text-lg text-muted-foreground">
                Master the skills to recognize and avoid online scams
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Stats */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">Completed</p>
                </div>
                <div className="text-3xl font-bold text-primary">{completedLessons.length}</div>
                <p className="text-xs text-muted-foreground">of {lessons.length} lessons</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="w-4 h-4" />
                  <p className="text-sm font-medium">Learning Points</p>
                </div>
                <div className="text-3xl font-bold text-accent">{earnedPoints}</div>
                <p className="text-xs text-muted-foreground">of {totalPoints} total</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <p className="text-sm font-medium">Time Invested</p>
                </div>
                <div className="text-3xl font-bold text-secondary">{completedLessons.length * 5}</div>
                <p className="text-xs text-muted-foreground">minutes learning</p>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BarChart3 className="w-4 h-4" />
                  <p className="text-sm font-medium">Progress</p>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {Math.round((completedLessons.length / lessons.length) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">overall</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Filters & Lessons */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Filter Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter Lessons
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Category</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        filterCategory === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      )}
                    >
                      All
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterCategory(cat.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          filterCategory === cat.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterDifficulty('all')}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                        filterDifficulty === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      )}
                    >
                      All
                    </button>
                    {difficulties.map(diff => (
                      <button
                        key={diff.id}
                        onClick={() => setFilterDifficulty(diff.id)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          filterDifficulty === diff.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        )}
                      >
                        {diff.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Lessons Grid */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Lessons ({filteredLessons.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredLessons.map((lesson) => {
                  const isCompleted = completedLessons.includes(lesson.id)
                  const categoryInfo = categories.find(c => c.id === lesson.category)

                  return (
                    <Card
                      key={lesson.id}
                      className={cn(
                        'p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary/50',
                        isCompleted && 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10'
                      )}
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {isCompleted && <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                              <span className="text-2xl">{categoryInfo?.icon}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                          </div>
                          {isCompleted && (
                            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                              Completed
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground">{lesson.description}</p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            <span>{lesson.learningPoints} pts</span>
                          </div>
                          <div className="text-xs font-semibold px-2 py-1 bg-muted rounded capitalize">
                            {lesson.difficulty}
                          </div>
                        </div>

                        {/* CTA */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between group"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLesson(lesson)
                          }}
                        >
                          {isCompleted ? 'Review Lesson' : 'Start Learning'}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-card border-t border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: '🔰',
                  title: 'Scam Aware',
                  description: 'Complete your first 3 lessons',
                  achieved: completedLessons.length >= 3,
                },
                {
                  icon: '🏆',
                  title: 'Knowledge Master',
                  description: 'Complete all lessons',
                  achieved: completedLessons.length === lessons.length,
                },
                {
                  icon: '🎓',
                  title: 'Certified Protector',
                  description: 'Earn 500+ learning points',
                  achieved: earnedPoints >= 500,
                },
              ].map((achievement, idx) => (
                <Card
                  key={idx}
                  className={cn(
                    'p-6 text-center',
                    achievement.achieved
                      ? 'border-primary/50 bg-primary/5'
                      : 'opacity-50'
                  )}
                >
                  <div className="text-4xl mb-3">{achievement.icon}</div>
                  <h3 className="font-semibold text-foreground mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.achieved && (
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                        Unlocked!
                      </span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
