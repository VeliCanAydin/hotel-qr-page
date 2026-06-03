export const dynamic = 'force-dynamic'

import { getGuestFeedbacks } from '@/lib/actions/feedback'
import FeedbackManagementClient from './feedback-management-client'

export default async function GuestFeedbackPage() {
  const feedbacks = await getGuestFeedbacks()
  return <FeedbackManagementClient initialFeedbacks={feedbacks} />
}
