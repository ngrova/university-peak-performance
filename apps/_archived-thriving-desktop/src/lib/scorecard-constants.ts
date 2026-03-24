import type { DomainKey } from '@upp/db'

export interface Anchor {
  score: number
  label: string
  description: string
}

export interface Domain {
  key: DomainKey
  name: string
  icon: string
  color: string
  category: string
  anchors: Anchor[]
}

export const DOMAINS: Domain[] = [
  {
    key: 'physical', name: 'Physical Health', icon: '💪', color: '#0891B2', category: 'Foundation',
    anchors: [
      { score: 2.0, label: 'Struggling', description: 'Rarely move, eat poorly, low energy most days' },
      { score: 4.5, label: 'Inconsistent', description: 'Some good weeks, but fall off track easily' },
      { score: 7.0, label: 'Solid', description: 'Exercise regularly, eat well, feel good' },
      { score: 9.0, label: 'Thriving', description: 'Strong routines for movement, nutrition & recovery' },
    ],
  },
  {
    key: 'mental', name: 'Mental & Emotional', icon: '🧠', color: '#06B6D4', category: 'Foundation',
    anchors: [
      { score: 2.0, label: 'Overwhelmed', description: 'Anxious or drained most of the time' },
      { score: 4.5, label: 'Up & down', description: "Stress gets to me more than I'd like" },
      { score: 7.0, label: 'Steady', description: 'Manage stress well, generally stable' },
      { score: 9.0, label: 'Grounded', description: 'Clear-headed and resilient nearly every day' },
    ],
  },
  {
    key: 'spiritual', name: 'Spiritual Health', icon: '✨', color: '#A855F7', category: 'Direction',
    anchors: [
      { score: 2.0, label: 'Disconnected', description: "Don't think about deeper meaning" },
      { score: 4.5, label: 'Curious', description: "Sense there's more but don't explore it" },
      { score: 7.0, label: 'Grounded', description: 'Have beliefs or practices that anchor me' },
      { score: 9.0, label: 'Deep', description: 'Active spiritual life that guides my decisions' },
    ],
  },
  {
    key: 'purpose', name: 'Purpose & Identity', icon: '🎯', color: '#8B5CF6', category: 'Direction',
    anchors: [
      { score: 2.0, label: 'Lost', description: "Not sure what I'm working toward" },
      { score: 4.5, label: 'Vague', description: 'Some direction but lack clarity' },
      { score: 7.0, label: 'Focused', description: 'Know my values and have clear goals' },
      { score: 9.0, label: 'On mission', description: "Clear life mission, know exactly where I'm headed" },
    ],
  },
  {
    key: 'character', name: 'Character & Virtue', icon: '⭐', color: '#7C3AED', category: 'Direction',
    anchors: [
      { score: 2.0, label: 'Easy path', description: 'Usually take the easy route, even when wrong' },
      { score: 4.5, label: 'Compromise', description: 'Try but often bend under pressure' },
      { score: 7.0, label: 'Principled', description: 'Generally act with integrity' },
      { score: 9.0, label: 'Rock solid', description: "Choose what's right over what's easy, always" },
    ],
  },
  {
    key: 'relationships', name: 'Close Relationships', icon: '❤️', color: '#DC2626', category: 'Connection',
    anchors: [
      { score: 2.0, label: 'Isolated', description: 'Closest relationships are strained or absent' },
      { score: 4.5, label: 'Surface', description: "People around but not as close as I'd like" },
      { score: 7.0, label: 'Strong', description: 'Real trust and care with key people' },
      { score: 9.0, label: 'Deep', description: 'Inner circle is strong and deeply fulfilling' },
    ],
  },
  {
    key: 'social', name: 'Social & Community', icon: '👥', color: '#EF4444', category: 'Connection',
    anchors: [
      { score: 2.0, label: 'Isolated', description: 'Rarely spend time with others' },
      { score: 4.5, label: 'Sparse', description: "Some contact but don't quite belong" },
      { score: 7.0, label: 'Connected', description: 'Decent social life, part of groups' },
      { score: 9.0, label: 'Vibrant', description: 'Multiple communities where I truly belong' },
    ],
  },
  {
    key: 'financial', name: 'Financial Stability', icon: '💰', color: '#D97706', category: 'Impact',
    anchors: [
      { score: 1.5, label: 'Distress', description: 'Struggling to cover basic needs' },
      { score: 4.0, label: 'Paycheck to paycheck', description: 'Get by but little margin' },
      { score: 6.5, label: 'Stable', description: 'Bills covered, some savings' },
      { score: 9.5, label: 'Free', description: 'Strong savings, no money stress' },
    ],
  },
  {
    key: 'growth', name: 'Learning & Growth', icon: '📚', color: '#059669', category: 'Growth',
    anchors: [
      { score: 2.0, label: 'Stagnant', description: 'Not learning anything new' },
      { score: 4.5, label: 'Consuming', description: 'Podcasts & articles but rarely apply' },
      { score: 7.0, label: 'Growing', description: 'Actively learning, getting better' },
      { score: 9.0, label: 'Rapid growth', description: 'Building skills, reading deeply, mentored' },
    ],
  },
  {
    key: 'adventure', name: 'Adventure & Play', icon: '⛰️', color: '#10B981', category: 'Growth',
    anchors: [
      { score: 2.0, label: 'Monotonous', description: "Can't remember last time I had fun" },
      { score: 4.5, label: 'Occasional', description: 'Some downtime but rarely exciting' },
      { score: 7.0, label: 'Active', description: 'Hobbies I enjoy, occasionally try new things' },
      { score: 9.0, label: 'Rich', description: 'Regularly do things that excite me' },
    ],
  },
  {
    key: 'environment', name: 'Home & Environment', icon: '🏠', color: '#1E40AF', category: 'Environment',
    anchors: [
      { score: 2.0, label: 'Draining', description: 'Uncomfortable, cluttered, or unsafe' },
      { score: 4.5, label: 'Functional', description: 'Works but not inspiring' },
      { score: 7.0, label: 'Comfortable', description: 'Mostly works well for my life' },
      { score: 9.0, label: 'Energizing', description: 'Beautiful, organized, love being here' },
    ],
  },
]
