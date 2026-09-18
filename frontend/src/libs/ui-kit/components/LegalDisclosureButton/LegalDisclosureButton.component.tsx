import { InfoCircle } from 'iconsax-react'

import { ButtonSecondary, useModal } from 'features/common'
import { useMediaQueries } from 'hooks'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { LegalDisclosureModal } from 'libs/ui-kit/components/LegalDisclosureModal/LegalDisclosureModal.component.tsx'

export const LegalDisclosureButton = () => {
  const { t } = useTranslations()
  const { handleModalOpen, handleModalClose, isOpen } = useModal()
  const { isMobile } = useMediaQueries()

  if (!isMobile) return null

  return (
    <>
      <ButtonSecondary
        color="inherit"
        onClick={handleModalOpen}
        size="small"
        startIcon={<InfoCircle size={24} variant="Outline" />}
        sx={{ alignSelf: 'flex-start', backgroundColor: 'background.default', borderColor: 'divider', color: 'text.secondary', flexShrink: 0, px: 1.5, py: 0.75 }}
      >
        {t({ id: 'legalDisclosureLink' })}
      </ButtonSecondary>
      <LegalDisclosureModal isOpen={isOpen} onClose={handleModalClose} />
    </>
  )
}
