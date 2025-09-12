import dayjs from 'dayjs'

import { getUser } from 'libs/authentication/user/getUser.tsx'
import { DATE_LONG_FORMAT_OPTIONS } from 'libs/const/dates.ts'
import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { formatDate } from 'libs/utils/format.ts'
import { HomeCardsMenu } from 'modules/home/sections/HomeCardsMenu/HomeCardsMenu.component.tsx'

export const ViewHome = () => {
  const { t } = useTranslations()

  const user = getUser()

  const hour = dayjs().hour()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details
          description={formatDate(dayjs().toDate(), { locale: 'en-GB', ...DATE_LONG_FORMAT_OPTIONS })}
          title={
            hour >= 18
              ? t({ id: 'homeWelcomeTitleEvening' }, { user: user?.given_name })
              : hour < 12
                ? t({ id: 'homeWelcomeTitleMorning' }, { user: user?.given_name })
                : t({ id: 'homeWelcomeTitleAfternoon' }, { user: user?.given_name })
          }
          isOrderReverted
        />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6}>
        <HomeCardsMenu />
      </LayoutAuth.Main>
    </>
  )
}
