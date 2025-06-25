/**
 * MOCK Hook: Simulates fetching the current user's role.
 * Replace this with actual authentication/authorization logic later.
 */
export function useUserRole(): 'Super Admin' | 'Admin' | 'User' | null {
  // TODO: Replace with real role fetching logic
  // For now, hardcode to 'User' for development/testing purposes.
  // Change this to 'Admin' or 'Super Admin' to test access control.
  return 'Super Admin'; // Keep as 'User' as per last update
}
