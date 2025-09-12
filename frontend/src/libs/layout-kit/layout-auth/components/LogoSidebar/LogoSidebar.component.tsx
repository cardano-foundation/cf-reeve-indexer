import { LogoContainerStyled, LogoStyled } from 'libs/layout-kit/layout-auth/components/LogoSidebar/LogoSidebar.styles.tsx'
import { useLayoutAuthContext } from 'libs/layout-kit/layout-auth/hooks/useLayoutAuthContext.ts'
import { LogoIcon } from 'libs/ui-kit/components/LogoIcon/LogoIcon.tsx'

export const LogoSidebar = () => {
  const { isSidebarOpen } = useLayoutAuthContext()

  return (
    <LogoContainerStyled $isSidebarOpen={isSidebarOpen}>
      <LogoStyled $isSidebarOpen={isSidebarOpen}>
        <LogoIcon />
      </LogoStyled>
    </LogoContainerStyled>
  )
}
