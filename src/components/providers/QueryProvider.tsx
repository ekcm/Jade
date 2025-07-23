'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache translated content for 30 minutes
            staleTime: 30 * 60 * 1000,
            // Keep in cache for 1 hour
            gcTime: 60 * 60 * 1000,
            // Retry failed requests up to 2 times
            retry: 2,
            // Don't refetch on window focus for translation results
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect for completed translations
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry failed translation mutations once
            retry: 1,
            // Custom retry delay for rate limiting
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  )
}
