import { SvgIconProps } from '@mui/material'

import { SvgIcon } from 'libs/ui-kit/components/SvgIcon/SvgIcon.component.tsx'

export const MoreVerticalIcon = ({ className }: SvgIconProps) => {
  return (
    <SvgIcon className={className}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21C10.8945 21 10 20.1055 10 19C10 17.8945 10.8945 17 12 17C13.1055 17 14 17.8945 14 19C14 20.1055 13.1055 21 12 21Z" fill="currentColor" />
        <path d="M12 14C10.8945 14 10 13.1055 10 12C10 10.8945 10.8945 10 12 10C13.1055 10 14 10.8945 14 12C14 13.1055 13.1055 14 12 14Z" fill="currentColor" />
        <path d="M12 7C10.8945 7 10 6.10545 10 5C10 3.89455 10.8945 3 12 3C13.1055 3 14 3.89455 14 5C14 6.10545 13.1055 7 12 7Z" fill="currentColor" />
      </svg>
    </SvgIcon>
  )
}
