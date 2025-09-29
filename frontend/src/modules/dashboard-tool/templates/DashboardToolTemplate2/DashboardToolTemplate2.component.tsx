import Grid from '@mui/material/Grid'

import { AnalyticsSelection } from 'modules/dashboard-tool/components/AnalyticsSelection/AnalyticsSelection.component.tsx'
import { TemplateSlot } from 'modules/dashboard-tool/components/TemplateSlot/TemplateSlot.component.tsx'
import { DashboardToolTemplateProps, Slots, SlotType } from 'modules/dashboard-tool/types'

export const DashboardToolTemplate2 = ({ data, options, selection, onClear, onSelect, isReadOnly = false }: DashboardToolTemplateProps) => {
  return (
    <Grid component="section" container direction="column" spacing={{ xs: 2, sm: 3 }} width="100%" height="100%">
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid height="9.625rem" size={{ xs: 12, lg: 'grow' }}>
          <TemplateSlot name={Slots.ONE} options={options} selection={selection} onClear={onClear} type={SlotType.STATISTICS} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
        <Grid height="9.625rem" size={{ xs: 12, lg: 'grow' }}>
          <TemplateSlot name={Slots.TWO} options={options} selection={selection} onClear={onClear} type={SlotType.STATISTICS} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
        <Grid height="9.625rem" size={{ xs: 12, lg: 'grow' }}>
          <TemplateSlot name={Slots.THREE} options={options} selection={selection} onClear={onClear} type={SlotType.STATISTICS} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
      </Grid>
      <Grid container size="grow" spacing={{ xs: 2, sm: 3 }}>
        <Grid minHeight="32rem" size={{ xs: 12, md: 'grow' }}>
          <TemplateSlot size="medium" name={Slots.FOUR} options={options} selection={selection} onClear={onClear} type={SlotType.CHART} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
        <Grid minHeight="32rem" size={{ xs: 12, md: 'grow' }}>
          <TemplateSlot size="medium" name={Slots.FIVE} options={options} selection={selection} onClear={onClear} type={SlotType.CHART} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
      </Grid>
    </Grid>
  )
}
