/**
 * Application Fee & Hours Calculations
 *
 * Implements exact fee rules from the official Divine Heritage Application Form:
 *  - Standard Rate: Hourly £12.00, Day rate £70.00 (if care > 5 hours), Full-time £330.00/wk
 *  - Babies under 8 months: Day rate £80.00, Hourly £14.00
 *  - Charges based on hourly rate; no half-hour charges
 *  - 50% retainer fee for term-time childcare
 *  - Fees payable in advance on a weekly, 4-weekly, or monthly basis
 *  - 4 weeks' notice / contracted charge
 */

import type {
  Page3ContractedHours,
  Page3FundedSchedule,
} from '@appTypes/application'

export interface DayCostResult {
  hours: number
  cost: number
  costStr: string
}

export interface WeeklyCostResult {
  totalHours: number
  grossCost: number
  grossCostStr: string
  isFullTimeDiscount: boolean
  isBabyRate: boolean
  fourWeeklyCost: number
  fourWeeklyCostStr: string
  monthlyCost: number
  monthlyCostStr: string
  retainerFee50: number
  retainerFee50Str: string
  fourWeeksNoticeCost: number
  fourWeeksNoticeCostStr: string
}

export interface FundedHoursResult {
  row8to1Hrs: number
  row12to5Hrs: number
  rowFullDayHrs: number
  totalFundedHrs: number
}

/**
 * Checks if the child is under 8 months old based on DOB and reference date (start date or today)
 */
export function isChildUnder8Months(childDob?: string, refDateStr?: string): boolean {
  if (!childDob) return false
  const dob = new Date(childDob)
  if (isNaN(dob.getTime())) return false

  const ref = refDateStr ? new Date(refDateStr) : new Date()
  const refTime = isNaN(ref.getTime()) ? new Date() : ref

  const diffMs = refTime.getTime() - dob.getTime()
  if (diffMs < 0) return false

  // Average days in 8 months is approx 243.5 days
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays < 244
}

/**
 * Calculates billable hours and daily rate according to official document rules:
 * - Care over 5 hours: Day rate applies (£70 standard, £80 baby)
 * - 5 hours or under: Hourly rate applies (£12 standard, £14 baby)
 * - "Charges are based on an hourly rate, and I do not offer half-hour charges" -> billable full hours
 */
export function calculateDayRate(
  timeFrom: string,
  timeTo: string,
  isBaby: boolean = false
): DayCostResult {
  if (!timeFrom || !timeTo) {
    return { hours: 0, cost: 0, costStr: '' }
  }

  const [fromH, fromM] = timeFrom.split(':').map(Number)
  const [toH, toM] = timeTo.split(':').map(Number)
  if (isNaN(fromH) || isNaN(toH)) {
    return { hours: 0, cost: 0, costStr: '' }
  }

  const diff = Math.max(0, toH + (toM || 0) / 60 - (fromH + (fromM || 0) / 60))
  if (diff <= 0) {
    return { hours: 0, cost: 0, costStr: '£0.00' }
  }

  const roundedHours = Math.round(diff * 10) / 10

  let cost = 0
  if (roundedHours > 5) {
    // Day rate applies if care is provided for over 5 hours
    cost = isBaby ? 80 : 70
  } else {
    // Hourly rate without half-hour charge (rounded up to nearest whole hour)
    const billableHours = Math.ceil(roundedHours)
    const hourlyRate = isBaby ? 14 : 12
    cost = billableHours * hourlyRate
  }

  return {
    hours: roundedHours,
    cost,
    costStr: `£${cost.toFixed(2)}`,
  }
}

/**
 * Calculates weekly total, full-time discount, and advance payment schedules
 */
export function calculateWeeklySchedule(
  contractedHours?: Page3ContractedHours,
  isBaby: boolean = false
): WeeklyCostResult {
  const days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ]

  let totalHours = 0
  let totalCost = 0
  let fullDaysCount = 0

  if (contractedHours) {
    days.forEach((day) => {
      const row = contractedHours[day]
      if (!row) return
      if (row.timeFrom && row.timeTo) {
        const dayRes = calculateDayRate(row.timeFrom, row.timeTo, isBaby)
        totalHours += dayRes.hours
        totalCost += dayRes.cost
        if (dayRes.hours > 5) {
          fullDaysCount++
        }
      } else if (row.totalHours) {
        const h = parseFloat(row.totalHours) || 0
        totalHours += h
        if (h > 5) {
          fullDaysCount++
          totalCost += isBaby ? 80 : 70
        } else if (h > 0) {
          totalCost += Math.ceil(h) * (isBaby ? 14 : 12)
        }
      }
    })

    // Fallback: if totalCost is 0 or uncalculated, check if totalCostPerWeek was stored
    if (totalCost === 0 && contractedHours.totalCostPerWeek) {
      const parsed = parseFloat(contractedHours.totalCostPerWeek.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsed) && parsed > 0) {
        totalCost = parsed
      }
    }
    if (totalHours === 0 && contractedHours.totalHoursPerWeek) {
      const parsedH = parseFloat(contractedHours.totalHoursPerWeek.replace(/[^0-9.]/g, ''))
      if (!isNaN(parsedH) && parsedH > 0) {
        totalHours = parsedH
      }
    }
  }

  // Full-time £330.00 per week when all 5 days are full days (>5 hours) or total hours >= 35
  let isFullTimeDiscount = false
  if (!isBaby && (fullDaysCount === 5 || totalHours >= 35)) {
    if (totalCost >= 330) {
      totalCost = 330
      isFullTimeDiscount = true
    }
  }

  const fourWeeklyCost = totalCost * 4
  const monthlyCost = (totalCost * 52) / 12
  const retainerFee50 = totalCost * 0.5
  const fourWeeksNoticeCost = totalCost * 4

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    grossCost: totalCost,
    grossCostStr: `£${totalCost.toFixed(2)}`,
    isFullTimeDiscount,
    isBabyRate: isBaby,
    fourWeeklyCost,
    fourWeeklyCostStr: `£${fourWeeklyCost.toFixed(2)}`,
    monthlyCost,
    monthlyCostStr: `£${monthlyCost.toFixed(2)}`,
    retainerFee50,
    retainerFee50Str: `£${retainerFee50.toFixed(2)}`,
    fourWeeksNoticeCost,
    fourWeeksNoticeCostStr: `£${fourWeeksNoticeCost.toFixed(2)}`,
  }
}

/**
 * Calculates Early Years Funded Hours based on checked days:
 * - 8 – 1pm = 5 hours per checked day
 * - 12 - 12:45 - 5 - 5:45 PM = 5 hours per checked day
 * - Full day = 10 hours per checked day (max 10 hrs per day per 30-hr funding rules)
 */
export function calculateFundedHours(schedule?: Page3FundedSchedule): FundedHoursResult {
  if (!schedule) {
    return {
      row8to1Hrs: 0,
      row12to5Hrs: 0,
      rowFullDayHrs: 0,
      totalFundedHrs: 0,
    }
  }

  const days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'> = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
  ]

  let count8to1 = 0
  let count12to5 = 0
  let countFull = 0

  days.forEach((day) => {
    if (schedule.row8to1?.[day]) count8to1++
    if (schedule.row12to5?.[day]) count12to5++
    if (schedule.rowFullDay?.[day]) countFull++
  })

  const row8to1Hrs = count8to1 * 5
  const row12to5Hrs = count12to5 * 5
  const rowFullDayHrs = countFull * 10
  const totalFundedHrs = row8to1Hrs + row12to5Hrs + rowFullDayHrs

  return {
    row8to1Hrs,
    row12to5Hrs,
    rowFullDayHrs,
    totalFundedHrs,
  }
}
