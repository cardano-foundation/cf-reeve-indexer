import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import { ICONSAX_NAMES, IconsaxIcon } from 'features/iconsax'
import { useLogOut } from 'libs/authentication/services/logOut.service.ts'
import { useSelectedOrganisation } from 'libs/authentication/user/userSelctedOrganisation'
import { TextContainerStyled, UserProfileStyled } from 'libs/layout-kit/layout-auth/components/UserProfileSidebar/UserProfileSidebar.styles.tsx'
import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext.ts'
import { useGetOrganisationModel } from 'libs/models/organisation-model/GetOrganisation/GetOrganisations.service.ts'
import { useUserDetails } from 'libs/storage-connectors/session-storage-connector/hooks/useUserDetails.ts'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { Avatar } from 'libs/ui-kit/components/Avatar/Avatar.component.tsx'
import { ButtonIcon } from 'libs/ui-kit/components/ButtonIcon/ButtonIcon.component.tsx'
import { ModalAction } from 'libs/ui-kit/components/ModalAction/ModalAction.component.tsx'
import { Snackbar } from 'libs/ui-kit/components/Snackbar/Snackbar.component.tsx'
import { useSnackbar } from 'libs/ui-kit/components/Snackbar/useSnackbar.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'

export const UserProfileSidebar = () => {
  const selectedOrganisation = useSelectedOrganisation()
  const { organisation } = useGetOrganisationModel({ id: selectedOrganisation })

  const { isSnackbarVisible, showSnackbar, handleClose } = useSnackbar()

  const { isSidebarOpen } = useLayoutAuthContext()

  const { t } = useTranslations()

  const { displayName, initials } = useUserDetails()

  const logOut = useLogOut()

  const handleLogOut = () => {
    logOut()
      .then(() => {
        showSnackbar()
      })
      .catch((error) => {
        console.error('Logout failed', error)
      })
  }

  return (
    <UserProfileStyled data-testid="user-profile" $isSidebarOpen={isSidebarOpen}>
      <Box alignItems="center" display="flex" flexGrow={1} gap={1.5}>
        {organisation && <Avatar data-testid="avatar">{initials}</Avatar>}
        <TextContainerStyled $isSidebarOpen={isSidebarOpen}>
          <Typography variant="body1" color="textSecondary" noWrap>
            {displayName}
          </Typography>
          {organisation && (
            <Typography variant="body2" color="textSecondary" noWrap>
              {organisation.name}
            </Typography>
          )}
        </TextContainerStyled>
      </Box>
      <Box justifySelf={isSidebarOpen ? 'self-end' : 'self-start'}>
        <ModalAction
          aria-label={t({ id: 'logoutModalTitle' })}
          message={t({ id: 'modalLogOutMessage' })}
          primaryActionLabel={t({ id: 'confirm' })}
          secondaryActionLabel={t({ id: 'cancel' })}
          primaryActionOnClick={handleLogOut}
          renderButton={({ handleClickOpen }) => (
            <Tooltip title={t({ id: 'logout' })}>
              <ButtonIcon onClick={handleClickOpen}>
                <IconsaxIcon name={ICONSAX_NAMES.LOGIN_CURVE} variant="Outline" />
              </ButtonIcon>
            </Tooltip>
          )}
        />
      </Box>
      <Snackbar open={isSnackbarVisible} onClose={handleClose} message={t({ id: 'succesfullyLoggedOut' })} />
    </UserProfileStyled>
  )
}
