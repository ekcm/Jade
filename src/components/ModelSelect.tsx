'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type TranslationModel =
  | 'qwen2.5-72b'
  | 'kimi-k2-instruct'
  | 'deepseek-v3'

interface ModelSelectProps {
  selectedModel: TranslationModel
  onModelChange: (model: TranslationModel) => void
  disabled?: boolean
}

const modelOptions = [
  {
    value: 'qwen2.5-72b' as const,
    label: 'Qwen2.5 7B Turbo',
  },
  {
    value: 'kimi-k2-instruct' as const,
    label: 'Kimi-K2-Instruct',
  },
  {
    value: 'deepseek-v3' as const,
    label: 'DeepSeek-V3',
  },
]

export function ModelSelect({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectProps) {
  const selectedModelInfo = modelOptions.find(
    (model) => model.value === selectedModel,
  )

  return (
    <Select
      value={selectedModel}
      onValueChange={onModelChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={`w-full ${
          disabled
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-white border-slate-200 hover:border-jade-300 focus:border-jade-500'
        }`}
      >
        <SelectValue placeholder="Select translation model">
          <span className="font-medium">{selectedModelInfo?.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {modelOptions.map((model) => (
          <SelectItem
            key={model.value}
            value={model.value}
            className="cursor-pointer hover:bg-jade-50"
          >
            <span className="font-medium">{model.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
