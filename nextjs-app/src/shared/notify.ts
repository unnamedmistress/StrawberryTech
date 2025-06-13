// Global notification function that works with the NotificationProvider
let globalNotificationHandler: ((message: string) => void) | null = null

export function setNotificationHandler(handler: (message: string) => void) {
  globalNotificationHandler = handler
}

export function notify(message: string) {
  if (typeof window !== 'undefined') {
    if (globalNotificationHandler) {
      globalNotificationHandler(message)
    } else {
      // Fallback to console if notification system isn't initialized yet
      console.log('Notification:', message)
    }
  } else {
    console.log(message)
  }
}
