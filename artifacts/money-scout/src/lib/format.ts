import { format, parseISO } from "date-fns"

export function formatDate(dateStr: string | undefined | null) {
  if (!dateStr) return "-"
  try {
    return format(parseISO(dateStr), "MMM d, yyyy")
  } catch (e) {
    return dateStr
  }
}

export function formatDateTime(dateStr: string | undefined | null) {
  if (!dateStr) return "-"
  try {
    return format(parseISO(dateStr), "MMM d, yyyy HH:mm")
  } catch (e) {
    return dateStr
  }
}
