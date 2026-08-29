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
  return addDocument<Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>>(
    POLICIES_COLLECTION,
    {
      title:       input.title.trim(),
      content:     input.content.trim(),
      order:       input.order,
      isPublished: input.isPublished,
    },
  )
}

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

export async function updatePolicy(id: string, patch: PolicyPatch): Promise<void> {
  const sanitised: PolicyPatch = {}
  if (patch.title       !== undefined) sanitised.title       = patch.title.trim()
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
// Seed data — existing policy content
// ---------------------------------------------------------------------------

interface SeedPolicy {
  title: string
  content: string
}

const SEED_POLICIES: SeedPolicy[] = [
  {
    title: 'Welcome',
    content: `Welcome to Divine Heritage. This handbook provides information about my settings and what Ofsted requires.`,
  },
  {
    title: 'Ethos & Aims',
    content: `"I believe in creating a nurturing environment where the children in my care feel happy, comfortable, and secure. I encourage them to learn through play, helping them to reach their full potential. Each child is treated as an individual with unique ideas and needs. I provide flexibility and continuity in care, allowing their routines to closely mirror those at home, which makes it easier for the children to settle in."

My Aims:

1. To encourage children to be happy and confident
2. To work with you (parent) to provide the best possible care for your child.
3. To promote a caring, safe and stimulating learning environment
4. To provide free-flow play in a safe environment
5. Building a positive relationship
6. To make sure children are competent and creative.
7. I listen and encourage children to share their views and ideas constructively.
8. I promote outdoor activities in my garden where children can learn and play. We also go to playgroups, parks, libraries and local farms.`,
  },
  {
    title: 'Areas of Learning',
    content: `The Early Years stage of learning and development covers three areas, which your child will mostly learn through games and play.

The 7 areas of learning and development consist of 3 prime areas: communication and language, physical development, and personal, social, and emotional development. The 4 specific areas are literacy, mathematics, understanding the world and expressive arts & design.

3 Prime Areas:
- Communication and language
- Physical development
- Personal, social, and emotional development

4 Specific Areas:
- Literacy
- Mathematics
- Understanding the world
- Expressive arts & design`,
  },
  {
    title: 'Assessments',
    content: `I do two types of assessments based on the Early Years Foundation Stage (EYFS).

The Early Years Foundation Stage requires early years practitioners to review children's progress and share a summary with parents at two points:

1. Ongoing Assessment: Ongoing assessments are conducted regularly during pick-up to provide feedback on what the child has learned and what can be done to support their continued learning. This type of assessment is known as a "formative" assessment, as it informs the next steps in the child's development in collaboration with the parent.

2. Summative Assessment: Between the ages of 24 and 36 months via the progress check.`,
  },
  {
    title: 'Observation Policy',
    content: `Guidance to the Foundation Stage Curriculum states: 'Practitioners must be able to observe and respond appropriately to children'.

This principle requires childminders to observe the children and respond appropriately to help them progress. This is demonstrated when childminders:

1. Make systematic observations and assessments of each child's achievements, interests and learning styles.
2. Use these observations and assessments to identify learning priorities and plan relevant and motivating learning experiences for each child.
3. Match their observations to the expectations of the early learning goals.
4. I will follow the Early Years Foundation Stage guidance to assist me in my work.
5. I will make regular observations on your child, using different media, for example, photographs, written observations and video recordings.`,
  },
  {
    title: 'Learning Journey',
    content: `This records your child's learning during their time with me. Observations of your child playing and interacting with others are added alongside photographs and videos. These observations are used to inform planning and assessments. You can add your comments whenever you wish.`,
  },
  {
    title: 'Accident Procedures',
    content: `If a child is injured in my care and the injury is minor (such as a scratch or graze), it will be handled by myself/assistance. An accident form will be completed, and on collection of the child at the end of the day, parents/carers will be required to read and sign the form. A copy will be given to the parent/carer. If a child has an accident and it's a major injury, I will administer first aid and consult the parents/carers, and an accident form will be completed.

Accident at Home: If a child has an accident at home, parents or carers must inform me and complete an accident form. A copy of this form will be provided to the parents or carers.`,
  },
  {
    title: 'Equal Opportunity Policy',
    content: `"I actively promote equal opportunities and anti-discriminatory practices for all children in my care. I recognise the importance of ensuring that no child or parent is discriminated against based on race, gender, class, culture, age, religion, disability, sexual orientation, or family status. I am committed to treating all children according to their individual needs and abilities with respect."

Procedure — How I put the statement into practice:

I value and respect the different racial origins, religions, cultures, and languages in a multi-ethnic society so that each child is valued as an individual without racial or gender stereotyping.

I will also not discriminate against anyone on the grounds of race, gender, disability, sexual orientation, age, or religious beliefs.

I will do my best to use toys, books, etc., to provide positive images of different cultures, racial groups, genders, religions, and disabilities.

I will recognise each child as an individual, treat them fairly and give them opportunities to develop to their full potential.

I will always help children feel good about themselves by celebrating the differences that make us all unique. I will not stereotype any children. I encourage them to play with whatever they wish. Wherever possible, I will allow children to make their own choices regarding activities, play, etc.

I will always encourage children to develop respect for each other's differences and to value everyone as an individual.

I trust parents/carers and children will accept this Equal Opportunities Policy.`,
  },
  {
    title: 'Holidays',
    content: `In every profession, workers will take time off to rejuvenate, reduce stress, and spend time with family. I take 25 days of holiday each year, not including Christmas and bank holidays. I provide four weeks' notice for any holidays I plan to take.

My setting is closed on bank holidays in line with Southwark Council childcare providers. A full fee will still be charged if a bank holiday falls on your child's normal contracted day.

If minded children or parents go on holiday or take any time off, I will charge the full fee, as I need to hold your child's place open during their absence.

If I'm off work on a contracted day, I have backup childminders who will cover for me. These childminders are familiar with your child and the other children they care for. If you would like to meet them beforehand, please let me know. My backup childminders will charge their rates for the day(s) they cover.`,
  },
  {
    title: 'Attendance Policy',
    content: `Although attendance in early years settings is not compulsory, I encourage regular attendance to ensure children gain maximum benefit from their time here. If a child was expected and not brought by parents, I must consider that the absence could be related to safeguarding concerns — for example, a parent having had an accident or died at home, or a child sustaining an injury that parents are hiding from me. The need to monitor children's attendance is also linked to female genital mutilation (FGM) and the Prevent Duty.

Absences will be followed up promptly, including those that occur for a prolonged period or without prior notification from parents. If a child is absent, I will make every effort to contact their parents or emergency contacts. I aim to have up to two or more emergency contacts for each child, in addition to the parents, to help me meet this requirement.

When deciding whether an absence is prolonged, I must consider patterns and trends in the child's absences, the child's personal circumstances, the child's vulnerability, and the vulnerabilities and home life of the parent or carer. If I am concerned about a child's absence and the parents, carers, or the child's emergency contacts are unavailable, I will follow our Safeguarding Procedures and contact local children's social care services and/or the police to request a welfare check.

Note: If the child's family live out of the area, I will also record the contact details for their social care services.`,
  },
  {
    title: 'Emergencies / Back-up Childminder',
    content: `In an emergency where I can't provide childcare, I will contact my backup/colleague to temporarily care for the children until their parents can collect them. There may be occasions when I entrust the children in my care to another reputable, registered childminder.

It is best practice in our profession to have backup plans to ensure the children's safety, especially during unexpected situations. This could involve a trusted family member or another registered childminder who can assist.`,
  },
  {
    title: 'Settling In',
    content: `Settling-in sessions for parents and children allow us to get to know each other.

1. It gives you a chance to provide me with lots of information about your child: their likes and dislikes, routines, favourite activities, how to comfort them if they become upset, and how they have reacted when left with others.
2. I may visit your home to spend time with you and your child. It is a great opportunity to spend time in a relaxed atmosphere, exchanging information and planning your child's start. You will also have the chance to ask questions and express any concerns.
3. Offer staggered admissions.
4. Encourage children to bring a familiar object from home i.e., a teddy or toy.
5. Invite parents to stay with the child as they adjust to the new environment.

I understand that some children may take longer to settle in than others, while some may adjust quickly and become upset a few weeks later. I am here to support you and your child during this transition period to ensure it goes as smoothly as possible.

Parents are welcome to contact me daily to check their child's health. If I cannot answer your call right away, please don't worry; I may be assisting another child. I will return your call as soon as possible within a reasonable timeframe.`,
  },
  {
    title: 'Sick / Medication Policy',
    content: `(This forms part of my Health and Safety Policy)

Whilst I understand that it is difficult for you to take time off from work to look after a sick child, I must protect other children in my care and myself, from infection.

1. Parents will be informed of any accidents. An accident that requires ice packs, marks, bruises, or bumps will be logged and parents will have to sign. Any bumps or bruises that your child arrives with will also be recorded with a brief explanation.
2. You will be required to fill in a medicine record should your child require any medication whilst in my care.
3. You must provide the medication/treatment you wish me to administer in its original packaging and you must have signed a "Non-prescription Medicine Permission Form" in advance.
4. It is vital that you inform me of any medication you have given your child within 24 hours before they arrive at my care.
5. I will ensure that all medication I receive is stored properly and that I check that it is still within its expiry date. Under no circumstances will I administer expired medication.
6. I will keep a written record, and I'll inform parents of when and what times medications were administered.

I reserve the right to follow NHS Public Health England's guidance regarding infectious diseases. Any child excluded due to an illness or infectious disease will not be allowed to return until they have been symptom-free for 48 hours.

Exclusion Guidelines:
1. Children who have shown signs of vomiting or have diarrhoea. They must be kept away for 48 hours after the vomiting or diarrhoea have ceased.
2. Children with chicken pox must be kept at home until all scabs are dry.
3. Children with conjunctivitis must stay home for at least 48 hours or until their eyes are no longer watering.
4. Hand, Foot & Mouth Disease, Ringworm, Scabies, Scarlet fever, Threadworms.
5. Hepatitis A, Impetigo, Measles, Mumps, Rubella (German Measles), Tuberculosis etc.

Children who are unwell or have had a fever in the last 24 hours must stay home. Parents must notify me if their child is unwell or has displayed any signs of illness in the last 2 hours before drop-off.

Head Lice must be reported to me so that I can inform other parents. Please treat your child if you discover head lice!`,
  },
  {
    title: 'Prevent Duty',
    content: `As a Childcare provider, I must comply with the Prevent Duty Guidance requirement to protect children within my setting from radicalisation, extremism, and being drawn into terrorism. I am aware of the Government's prevention strategy, which aims to protect children from terrorism and radicalisation, and I have incorporated the strategy into my safeguarding procedures.

1. To protect children in my care, I will be alert to any reason for concern in the child's life at home or elsewhere. This includes awareness of the expression of extremist views.
2. Assessing the risk of children being drawn into terrorism.
3. Demonstrate that children are protected from being drawn into terrorism by having robust safeguarding policies.
4. Ensure that safeguarding arrangements are included in the policies and procedures of the Local Safeguarding Children Board.
5. Keeping myself abreast and having training that gives me the knowledge and confidence to identify children at risk of being drawn into terrorism.
6. Committed to teaching the children British Values, i.e. democracy, the rule of law, individual liberty and personal responsibility, mutual respect and tolerance of those of different cultures, faiths and beliefs.`,
  },
  {
    title: 'Visitors Policy',
    content: `As an Ofsted-registered Childminder, I know my role in keeping your child safe. While children need to mix with other children and adults, my responsibility is to ensure the suitability of the people they meet during busy hours.

1. Any regular visitors to my setting will need to complete a DBS check.
2. I will not leave a minded child in a room alone with a visitor, unless I know they have been DBS cleared.
3. I will not allow any visitors or my children to take children to the toilet or change them.
4. I will check the identification of any visitors unknown to me and refuse entry to anyone whose identification I cannot verify.
5. If possible, I will arrange for workmen and maintenance to my property outside of working hours.
6. I will maintain written records / have a visitor's book available for you to look at.

If you have any concerns regarding this matter, please do not hesitate to contact me.`,
  },
  {
    title: 'Confidentiality',
    content: `I endeavour to take a professional approach to confidentiality. I will not share confidential or sensitive information about children or their families without the family's permission. Information on children and families I work with will be kept secure and treated in confidence.

I will only break this rule in the interest of protecting a child. There may be circumstances when the parents' permission is not appropriate or able to be sought, as would be the case if the child required urgent medical attention or if there appeared to be a safeguarding issue.

Ofsted may ask to see my records at any time.

I will not use any photographs of the minded children other than for the Learning Journey. No photographs will be taken without signed authorisation from the parents, and it will be in line with the Data Protection Policy.

Parents have the right to inspect all records about their child at any time, except in exceptional cases where data protection laws stipulate that it is against the child's best interests to do so.`,
  },
  {
    title: 'Use of Mobile Telephones and Cameras',
    content: `When children are present in the setting, parents or visitors are prohibited from using mobile phones, video recording devices, or cameras. This measure is intended to prevent unauthorised photographs, videos, and recordings.`,
  },
  {
    title: 'Emergency Plan & Fire Evacuation',
    content: `In an emergency, I will strive to remain calm and handle the situation to the best of my ability. I will always ensure that all children are safe and, if necessary, removed from the immediate area. I will assess the situation and decide if there is a need to call the emergency services.

If the emergency involves a fire in the kitchen or main room, I will exit the flat by the front door. I grab my phone and call emergency services or shout for help. I will assemble the children outside by the side of Tesco. Any child who is unable to walk, I'll carry.

I will contact the parents of all the children and inform them of the situation. If the parents are not available, I will leave a message and a contact number, and try to contact another "emergency contact", who is on the child's registration form.`,
  },
  {
    title: 'Smoking Policy',
    content: `I apply a strict No Smoking policy to my home.

I shall not take minded children to any private dwelling where smoking is permitted.

Smoking is prohibited by law in all enclosed public spaces.

I will not take the children into smoky environments and will avoid places that permit smoking wherever possible.

This policy supports the Early Years Foundation Stage Safeguarding and Welfare Requirements 2014 requirements and standards.`,
  },
  {
    title: 'Procedure if a Child Is Not Collected',
    content: `1. It is crucial to arrive at the scheduled time to collect your child. Even young children learn routines and know when their parents are expected. They can become anxious if you are late.
2. Please inform me by telephone, at the earliest opportunity, if you expect to be late or if your child will not be attending for any reason.
3. If a child is not collected within 15 minutes of their agreed collection time, and I have not been informed of their late collection, I will try calling the parents' contact numbers. Then I will try the emergency contact numbers.
4. During this time, I will continue to care for the child safely and will keep attempting to contact the parents and their emergency contacts.
5. If the child is not collected after 30 minutes, I will then contact my local authority duty social worker and follow their advice.
6. This follows the Ofsted National Childminding Standards concerning child safety.`,
  },
  {
    title: 'Lost / Missing Child',
    content: `The care of your child is paramount, and I will always try to ensure that they remain with me and are safe. However, sometimes children can become 'lost' in busy places, and as a responsible childminder, I have written a procedure that will be followed in the unlikely event of this happening.

I will immediately raise the alarm to all around me that I have lost a child and enlist the help of everyone to look for them.

If it is a secure area such as a shopping centre, I will quickly alert the security staff, so they can seal off exits and monitor the situation on any CCTV. I will provide everyone involved in the search with a description of the child. I will reassure the other children, as they may be distressed.

I will then alert the police and provide a full description, and alert the parents of the situation.

I take precautions to avoid situations like this from happening by implementing the following measures:

1. Ensuring children are on reins or holding my hand or the pushchair when we are out.
2. Avoid going to overcrowded places.
3. I will ensure the children wear wristbands with my mobile number when going on outings outside the local area.
4. I will teach the children the dangers of wandering off and talking to strangers.`,
  },
  {
    title: 'Behaviour Management',
    content: `I aim to set good behaviour by setting a good example to the children.

- I will not smack or shake any child.
- I will not humiliate any child.
- I will encourage children to share and reward good behaviour.
- I will praise and approve of good behaviour.
- I will attempt to distract and redirect a child who is misbehaving.
- If the misbehaviour continues, I will remove the child from the situation. If the child is old enough to understand, I will take them to a calm-down area for five minutes to reflect on their behaviour.
- I will explain to the children why I feel their behaviour is unacceptable.
- I will only consider physical intervention if a child is in danger, e.g. if they are about to run into the road or are about to hurt another child.

I expect the children to abide by the house rules (as appropriate for their age and stage of development). I will discuss and agree on behaviour management methods with the parents.

Suppose a child continues to act unacceptably and is a danger to other children and myself. In that case, I will try to gain support from different services to address their behaviour before their contract is terminated. This would only be if all possible steps to improve the behaviour had failed or if the child caused severe injury to another person.`,
  },
  {
    title: 'Alcohol, Drugs & Smoking Policy',
    content: `As an Ofsted registered Childminder, I work alone and will have sole responsibility for your child whilst they are in my care. I must be alert to any dangers and able to protect him/her. To do this effectively, I must not be under the influence of any form of drugs (including some prescription medications). I do not drink or smoke at all.

If you have been drinking, perhaps at a work Christmas party or whilst entertaining clients, I would prefer if you arranged for another responsible adult to collect your child, especially if you plan to drive home. Alternatively, you may call me, and I can delay the pickup time if possible.`,
  },
  {
    title: 'Complaints Policy',
    content: `As a registered childminder, I aim to work closely with all parents to meet their children's needs. If you have a complaint about any aspect of my care of your child, please bring it to my attention, and hopefully, we can resolve it amicably.

I prefer to deal with complaints informally wherever possible and would hope to be able to resolve any issues through open discussion.

If a parent feels unable to discuss an area of concern directly with me or has previously discussed their problem with me but remains unhappy, they should contact Ofsted.

The complaints record will include:
1. The nature of the complaint.
2. How I dealt with the complaint.
3. Any actions taken or proposed because of my findings.
4. Whether the parent has been provided with an account of the findings and any action taken within 28 days after the complaint was made.

Investigation Record Details:
1. Name of the person making the complaint
2. The nature of the complaint
3. Date and time of complaint
4. The outcome of the complaint investigation
5. Details of the information and findings given to the person making the complaint, and any action taken.

I will provide a summary of the complaint on request to any parent of a child for whom I act as a childminder or to Ofsted.

OFSTED Contact: Piccadilly Gate, Store Street, Manchester, M1 2WD — Tel: 0300 123 1231`,
  },
  {
    title: 'Safeguarding Child Policies',
    content: `As a registered childminder and the designated officer for my childminding setting, I have always considered the safety and protection of children in my care to be of utmost importance.

I understand that abuse can be emotional, physical, sexual or neglect. Parents must notify me of any concerns about their child and any accidents, incidents or injuries affecting the child, which will be recorded.

If I notice anything that gives me cause for concern, such as:
1. Significant changes in the child's behaviour
2. Unexpected bruising or marks
3. Comments that cause concern
4. Play and language that indicate sexual knowledge beyond a child's years
5. Deterioration in general well-being

I will:
- Refer a child, if there are concerns about possible abuse, to the Children and Young People Service Multi-Agency Safeguarding Hub (MASH). Referrals will be made in writing, following a telephone call.
- Keep written records of concerns about a child, even if there is no need to make an immediate referral.
- Liaise with other agencies and professionals.
- Attend case conferences, or other multi-agency planning meetings, as necessary.
- Inform my local child protection agency (MASH) and Ofsted of any serious accident, illness, or injury involving any child under my care. Ofsted will be notified within 14 days.

Procedure if an allegation is made against me:
- I will contact the Local Authority Designated Officer (LADO) immediately to discuss the nature of the allegation and the appropriate action to be taken.
- I will write a detailed record of all related incidents, including what was said and by whom, with times and dates.
- If an allegation is made against me or anyone within my setting, I will report it to Ofsted and LADO within fourteen days, following the local Safeguarding Children Board procedures.`,
  },
  {
    title: 'Useful Telephone Numbers',
    content: `MASH Team (Multi-Agency Safeguarding Hub)
Daytime: 0207 525 1921
Out of hours: 0207 525 5000

Quality Assurance Unit Service Manager (LADO)
Tel: 0207 525 3295

Quality Assurance Unit Duty Number
Tel: 0207 525 3297

Head of Social Work Improvement & Quality Assurance
Tel: 020 7525 0387

NSPCC 24-hour Child Protection Helpline
Tel: 0808 800 5000

Ofsted
Piccadilly Gate, Store Street, Manchester M1 2WD
Tel: 0300 123 1231`,
  },
  {
    title: 'Health & Safety — Home Environment',
    content: `The Health and Safety of your child is important. These are some of the procedures in place to support this:

- All unused electrical sockets accessible to young children have appropriate safety covers fitted. Toys are regularly inspected and cleaned to ensure they are safe for use.
- Cleaning products and materials are kept in a cupboard and out of reach of small children.
- Medicines are kept out of reach of small children.
- A safety gate is fitted in the kitchen.
- I use appropriate safety equipment for the children in my care, such as cupboard locks.
- All glass cabinets have a glass protection film.
- The kitchen has a fire blanket in case there is a fire.
- I will ensure the first aid box is up to date.
- I maintain a clean kitchen and adhere to food hygiene guidelines, such as ensuring the fridge is at the correct temperature.
- Waste bins are emptied regularly.
- I encourage good hygiene skills in the children and myself, such as washing hands after going to the toilet and before touching food.
- I will teach children safety skills, such as how to cross the road safely.
- I will encourage the children to make healthy food choices and to do physical exercise.
- I have smoke detectors which are routinely tested to be in working order.
- I will remove toys or equipment found to be faulty from areas where children can access them.`,
  },
  {
    title: 'Risk Assessment — My Premises',
    content: `As a registered childminder, my home is clean and checked before the minded children arrive to ensure the environment is safe for them to play. I also risk assess any environment I take the children into, such as walking to school, shops, parks, playgroups, etc.

If I'm taking the children into unknown environments, I will try to do a risk assessment in advance, so I am aware of any potential hazards, although this may not always be possible.

I will keep records of my assessments, which will be stored in a file. These documents are available for parents and Ofsted upon request.

Each day before I commence minding I shall:
- Check that the door slams are in position
- Ensure that the wall unit cabinet is locked and sealed with a child lock
- Check that the socket covers are in place
- Check that bins are emptied
- Check that knives and sharp objects are out of reach in the kitchen
- Check that the toilet is clean, and all chemicals are out of reach
- Ensure that enough soap, towels, toilet rolls and tissues are available
- Ensure that the living room is clean and tidy
- Check the temperature of the fridge
- Check that the wires are not trailing anywhere

I will carry out visual checks before children arrive, and review as necessary throughout the day.`,
  },
  {
    title: 'Risk Assessment — Outing',
    content: `This is reviewed before each outing, and any incidents are recorded in my accident/incident book. I will remember to take my mobile telephone, emergency contact numbers and a first aid kit.

Type of outing: Park — How we get there: Walking

Potential risks on the journey and how I will minimise these risks:
1. I will look for animal faeces and broken glass on the path to ensure that no one steps on it.
2. I will check for overhanging bushes and branches to ensure they will not scratch a child's face or go into their eyes.
3. If we encounter a dog, I will teach the children to stay calm and ask the owner if the dog is friendly.
4. I will teach the children about road safety by ensuring we cross at a visible stop; look left, right and left again before crossing; use pedestrian crossings where available.
5. I will harness the child while the others will be in a pushchair to avoid anyone getting lost.

Potential risks once we arrive and how I will minimise these risks:
1. To stop a child from getting lost, I'll ensure we're always together and constantly keeping an eye on them.
2. To prevent a child from getting hurt, I will teach them to avoid going behind and in front of swings.
3. I will ensure that the child is using play equipment appropriate for their stage of development/age.
4. To avoid a child going with someone they don't know, I will teach them basic 'Stranger Danger' rules.
5. I will check for broken glass and animal faeces; if found, I will remove it using plastic gloves and paper tissues.`,
  },
]

/**
 * Seeds the `policies` Firestore collection with the existing website policy content.
 * Idempotent — checks existing titles before inserting to avoid duplicates.
 */
export async function seedPolicies(): Promise<void> {
  const q = query(collection(db, POLICIES_COLLECTION))
  const snapshot = await getDocs(q)
  const existingTitles = new Set(
    snapshot.docs.map((d) => {
      const data = d.data() as Partial<Policy>
      return data.title ?? ''
    })
  )

  const toInsert = SEED_POLICIES.filter((p) => !existingTitles.has(p.title))
  if (toInsert.length === 0) return

  const maxOrder = snapshot.docs.reduce((max, d) => {
    const data = d.data() as Partial<Policy>
    return Math.max(max, data.order ?? 0)
  }, -1)

  const batch = writeBatch(db)
  const now = serverTimestamp()

  toInsert.forEach((seed, idx) => {
    const ref = doc(collection(db, POLICIES_COLLECTION))
    batch.set(ref, {
      title:       seed.title,
      content:     seed.content,
      order:       maxOrder + 1 + idx,
      isPublished: true,
      createdAt:   now,
      updatedAt:   now,
    })
  })

  await batch.commit()
}
