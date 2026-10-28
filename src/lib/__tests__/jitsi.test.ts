import { generateRoomId } from '../jitsi';

describe('generateRoomId', () => {
  it('returns unique UUID-based room ID for each appointment', () => {
    const id1 = generateRoomId('appt-1');
    const id2 = generateRoomId('appt-2');
    expect(id1).not.toBe(id2);
    expect(id1).toMatch(/^[0-9a-f-]{36}$/);
  });
});