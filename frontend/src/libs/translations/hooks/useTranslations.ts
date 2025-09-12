import { useIntl } from 'react-intl'

export const useTranslations = () => {
  const { formatMessage } = useIntl()

  return { t: formatMessage }
}
