import { useState, useMemo } from 'react'
import Box from '@mui/material/Box'

import { DialogOrganisation } from 'libs/layout-kit/layout-public/components/DialogOrganisation/DialogOrganisation.component.tsx'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { Avatar } from 'libs/ui-kit/components/Avatar/Avatar.component.tsx'
import { getInitials } from 'libs/utils/getInitials'
import { useLayoutPublicContext } from 'libs/layout-kit/layout-public/hooks/useLayoutPublicContext.ts'

export const Organisation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { organisations = [], selectedOrganisation = '' } = useLayoutPublicContext() as any

  const resolveOrgValue = (o: any) => o?.value ?? o?.id ?? o?.name ?? o?.label ?? ''

  const orgName = useMemo(() => {
    if (!selectedOrganisation) return ''
    const found = (organisations ?? []).find((o: any) => {
      const v = resolveOrgValue(o)
      return v === selectedOrganisation || o?.name === selectedOrganisation || o?.label === selectedOrganisation
    })

    return found?.name ?? found?.label ?? selectedOrganisation
  }, [selectedOrganisation])

  return (
    <>
      <ButtonIcon sx={{ '&&': { padding: 0 } }} onClick={() => setIsOpen(true)}>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar alt={orgName} data-testid={orgName}>
            {getInitials(orgName)}
          </Avatar>
        </Box>
      </ButtonIcon>

      <DialogOrganisation onClose={() => setIsOpen(false)} isOpen={isOpen} />
    </>
  )
}
