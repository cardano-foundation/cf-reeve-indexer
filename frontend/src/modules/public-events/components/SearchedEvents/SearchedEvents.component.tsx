import { useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { GridColDef } from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { ExportSquare, Eye } from 'iconsax-react'
import { MouseEvent, useMemo, useRef, useState } from 'react'

import { Modal, useModal } from 'features/common'
import { IconButton } from 'features/mui/base'
import { EventView, PostPublicEventsResponse200 } from 'libs/api-connectors/backend-connector-reeve/api/events/publicEventsApi.types'
import { usePagination } from 'libs/hooks/usePagination'
import { useSorting } from 'libs/hooks/useSorting'
import { useTranslations } from 'libs/translations/hooks/useTranslations.ts'
import { DataGridContainer } from 'libs/ui-kit/components/DataGrid/DataGridContainer.component.tsx'
import { Tooltip } from 'libs/ui-kit/components/Tooltip/Tooltip.component.tsx'
import { formatNumber } from 'libs/utils/format.ts'
import { EventDetail } from 'modules/public-events/components/EventDetail/EventDetail.component'
import { SearchToolbar } from 'modules/public-events/components/SearchToolbar/SearchToolbar.component'

interface SearchedEventsProps {
  data: PostPublicEventsResponse200 | null
  pagination: ReturnType<typeof usePagination>
  sorting: ReturnType<typeof useSorting>
  hasFiltersSelected: boolean
  isLoading: boolean
}

export const SearchedEvents = ({ data, pagination, sorting, hasFiltersSelected, isLoading }: SearchedEventsProps) => {
  const { page, rowsPerPage, handlePagination } = pagination
  const { handleSorting } = sorting

  const { t } = useTranslations()

  const theme = useTheme()

  const { isOpen, handleModalOpen, handleModalClose } = useModal()
  const [selectedEvent, setSelectedEvent] = useState<EventView | null>(null)

  const rowCountRef = useRef(data?.total || 0)

  const rowCount = useMemo(() => {
    if (data?.total !== undefined) {
      rowCountRef.current = data.total
    }

    return rowCountRef.current
  }, [data?.total])

  const handleOpenDetail = (event: EventView) => {
    setSelectedEvent(event)
    handleModalOpen()
  }

  const columns: GridColDef[] = [
    {
      field: 'txHash',
      headerName: t({ id: 'blockchainHash' }),
      renderCell: ({ value }) =>
        value ? (
          <Box alignItems="center" display="flex" gap={1}>
            <Tooltip title={value}>
              <Typography component="span" variant="body2">{`${value.slice(0, 4)}...${value.slice(-4)}`}</Typography>
            </Tooltip>
            <Tooltip title={t({ id: 'openInExplorer' })}>
              <Link display="flex" href={`https://explorer.cardano.org/transaction/${value}`} rel="noreferrer" target="_blank" onClick={(event) => event.stopPropagation()}>
                <ExportSquare color={theme.palette.action.active} size={20} variant="Outline" />
              </Link>
            </Tooltip>
          </Box>
        ) : null,
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 192
    },
    { field: 'eventId', headerName: t({ id: 'eventId' }), hideable: false, sortable: true, flex: 1, minWidth: 160 },
    { field: 'eventType', headerName: t({ id: 'eventType' }), hideable: false, sortable: true, flex: 1, minWidth: 160 },
    { field: 'eventCategory', headerName: t({ id: 'eventCategory' }), hideable: true, sortable: false, flex: 1, minWidth: 160 },
    {
      field: 'date',
      headerName: t({ id: 'eventDate' }),
      valueFormatter: (value) => (value ? dayjs(value, 'YYYY-MM-DD').format('DD/MM/YYYY') : null),
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 160
    },
    { field: 'fundingId', headerName: t({ id: 'fundingId' }), hideable: true, sortable: true, flex: 1, minWidth: 160 },
    { field: 'fundingEntity', headerName: t({ id: 'fundingEntity' }), hideable: true, sortable: false, flex: 1, minWidth: 160 },
    {
      field: 'totalAmount',
      headerName: t({ id: 'totalAmount' }),
      valueFormatter: (value) => (value || value === 0 ? formatNumber(value) : null),
      align: 'right',
      headerAlign: 'right',
      hideable: false,
      sortable: true,
      flex: 1,
      minWidth: 160
    },
    {
      field: 'actions',
      headerName: '',
      renderCell: ({ row }) => (
        <Tooltip title={t({ id: 'viewDetails' })}>
          <IconButton
            aria-label={t({ id: 'viewDetails' })}
            size="small"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation()
              handleOpenDetail(row as EventView)
            }}>
            <Eye color={theme.palette.action.active} size={20} variant="Outline" />
          </IconButton>
        </Tooltip>
      ),
      hideable: false,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      align: 'center',
      headerAlign: 'center',
      width: 64
    }
  ]

  return (
    <>
      <DataGridContainer>
        <DataGridContainer.Toolbar>
          <SearchToolbar />
        </DataGridContainer.Toolbar>
        <DataGridContainer.Table
          initialState={{
            columns: {
              columnVisibilityModel: {
                eventCategory: false,
                fundingId: false,
                fundingEntity: false
              }
            },
            pagination: undefined,
            sorting: {
              sortModel: [{ field: 'date', sort: 'desc' }]
            }
          }}
          noRowsHint={t({ id: 'noPublicEventsHint' }, { organisation: 'Cardano Foundation' })}
          noRowsMessage={t({ id: 'nothingHereMessage' })}
          paginationModel={{ page, pageSize: rowsPerPage }}
          paginationMode="server"
          sortingMode="server"
          rowCount={rowCount}
          columns={columns}
          rows={data?.events ?? []}
          onRowClick={(params) => handleOpenDetail(params.row as EventView)}
          onPaginationModelChange={(model) => {
            const { page, pageSize } = model

            handlePagination(page, pageSize)
          }}
          onSortModelChange={(model) => {
            const [current] = model

            if (current) {
              handleSorting(current.field, current.sort)
            }
          }}
          hasFiltersSelected={hasFiltersSelected}
          isLoading={isLoading}
        />
      </DataGridContainer>
      <Modal isOpen={isOpen} maxWidth="md" onClose={handleModalClose}>
        <Modal.Header hasCloseButton>{t({ id: 'eventDetailsTitle' })}</Modal.Header>
        <Modal.Content>{selectedEvent && <EventDetail event={selectedEvent} />}</Modal.Content>
      </Modal>
    </>
  )
}
