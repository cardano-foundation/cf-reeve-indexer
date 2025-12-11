import { useTheme, Box, MenuItem } from '@mui/material'
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
}

export const InputOrganisationsSelectField = ({ items, name, value, hasChevron = true, ...props }: InputOrganisationsSelectFieldProps) => {
  const theme = useTheme()
  console.log('Rendering InputOrganisationsSelectField with items:', items)
  return (
    <Select
      name={name}
      value={value}
      renderValue={(value) => {
        const org = items.find((item) => item.value === value)
        return (
          <Box alignItems="center" display="flex" gap={1}>
            <Avatar alt={org?.name} data-testid={org?.name}>
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
