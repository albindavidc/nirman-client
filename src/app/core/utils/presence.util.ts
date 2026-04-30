export const ONLINE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

export function isUserOnline(user: { isOnline: boolean; lastSeenAt: string | Date | null | undefined }): boolean {
  if (!user.lastSeenAt) return false;
  const diff = Date.now() - new Date(user.lastSeenAt).getTime();
  return diff < ONLINE_THRESHOLD_MS;
}
