/**
 * Format a display name from first and optional last name.
 */
export function formatDisplayName(
  firstName: string,
  lastName?: string
): string {
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
}
