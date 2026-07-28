export async function registerForPushNotifications() {
  console.log('Push Notifications deshabilitadas en Expo Go');
  return null;
}

export async function removePushToken() {}

export function addNotificationListener(handler) {
  return { remove() {} };
}

export function addNotificationResponseListener(handler) {
  return { remove() {} };
}

export async function setBadgeCount(count) {}
