import { LayoutAuth } from 'libs/layout-kit/layout-auth/LayoutAuth.component.tsx'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { SectionBatchesAll } from 'modules/batches-all/sections/SectionBatchesAll/SectionBatchesAll.component.tsx'

export const ViewBatchesList = () => {
  const { t } = useTranslations()

  return (
    <>
      <LayoutAuth.Header>
        <LayoutAuth.Header.Details description={t({ id: 'batchesAllDescription' })} title={t({ id: 'batchesAllViewTitle' })} />
      </LayoutAuth.Header>
      <LayoutAuth.Main flexDirection="column" gap={6} isHeightRestricted>
        <SectionBatchesAll />
      </LayoutAuth.Main>
    </>
  )
}
