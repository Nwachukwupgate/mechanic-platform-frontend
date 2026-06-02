import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { adminAPI } from '../../services/adminApi'
import { fmtShortDate } from '../../lib/adminFormat'
import {
  AdminPageHeader,
  AdminTable,
  AdminTh,
  AdminTd,
  AdminPagination,
  AdminBadge,
  AdminJson,
} from '../../components/admin/AdminUi'
import { AdminExportButton } from '../../components/admin/AdminExportButton'

export default function AdminWebhooks() {
  const [params, setParams] = useSearchParams()
  const page = Number(params.get('page') || 1)
  const [data, setData] = useState<any>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [detail, setDetail] = useState<any>(null)

  useEffect(() => {
    adminAPI.listPaystackWebhooks({ page, limit: 30 }).then((r) => setData(r.data))
  }, [page])

  const openDetail = async (id: string) => {
    if (expanded === id) {
      setExpanded(null)
      setDetail(null)
      return
    }
    setExpanded(id)
    const r = await adminAPI.getPaystackWebhook(id)
    setDetail(r.data)
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
        <AdminPageHeader
          title="Paystack webhooks"
          subtitle="Every webhook Paystack sends is stored with signature, payload, and processing result."
        />
        <AdminExportButton resource="webhooks" />
      </div>

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>When</AdminTh>
            <AdminTh>Event</AdminTh>
            <AdminTh>Reference</AdminTh>
            <AdminTh>Signature</AdminTh>
            <AdminTh>Status</AdminTh>
            <AdminTh>Payload</AdminTh>
          </tr>
        </thead>
        <tbody>
          {data?.items?.map((w: any) => (
            <tr key={w.id}>
              <AdminTd>{fmtShortDate(w.createdAt)}</AdminTd>
              <AdminTd className="font-medium">{w.event}</AdminTd>
              <AdminTd className="text-xs font-mono">{w.reference ?? ''}</AdminTd>
              <AdminTd>
                <AdminBadge tone={w.signatureValid ? 'green' : 'red'}>
                  {w.signatureValid ? 'Valid' : 'Invalid'}
                </AdminBadge>
              </AdminTd>
              <AdminTd>
                <AdminBadge tone={w.processingStatus === 'processed' ? 'green' : w.processingStatus === 'failed' ? 'red' : 'amber'}>
                  {w.processingStatus}
                </AdminBadge>
                {w.errorMessage ? <p className="text-xs text-red-600 mt-1 truncate max-w-xs">{w.errorMessage}</p> : null}
              </AdminTd>
              <AdminTd>
                <button type="button" className="text-xs text-violet-700" onClick={() => void openDetail(w.id)}>
                  {expanded === w.id ? 'Hide' : 'View JSON'}
                </button>
                {expanded === w.id && detail ? (
                  <div className="mt-2 max-w-lg">
                    <AdminJson data={detail.payload} />
                  </div>
                ) : null}
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {data && (
        <AdminPagination
          page={data.page}
          totalPages={data.totalPages}
          total={data.total}
          onPage={(p) => {
            const n = new URLSearchParams(params)
            n.set('page', String(p))
            setParams(n)
          }}
        />
      )}
    </>
  )
}
