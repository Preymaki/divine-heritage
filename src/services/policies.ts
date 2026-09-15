/**
 * Policies Service
 *
 * Domain-specific service for the Policies CMS feature.
 * Composes the generic firestore.ts utilities into higher-level operations.
 *
 * Collection: `policies`
 */

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  doc,
  getDocs,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@services/firebase/config'
import {
  addDocument,
  updateDocument,
  deleteDocument,
} from '@services/firebase/firestore'
import type { Policy, PolicyInput, PolicyPatch } from '@appTypes/policy'

export const POLICIES_COLLECTION = 'policies'

// ---------------------------------------------------------------------------
// Create
// ---------------------------------------------------------------------------

export async function addPolicy(input: PolicyInput): Promise<string> {
  const data: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'> = {
    title:       input.title.trim(),
    content:     input.content.trim(),
    order:       input.order,
    isPublished: input.isPublished,
  }
  if (input.category?.trim()) {
    data.category = input.category.trim()
  }
  return addDocument<Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>>(
    POLICIES_COLLECTION,
    data,
  )
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updatePolicy(id: string, patch: PolicyPatch): Promise<void> {
  const sanitised: PolicyPatch = {}
  if (patch.title       !== undefined) sanitised.title       = patch.title.trim()
  if (patch.category    !== undefined) sanitised.category    = patch.category.trim()
  if (patch.content     !== undefined) sanitised.content     = patch.content.trim()
  if (patch.order       !== undefined) sanitised.order       = patch.order
  if (patch.isPublished !== undefined) sanitised.isPublished = patch.isPublished
  await updateDocument(POLICIES_COLLECTION, id, sanitised)
}

// ---------------------------------------------------------------------------
// Delete
// ---------------------------------------------------------------------------

export async function deletePolicy(id: string): Promise<void> {
  await deleteDocument(POLICIES_COLLECTION, id)
}

// ---------------------------------------------------------------------------
// Reorder
// ---------------------------------------------------------------------------

export async function reorderPolicies(orderedIds: string[]): Promise<void> {
  const batch = writeBatch(db)
  const now = serverTimestamp()
  orderedIds.forEach((id, index) => {
    const ref = doc(db, POLICIES_COLLECTION, id)
    batch.update(ref, { order: index, updatedAt: now })
  })
  await batch.commit()
}

// ---------------------------------------------------------------------------
// Real-time subscription — all items (admin)
// ---------------------------------------------------------------------------

export function subscribeToPolicies(
  callback: (items: Policy[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(
    collection(db, POLICIES_COLLECTION),
    orderBy('order', 'asc'),
  )
  return onSnapshot(
    q,
    (snap) => {
      const items: Policy[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Policy, 'id'>),
      }))
      callback(items)
    },
    (err) => {
      console.error('[policies] onSnapshot error:', err)
      onError?.(err)
    },
  )
}

// ---------------------------------------------------------------------------
// Real-time subscription — published only (public page)
// ---------------------------------------------------------------------------

export function subscribeToPublishedPolicies(
  callback: (items: Policy[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, POLICIES_COLLECTION),
    (snap) => {
      const items: Policy[] = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Policy, 'id'>) }))
        .filter((p) => p.isPublished === true)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      callback(items)
    },
    (err) => {
      console.error('[policies/public] onSnapshot error:', err)
      onError?.(err)
    },
  )
}

// ---------------------------------------------------------------------------
// Official Policy Handbook (Verbatim — Updated September 2026 / Review September 2027)
// ---------------------------------------------------------------------------

export interface OfficialPolicyData {
  title: string
  category: string
  content: string
}

export const OFFICIAL_POLICIES: OfficialPolicyData[] = [
  // ── 1. Learning & Development ─────────────────────────────────────────────
  {
    category: 'Learning & Development',
    title: 'Welcome',
    content: `Welcome to Divine Heritage Childcare service, a warm, nurturing home-away-from-home place where every child thrives, grows, and belongs.

It is a pleasure to welcome new families into the setting. Here, children are supported with personalised care, meaningful play, and gentle routines that help them feel safe, confident, and ready to explore. Every day is designed to encourage curiosity, build independence, and celebrate each child’s unique personality.`,
  },
  {
    category: 'Learning & Development',
    title: 'My Aims & Ethos',
    content: `At Divine Heritage, my practice is rooted in three core pillars: helping every child belong, grow, and thrive. Through strong parent partnerships, safe environments, and enriching experiences, I am committed to fulfilling these aims every day:

1. Belong
• I build strong, caring bonds with every child and family, ensuring parents and children feel welcomed, valued, and respected.
• I listen actively to children, encouraging them to share their views, express their ideas constructively, and feel confident in who they are.

2. Grow
• I provide a secure home-from-home setting with free-flow play where children feel safe to take managed risks, build confidence, and develop independence.
• Through rich, child-led play, I spark curiosity and nurture creative, capable, and happy learners.

3. Thrive
• I work in close collaboration with parents to deliver tailored, consistent care that supports each child's overall well-being.
• Children thrive through daily outdoor play in my garden as well as regular community outings to parks, libraries, playgroups, and local farms that expand their world.`,
  },
  {
    category: 'Learning & Development',
    title: 'EYFS Assessment, Observation & Learning Journey Policy',
    content: `As your child’s key person, I build a close relationship with them to support their unique growth, happiness, and learning. I follow the UK Early Years Foundation Stage (EYFS) framework, where children learn primarily through play across 7 key areas:

• Prime Areas: Communication & Language, Physical Development, Personal, Social & Emotional Development.
• Specific Areas: Literacy, Mathematics, Understanding the World, Expressive Arts & Design.

How I Assess Your Child
• Ongoing (Formative) Assessment: I continuously observe your child during daily play to spot their interests, celebrate milestones, and plan their immediate next steps. I share updates with you regularly during pick-up and drop-off so we can work in partnership.
• Two-Year Progress Check (Summative): Between 24 and 36 months, I complete a formal written summary of your child’s progress in the 3 Prime Areas, highlighting strengths and any extra support needed.

Observations & Learning Journey
To track progress and plan tailored, engaging activities, I make regular observations using written notes, photographs, and short video recordings.

I gather all of these in your child's personal Learning Journey. This tracks their achievements and special moments while in my care. I share this with you via WhatsApp so you can add your own comments, photos, and updates from home.

Special Educational Needs & Disability (SEND):
• Any concerns regarding your child's progress in a prime area are discussed with you promptly so we can agree on support without delay.
• Reasonable adjustments are made for disabled children. I follow the SEND Code of Practice, treating parents as equal partners in "assess-plan-do-review" arrangements and seeking outside professional support whenever needed.

Supporting Children with English as an Additional Language (EAL)
I value and celebrate the linguistic diversity of all children. For children learning English as an additional language, I ensure:
• A child's home language is recognised as an essential foundation for learning. I encourage parents to continue speaking and reading in their home language at home.
• With your guidance, I gather key words and phrases in your child’s home language (such as greetings, comfort words, and terms for personal needs) to help them feel safe, secure, and understood in my setting.
• Children are given full opportunity to develop their home language through play while simultaneously acquiring English through visual aids, routine cards, body language, songs, stories, and rich conversational interactions.`,
  },

  // ── 2. Safeguarding & Child Policies ──────────────────────────────────────
  {
    category: 'Safeguarding & Child Policies',
    title: 'Child Absence / Attendance Policy',
    content: `At Divine Heritage, I am committed to providing a safe, reliable, and consistent service. Regular attendance supports your child’s routine, development, and well-being. Under the Early Years Foundation Stage (EYFS) statutory framework, keeping a daily attendance register is required. I take child protection very seriously and monitor attendance closely.

• A daily register is kept recording all children's arrival and departure times to ensure the smooth operation of the setting and account for staff presence, to meet legal staff-to-child ratios throughout the day.
• Please notify me as early as possible if your child will be absent or arriving late.
• If your child has not arrived by 10:00 AM on a scheduled day and I have not heard from you, I will call you immediately.
• If I cannot reach you, I will call your designated emergency contacts to verify your child's safety.
• In line with local authority regulations, any prolonged or unnotified absence that raises welfare concerns will be referred to local safeguarding services.`,
  },
  {
    category: 'Safeguarding & Child Policies',
    title: 'Uncollected Child Policy & Procedure',
    content: `At Divine Heritage, I am committed to ensuring the safety and emotional well-being of all children in my care. Children thrive on predictability, and arriving on time for collection helps them feel secure. I understand that emergencies, severe traffic, or unforeseen delays happen; however, clear communication and strict procedures must be followed to ensure your child always remains safe.

• Please ensure your child is collected promptly at the agreed contracted time. Late arrivals can cause distress to young children who rely on daily routines.
• If you anticipate being late due to an emergency, please call or text me immediately. This allows me to reassure your child and make suitable staffing or routine arrangements.
• Children will only be released to parents/carers or adults designated as authorised collectors on your registration form. If someone else is collecting your child, you must inform me in advance, and a pre-agreed password system or photo identification check will be required.

If a child is not collected at the agreed time and I have received no prior notification from the parents/carers, the following procedure is initiated:

• I will continue to care for your child safely within the setting, reassuring them to prevent any anxiety or distress.
• If your child has not been collected after 15 minutes, I will attempt to contact you via all provided mobile and workplace telephone numbers.
• If I cannot reach you, I will immediately begin calling your nominated emergency contacts to arrange collection.
• I will continue attempting to reach parents and emergency contacts every few minutes.
• Your child will remain fully supervised, comforted, and provided with snacks or activities as needed.
• If 30 minutes have passed since the contracted collection time, all emergency contact attempts have failed. No communication has been established; I am legally obligated under my EYFS safeguarding duties to contact the Local Authority Children’s Social Care Duty Team (and/or the Out-of-Hours Emergency Duty Team) as well as the local police for advice and intervention.
• I will follow all instructions given by the Social Care Duty Officer regarding the safe care or handover of your child.
• A full written record of the incident, including times, contact attempts, and outcome, will be documented in my setting logs and shared with the local safeguarding board/Ofsted if required.
• A late collection fee (as outlined in your childcare contract) will be charged to cover the additional staffing, resource, and operational costs incurred due to unnotified late pick-ups.`,
  },
  {
    category: 'Safeguarding & Child Policies',
    title: 'Lost / Missing Child Policy & Procedure',
    content: `At Divine Heritage, the safety, security, and emotional well-being of your child are my highest priorities. While the thought of a child going missing is distressing, I maintain strict supervisory routines and preventative measures to ensure this remains an extremely unlikely event.

However, as a responsible, Ofsted-registered childminder, I have a clear, robust protocol in place to act swiftly and decisively in an emergency.

To prevent any child from wandering off or becoming lost, I implement strict safety procedures whenever we leave the setting:

• Depending on age and developmental stage, children use safety reins, wrist straps, or always hold my hand/the pushchair when walking near roads or in public spaces.
• During outings away from our local area, children wear discreet wristbands containing my contact telephone number (no child names are displayed for safeguarding reasons).
• Children wear bright, high-visibility vests on outings, making them easily identifiable in public places.
• I complete thorough risk assessments before visiting new locations and consciously avoid overcrowded or uncontained environments during peak hours.
• I continuously teach children about spatial awareness, the importance of staying close, and what to do if they ever feel separated (e.g., finding a safe adult or shop assistant).
• Continuous headcounts are conducted throughout all outings, especially when transitioning between spaces or vehicles.

If a child becomes separated from the group, I will remain calm and immediately execute the following step-by-step procedure:

• I will immediately raise the alarm to staff, venue attendants, or members of the public nearby to enlist immediate help in searching the surrounding area.
• If in a contained or managed area (e.g., shopping centre, zoo, or soft play), I will alert security personnel immediately so they can monitor CCTV and manage access exits.
• I will keep all other minded children calm, safe, and closely supervised alongside me throughout the search to prevent further distress or risk.
• If the child is not located within 5 minutes, I will call 999 to alert the Police, providing a precise description of the child (including physical features, clothing, and last known location).
• Immediately after contacting the police, I will call you (the parent/carer) to inform you calmly of the situation, the actions taken, and where to meet us.
• In line with legal requirements, I will inform the Local Authority Children’s Social Care/Safeguarding Team and Ofsted as soon as reasonably practicable (and within 14 days) following any serious incident.`,
  },
  {
    category: 'Safeguarding & Child Policies',
    title: 'Prevent Duty & Counter-Extremism Policy',
    content: `At Divine Heritage, safeguarding children’s safety, emotional well-being, and moral development is my highest duty. In compliance with Section 26 of the Counter terrorism and Security Act 2015, the statutory Prevent Duty Guidance, and the EYFS Statutory Framework, I am legally required to protect children from the risks of radicalisation, extreme views, and being drawn into terrorism.

I recognise that radicalisation is a safeguarding concern like any other. I embed protective measures into daily routines to nurture an inclusive, critical-thinking, and resilient environment.

• I maintain an active awareness of potential vulnerability factors in a child's life at home or in the community. I monitor for indicators of concern, such as sudden changes in family dynamics, exposure to extreme ideological views, or hostility toward other cultures and faiths.
• I undertake mandatory Prevent Duty and Channel awareness training to ensure I have the knowledge and confidence to spot early warning signs, challenge extremist narratives, and follow correct referral pathways.

I build children’s resilience to negative influences by embedding fundamental British values into everyday play:
o Democracy: Encouraging children to make choices, vote on activities, share, and listen to each other's views.
o Rule of Law: Helping children understand right from wrong, manage feelings, and follow simple setting rules.
o Individual Liberty: Fostering self-esteem, confidence, personal responsibility, and freedom of expression.
o Mutual Respect & Tolerance: Celebrating cultural diversity, learning about different faiths and backgrounds, and modelling inclusion and empathy.

• I ensure all digital devices used within the setting are protected by robust internet filtering and monitoring safety controls to prevent access to harmful, inappropriate, or extremist content online.

If I suspect a child or family member is at risk of radicalisation, being targeted by extremists, or exposed to dangerous ideologies:
1. I will document detailed, objective factual notes of my observations, including dates, times, and context.
2. In accordance with my local authority safeguarding procedures, I will immediately report my concerns to the Local Authority Designated Officer (LADO), the Prevent Team / Local Safeguarding Children Partnership (LSCP), or the Anti-Terrorism Hotline (0800 789 321).
3. If there is an immediate, urgent threat of harm to a child or others, I will contact emergency services by dialling 999. Ofsted: 0300 1234 666 • NSPCC/Childline: 0800 1111`,
  },
  {
    category: 'Safeguarding & Child Policies',
    title: 'Safeguarding & Child Protection Policy',
    content: `I am committed to providing a safe, secure, and welcoming environment where children are protected from harm, abuse, and neglect. My primary aim is to safeguard the physical, emotional, and developmental well-being of every child in my care by maintaining a culture of continuous vigilance, clear communication, and prompt action.

Recognising Concerns
I remain alert to the physical, behavioural, and emotional indicators that may suggest a child is at risk of harm or abuse (including physical, emotional, or sexual abuse, or neglect).

Key indicators I watch for include:
• Unexplained bruises, marks, burns, injuries in non-accidental patterns, or persistent untreated medical issues.
• Sudden changes in behaviour or personality, extreme aggression, withdrawal, excessive clinginess, or developmentally unexpected sexual knowledge.
• Consistently unwashed clothes, persistent poor hygiene, inadequate clothing for weather conditions, or constant extreme hunger.

What Happens When a Child Discloses a Concern
If a child discloses an issue or concern to me directly, I will handle the situation with sensitivity, reassurance, and strict adherence to protocol:
• I will listen calmly without showing shock or disbelief, letting the child talk at their own pace.
• I will reassure the child that they are safe and that they did the right thing by telling me. I will never promise to keep the disclosure a secret.
• I will only ask open questions (e.g., "Tell me what happened") for basic clarification, ensuring I do not lead the child or ask suggestive questions.
• I will make a detailed written record of the disclosure as soon as possible, using the child's exact words, along with the date, time, and surrounding context.
• I will immediately contact the relevant local Children’s Social Care services and/or the local safeguarding board (and police if in immediate danger) to report the concern.

Steps Taken if an Allegation is Made Against an Adult
If an allegation of abuse or harm is made against me, a family member, or any other adult residing or working on the premises:
1. The allegation will be reported immediately to the Local Authority Designated Officer (LADO) and my registering body (e.g., Ofsted) within required statutory timelines.
2. I will not attempt to investigate the allegation myself to ensure the integrity of any official investigation.
3. I will fully cooperate with all external investigations conducted by Social Care, the LADO, and the police.
4. Depending on the nature of the allegation and advice from the LADO/Social Care, steps will be taken to immediately remove the accused adult from contact with children until the investigation is complete.
5. Detailed notes of all actions, communications, and guidance received from authorities will be kept securely.

As a registered childminder and the designated safeguarding lead, I make the safety, well-being, and protection of every child in my care my highest priority. I am committed to recognising signs of abuse, whether physical, emotional, sexual, or neglect, and acting swiftly to protect children. Parents are required to notify me of any existing concerns, accidents, incidents, or injuries affecting their child so they can be formally recorded.

Recognising Concerns: I monitor children closely for any signs that may indicate potential abuse or distress, including:
• Significant or sudden changes in behaviour or mood
• Unexplained or unexpected bruising, marks, or injuries
• Comments made by the child or others that raise concern
• Play, language, or behaviours suggesting sexual knowledge beyond the child's developmental age
• Any deterioration in general physical health, hygiene, or emotional well-being

Responding to Concerns and Disclosures: When a child discloses information, or if I observe concerning signs, I follow a strict procedure:
• If abuse is suspected, I will immediately contact the Children and Young People Service Multi-Agency Safeguarding Hub (MASH) by phone, followed by a formal written referral. Relevant information will be shared with MASH and the police as required.
• I maintain clear, accurate, and dated written records of all concerns, even if an immediate referral is not required. These records are kept strictly confidential and stored securely, separate from general child records.
• If a child subject to a child protection plan is absent without explanation, I will immediately report this to their assigned Social Worker.
• I actively liaise with external agencies and attend case conferences or multi-agency planning meetings whenever required.
• I will inform both MASH and Ofsted of any serious accident, illness, or injury involving a child in my care, ensuring Ofsted is notified within 14 days.

Allegations Against Myself or a Family Member If an allegation of abuse is made against me, a member of my family, or any other adult associated with the setting, I immediately implement the following steps:
• I will contact the Local Authority Designated Officer (LADO) immediately for guidance, support, and to determine the necessary course of action.
• I will compile a thorough, written account of all related events, detailing dates, times, and exact statements made by all parties involved.
• Subject to guidance from the LADO, I will ask any witnesses to provide written, signed statements along with their contact details for authority follow-up.
• I will report any allegation made against me or anyone in my household/setting to both Ofsted and the LADO without delay, strictly within the 14-day statutory limit and in accordance with local Safeguarding Board procedures.

Confidentiality
All family and child records are kept strictly confidential and will not be shared publicly. However, child safety is our top priority. If any safeguarding or child protection concerns arise, we will share relevant information with external agencies, including the Local Authority Designated Officer (LADO), Social Care, and Ofsted, in accordance with multi-agency procedures and data protection laws. All records are stored securely.

SOUTHWARK: 0207 525-1921 OUT OF HOURS 0207 525-5000.
Southwark email: mash@southwark.gov.uk • Southwark LADO: Eva Simcock`,
  },
  {
    category: 'Safeguarding & Child Policies',
    title: 'Mobile phone, Cameras & Technological Devices',
    content: `At Divine Heritage, protecting children in the digital age is an essential component of my safeguarding responsibilities. In accordance with the Early Years Foundation Stage (EYFS) Statutory Framework and national safeguarding guidance, I maintain strict controls regarding personal devices, photography, screen time, and internet access within my setting

Mobile Telephones & Personal Recording Devices
• I use one personal mobile phone for both business and personal communication. When minded children are present, phone calls and messaging are kept strictly to essential business operations, emergency communications, or urgent family matters.
• The phone is never used for personal browsing, social media, or non-essential calls while supervising children.
• Mobile phones, smartwatches, recording devices, and cameras must not be used by parents, visitors, or contractors while children are present. All visitors must keep devices out of sight or stored securely to prevent unauthorised photographs, videos, or recordings.

Cameras, Photography & Digital Images
• Photos and video recordings of minded children are captured solely on my designated phone/device exclusively for learning observations, assessments, and parent updates.
• Photos are taken and stored only with explicit, prior written consent from parents/carers.
• Camera functions are strictly prohibited during nappy changes, bathroom routines, or intimate care. Images are stored securely on password-protected devices and are never shared or posted publicly without explicit permission.

Screen Time & Digital Media
• Screen use (television, tablets, interactive devices) is kept to a minimum and integrated purposefully to support specific EYFS learning goals or calm rest periods.
• All media, applications, and programs accessed by children are strictly vetted for age-appropriateness, educational value, and suitability.
• Screen time is never used as a substitute for active play, outdoor exploration, physical movement, or face-to-face social interaction.

Online safety & Internet Access
• I strictly supervise children’s access to internet-enabled devices.
• Robust safety controls, child-friendly search filters, and security settings are maintained on all devices connected to the setting's network.
• Children are guided on how to use technology safely, respectfully, and responsibly, building early foundations for online safety.`,
  },

  // ── 3. Operational & Staffing Policies ────────────────────────────────────
  {
    category: 'Operational & Staffing Policies',
    title: 'Emergency & Backup Cover Policy',
    content: `As a solo childminder, I have sole responsibility for the children in my care. While every effort is made to prevent disruptions, unexpected emergencies (such as sudden personal illness, serious injury, or an urgent family crisis) can still occur. To ensure your child's continuous safety and a high standard of care, I maintain formal, robust backup arrangements.

Designated Emergency Backup Personnel & Qualifications
• I hold established agreements with named emergency backup covers (e.g., a fully registered fellow childminder or an Ofsted/agency-vetted, DBS-checked assistant/family member).
• In the event of an urgent situation while minded children are present, my designated backup cover will be called to take over supervision immediately, ensuring children remain in a secure, supportive environment until they can be collected.
• On rare, planned, or unexpected occasions, I may temporarily transfer care to another reputable, registered childminder. Full registration numbers, DBS details, and qualifications of my backup cover are kept on file and available for parents to inspect at any time

Data Sharing & Emergency Information
• To ensure safe care during an emergency, my designated backup cover will be given secure, confidential access to your child’s emergency contact details, medical history, dietary requirements, and signed consent forms.
• Information is shared strictly on a need-to-know basis in compliance with UK GDPR and data protection regulations, solely to safeguard your child's health and safety during an emergency.

Communication & Parent Notification
• If an emergency requires the activation of backup cover, I (or my named backup person) will contact you immediately to explain the situation, state your child's current location, and coordinate collection.
• If parents or primary guardians are unreachable, I will systematically call the secondary emergency contacts listed on your child’s registration form.`,
  },
  {
    category: 'Operational & Staffing Policies',
    title: 'Settling-In Policy',
    content: `Starting at Divine Heritage is an exciting new chapter, but I understand it can also be an emotional transition for both you and your child. Every child settles at their own pace; some adjust quickly, while others need a bit more time or experience a delayed wave of separation anxiety a few weeks later.

As your child's key person, I am dedicated to making this transition as gentle, reassuring, and seamless as possible, ensuring you both feel confident, relaxed, and happy in my care.

• Before your child's start date, we will complete a detailed "All About Me" profile. I will learn about your child's likes, dislikes, routines, favourite activities, sleep habits, comfort methods, and past reactions to separation so I can mirror home routines closely.
• We begin with short, gradual visits starting with brief stay-and-play sessions alongside you, progressing to short periods where you step away, and slowly extending to full sessions. Admissions are tailored entirely to your child's emotional readiness.
• I encourage children to bring a familiar comforter, such as a favourite teddy, blanket, or family photo album, to offer security and emotional grounding while adjusting to the setting.
• Separation anxiety affects parents too! You are welcome to stay during initial sessions until your child feels comfortable, and we will work closely together to establish a confident, positive drop-off routine.
• During the settling-in phase, I provide extra updates, photos, videos and quick check-ins via WhatsApp to give you complete peace of mind while you are away.
• You are welcome to contact me during the day to check on your child’s well-being. If I am unable to answer immediately, please do not worry; my hands are likely busy caring for the children. I will always return your call or text as soon as it is safe to do so.`,
  },
  {
    category: 'Operational & Staffing Policies',
    title: 'Equality, Diversity & Inclusion Policy',
    content: `At Divine Heritage, I actively promote equality of opportunity, anti-discriminatory practice, and inclusion for every child and family. As your child’s key person, I am committed to creating a welcoming, safe environment where diversity is celebrated, individual needs are met, and every child feels valued, respected, and empowered to reach their full potential.

• In line with the Equality Act 2010, I do not discriminate against any child, parent, or family member on the grounds of race, ethnicity, culture, religion or belief, gender, disability, sexual orientation, age, socio-economic background, or family structure.
• I proactively challenge stereotyping based on gender, race, or ability. Children are encouraged to choose their own toys, resources, and activities freely, without restriction, bias, or role judgment.
• I carefully select play materials, books, toys, and imagery that reflect positive, diverse representations of our multi-ethnic society, including different cultures, family structures, languages, faiths, and disabilities.
• I embed fundamental British values- Democracy, Rule of Law, Individual Liberty, and Mutual Respect & Tolerance- into daily routines by encouraging turn-taking, listening to every child’s voice, celebrating global festivals, and fostering empathy.
• Every child is unique. I tailor care and learning activities to accommodate individual developmental needs, making reasonable adjustments so that children with disabilities or extra needs can fully participate alongside their peers.
• I help children develop a strong sense of identity, self-worth, and mutual respect. I celebrate the differences that make each child unique while supporting their home language and cultural background.
• I work closely with parents to understand, respect, and value family backgrounds, traditions, and specific requirements, ensuring our setting reflects a fair, inclusive, and collaborative community.`,
  },
  {
    category: 'Operational & Staffing Policies',
    title: 'Complaints Policy & Procedure',
    content: `At Divine Heritage, I value open, transparent communication and strive to work in close partnership with parents to provide the highest standard of care. I welcome all feedback, including concerns, as an opportunity to review and continuously improve my practice.

If you ever feel unhappy or have concerns about any aspect of the care provided, please bring it to my attention as early as possible so we can work together to resolve it.

• Most concerns can be resolved quickly through an informal, open conversation during drop-off, pick-up, or a pre-arranged meeting.
• I am committed to listening attentively to your perspective, reviewing my practice, and agreeing on practical solutions amicably to ensure your child’s needs continue to be met.

If an issue cannot be resolved informally, or if you wish to submit a formal written complaint:
• I will thoroughly investigate the matter promptly and objectively.
• In accordance with EYFS statutory requirements, I will conduct the investigation and provide you with a full written report of my findings, including any corrective actions taken or proposed, within 28 days of receiving your complaint.
• A detailed record of all written complaints (verbal and written) is maintained securely. This includes the complainant's details, the nature of the concern, investigation findings, and the final resolution.
• Complaint records relating to the Childcare Register requirements are securely stored for at least 3 years and made available to parents (as a summary upon request) and Ofsted inspectors.

While I hope we can resolve any concerns together, you have the right to contact Ofsted directly at any stage, particularly if you feel unable to discuss the concern with me, if an issue remains unresolved, or if you have a safeguarding concern.

Ofsted will evaluate the complaint and determine whether it should be referred to me for internal investigation, inspected during a site visit, or referred to local safeguarding agencies in cases involving child protection.

• Telephone: 0300 123 1231
• Address: Ofsted, Piccadilly Gate, Store Street, Manchester, M1 2WD
• Online Portal: www.gov.uk/government/organisations/ofsted`,
  },
  {
    category: 'Operational & Staffing Policies',
    title: 'Confidentiality, Data Protection, and Photography Policy',
    content: `1. As a solo childminder, I treat all personal information regarding your child and family with strict confidence and professionalism.
• All physical and digital records are stored securely in compliance with UK GDPR and Data Protection regulations.
• Parents have the right to inspect all records relating to their child at any reasonable time, except in rare circumstances where data protection law restricts access to protect the child's best interests.
• Records must be made available to Ofsted or statutory authorities upon request to demonstrate compliance with Early Years Foundation Stage (EYFS) standards.

2. Confidentiality will always be maintained, except where sharing information without consent is necessary to protect a child. Prior permission may not be sought if:
• The child requires urgent medical treatment and parents are unreachable.
• There is a child protection or safeguarding concern where seeking consent would place the child or another individual at increased risk of harm.

3. Use of Mobile Devices, Photography, and Videos
• For business efficiency, I use a single mobile phone for both personal communications and childminding operations. Strict security measures (e.g., biometric locking, strong passwords, and restricted cloud access) are maintained on this device to protect all stored data.
• Photos and videos of minded children are captured solely to document developmental milestones, create Learning Journeys/portfolios, and share key "wow factor" moments with parents.
• Photos and videos will only be taken if parents have completed and signed the explicit photography consent form.
• Media is shared directly with parents via private, individual WhatsApp groups created strictly for your child only. Photos or videos are never shared in group chats with other families, nor posted on public social media platforms, unless explicit, separate consent is granted.
• Children’s full names are not used alongside published photographs or within portfolio displays. Media is periodically reviewed and deleted from the device in line with my Data Protection retention schedule once transferred to official records or sent to parents.`,
  },
  {
    category: 'Operational & Staffing Policies',
    title: 'Smoking, Alcohol, and Substance Policy',
    content: `1. Smoking and Vaping Policy
• In line with the Statutory Framework for the Early Years Foundation Stage (EYFS) for Childminders, smoking or vaping (including the use of e-cigarettes) is strictly prohibited on the premises, in the garden, or in any vehicle used for transporting minded children.
• Children will never be taken into smoky/vaping environments, private dwellings where smoking/vaping takes place, or public spaces where exposure to second-hand smoke or vapour cannot be avoided.
• No household members, visitors, or assistant childminders are permitted to smoke or vape anywhere on the setting’s premises or within sight/reach of the children.

Alcohol, Drugs, and Medication Policy
• I will never be under the influence of alcohol, illegal drugs, or any substance (including legal highs or prescription medication) that impairs my ability or alertness to safely care for children.
• If I am prescribed medication (other than routine, non-impairing treatments) that may impact my fitness to provide childcare, I will consult my GP/medical professional and promptly notify Ofsted as required.
• All medication (whether for minded children, household members, or myself) will always be stored securely out of reach of children.

Safe Collection & Parent Responsibilities
• For safeguarding reasons, children will only be released into the care of a fully competent adult. If a parent or designated emergency contact arrives to collect a child while appearing under the influence of alcohol, drugs, or any substance, I will not release the child.
• In such instances, I will contact alternative secondary emergency contacts listed on the child’s registration form. If necessary, I will notify local Children's Social Care / safeguarding services to ensure the child’s safety.
• If you are attending an event where alcohol may be consumed (e.g., a work event), please arrange for another designated, responsible adult to collect your child, or contact me in advance so alternative arrangements can be made.`,
  },

  // ── 4. Health & Safety Policies ───────────────────────────────────────────
  {
    category: 'Health & Safety Policies',
    title: 'Sickness & Medication Policy',
    content: `While I understand the difficulty of taking time off work, my priority is to maintain a healthy setting and protect all children, myself, and my household from infection.

1. Sickness & Infection Exclusion
• Unwell children who have a high temperature (38C or above) or require infant paracetamol/ ibuprofen to manage a fever must not attend the setting.
• Please notify me as early as possible (and at least within 2 hours of drop-off) if your child shows any signs of illness.

I strictly enforce the following UK Health Security Agency (UKHSA) exclusion periods. Children will not be permitted into the setting until these timeframes have passed:
• Diarrhoea and /or vomiting: Excluded for a minimum of 48 hours after the last episode of diarrhoea or vomiting.
• Chickenpox: Excluded until all blisters/scabs have dried over.
• Conjunctivitis: Excluded for 48 hours or until eyes stop discharging.
• Hand, Foot & Mouth: The child may attend once they feel well enough.
• Measles: Excluded for a minimum of 4 days from the onset of the rash.
• Mumps: Excluded for a minimum of 5 days from the onset of the swelling/swollen glands.
• Scarlet Fever: Excluded until 24 hours after the first dose of appropriate antibiotic treatment has been administered.
• Head Lice: Please notify me immediately so I can alert other parents (anonymously). Children must be treated before returning.

If your child becomes unwell while in my care, I will contact you immediately. You (or an agreed emergency contact) must collect your child promptly.
• I’m required by law to report confirmed and suspected cases of measles, mumps and scarlet fever to my local UKHSA health protection team, Ofsted, within 14 days and notify parents; the affected child will remain strictly anonymous.

Medication & Administering
• I will only administer medication if you have completed and signed a Medication Permission Form.
• All medication (prescription and non-prescription) must be in its original packaging, within date, and clearly labelled with your child’s name and dosage instructions.
• Children starting a new course of prescribed medication (e.g., antibiotics) must complete the first 24–48 hours at home to ensure there are no adverse allergic reactions before returning to my setting.
• You must inform me of any medication administered to your child within the 24 hours before drop-off (time, dose, and medicine type).
• I keep a written log of every dose administered (time, dosage, and date), which you will be asked to sign at pick-up.

Accidents & Existing Injuries
• Minor accidents, bumps, or marks occurring during the day will be logged on an Incident/Accident Report Form. You will be informed and asked to sign it at pick-up (or immediately in the event of a head injury).
• If your child arrives with any pre-existing injuries, bumps, or bruises, I am required to record these alongside your explanation, and you will be asked to sign the log upon drop-off.`,
  },
  {
    category: 'Health & Safety Policies',
    title: 'Accident & Injury Policy',
    content: `As a registered childminder, I hold a valid Paediatric First Aid qualification and maintain fully stocked first aid kits both in my setting and on outings. Your child's safety is my priority.

1. Accidents Occurring in My Care
• Minor Injuries (Cuts, Grazes, Minor Bumps):
o First aid will be administered immediately.
o An Accident Report will be completed, detailing the time, location, nature of the injury, and first aid given.
o You will be informed upon collection (or via message during the day) and asked to review and sign the report. A copy will be provided to you.
• Head Injuries:
o Due to the risk of concussion, I will contact you immediately by phone following any bump to the head, even if it appears minor.
o Your child will be monitored closely for symptoms of deterioration.
• Major Injuries or Medical Emergencies:
o I will immediately call emergency services (999) and administer emergency first aid.
o I will contact you (or your designated emergency contacts) straight away.
o If your child needs to go to the hospital by ambulance before you arrive, I will accompany them and stay with them until you arrive.
o Statutory Reporting: Major injuries, fractures, hospital admissions, or serious incidents will be reported to Ofsted within 14 days, in accordance with EYFS requirements.

2. (Accidents at Home)
To ensure safeguarding standards and maintain accurate health records:
• You must inform me at drop-off if your child has sustained any injury at home or elsewhere (such as bumps, bruises, burns, or scratches).
• We will complete a brief Existing Injury Form at drop-off outlining how the injury occurred, and you will be asked to sign it.`,
  },
  {
    category: 'Health & Safety Policies',
    title: 'Safer Sleep Policy',
    content: `At Divine Heritage, the safety and well-being of sleeping children are paramount. In accordance with the Early Years Foundation Stage (EYFS) Statutory Framework and national Lullaby Trust safer sleep guidelines, I follow strict sleep protocols to reduce the risk of sudden infant death syndrome (SIDS) and ensure all children rest safely.

• Sleeping children are never left unattended. Rest areas are positioned so I can maintain continuous sight and hearing of all children.
• I regularly check (every 10–15 minutes for babies) for breathing, position, and body temperature to monitor for signs of distress.

• Babies (Under 12–18 Months):
o Sleep in a clean, safety-tested travel cot fitted with a firm, flat, well-fitting mattress covered by a clean sheet.
o Travel cot is kept clear of loose bedding, pillows, cot bumpers, soft toys, and duvet covers to eliminate suffocation risks.

• Young Children & Toddlers:
o Rest on individual, clean sleeping mats located safely on the floor in the main room, clear of trailing cords, heat sources, or hazards.

• The main room is kept at a safe, comfortable temperature (ideally 16–20°C). Sleeping areas are well-ventilated and strictly smoke- and vape-free.
• Babies are always placed to sleep on their backs with their feet at the foot of the travel cot.
• Lightweight blankets are tucked securely below shoulder level.
• I monitor children for signs of overheating by checking their neck or chest. Outerwear, hats, and bibs are removed before sleep.
• I work with parents to support individual sleep routines while maintaining strict alignment with statutory safer sleep guidance.`,
  },
  {
    category: 'Health & Safety Policies',
    title: 'Visitors & Safeguarding Policy',
    content: `At Divine Heritage, the safety, security, and well-being of minded children are my highest priorities. In line with the Early Years Foundation Stage (EYFS) Statutory Framework and my safeguarding duties as an Ofsted-registered childminder, I maintain strict procedures regarding who enters my setting during operational hours.

While I recognise the value of children interacting with others, I must ensure that all visitors are suitable and that no unvetted adult has unsupervised access to children in my care.

• All adult (aged 16 or over) who lives on the premises hold an Enhanced Disclosure and Barring Service (DBS) check and are vetted for suitability.
• I will only permit another adult to supervise children independently if they are fully DBS-cleared and vetted (such as another registered childminder or approved assistant).
• My own family members are strictly prohibited from taking minded children to the toilet, changing nappies, or assisting with intimate care routines.
• I strictly verify the official photo identification of any unknown visitor (e.g., inspectors, utility workers, or delivery personnel) before granting entry. I reserve the right to refuse entry to anyone whose identity or business cannot be verified.
• Where possible, maintenance, repairs, and non-essential works are scheduled outside of childminding hours to minimise disruption and potential hazards.
• I maintain a written record of all visitors entering the setting during operational hours. This log details the visitor's name, organisation/reason for visit, arrival and departure times, and is available for parents to inspect upon request.

If you have any questions or concerns regarding these visitor procedures, please feel free to contact me.`,
  },
  {
    category: 'Health & Safety Policies',
    title: 'Health, Safety & Risk Assessment Policy',
    content: `At Divine Heritage, providing a safe, clean, and healthy home environment is central to my practice. In accordance with the Early Years Foundation Stage (EYFS) Statutory Framework and Health and Safety at Work legislation, I maintain strict safety measures, routine risk assessments, and robust hygiene standards to protect every child in my care.

Before minding commences each morning, I conduct a thorough check of all accessible areas:
• I conduct visual and written risk assessments for all outings (e.g., parks, playgroups, walking routes to school). For new or unfamiliar locations, I perform advance assessments whenever possible to identify hazards, assess transport safety, and plan for emergency procedures.
• All formal risk assessments are logged, reviewed annually (or immediately following an incident or change), and remain available for parents and Ofsted inspectors upon request.
• Safety gates protect high-risk areas (e.g., kitchen and entrances), child locks secure hazardous cupboards, and glass protection film is applied to glass cabinets. Wires are kept tidy, and socket safety is regularly evaluated in line with modern electrical safety standards.
• All cleaning chemicals, medicines, and sharp objects (such as kitchen knives) are stored securely in locked cupboards or positioned strictly out of reach.
• Working smoke detectors are fitted, routinely tested, and logged. A fire blanket is maintained in the kitchen, and a clear emergency evacuation route is practised regularly with the children.
• Toys and play equipment are inspected daily for wear and tear, cleaned routinely, and immediately removed or disposed of if damaged or faulty.
• Inspect the living space for trailing wires and trip hazards.
• I teach and model good hygiene practices, including supervised handwashing after using the toilet, outdoor play, or contact with animals, and before eating. Clean disposable tissues and liquid soap are always fully stocked.
• I maintain strict kitchen standards. Fridge temperatures are monitored daily (below 5°C), and waste bins are emptied regularly.
• I encourage healthy eating choices, safe hydration, daily outdoor physical play, and essential life safety skills (such as road safety awareness).`,
  },
  {
    category: 'Health & Safety Policies',
    title: 'Fire safety & Evacuation Procedure',
    content: `In any emergency, the safety and well-being of the children in my care is my absolute priority. I will remain calm, assess the situation quickly, and take immediate action to protect the children. Emergency services will be called without delay whenever required.

• If a fire occurs in the flat, all occupants will immediately exit through the front door.
• I will grab my mobile phone and emergency contact details on the way out, provided it is safe to do so.
• Children able to walk will be guided safely out of the building. Infants or children unable to walk will be carried.
• The designated meeting point is outside by the side of Tesco.
• Once safely outside, I will call emergency services (999) or raise the alarm by calling for help.
• Once the children are safe at the assembly point, I will immediately contact parents to inform them of the situation and arrange collection.
• If a parent is unavailable, I will leave a voicemail and immediately call the secondary emergency contacts listed on the child’s registration form.`,
  },
  {
    category: 'Health & Safety Policies',
    title: 'Risk Assessment Outing Procedure',
    content: `In line with the EYFS Statutory Framework, I conduct systematic risk assessments for all outings to parks, public spaces, and unfamiliar environments to ensure children remain safe, secure, and fully supervised at all times.

1. Pre-Outing Assessment & Planning
• Conduct an advance or virtual check of unfamiliar locations to identify access points, toilets, boundaries, and potential hazards (e.g., open water, road proximity, busy crowds).
• Confirm adult-to-child ratios are suitable for the environment and age/needs of minded children.
• Identify the nearest safe meeting point, emergency exit routes, and local emergency contacts.
• I make sure I have a
o Fully charged mobile phone with emergency contact numbers saved.
o First aid kit
o Spare clothing, wipes, hand sanitiser, and water bottles.
o High-visibility vests and child contact wristbands (displaying my phone number, no child names).

• En Route & Road Safety:
o Younger children are secured in pushchairs, hold hands, or wear safety reins.
o Road safety skills (Stop, Look, Listen) are actively taught and practised at crossings.
• Upon arrival at a park or unfamiliar space, perform an immediate visual sweep for physical hazards (e.g., broken glass, dog foul, faulty play equipment, uncontained boundaries).
• Maintain continuous sight and hearing supervision. Perform headcounts before leaving the setting, upon arrival, during transitions, and before departing.
• Ensure children do not talk to or leave with strangers. Only I manage toilet routines in public facilities.

3. Review & Record Keeping
• Written risk assessment templates are logged and updated before visiting new locations.
• Procedures are reviewed annually or immediately following any minor incident, near-miss, or change in circumstances. All records are available for parent and Ofsted inspection.`,
  },
  {
    category: 'Health & Safety Policies',
    title: 'Useful Contact Details & Policy Review Confirmation',
    content: `Useful Contact details
Emergency 999 (serious crime in progress, danger, life at risk)
Police non-emergency 101
Southwark MASH 020 7525 1921 | MASH@southwark.gov.uk
Southwark LADO 020 7525 3297 | Eva.simcock@southwark.gov.uk
Ofsted concerns/complaints 0300 123 4666 | enquiries@ofsted.gov.uk
NSPCC Helpline 0808 800 5000 | help@nspcc.org.uk

I confirmed that these policies have been reviewed, signed, and will be updated next year by Avril Cole

Updated September 2026 Review September 2027`,
  },
]

// ---------------------------------------------------------------------------
// Sync / Reset to Official Handbook in Firestore
// ---------------------------------------------------------------------------

/**
 * Replaces all documents in the `policies` collection with the official 2026-2027 handbook.
 * Clears old or legacy policies and writes all official policies in a clean batch.
 */
export async function syncOfficialPolicies(): Promise<void> {
  const snap = await getDocs(collection(db, POLICIES_COLLECTION))
  const batch = writeBatch(db)

  // Remove existing policies
  snap.docs.forEach((d) => {
    batch.delete(d.ref)
  })

  // Insert all official policies
  const now = serverTimestamp()
  OFFICIAL_POLICIES.forEach((p, idx) => {
    const ref = doc(collection(db, POLICIES_COLLECTION))
    batch.set(ref, {
      title:       p.title,
      category:    p.category,
      content:     p.content,
      order:       idx,
      isPublished: true,
      createdAt:   now,
      updatedAt:   now,
    })
  })

  await batch.commit()
}

/**
 * Legacy seed function alias — now calls syncOfficialPolicies to guarantee
 * that the new official handbook is loaded.
 */
export async function seedPolicies(): Promise<void> {
  return syncOfficialPolicies()
}
