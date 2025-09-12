import { createContext } from 'react'

import type { ModalContextProps } from './modal.types'

export const ModalContext = createContext<ModalContextProps | undefined>(undefined)
