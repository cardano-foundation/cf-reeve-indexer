import React from 'react'
import { useTheme, Box, MenuItem, Typography } from '@mui/material'
import Select, { SelectProps as SelectPropsMUI } from '@mui/material/Select'
import { ArrowDown2 } from 'iconsax-react'
import { OrganisationLabelStyled } from 'libs/form-kit/components/InputOrganisationsSelectField/InputOrganisationsSelectField.styles.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'
import { Avatar } from 'libs/ui-kit/components/Avatar/Avatar.component.tsx'
import { getInitials } from 'libs/utils/getInitials'

type InputOrganisationsSelectFieldProps = SelectPropsMUI<string> & {
  items: SelectOption[]
  value: string
  hasChevron?: boolean
  placeholder?: string
}

export const InputOrganisationsSelectField = ({
  items,
  name,
  value,
  hasChevron = true,
  placeholder = 'Select organisation',
  ...props
}: InputOrganisationsSelectFieldProps) => {
  const theme = useTheme()

  const selectedOrg = items.find((item) => item.value === value)

  return (
    <Select
      name={name}
      value={value ?? ''}
      displayEmpty
      renderValue={(v) => {
        // render placeholder when no value selected
        if (!v) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: theme.palette.action.hover,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.text.secondary,
                  fontWeight: 700
                }}
              >
                {placeholder.charAt(0)}
              </Box>
              <OrganisationLabelStyled component="span" variant="h2" sx={{ color: theme.palette.text.secondary }}>
                {placeholder}
              </OrganisationLabelStyled>
            </Box>
          )
        }

        const org = selectedOrg ?? items[0]
        return (
          <Box alignItems="center" display="flex" gap={1}>
            <Avatar alt={org?.name} data-testid={org?.name} sx={{ width: 32, height: 32, fontSize: '0.85rem' }}>
              {getInitials(org?.name)}
            </Avatar>
            <OrganisationLabelStyled component="h2" variant="h2">
              {org?.name}
            </OrganisationLabelStyled>
          </Box>
        )
      }}
      size="medium"
      variant="outlined"
      inputProps={{
        name,
        id: `field-${name}`,
        'data-testid': `field-${name}`
      }}
      IconComponent={ArrowDown2}
      MenuProps={{
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left'
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left'
        },
        PaperProps: {
          elevation: 8,
          sx: {
            background: theme.palette.background.paper,
            borderRadius: '0.75rem',
            boxShadow: `0 8px 24px rgba(16,24,40,0.08)`,
            mt: 1,
            minWidth: 220,
            '.MuiList-root': {
              maxHeight: '12rem',
              padding: 0
            }
          }
        },
        MenuListProps: {
          dense: true,
          sx: {
            px: 0
          }
        }
      }}
      sx={{
        '&&': {
          padding: 0,
          background: theme.palette.background.default,
          borderRadius: '0.75rem',
          boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`,
          '&:hover': {
            boxShadow: `0 4px 12px rgba(16,24,40,0.04)`
          }
        },
        '&& .MuiSelect-select': {
          minHeight: 'unset',
          padding: theme.spacing(1.25, 2),
          display: 'flex',
          alignItems: 'center'
        },
        '&& .MuiSelect-icon': {
          width: hasChevron ? 18 : 0,
          margin: theme.spacing(-0.5, 0, 0, 0),
          right: 8,
          color: theme.palette.text.secondary
        },
        '&& .MuiOutlinedInput-notchedOutline': {
          display: 'none'
        },
        // MenuItem global style inside this Select
        '& .MuiMenuItem-root': {
          px: 2,
          py: 1,
          display: 'flex',
          gap: theme.spacing(1.5),
          alignItems: 'center'
        },
        '& .MuiMenuItem-root.Mui-selected': {
          background: `${theme.palette.primary.main}22 !important`, // subtle primary tint
          color: theme.palette.primary.main
        }
      }}
      fullWidth
      {...props}
    >
      {items.map(({ name: itemName, value: itemValue }) => (
        <MenuItem key={itemValue} value={itemValue} sx={{ px: 2, py: 1 }}>
          <Typography variant="body2">{itemName}</Typography>
        </MenuItem>
      ))}
    </Select>
  )
}
