import { useTheme, Box, MenuItem } from '@mui/material'
import Select, { SelectProps as SelectPropsMUI } from '@mui/material/Select'
import { ArrowDown2 } from 'iconsax-react'
import { cardanoFoundationLogo, issuranceSwissLogo } from 'assets/icons'
import { OrganisationLabelStyled, OrganisationLogoStyled } from 'libs/form-kit/components/InputOrganisationsSelectField/InputOrganisationsSelectField.styles.tsx'
import { SelectOption } from 'libs/ui-kit/components/InputSelect/InputSelect.component.tsx'

type InputOrganisationsSelectFieldProps = SelectPropsMUI<string> & {
  items: SelectOption[]
  value: string
  hasChevron?: boolean
}

export const InputOrganisationsSelectField = ({ items, name, value, hasChevron = true, ...props }: InputOrganisationsSelectFieldProps) => {
  const theme = useTheme()

  return (
    <Select
      name={name}
      value={value}
      renderValue={(value) => {
        const org = items.find((item) => item.value === value)
        return (
          <Box alignItems="center" display="flex" gap={1}>
            <OrganisationLogoStyled
              alt={org?.name}
              src={
                value === '75f95560c1d883ee7628993da5adf725a5d97a13929fd4f477be0faf5020ca94'
                  ? cardanoFoundationLogo
                  : issuranceSwissLogo
              }
            />
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
          padding: 0
        },
        '&& .MuiSelect-select': {
          minHeight: 'unset',
          padding: theme.spacing(1.5, 3, 1.5, 2)
        },
        '&& .MuiSelect-icon': {
          width: hasChevron ? '18px' : '0px',
          margin: theme.spacing(-0.5, 0, 0, 0),
          right: '5px'
        },
        '&& .MuiOutlinedInput-notchedOutline': {
          display: 'none'
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