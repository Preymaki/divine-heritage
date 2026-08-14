export interface Activity {
  id: string
  icon: string
  title: string
  description: string
  colour: string
}

export const ACTIVITIES: Activity[] = [
  {
    id: 'outdoor-play',
    icon: 'TreePine',
    title: 'Indoor & Outdoor Play',
    description: 'Daily active play in a spacious setting and secure garden to explore and develop physical skills.',
    colour: '#6b9e7a',  // sage
  },
  {
    id: 'creative-play',
    icon: 'Shapes',
    title: 'Creative Play',
    description: 'Imaginative free play with dressing up, building, role play, and open-ended toys.',
    colour: '#3a6be7',  // blue
  },
  {
    id: 'arts-crafts',
    icon: 'Palette',
    title: 'Arts & Crafts',
    description: 'Painting, drawing, collage, and craft activities that spark creativity and develop fine motor skills.',
    colour: '#e0289b',  // pink
  },
  {
    id: 'story-time',
    icon: 'BookOpen',
    title: 'Story Time',
    description: 'Daily shared reading, storytelling, and book exploration to build a love of language and literature.',
    colour: '#1e56d0',  // blue
  },
  {
    id: 'music-movement',
    icon: 'Music',
    title: 'Music & Movement',
    description: 'Songs, rhymes, dancing, and musical instruments to support language, coordination, and joy.',
    colour: '#f054af',  // soft pink
  },
  {
    id: 'library',
    icon: 'Library',
    title: 'Library Visits',
    description: 'Weekly trips to the local library for story sessions, book selection, and community connection.',
    colour: '#1845aa',  // dark blue
  },
  {
    id: 'playgroups',
    icon: 'Users',
    title: 'Community Playgroups',
    description: 'Regular attendance at local playgroups to develop social skills and build friendships.',
    colour: '#e0289b',  // pink
  },
  {
    id: 'sensory-play',
    icon: 'Sparkles',
    title: 'Sensory Play',
    description: 'Carefully planned sensory activities — sand, water, dough, and textures — to stimulate curiosity.',
    colour: '#3a6be7',  // blue
  },
  {
    id: 'healthy-snacks',
    icon: 'Apple',
    title: 'Healthy Meal Routine',
    description: 'Children bring in their own food, supported with healthy eating habits and structured mealtime routines.',
    colour: '#6b9e7a',  // sage
  },
  {
    id: 'quiet-time',
    icon: 'Moon',
    title: 'Quiet & Rest Time',
    description: 'Calm, restorative periods with puzzles, books, and relaxation — essential for emotional balance.',
    colour: '#1e56d0',  // blue
  },
]
