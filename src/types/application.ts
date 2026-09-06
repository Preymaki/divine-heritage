/**
 * Divine Heritage Childcare Application Types
 *
 * Strictly models the exact 7-page official Divine Heritage Application Form
 * without any AI-added content or extraneous questions.
 */

import type { Timestamp } from 'firebase/firestore'

// ── Page 1 & 2: Parental Responsibility & Emergency Contacts ────────────────

export interface EmergencyContactEntry {
  name: string
  contactNo: string
  relationship: string
}

export interface Page1ParentalResponsibility {
  childFullName: string
  childDob: string
  childGender: 'Male' | 'Female' | ''

  parent1Name: string
  parent1Address: string
  parent1Mobile: string
  parent1Email: string
  parent1Profession: string
  parent1WorkAddress: string
  parent1WorkPhone: string

  parent2Name: string
  parent2Address: string
  parent2Mobile: string
  parent2Email: string
  parent2Profession: string
  parent2WorkAddress: string
  parent2WorkPhone: string

  whoWillBringCollect: string
  contactDetails: string
}

// ── Page 2: Funded Hours / Free Entitlements & Fees ──────────────────────────

export interface Page2FundedHours {
  universal15Hrs: 'Yes' | 'No' | ''
  workingParent15HrsUnder2Code: string
  workingParent15Hrs2yoCode: string
  workingParent30HrsCode: string
  nationalInsuranceNo: string
  parentClaimingDob: string
}

// ── Page 3: Sessions, Funded Schedule & Contracted Hours ─────────────────────

export interface FundedDaySchedule {
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  totalHrs: string
}

export interface Page3FundedSchedule {
  row8to1: FundedDaySchedule
  row12to5: FundedDaySchedule
  rowFullDay: FundedDaySchedule
}

export interface ContractedDayRow {
  timeFrom: string
  timeTo: string
  totalHours: string
  rate: string
}

export interface Page3ContractedHours {
  monday: ContractedDayRow
  tuesday: ContractedDayRow
  wednesday: ContractedDayRow
  thursday: ContractedDayRow
  friday: ContractedDayRow
  totalHoursPerWeek: string
  totalCostPerWeek: string
}

export interface Page3SessionDetails {
  requiredStartDate: string
  sessionPreference?: 'Morning' | 'Afternoon' | 'Full Day' | ''
  fundedSchedule: Page3FundedSchedule
  contractedHours: Page3ContractedHours
}

// ── Page 4: Contract Duration, Race & Ethnicity ──────────────────────────────

export interface Page4ContractAndEthnicity {
  contractStartDate: string
  contractEndDate: string

  childRaceEthnicity: string
  familyRaceEthnicity: string
  languagesUnderstoodChild: string
  languagesSpokenFamily: string
  languagesSpokenChild: string
  translationRequired: string
  religion: string
  festivalsCelebrated: string

  previousChildcare: string
}

// ── Page 5: Previous Nursery, Family Members, Social Service, Medical ─────────

export interface FamilyChildItem {
  name: string
  dob: string
}

export interface Page5FamilyAndHealth {
  nurseryAttendedName: string
  nurseryAttendedAddress: string

  familyChildren: [
    FamilyChildItem,
    FamilyChildItem,
    FamilyChildItem,
    FamilyChildItem,
    FamilyChildItem,
    FamilyChildItem,
  ]
  positionInFamily: '1' | '2' | '3' | '4' | '5' | '6' | ''

  childInCareOrLookedAfter: 'Yes' | 'No' | ''
  lookedAfterDetails: string

  medicalNeedsDetails: string
  allergiesDetails: string
  specialDietaryRequirements: string
}

// ── Page 6: Permissions & Policies ───────────────────────────────────────────

export interface Page6Permissions {
  emergencyHospitalTreatment: boolean
  localOutings: boolean
  photosVideosLearningRecord: boolean
  transportInVehicle: boolean
  transitionRecords: boolean
}

// ── Page 7: Declarations & Signatures ────────────────────────────────────────

export interface Page7Signatures {
  parentSignature: string
  parentName: string
  parentDate: string

  childminderName: string
  childminderDate: string
  childminderSigned: boolean
}

// ── Complete Application Form Data Schema ────────────────────────────────────

export interface ApplicationFormData {
  page1: Page1ParentalResponsibility
  emergencyContacts: [
    EmergencyContactEntry,
    EmergencyContactEntry,
    EmergencyContactEntry,
    EmergencyContactEntry,
  ]
  page2: Page2FundedHours
  page3: Page3SessionDetails
  page4: Page4ContractAndEthnicity
  page5: Page5FamilyAndHealth
  page6: Page6Permissions
  page7: Page7Signatures

  // Convenience aliases for backward compatibility with existing queries/views
  child?: {
    fullName: string
    dob: string
    sex: string
    homeAddress?: string
  }
  parent1?: {
    fullName: string
    email: string
    mobile: string
    homeAddress?: string
  }
  sessions?: {
    requiredStartDate: string
  }
  contractedSchedule?: {
    totalContractedHours: number | string
    totalWeeklyCost: number | string
  }
}

// ── Admin Status & Record Types ──────────────────────────────────────────────

export type ApplicationStatus =
  | 'new'
  | 'under_review'
  | 'contacted'
  | 'accepted'
  | 'declined'
  | 'archived'

export type EmailDeliveryStatus =
  | 'pending'
  | 'sent'
  | 'failed'
  | 'unconfigured'

export interface ApplicationRecord extends ApplicationFormData {
  id: string
  applicationId: string
  status: ApplicationStatus
  submittedAt: string
  createdAt?: Timestamp | string
  updatedAt?: Timestamp | string
  emailStatus: EmailDeliveryStatus
  emailError?: string | null
  emailSentAt?: string | null
  pdfGenerated: boolean
  pdfStorageUrl?: string | null
  notes?: string
}
