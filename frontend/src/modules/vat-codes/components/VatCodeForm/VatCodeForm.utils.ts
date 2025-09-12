import isoCountries from 'i18n-iso-countries'
import en from 'i18n-iso-countries/langs/en.json'

import { AutocompleteOption } from 'libs/form-kit/components/InputAutocomplete/InputAutocomplete.component.tsx'

isoCountries.registerLocale(en)

export const getCountryCodeOptions = (): AutocompleteOption[] => {
  const countries = isoCountries.getNames('en', { select: 'official' })

  return Object.entries(countries).map(([code, name]) => ({ name, value: code }))
}
