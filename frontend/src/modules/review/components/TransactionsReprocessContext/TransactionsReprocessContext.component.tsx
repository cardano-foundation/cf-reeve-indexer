import { SnackbarCloseReason } from '@mui/material/Snackbar'
import { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react'

import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'

interface TransactionsReprocessContextProps {
  hint: string | undefined
  message: string | undefined
  isReprocessing: boolean
  isSnackbarVisible: boolean
  handleClose: (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => void
  setIsReprocessing: Dispatch<SetStateAction<boolean>>
  setHint: Dispatch<SetStateAction<string | undefined>>
  setMessage: Dispatch<SetStateAction<string | undefined>>
  showSnackbar: () => void
}

export const TransactionsReprocessContext = createContext<TransactionsReprocessContextProps | undefined>(undefined)

export const TransactionsReprocessContextProvider = ({ children }: { children: ReactNode }) => {
  const [isReprocessing, setIsReprocessing] = useState<boolean>(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [hint, setHint] = useState<string | undefined>(undefined)

  const { handleClose, showSnackbar, isSnackbarVisible } = useSnackbar()

  return (
    <TransactionsReprocessContext.Provider value={{ hint, message, isReprocessing, isSnackbarVisible, handleClose, setIsReprocessing, setHint, setMessage, showSnackbar }}>
      {children}
    </TransactionsReprocessContext.Provider>
  )
}
