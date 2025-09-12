import { useEffect } from 'react'

import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { useTransactionsReprocessContext } from 'modules/review/components/TransactionsReprocessContext/hooks/useTransactionsReprocessContext.tsx'

interface UseTransactionsReprocessProps {
  pendingTransactionsCount?: number
  prevPendingTransactionsCount?: number | null
}

export const useTransactionsReprocess = ({ pendingTransactionsCount, prevPendingTransactionsCount }: UseTransactionsReprocessProps) => {
  const { showSnackbar, isReprocessing, setIsReprocessing, setHint, setMessage } = useTransactionsReprocessContext()

  const { t } = useTranslations()

  const hasCountChanged = pendingTransactionsCount !== prevPendingTransactionsCount

  useEffect(() => {
    if (!isReprocessing) return

    let timeoutId: number | undefined

    if (hasCountChanged) {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)

      timeoutId = window.setTimeout(() => {
        setIsReprocessing(false)
        setMessage(t({ id: 'transactionsReprocessed' }))
        setHint(undefined)
        showSnackbar()
      }, 2000)
    }

    return () => {
      if (timeoutId !== undefined) window.clearTimeout(timeoutId)
    }
  }, [setHint, setMessage, setIsReprocessing, hasCountChanged, isReprocessing])
}
