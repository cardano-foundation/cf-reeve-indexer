import { useState } from 'react'

import { DialogOrganisation } from 'libs/layout-kit/layout-public/components/DialogOrganisation/DialogOrganisation.component.tsx'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'

export const Organisation = () => {
  // NOTE: Temporary solution which later on should be replaced with context
  // and layout query to handle organisation management across the public pages
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ButtonIcon sx={{ '&&': { padding: 0 } }} onClick={() => setIsOpen(true)}>
      </ButtonIcon>
      <DialogOrganisation onClose={() => setIsOpen(false)} isOpen={isOpen} />
    </>
  )
}
