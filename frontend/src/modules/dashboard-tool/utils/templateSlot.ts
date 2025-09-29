import { Slots, Template, TemplateSlotSelections } from 'modules/dashboard-tool/types'

export const getDefaultSelection = (keys: Slots[]) => keys.reduce((acc, key) => ({ ...acc, [key]: null }), {} as TemplateSlotSelections<Slots>)

export const getDefaultTemplateSlots = (template: Template) => {
  switch (template) {
    case Template.ONE:
      return [Slots.ONE, Slots.TWO, Slots.THREE, Slots.FOUR, Slots.FIVE, Slots.SIX, Slots.SEVEN]
    case Template.TWO:
      return [Slots.ONE, Slots.TWO, Slots.THREE, Slots.FOUR, Slots.FIVE]
    case Template.THREE:
      return [Slots.ONE, Slots.TWO, Slots.THREE, Slots.FOUR]
    default:
      return []
  }
}
