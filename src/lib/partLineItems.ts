export type PartLineItem = {
  name: string
  amountNaira: number
  note?: string
}

export function emptyPartLine(): PartLineItem {
  return { name: '', amountNaira: 0, note: '' }
}

export function sumPartLines(items: PartLineItem[]): number {
  return items.reduce((s, r) => s + (Number(r.amountNaira) || 0), 0)
}

export function activePartLines(items: PartLineItem[]) {
  return items.filter((r) => r.name.trim() && Number(r.amountNaira) > 0)
}

export function partLinesFromQuote(quote: {
  partsLineItems?: PartLineItem[] | null
  partsNaira?: number | null
}): PartLineItem[] {
  if (quote.partsLineItems?.length) {
    return quote.partsLineItems.map((r) => ({
      name: r.name,
      amountNaira: Number(r.amountNaira) || 0,
      note: r.note,
    }))
  }
  const parts = Number(quote.partsNaira) || 0
  if (parts > 0) {
    return [{ name: 'Parts / materials (combined)', amountNaira: parts }]
  }
  return []
}

export function partsPayload(items: PartLineItem[]) {
  const lines = activePartLines(items)
  const total = sumPartLines(lines)
  return {
    partsCost: total,
    partsLineItems: lines.map((r) => ({
      name: r.name.trim(),
      amountNaira: Number(r.amountNaira),
      ...(r.note?.trim() ? { note: r.note.trim() } : {}),
    })),
  }
}
