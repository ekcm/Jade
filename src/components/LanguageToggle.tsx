'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export type LanguageDirection = 'en-to-zh' | 'zh-to-en'

interface LanguageToggleProps {
  direction: LanguageDirection
  onDirectionChange: (direction: LanguageDirection) => void
  disabled?: boolean
}

export function LanguageToggle({
  direction,
  onDirectionChange,
  disabled = false,
}: LanguageToggleProps) {
  const isZhToEn = direction === 'zh-to-en'

  const handleToggle = (checked: boolean) => {
    onDirectionChange(checked ? 'zh-to-en' : 'en-to-zh')
  }

  return (
    <div className="flex items-center space-x-3">
      <Label
        htmlFor="language-toggle"
        className={`text-sm font-medium transition-colors ${
          !isZhToEn && !disabled
            ? 'text-jade-600'
            : disabled
              ? 'text-slate-400'
              : 'text-slate-500'
        }`}
      >
        EN → 中文
      </Label>

      <Switch
        id="language-toggle"
        checked={isZhToEn}
        onCheckedChange={handleToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-jade-500 data-[state=unchecked]:bg-slate-200"
      />

      <Label
        htmlFor="language-toggle"
        className={`text-sm font-medium transition-colors ${
          isZhToEn && !disabled
            ? 'text-jade-600'
            : disabled
              ? 'text-slate-400'
              : 'text-slate-500'
        }`}
      >
        中文 → EN
      </Label>
    </div>
  )
}
