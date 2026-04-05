import {
  format,
  parseISO,
  isToday,
  isFuture,
  isPast,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  subDays,
  addDays,
  isSameDay,
  differenceInDays,
  startOfDay,
} from 'date-fns'

export const TODAY = () => format(new Date(), 'yyyy-MM-dd')

export function formatDate(dateStr, fmt = 'MMM d, yyyy') {
  if (!dateStr) return ''
  try {
    return format(parseISO(dateStr), fmt)
  } catch {
    return dateStr
  }
}

export function formatDateTime(isoStr) {
  if (!isoStr) return ''
  try {
    return format(parseISO(isoStr), 'MMM d, yyyy · h:mm a')
  } catch {
    return isoStr
  }
}

export function isDateToday(dateStr) {
  try {
    return isToday(parseISO(dateStr))
  } catch {
    return false
  }
}

export function isDateFuture(dateStr) {
  try {
    return isFuture(startOfDay(parseISO(dateStr)))
  } catch {
    return false
  }
}

export function isDatePast(dateStr) {
  try {
    const d = parseISO(dateStr)
    return !isToday(d) && isPast(d)
  } catch {
    return false
  }
}

// Get all days in a given month (date object or yyyy-MM string)
export function getDaysInMonth(month) {
  const d = typeof month === 'string' ? parseISO(month + '-01') : month
  const days = eachDayOfInterval({ start: startOfMonth(d), end: endOfMonth(d) })
  return days.map(day => format(day, 'yyyy-MM-dd'))
}

export function getMonthStartPadding(month) {
  const d = typeof month === 'string' ? parseISO(month + '-01') : month
  return getDay(startOfMonth(d)) // 0=Sun, 1=Mon...
}

export function getMonthLabel(month) {
  const d = typeof month === 'string' ? parseISO(month + '-01') : month
  return format(d, 'MMMM yyyy')
}

export function prevMonth(monthStr) {
  const d = parseISO(monthStr + '-01')
  const prev = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  return format(prev, 'yyyy-MM')
}

export function nextMonth(monthStr) {
  const d = parseISO(monthStr + '-01')
  const next = new Date(d.getFullYear(), d.getMonth() + 1, 1)
  return format(next, 'yyyy-MM')
}

export function currentMonthStr() {
  return format(new Date(), 'yyyy-MM')
}

// Get last N days as date strings
export function getLastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(format(subDays(new Date(), i), 'yyyy-MM-dd'))
  }
  return days
}

// Calculate streaks
// returns { current, longest }
export function calculateStreak(doneDates) {
  if (!doneDates || doneDates.length === 0) return { current: 0, longest: 0 }

  const sortedDates = [...new Set(doneDates)].sort()
  let longest = 1
  let current = 1
  let tempStreak = 1

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = parseISO(sortedDates[i - 1])
    const curr = parseISO(sortedDates[i])
    if (differenceInDays(curr, prev) === 1) {
      tempStreak++
      if (tempStreak > longest) longest = tempStreak
    } else {
      tempStreak = 1
    }
  }

  // Current streak: check if it reaches today or yesterday
  const today = TODAY()
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const lastDate = sortedDates[sortedDates.length - 1]

  if (lastDate !== today && lastDate !== yesterday) {
    current = 0
  } else {
    current = 1
    for (let i = sortedDates.length - 2; i >= 0; i--) {
      const a = parseISO(sortedDates[i])
      const b = parseISO(sortedDates[i + 1])
      if (differenceInDays(b, a) === 1) {
        current++
      } else {
        break
      }
    }
  }

  return { current, longest: Math.max(longest, current) }
}
