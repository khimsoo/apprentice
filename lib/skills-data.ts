export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type ResourceType = 'video' | 'course' | 'podcast' | 'practice' | 'insight'

export interface Resource {
  title: string
  description: string
  url?: string
  type: ResourceType
  difficulty: Difficulty
  note?: string
}

export interface SkillCategory {
  id: string
  title: string
  resources: Resource[]
}

export interface PracticeDay {
  label: string
  focus: string
}

export interface Skill {
  slug: string
  title: string
  description: string
  categories: SkillCategory[]
  practiceRoutine: {
    title: string
    schedule: PracticeDay[]
    tip: string
  }
  difficultyMap: { level: string; focus: string }[]
  warnings: string[]
}

const productManagement: Skill = {
  slug: 'product-management',
  title: 'Product Management',
  description:
    'Curated, high-quality resources for PM interview prep — organised by skill area and difficulty. Prioritises deep, practical, interview-relevant content over fluffy intros.',
  categories: [
    {
      id: 'product-sense',
      title: 'Product Sense & Design',
      resources: [
        {
          title: 'Product Sense Basics Course',
          description:
            'Structured intro to product breakdown, metrics, and user journeys. Good starting framework before interviews.',
          type: 'course',
          difficulty: 'beginner',
          note: 'Free preview sections available',
        },
        {
          title: '"Design a Product" walkthrough — Ex-Google PM',
          description: 'Ex-Google PM solving a product design question step-by-step.',
          url: 'https://www.youtube.com/watch?v=V6hZ0P8wG9Q',
          type: 'video',
          difficulty: 'beginner',
        },
        {
          title: 'Design a learning experience product for YouTube',
          description:
            'Real interview prompt with structure cues. Practise framing, clarifying, and solutioning.',
          type: 'practice',
          difficulty: 'intermediate',
          note: 'Real-world question format',
        },
        {
          title: 'Product Sense frameworks — Exponent-style walkthroughs',
          description: 'Covers user segmentation, pain points, and prioritisation.',
          url: 'https://www.youtube.com/watch?v=2n5t6vY0K6E',
          type: 'video',
          difficulty: 'intermediate',
        },
        {
          title: 'YouTube PM Interview Course (case-heavy)',
          description:
            'Deep deliberate practice with real company context. Focus on how YouTube evaluates PMs — very practical. 700+ cases.',
          type: 'course',
          difficulty: 'advanced',
        },
      ],
    },
    {
      id: 'metrics',
      title: 'Metrics, Analytics & Execution',
      resources: [
        {
          title: '"North Star Metric explained"',
          description: 'Clear explanation with examples from Spotify and Airbnb.',
          url: 'https://www.youtube.com/watch?v=5k2Z7l4K0Z8',
          type: 'video',
          difficulty: 'beginner',
        },
        {
          title: 'Acing Product Management Interviews (Coursera)',
          description:
            'Covers metrics, estimation, and execution rounds. Includes assignments — rare for free-ish content.',
          type: 'course',
          difficulty: 'intermediate',
        },
        {
          title: 'PM Interview Question Bank (3,000+ questions)',
          description:
            'One of the best structured repositories across metrics, growth, and execution. Use for daily drills.',
          type: 'practice',
          difficulty: 'advanced',
        },
      ],
    },
    {
      id: 'experimentation',
      title: 'Experimentation (A/B Testing & Growth)',
      resources: [
        {
          title: '"A/B Testing Explained Simply"',
          description: 'Covers hypothesis → control → variant → metrics.',
          url: 'https://www.youtube.com/watch?v=lKzjJk3h7zY',
          type: 'video',
          difficulty: 'beginner',
        },
        {
          title: 'A/B Testing Crash Course for Product Managers',
          description:
            'Covers experimentation loop, hypothesis prioritisation. Includes hiring/interview angles.',
          type: 'course',
          difficulty: 'intermediate',
        },
        {
          title: 'Practitioner insight: Explain the full experiment arc',
          description:
            'Focus on explaining goal → metric → MDE → runtime rather than deep statistics.',
          type: 'insight',
          difficulty: 'intermediate',
          note: 'Consensus from practitioner discussions',
        },
        {
          title: 'Complete A/B Testing Course with Interview Guide',
          description:
            'Covers statistical rigor (p-values, power, sample size). Includes interview questions and real company examples.',
          type: 'course',
          difficulty: 'advanced',
        },
      ],
    },
    {
      id: 'strategy',
      title: 'Product Strategy & Thinking',
      resources: [
        {
          title: '"Product Strategy in 10 Minutes"',
          description: 'Quick, clear overview of product strategy fundamentals.',
          url: 'https://www.youtube.com/watch?v=K7xYk3g1w6Y',
          type: 'video',
          difficulty: 'beginner',
        },
        {
          title: 'Product teardown videos (Airbnb, Uber)',
          description:
            'Focus on growth loops, monetisation, and retention levers. Watch with a critical lens.',
          type: 'video',
          difficulty: 'intermediate',
        },
        {
          title: 'Crash Course in PM Interviews — Google PM Podcast',
          description:
            'Emphasises differentiated thinking, pragmatic execution, and avoiding unrealistic "10x but impossible" ideas.',
          type: 'podcast',
          difficulty: 'advanced',
        },
      ],
    },
    {
      id: 'interview-techniques',
      title: 'PM Interview Techniques',
      resources: [
        {
          title: '"PM Interview Overview (types of questions)"',
          description: 'Covers the main question types: product design, metrics, execution, estimation, and behavioural.',
          url: 'https://www.youtube.com/watch?v=YQ8kG0k9F6E',
          type: 'video',
          difficulty: 'beginner',
        },
        {
          title: 'Acing PM Interviews (structured modules + exercises)',
          description:
            'Covers behavioural, product design, execution, and estimation rounds with structured modules.',
          type: 'course',
          difficulty: 'intermediate',
        },
        {
          title: 'YouTube PM Interview Course (case-driven)',
          description: 'Case-driven with feedback loops. Best paired with recorded self-practice.',
          type: 'course',
          difficulty: 'advanced',
        },
        {
          title: 'PM Exercises Question Bank',
          description: 'Practice by category. Best practice: 1 question/day, recorded, compared against frameworks.',
          type: 'practice',
          difficulty: 'advanced',
        },
      ],
    },
  ],
  practiceRoutine: {
    title: 'Weekly Practice Routine (High ROI)',
    schedule: [
      { label: 'Day 1–2', focus: 'Product design — 1 case per day' },
      { label: 'Day 3', focus: 'Metrics / execution' },
      { label: 'Day 4', focus: 'Experimentation' },
      { label: 'Day 5', focus: 'Strategy / teardown' },
      { label: 'Weekend', focus: 'Mock interview (recorded)' },
    ],
    tip: 'Interview success depends more on structured thinking + practice than background. Consuming content is not practicing.',
  },
  difficultyMap: [
    { level: 'Beginner', focus: 'Frameworks + terminology' },
    { level: 'Intermediate', focus: 'Structured answering + case practice' },
    { level: 'Advanced', focus: 'Speed, clarity, trade-offs, realism' },
  ],
  warnings: [
    'Generic "What is PM?" courses — low ROI',
    'Passive YouTube bingeing without applying frameworks',
    'Over-indexing on frameworks without deliberate practice',
    'Many courses are "too basic" unless applied deeply',
  ],
}

export const skills: Skill[] = [productManagement]

export function getSkillBySlug(slug: string): Skill | undefined {
  return skills.find((s) => s.slug === slug)
}
