// Google Calendar integration stub
// TODO: Add GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, GOOGLE_CALENDAR_REFRESH_TOKEN to .env.local
// Setup instructions: See README.md > Google Calendar Setup

export interface CalendarEvent {
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  attendeeEmail: string;
  attendeeName: string;
}

export async function createCalendarEvent(event: CalendarEvent): Promise<string | null> {
  // TODO: Implement Google Calendar event creation once credentials are added
  // 1. Use GOOGLE_CALENDAR_CLIENT_ID + GOOGLE_CALENDAR_CLIENT_SECRET + GOOGLE_CALENDAR_REFRESH_TOKEN
  // 2. Exchange refresh token for access token via POST https://oauth2.googleapis.com/token
  // 3. Create event via POST https://www.googleapis.com/calendar/v3/calendars/primary/events
  // 4. Return the created event ID (gcal_event_id) to store in appointments table

  console.log("[Google Calendar] Event creation stubbed — credentials not yet configured:", event);
  return null;
}
