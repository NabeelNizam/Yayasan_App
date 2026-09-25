// Contact information card
export interface ContactInfo {
  id: string
  icon: string
  title: string
  value: string
}

// Social media link
export interface SocialLink {
  id: string
  platform: string
  icon: string
  description: string
  url: string
}

// Feedback form data
export interface FeedbackFormData {
  name: string
  isAnonymous: boolean
  rating: number
  message: string
}
