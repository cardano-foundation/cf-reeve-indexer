import { useTheme, MenuItem } from '@mui/material'
import Select, { SelectProps as SelectPropsMUI } from '@mui/material/Select'
import { Buliding } from 'iconsax-react'

import { IconStyled } from 'features/mui/base/select/select.styles'
import { OrganisationLabelStyled } from 'libs/form-kit/components/InputOrganisationsSelectField/InputOrganisationsSelectField.styles.tsx'
import { Avatar } from 'libs/ui-kit/components/Avatar/Avatar.component.tsx'
import { getAvatarColor } from 'libs/ui-kit/components/Avatar/Avatar.consts.ts'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { getInitials } from 'libs/utils/getInitials'

type InputOrganisationsSelectFieldProps = SelectPropsMUI<string> & {
  items: SelectOption[]
  value: string
  isCollapsed?: boolean
  placeholder?: string
}

export const InputOrganisationsSelectField = ({ items, name, value, isCollapsed = false, placeholder, ...props }: InputOrganisationsSelectFieldProps) => {
  const theme = useTheme()
  const selectedName = items.find((item) => item.value === value)?.name

  return (
    <Select
      name={name}
      value={value}
      displayEmpty
      SelectDisplayProps={{ 'aria-labelledby': undefined, 'aria-label': selectedName ? `${placeholder}: ${selectedName}` : placeholder }}
      renderValue={(value) => {
        if (!value) {
          return isCollapsed ? <Buliding aria-hidden color={theme.palette.text.secondary} size={24} /> : placeholder
        }
        const index = items.findIndex((item) => item.value === value)
        const org = items[index]
        if (isCollapsed) {
          return (
            <Avatar alt={org?.name} data-testid={org?.name} background={getAvatarColor(index)}>
              {getInitials(org?.name)}
            </Avatar>
          )
        }
        return (
          <OrganisationLabelStyled component="h2" variant="h2">
            {org?.name}
          </OrganisationLabelStyled>
        )
      }}
      size="medium"
      variant="outlined"
      inputProps={{
        name,
        id: `field-${name}`,
        'data-testid': `field-${name}`
      }}
      IconComponent={IconStyled}
      MenuProps={{
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center'
        },
        anchorReference: 'anchorEl',
        transformOrigin: {
          vertical: -4,
          horizontal: 'center'
        },
        slotProps: {
          paper: {
            sx: {
              background: theme.palette.background.default,
              borderRadius: '0.5rem',
              boxShadow: `0 4px 16px -1px rgba(0, 0, 0, 0.1)`,

              '.MuiList-root': {
                maxHeight: '11.25rem'
              }
            }
          }
        }
      }}
      sx={{
        '&&': {
          padding: 0,
          background: theme.palette.common.white,
          borderRadius: '0.5rem',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
          color: theme.palette.text.primary
        },
        '&& .MuiSelect-select': {
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
          paddingLeft: isCollapsed ? theme.spacing(1) : theme.spacing(2),
          paddingRight: isCollapsed ? theme.spacing(1) : theme.spacing(2),
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          color: theme.palette.text.primary
        },
        '&& .MuiSelect-icon': {
          display: isCollapsed ? 'none' : undefined
        },
        '& .MuiMenuItem-root': {
          px: 2,
          py: 1,
          display: 'flex',
          gap: theme.spacing(1.5),
          alignItems: 'center'
        },
        '& .MuiMenuItem-root.Mui-selected': {
          background: `${theme.palette.primary.main}22 !important`,
          color: theme.palette.primary.main
        }
      }}
      fullWidth
      {...props}>
      {items.map(({ name, value }) => (
        <MenuItem key={value} value={value}>
          {name}
        </MenuItem>
      ))}
    </Select>
  )
}
