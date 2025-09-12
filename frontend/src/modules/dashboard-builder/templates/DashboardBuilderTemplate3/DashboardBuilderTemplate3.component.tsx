import Grid from '@mui/material/Grid'

import { AnalyticsSelection } from 'modules/dashboard-builder/components/AnalyticsSelection/AnalyticsSelection.component.tsx'
import { TemplateSlot } from 'modules/dashboard-builder/components/TemplateSlot/TemplateSlot.component.tsx'
import { DashboardBuilderTemplateProps, Slots, SlotType } from 'modules/dashboard-builder/types'

export const DashboardBuilderTemplate3 = ({ data, options, selection, onClear, onSelect, isReadOnly = false }: DashboardBuilderTemplateProps) => {
  return (
    <Grid component="section" container direction="row" spacing={{ xs: 2, sm: 3 }} width="100%" height="100%">
      <Grid container direction="column" size={{ xs: 12, md: 'grow' }} spacing={{ xs: 2, sm: 3 }}>
        <Grid container direction="row" spacing={{ xs: 2, sm: 3 }}>
          <Grid height="9.625rem" size={{ xs: 12, sm: 'grow' }}>
            <TemplateSlot name={Slots.ONE} options={options} selection={selection} type={SlotType.STATISTICS} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
              <AnalyticsSelection data={data} />
            </TemplateSlot>
          </Grid>
          <Grid height="9.625rem" size={{ xs: 12, sm: 'grow' }}>
            <TemplateSlot name={Slots.TWO} options={options} selection={selection} type={SlotType.STATISTICS} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
              <AnalyticsSelection data={data} />
            </TemplateSlot>
          </Grid>
        </Grid>
        <Grid container size="grow" spacing={{ xs: 2, sm: 3 }}>
          <TemplateSlot
            size="medium"
            name={Slots.THREE}
            options={options}
            selection={selection}
            type={SlotType.CHART}
            onClear={onClear}
            onSelect={onSelect}
            isReadOnly={isReadOnly}
          >
            <AnalyticsSelection data={data} />
          </TemplateSlot>
        </Grid>
      </Grid>
      <Grid container size={{ xs: 12, md: 'grow' }} spacing={{ xs: 2, sm: 3 }}>
        <TemplateSlot size="large" name={Slots.FOUR} options={options} selection={selection} type={SlotType.CHART} onClear={onClear} onSelect={onSelect} isReadOnly={isReadOnly}>
          <AnalyticsSelection data={data} />
        </TemplateSlot>
      </Grid>
    </Grid>
  )
}
