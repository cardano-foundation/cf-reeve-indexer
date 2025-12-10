import Box from '@mui/material/Box'
import DialogTitle from '@mui/material/DialogTitle'
import ListItemText from '@mui/material/ListItemText'

import {
  ListItemButtonStyled,
  ListItemIconStyled,
  ListItemStyled,
  ListStyled,
} from 'libs/layout-kit/layout-public/components/DialogOrganisation/DialogOrganisation.styles.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { ButtonClose } from 'libs/ui-kit/components/ButtonClose/ButtonClose.component.tsx'
import { Dialog } from 'libs/ui-kit/components/Dialog/Dialog.component.tsx'
import { DialogContent } from 'libs/ui-kit/components/DialogContent/DialogContent.component.tsx'
import { useLayoutPublicContext } from '../../hooks/useLayoutPublicContext'
import { Avatar } from 'libs/ui-kit/components/Avatar/Avatar.component.tsx'
import { getInitials } from 'libs/utils/getInitials'

interface DialogOrganisationProps {
  onClose: () => void
  isOpen: boolean
  onSelect?: (value: string) => void
}

export const DialogOrganisation = ({ onClose, isOpen, onSelect }: DialogOrganisationProps) => {
  const { t } = useTranslations()
  const { organisations = [], selectedOrganisation, setSelectedOrganisation } = useLayoutPublicContext() as any

  // sort organisations by display name (case-insensitive). fallback to value/id if no name.
  const sortedOrgs = (organisations ?? [])
    .slice()
    .sort((a: any, b: any) => {
      const aName = (a?.name ?? a?.label ?? a?.value ?? a?.id ?? '').toString()
      const bName = (b?.name ?? b?.label ?? b?.value ?? b?.id ?? '').toString()
      return aName.localeCompare(bName, undefined, { sensitivity: 'base' })
    })

  const resolveOrgValue = (o: any) => o?.value ?? o?.id ?? o?.name ?? o?.label ?? ''

  return (
    <Dialog aria-labelledby="organization" maxWidth="sm" open={isOpen} fullWidth>
      <Box alignItems="center" display="flex" justifyContent="space-between" pt={2} pr={2} pb={1} pl={3}>
        <DialogTitle id="organization" sx={{ p: 0 }}>
          {t({ id: 'organization' })}
        </DialogTitle>
        <ButtonClose onClick={onClose} />
      </Box>

      <DialogContent>
        <ListStyled>
          {sortedOrgs.length === 0 && (
            <ListItemStyled>
              <ListItemButtonStyled onClick={onClose}>
                <ListItemText primary={t({ id: 'no_organizations' }) ?? 'No organisations'} />
              </ListItemButtonStyled>
            </ListItemStyled>
          )}

          {sortedOrgs.map((org: any) => {
            const name = org?.name ?? org?.label ?? org?.value ?? org?.id ?? ''
            const value = resolveOrgValue(org)
            const isSelected =
              value === selectedOrganisation ||
              name === selectedOrganisation ||
              org?.label === selectedOrganisation ||
              JSON.stringify(org) === selectedOrganisation

            return (
              <ListItemStyled key={value || name}>
                <ListItemButtonStyled
                  selected={!!isSelected}
                  onClick={() => {
                    setSelectedOrganisation?.(value)
                    onSelect?.(value)
                    onClose()
                  }}
                >
                  <ListItemIconStyled>
                    <Avatar alt={name}>{getInitials(name)}</Avatar>
                  </ListItemIconStyled>

                  <ListItemText primary={name} />
                </ListItemButtonStyled>
              </ListItemStyled>
            )
          })}
        </ListStyled>
      </DialogContent>
    </Dialog>
  )
}
