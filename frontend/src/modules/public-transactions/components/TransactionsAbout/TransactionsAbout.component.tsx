import { useMediaQuery } from '@mui/material'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'
import { ArrowDown2, ArrowUp2 } from 'iconsax-react'
import { ReactNode, useEffect, useId, useState } from 'react'

import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'
import { useSelectedOrganisationCurrency } from 'libs/layout-kit/layout-public/hooks/useSelectedOrganisationCurrency.ts'
import { getLocalStorageItem } from 'libs/storage-connectors/local-storage-connector/utils/getLocalStorageItem.ts'
import { setLocalStorageItem } from 'libs/storage-connectors/local-storage-connector/utils/setLocalStorageItem.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonText } from 'libs/ui-kit/components/ButtonText/ButtonText.component.tsx'

import { ABOUT_STORAGE_KEY } from './TransactionsAbout.consts'
import { AboutContentStyled, AboutHeaderStyled, AboutStyled } from './TransactionsAbout.styles'
import type { AboutStorage } from './TransactionsAbout.types'

const getInitialIsOpen = () => {
  const stored = getLocalStorageItem<AboutStorage>(ABOUT_STORAGE_KEY)

  return typeof stored === 'object' ? (stored?.isOpen ?? true) : true
}

export const TransactionsAbout = () => {
  const { t } = useTranslations()
  const currency = useSelectedOrganisationCurrency()
  const contentId = useId()
  const { isDrawerOpen } = useLayoutPublicContext()
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [isOpen, setIsOpen] = useState<boolean>(getInitialIsOpen)

  useEffect(() => {
    if (isDrawerOpen) setIsOpen(false)
  }, [isDrawerOpen])

  const handleToggle = () => {
    const nextIsOpen = !isOpen

    setIsOpen(nextIsOpen)
    setLocalStorageItem<AboutStorage>(ABOUT_STORAGE_KEY, { isOpen: nextIsOpen })
  }

  const strong = (chunks: ReactNode) => (
    <Typography component="strong" variant="body2" color="text.primary" fontWeight={600}>
      {chunks}
    </Typography>
  )

  const sections = [
    t({ id: 'publicTransactionsAboutItems' }, { strong }),
    t({ id: 'publicTransactionsAboutOnChainRecord' }, { strong }),
    t({ id: 'publicTransactionsAboutAmounts' }, { strong, currency }),
    t({ id: 'publicTransactionsAboutTypes' }, { strong })
  ]

  return (
    <AboutStyled component="section" aria-labelledby={`${contentId}-title`}>
      <AboutHeaderStyled>
        <Typography id={`${contentId}-title`} component="h2" variant="subtitle2">
          {t({ id: 'publicTransactionsAboutTitle' })}
        </Typography>
        <ButtonText aria-controls={contentId} aria-expanded={isOpen} endIcon={isOpen ? <ArrowUp2 size={16} /> : <ArrowDown2 size={16} />} onClick={handleToggle} size="small">
          {isOpen ? t({ id: 'publicTransactionsAboutHide' }) : t({ id: 'publicTransactionsAboutShow' })}
        </ButtonText>
      </AboutHeaderStyled>
      <Collapse id={contentId} in={isOpen} timeout={prefersReducedMotion ? 0 : undefined}>
        <AboutContentStyled>
          {sections.map((section, index) => (
            <Typography key={index} color="text.secondary" variant="body2">
              {section}
            </Typography>
          ))}
        </AboutContentStyled>
      </Collapse>
    </AboutStyled>
  )
}
