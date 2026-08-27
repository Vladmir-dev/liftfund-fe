export interface Fundraiser {
  id: string
  title: string
  description: string
  category: string
  imageUrl: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  daysLeft: number
  organizer: string
  city: string
  country: string
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  colorClass: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface DropdownMenuItem {
  title: string
  description: string
  route: string
}
