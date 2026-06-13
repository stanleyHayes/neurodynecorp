import { ObjectId } from "mongodb";

/**
 * Book a Reading (spec §6.4).
 *
 * A request for an initial conversation, ideally gated by completion of the
 * Engagement Readiness Diagnostic. The conversation duration is derived from the
 * diagnostic's routing outcome (different durations for different qualification
 * outcomes). Captured as a request that staff confirm; live Google Calendar /
 * Microsoft 365 sync on confirmation is a config-time follow-up.
 */

export type BookingStatus = "requested" | "confirmed" | "declined" | "completed";

export const BOOKING_STATUSES: BookingStatus[] = ["requested", "confirmed", "declined", "completed"];

export interface BookingRequest {
  id: string;
  name: string;
  email: string;
  org?: string;
  topic?: string;
  /** Routing outcome carried over from the diagnostic, if any. */
  route?: string;
  /** Link back to the originating DiagnosticRecord, if any. */
  diagnosticId?: string;
  durationMins: number;
  preferredTimes?: string;
  timezone?: string;
  status: BookingStatus;
  createdAt: Date;
}

/** Conversation length by diagnostic routing outcome. */
export function bookingDurationForRoute(route?: string): number {
  switch (route) {
    case "gov_digital_excellence":
      return 45;
    case "services":
    case "labs":
      return 30;
    default:
      return 20;
  }
}

export function createBookingRequest(
  input: Omit<BookingRequest, "id" | "status" | "durationMins" | "createdAt"> & { durationMins?: number },
): BookingRequest {
  const { durationMins, ...rest } = input;
  return {
    id: new ObjectId().toHexString(),
    ...rest,
    durationMins: durationMins ?? bookingDurationForRoute(input.route),
    status: "requested",
    createdAt: new Date(),
  };
}
