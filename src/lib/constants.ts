/**
 * Application-wide constants and configuration values
 */

export const FILE_UPLOAD_CONFIG = {
  /** Maximum allowed file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  /** Accepted file MIME types */
  ACCEPTED_TYPES: ['application/pdf', 'application/json', 'text/json'] as const,

  /** Average estimated bytes per PDF page for page count estimation */
  PAGE_SIZE_ESTIMATE: 100 * 1024, // 100KB per page

  /** Drag over visual feedback delay in milliseconds */
  DRAG_OVER_DELAY: 150,
} as const

export const TOAST_CONFIG = {
  /** Maximum number of toasts to display simultaneously */
  TOAST_LIMIT: 1,

  /** Duration before toast is automatically removed (5 seconds) */
  TOAST_REMOVE_DELAY: 5000,

  /** Debounce delay for rapid toast calls */
  DEBOUNCE_DELAY: 300,
} as const

export const UI_CONFIG = {
  /** Responsive breakpoints */
  BREAKPOINTS: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },

  /** Animation durations in milliseconds */
  ANIMATION: {
    fast: 150,
    normal: 200,
    slow: 300,
  },

  /** Layout dimensions */
  LAYOUT: {
    /** PDF viewer panel width percentage */
    PDF_PANEL_WIDTH: '60%',
    /** Translation panel width percentage */
    TRANSLATION_PANEL_WIDTH: '40%',
  },
} as const

export const VALIDATION_MESSAGES = {
  FILE_TYPE_ERROR: 'File must be a PDF or JSON file',
  FILE_SIZE_ERROR: 'File size must be less than 10MB',
  FILE_EMPTY_ERROR: 'File cannot be empty',
  UPLOAD_FAILED_ERROR: 'Upload failed. Please try again.',
  INVALID_FILE_ERROR: 'Invalid file',
  INVALID_JSON_ERROR: 'Invalid JSON format',
} as const

export const UI_TEXT = {
  UPLOAD: {
    DRAG_DROP_PROMPT: 'Upload PDF or JSON file',
    DRAG_DROP_ACTIVE: 'Drop your file here',
    BROWSE_INSTRUCTION: 'Drag & drop or click to browse (PDF/JSON, Max 10MB)',
    CHOOSE_FILE_BUTTON: 'Choose File',
    SUCCESS_MESSAGE: '✓ File uploaded successfully and ready for processing',
    CLEAR_FILE_ARIA: 'Clear file',
  },

  TOAST: {
    FILE_ALREADY_UPLOADED_TITLE: 'File already uploaded',
    KEEP_CURRENT_FILE: 'Keep current file',
    REPLACE_WITH_NEW_FILE: 'Replace with new file',
  },

  PANELS: {
    PDF_VIEWER_TITLE: 'PDF Viewer',
    JSON_VIEWER_TITLE: 'JSON Viewer',
    DOCUMENT_VIEWER_TITLE: 'Document Viewer',
    TRANSLATION_TITLE: 'Translation',
  },
} as const

export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const

/**
 * Color theme configuration
 */
export const THEME_COLORS = {
  jade: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    900: '#0f172a',
  },
} as const
