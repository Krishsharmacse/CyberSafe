'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Volume2, Eye, Type, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccessibilitySettings {
  voiceGuidance: boolean
  highContrast: boolean
  fontSize: 'normal' | 'large' | 'xlarge'
  reducedMotion: boolean
  screenReader: boolean
}

interface AccessibilityPanelProps {
  isOpen: boolean
  onClose: () => void
  settings: AccessibilitySettings
  onSettingsChange: (settings: AccessibilitySettings) => void
}

export function AccessibilityPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: AccessibilityPanelProps) {
  const handleToggle = (key: keyof AccessibilitySettings) => {
    if (typeof settings[key] === 'boolean') {
      onSettingsChange({
        ...settings,
        [key]: !settings[key],
      })
    }
  }

  const handleFontSizeChange = (size: 'normal' | 'large' | 'xlarge') => {
    onSettingsChange({
      ...settings,
      fontSize: size,
    })
    // Apply font size to document
    if (size === 'normal') {
      document.documentElement.style.fontSize = '16px'
    } else if (size === 'large') {
      document.documentElement.style.fontSize = '18px'
    } else {
      document.documentElement.style.fontSize = '20px'
    }
  }

  const handleHighContrastToggle = () => {
    const newValue = !settings.highContrast
    handleToggle('highContrast')
    // Apply high contrast mode
    if (newValue) {
      document.documentElement.classList.add('high-contrast')
    } else {
      document.documentElement.classList.remove('high-contrast')
    }
  }

  const handleReducedMotionToggle = () => {
    const newValue = !settings.reducedMotion
    handleToggle('reducedMotion')
    // Apply prefers-reduced-motion
    if (newValue) {
      document.documentElement.classList.add('motion-safe')
    } else {
      document.documentElement.classList.remove('motion-safe')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Accessibility Settings</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close accessibility settings"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Voice Guidance */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <Volume2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">Voice Guidance</p>
                  <p className="text-xs text-muted-foreground">Read content aloud</p>
                </div>
              </label>
              <button
                onClick={() => handleToggle('voiceGuidance')}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  settings.voiceGuidance
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
                aria-label={`Voice guidance ${settings.voiceGuidance ? 'enabled' : 'disabled'}`}
              >
                <div
                  className={cn(
                    'w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.voiceGuidance ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          {/* High Contrast */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <Eye className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">High Contrast</p>
                  <p className="text-xs text-muted-foreground">Increase color contrast</p>
                </div>
              </label>
              <button
                onClick={handleHighContrastToggle}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  settings.highContrast
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
                aria-label={`High contrast ${settings.highContrast ? 'enabled' : 'disabled'}`}
              >
                <div
                  className={cn(
                    'w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.highContrast ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Type className="w-5 h-5 text-primary" />
              <label className="font-semibold text-foreground">Text Size</label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => handleFontSizeChange(size)}
                  className={cn(
                    'px-4 py-2 rounded-lg transition-colors font-medium',
                    settings.fontSize === size
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  )}
                  aria-label={`Set text size to ${size}`}
                >
                  <span className={cn(
                    size === 'normal' && 'text-sm',
                    size === 'large' && 'text-base',
                    size === 'xlarge' && 'text-lg'
                  )}>
                    A
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-5 h-5 text-primary">✓</div>
                <div>
                  <p className="font-semibold text-foreground">Reduce Motion</p>
                  <p className="text-xs text-muted-foreground">Minimize animations</p>
                </div>
              </label>
              <button
                onClick={handleReducedMotionToggle}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  settings.reducedMotion
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
                aria-label={`Reduce motion ${settings.reducedMotion ? 'enabled' : 'disabled'}`}
              >
                <div
                  className={cn(
                    'w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.reducedMotion ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Screen Reader */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <div className="w-5 h-5 text-primary">♿</div>
                <div>
                  <p className="font-semibold text-foreground">Screen Reader</p>
                  <p className="text-xs text-muted-foreground">Optimize for assistive tech</p>
                </div>
              </label>
              <button
                onClick={() => handleToggle('screenReader')}
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  settings.screenReader
                    ? 'bg-primary'
                    : 'bg-muted'
                )}
                aria-label={`Screen reader ${settings.screenReader ? 'enabled' : 'disabled'}`}
              >
                <div
                  className={cn(
                    'w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.screenReader ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Info Card */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-foreground">
              These settings are stored locally on your device. They will persist across sessions.
            </p>
          </Card>

          {/* Close Button */}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  )
}
