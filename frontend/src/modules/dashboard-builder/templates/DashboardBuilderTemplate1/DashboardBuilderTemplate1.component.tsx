import Grid from '@mui/material/Grid'

import { AnalyticsSelection } from 'modules/dashboard-builder/components/AnalyticsSelection/AnalyticsSelection.component.tsx'
import { TemplateSlot } from 'modules/dashboard-builder/components/TemplateSlot/TemplateSlot.component.tsx'
import { DashboardBuilderTemplateProps, Slots, SlotType } from 'modules/dashboard-builder/types'

export const DashboardBuilderTemplate1 = ({ data, options, selection, onClear, onSelect, isReadOnly = false }: DashboardBuilderTemplateProps) => {
  return (
    <Grid component="section" container direction="column" spacing={3} width="100%" height="100%">
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid height="9.625rem" size={{ xs: 12, lg: 'grow' }}>
          <TemplateSlot name={Slots.ONE} options={options} selection={selection} type={SlotType.STATISTICS} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
        <Grid height="9.625rem" size={{ xs: 12, lg: 'grow' }}>
          <TemplateSlot name={Slots.TWO} options={options} selection={selection} type={SlotType.STATISTICS} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
        <Grid height="9.625rem" size={{ xs: 12, lg: 'grow' }}>
          <TemplateSlot name={Slots.THREE} options={options} selection={selection} type={SlotType.STATISTICS} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
      </Grid>
      <Grid container size="grow" spacing={{ xs: 2, sm: 3 }}>
        <Grid minHeight="20rem" size={{ xs: 12, md: 'grow' }}>
          <TemplateSlot size="small" name={Slots.FOUR} options={options} selection={selection} type={SlotType.CHART} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
        <Grid minHeight="20rem" size={{ xs: 12, md: 'grow' }}>
          <TemplateSlot size="small" name={Slots.FIVE} options={options} selection={selection} type={SlotType.CHART} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
      </Grid>
      <Grid container size="grow" spacing={{ xs: 2, sm: 3 }}>
        <Grid minHeight="20rem" size={{ xs: 12, md: 'grow' }}>
          <TemplateSlot size="small" name={Slots.SIX} options={options} selection={selection} type={SlotType.CHART} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
        <Grid minHeight="20rem" size={{ xs: 12, md: 'grow' }}>
          <TemplateSlot size="small" name={Slots.SEVEN} options={options} selection={selection} type={SlotType.CHART} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
      </Grid>
    </Grid>
  )
}
