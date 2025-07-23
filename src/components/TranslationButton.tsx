'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TranslationButtonProps {
  isTranslating?: boolean
  disabled?: boolean
  onClick: () => void
}

export function TranslationButton({
  isTranslating = false,
  disabled = false,
  onClick,
}: TranslationButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled || isTranslating}
      className={`
        ${
          disabled
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300'
            : isTranslating
              ? 'bg-jade-600 text-white'
              : 'bg-jade-500 text-white hover:bg-jade-600'
        }
        transition-colors duration-200
      `}
      aria-label={
        isTranslating
          ? 'Translation in progress'
          : disabled
            ? 'Upload a PDF to enable translation'
            : 'Start translation'
      }
    >
      {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isTranslating ? 'Translating...' : 'Start Translation'}
    </Button>
  )
}
