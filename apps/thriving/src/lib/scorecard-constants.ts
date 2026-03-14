import type { DomainKey } from '@upp/db'

export interface Domain {
  key: DomainKey
  name: string
  icon: string
  color: string
  category: string
}

export interface ScenarioOption {
  text: string
  score: number
}

export interface ScenarioQuestion {
  domain: DomainKey
  text: string
  options: ScenarioOption[]
}

export interface SliderQuestion {
  domain: DomainKey
  text: string
  min: number
  max: number
  multiplier: number
  lowLabel: string
  highLabel: string
}

export const DOMAINS: Domain[] = [
  { key: 'physical',      name: 'Physical Health',           icon: '💪', color: '#0891B2', category: 'Foundation'   },
  { key: 'mental',        name: 'Mental & Emotional Health', icon: '🧠', color: '#06B6D4', category: 'Foundation'   },
  { key: 'spiritual',     name: 'Spiritual Health',          icon: '✨', color: '#A855F7', category: 'Direction'    },
  { key: 'purpose',       name: 'Purpose & Identity',        icon: '🎯', color: '#8B5CF6', category: 'Direction'    },
  { key: 'character',     name: 'Character & Virtue',        icon: '⭐', color: '#7C3AED', category: 'Direction'    },
  { key: 'relationships', name: 'Close Relationships',       icon: '❤️', color: '#DC2626', category: 'Connection'   },
  { key: 'social',        name: 'Social & Community',        icon: '👥', color: '#EF4444', category: 'Connection'   },
  { key: 'financial',     name: 'Financial Stability',       icon: '💰', color: '#D97706', category: 'Impact'       },
  { key: 'growth',        name: 'Learning & Growth',         icon: '📚', color: '#059669', category: 'Growth'       },
  { key: 'adventure',     name: 'Adventure & Play',          icon: '⛰️', color: '#10B981', category: 'Growth'       },
  { key: 'environment',   name: 'Home & Environment',        icon: '🏠', color: '#1E40AF', category: 'Environment'  },
]

export const SCENARIO_QUESTIONS: ScenarioQuestion[] = [
  { domain: 'physical', text: 'Which best describes your physical health habits?', options: [
    { text: 'I rarely move my body, eat poorly, and feel low energy most days.', score: 2 },
    { text: 'I\'m inconsistent — some good weeks, but I fall off track easily.', score: 4.5 },
    { text: 'I exercise a few times a week, eat reasonably well, and generally feel good.', score: 7 },
    { text: 'I have strong routines for movement, nutrition, and recovery. I feel great.', score: 9 },
  ]},
  { domain: 'mental', text: 'Which best describes your mental and emotional wellbeing?', options: [
    { text: 'I often feel overwhelmed, anxious, or emotionally depleted.', score: 2 },
    { text: 'I manage okay but struggle with stress or emotional regulation at times.', score: 4.5 },
    { text: 'I generally feel stable and can handle life\'s challenges reasonably well.', score: 7 },
    { text: 'I feel emotionally resilient, grounded, and mentally sharp most of the time.', score: 9 },
  ]},
  { domain: 'spiritual', text: 'Which best describes your sense of spiritual health or inner peace?', options: [
    { text: 'I feel disconnected from any deeper meaning or inner peace.', score: 2 },
    { text: 'I occasionally connect with something larger than myself but it\'s inconsistent.', score: 4.5 },
    { text: 'I have a fairly clear sense of what I believe and find moments of peace regularly.', score: 7 },
    { text: 'I feel deeply connected to my values, faith, or sense of purpose and it grounds me daily.', score: 9 },
  ]},
  { domain: 'purpose', text: 'Which best describes your sense of purpose and identity?', options: [
    { text: 'I feel lost or uncertain about who I am and what I\'m here to do.', score: 2 },
    { text: 'I have some sense of direction but it\'s fuzzy or I\'m still figuring it out.', score: 4.5 },
    { text: 'I have a reasonably clear sense of purpose that guides most of my decisions.', score: 7 },
    { text: 'I live with a strong, clear sense of identity and purpose that energizes me daily.', score: 9 },
  ]},
  { domain: 'character', text: 'Which best describes how well you live by your values?', options: [
    { text: 'I often act in ways that conflict with my stated values.', score: 2 },
    { text: 'I try to live by my values but frequently compromise them under pressure.', score: 4.5 },
    { text: 'I mostly live in alignment with my values, with occasional lapses.', score: 7 },
    { text: 'I consistently act with integrity and feel proud of how I show up.', score: 9 },
  ]},
  { domain: 'relationships', text: 'Which best describes the quality of your closest relationships?', options: [
    { text: 'My close relationships feel strained, distant, or absent.', score: 2 },
    { text: 'I have some close relationships but they feel surface-level or complicated.', score: 4.5 },
    { text: 'I have a few meaningful relationships with genuine trust and connection.', score: 7 },
    { text: 'My close relationships are deep, reciprocal, and a source of real strength.', score: 9 },
  ]},
  { domain: 'social', text: 'Which best describes your sense of community and belonging?', options: [
    { text: 'I feel isolated or like I don\'t really belong anywhere.', score: 2 },
    { text: 'I have some social connections but don\'t feel deeply part of a community.', score: 4.5 },
    { text: 'I have a social circle and feel a reasonable sense of belonging.', score: 7 },
    { text: 'I feel genuinely embedded in community and it\'s a meaningful part of my life.', score: 9 },
  ]},
  { domain: 'financial', text: 'Which best describes your financial situation?', options: [
    { text: 'I\'m in financial distress — debt, instability, or crisis.', score: 1.5 },
    { text: 'I cover my basics but have little savings and live close to the edge.', score: 4 },
    { text: 'I\'m financially stable with some savings and a manageable plan.', score: 6.5 },
    { text: 'I have strong financial foundations — savings, investments, and clear goals.', score: 9.5 },
  ]},
  { domain: 'growth', text: 'Which best describes your commitment to learning and growth?', options: [
    { text: 'I rarely challenge myself to learn or grow.', score: 2 },
    { text: 'I occasionally learn new things but don\'t pursue growth intentionally.', score: 4.5 },
    { text: 'I regularly invest in my development through reading, courses, or new experiences.', score: 7 },
    { text: 'Growth is a core part of how I live — I\'m always stretching and evolving.', score: 9 },
  ]},
  { domain: 'adventure', text: 'Which best describes the role of adventure and play in your life?', options: [
    { text: 'I rarely do anything for pure fun or adventure.', score: 2 },
    { text: 'I occasionally have fun but it\'s not a real priority.', score: 4.5 },
    { text: 'I make time for hobbies and adventures that genuinely light me up.', score: 7 },
    { text: 'Adventure and play are woven into my life — I feel alive and energized regularly.', score: 9 },
  ]},
  { domain: 'environment', text: 'Which best describes your home and physical environment?', options: [
    { text: 'My environment feels chaotic, unsafe, or deeply unsatisfying.', score: 2 },
    { text: 'My environment is functional but often cluttered, stressful, or uninspiring.', score: 4.5 },
    { text: 'My home and environment are reasonably organized and generally feel good.', score: 7 },
    { text: 'My environment is intentional, restorative, and a source of real comfort and joy.', score: 9 },
  ]},
]

export const SLIDER_QUESTIONS: SliderQuestion[] = [
  { domain: 'physical',      text: 'How many days in a typical week do you get 7+ hours of quality sleep?', min: 0, max: 7,  multiplier: 10/7,  lowLabel: '0 days',          highLabel: '7 days'           },
  { domain: 'mental',        text: 'How many days per week do you feel genuinely calm and in control?',       min: 0, max: 7,  multiplier: 10/7,  lowLabel: '0 days',          highLabel: '7 days'           },
  { domain: 'spiritual',     text: 'How connected do you feel to a sense of meaning or inner peace?',         min: 0, max: 10, multiplier: 1,     lowLabel: 'Not at all',      highLabel: 'Deeply connected' },
  { domain: 'purpose',       text: 'How clearly defined is your sense of purpose right now?',                 min: 0, max: 10, multiplier: 1,     lowLabel: 'Totally unclear', highLabel: 'Crystal clear'    },
  { domain: 'character',     text: 'How consistently do you act in alignment with your values?',              min: 0, max: 10, multiplier: 1,     lowLabel: 'Rarely',          highLabel: 'Almost always'    },
  { domain: 'relationships', text: 'How many people could you call at 2 AM in a genuine crisis?',            min: 0, max: 5,  multiplier: 2,     lowLabel: '0 people',        highLabel: '5+ people'        },
  { domain: 'social',        text: 'How strong is your sense of community and belonging?',                   min: 0, max: 10, multiplier: 1,     lowLabel: 'Very weak',       highLabel: 'Very strong'      },
  { domain: 'financial',     text: 'If you lost your income today, how many months could you sustain your lifestyle?', min: 0, max: 12, multiplier: 10/12, lowLabel: '0 months', highLabel: '12+ months'  },
  { domain: 'growth',        text: 'How intentional are you about your personal growth right now?',           min: 0, max: 10, multiplier: 1,     lowLabel: 'Not intentional', highLabel: 'Very intentional' },
  { domain: 'adventure',     text: 'How often do you do something that genuinely excites or energizes you?', min: 0, max: 10, multiplier: 1,     lowLabel: 'Almost never',    highLabel: 'Very regularly'   },
  { domain: 'environment',   text: 'How satisfied are you with your home and physical environment?',         min: 0, max: 10, multiplier: 1,     lowLabel: 'Very unsatisfied', highLabel: 'Completely satisfied' },
]

export const DOMAIN_COUNT = DOMAINS.length
export const TOTAL_STEPS = DOMAIN_COUNT * 2 // 22 steps: Q1+Q2 per domain
