export function generateRoomId(appointmentId: string): string {
  return crypto.randomUUID();
}