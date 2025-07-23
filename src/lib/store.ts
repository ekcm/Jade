import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { LanguageDirection } from '@/components/LanguageToggle'
import type { TranslationModel } from '@/components/ModelSelect'
import type { SSRFile } from '@/types/file'

// PDF State Types
interface PDFState {
  selectedFile: SSRFile | null
  pageCount: number
  isLoading: boolean
}

// Translation State Types
interface TranslationState {
  languageDirection: LanguageDirection
  selectedModel: TranslationModel
  originalText: string
  translatedText: string
  isTranslating: boolean
  currentPage: number
  totalPages: number
  progress: number
}

// UI State Types
interface UIState {
  errors: string[]
  notifications: string[]
}

// Combined Store State
interface AppState extends PDFState, TranslationState, UIState {}

// Actions Interface
interface AppActions {
  // PDF Actions
  setSelectedFile: (file: SSRFile | null) => void
  clearPDF: () => void
  setPageCount: (count: number) => void
  setPDFLoading: (loading: boolean) => void

  // Translation Actions
  setLanguageDirection: (direction: LanguageDirection) => void
  setSelectedModel: (model: TranslationModel) => void
  setOriginalText: (text: string) => void
  setTranslatedText: (text: string) => void
  setIsTranslating: (translating: boolean) => void
  setCurrentPage: (page: number) => void
  setTotalPages: (pages: number) => void
  setProgress: (progress: number) => void
  clearTranslation: () => void

  // UI Actions
  addError: (error: string) => void
  removeError: (index: number) => void
  clearErrors: () => void
  addNotification: (notification: string) => void
  removeNotification: (index: number) => void
  clearNotifications: () => void

  // Combined Actions
  resetAll: () => void
}

// Store Type
type AppStore = AppState & AppActions

// Initial State
const initialPDFState: PDFState = {
  selectedFile: null,
  pageCount: 0,
  isLoading: false,
}

const initialTranslationState: TranslationState = {
  languageDirection: 'en-to-zh',
  selectedModel: 'qwen2.5-72b',
  originalText: '',
  translatedText: '',
  isTranslating: false,
  currentPage: 0,
  totalPages: 0,
  progress: 0,
}

const initialUIState: UIState = {
  errors: [],
  notifications: [],
}

const initialState: AppState = {
  ...initialPDFState,
  ...initialTranslationState,
  ...initialUIState,
}

// Create Store
export const useAppStore = create<AppStore>()(
  devtools(
    (set, _get) => ({
      ...initialState,

      // PDF Actions
      setSelectedFile: (file) =>
        set(
          (state) => ({
            ...state,
            selectedFile: file,
            // Clear previous translation data when new file is selected
            originalText: '',
            translatedText: '',
            currentPage: 0,
            progress: 0,
          }),
          false,
          'setSelectedFile',
        ),

      clearPDF: () =>
        set(
          (state) => ({
            ...state,
            selectedFile: null,
            pageCount: 0,
            isLoading: false,
            // Clear related translation data
            originalText: '',
            translatedText: '',
            currentPage: 0,
            totalPages: 0,
            progress: 0,
          }),
          false,
          'clearPDF',
        ),

      setPageCount: (count) =>
        set((state) => ({ ...state, pageCount: count }), false, 'setPageCount'),

      setPDFLoading: (loading) =>
        set(
          (state) => ({ ...state, isLoading: loading }),
          false,
          'setPDFLoading',
        ),

      // Translation Actions
      setLanguageDirection: (direction) =>
        set(
          (state) => ({ ...state, languageDirection: direction }),
          false,
          'setLanguageDirection',
        ),

      setSelectedModel: (model) =>
        set(
          (state) => ({ ...state, selectedModel: model }),
          false,
          'setSelectedModel',
        ),

      setOriginalText: (text) =>
        set(
          (state) => ({ ...state, originalText: text }),
          false,
          'setOriginalText',
        ),

      setTranslatedText: (text) =>
        set(
          (state) => ({ ...state, translatedText: text }),
          false,
          'setTranslatedText',
        ),

      setIsTranslating: (translating) =>
        set(
          (state) => ({ ...state, isTranslating: translating }),
          false,
          'setIsTranslating',
        ),

      setCurrentPage: (page) =>
        set(
          (state) => ({ ...state, currentPage: page }),
          false,
          'setCurrentPage',
        ),

      setTotalPages: (pages) =>
        set(
          (state) => ({ ...state, totalPages: pages }),
          false,
          'setTotalPages',
        ),

      setProgress: (progress) =>
        set((state) => ({ ...state, progress }), false, 'setProgress'),

      clearTranslation: () =>
        set(
          (state) => ({
            ...state,
            originalText: '',
            translatedText: '',
            currentPage: 0,
            progress: 0,
            isTranslating: false,
          }),
          false,
          'clearTranslation',
        ),

      // UI Actions
      addError: (error) =>
        set(
          (state) => ({ ...state, errors: [...state.errors, error] }),
          false,
          'addError',
        ),

      removeError: (index) =>
        set(
          (state) => ({
            ...state,
            errors: state.errors.filter((_, i) => i !== index),
          }),
          false,
          'removeError',
        ),

      clearErrors: () =>
        set((state) => ({ ...state, errors: [] }), false, 'clearErrors'),

      addNotification: (notification) =>
        set(
          (state) => ({
            ...state,
            notifications: [...state.notifications, notification],
          }),
          false,
          'addNotification',
        ),

      removeNotification: (index) =>
        set(
          (state) => ({
            ...state,
            notifications: state.notifications.filter((_, i) => i !== index),
          }),
          false,
          'removeNotification',
        ),

      clearNotifications: () =>
        set(
          (state) => ({ ...state, notifications: [] }),
          false,
          'clearNotifications',
        ),

      // Combined Actions
      resetAll: () => set(() => ({ ...initialState }), false, 'resetAll'),
    }),
    {
      name: 'jade-app-store',
    },
  ),
)

// Selector Hooks for Better Performance
export const usePDFState = () =>
  useAppStore((state) => ({
    selectedFile: state.selectedFile,
    pageCount: state.pageCount,
    isLoading: state.isLoading,
  }))

export const useTranslationState = () =>
  useAppStore((state) => ({
    languageDirection: state.languageDirection,
    selectedModel: state.selectedModel,
    originalText: state.originalText,
    translatedText: state.translatedText,
    isTranslating: state.isTranslating,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    progress: state.progress,
  }))

export const useUIState = () =>
  useAppStore((state) => ({
    errors: state.errors,
    notifications: state.notifications,
  }))
