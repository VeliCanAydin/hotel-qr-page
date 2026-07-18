import {
  getNotificationHistory,
  getNotificationRecipients,
} from '@/lib/actions/admin-notifications'
import NotificationsClient from './notifications-client'

export default async function NotificationsPage() {
  const [recipients, history] = await Promise.all([
    getNotificationRecipients(),
    getNotificationHistory(),
  ])
  return <NotificationsClient initialRecipients={recipients} initialHistory={history} />
}
