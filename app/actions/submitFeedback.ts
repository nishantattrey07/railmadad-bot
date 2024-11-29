// app/actions/submitFeedback.ts
'use server';

import { db } from '@/lib/db';
import { Complaint } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function submitFeedback(
  uuid: string,
  feedback: string,
  stars: number
) {
  try {
    await db
      .update(Complaint)
      .set({ feedback, stars })
      .where(eq(Complaint.uuid, uuid));
    return { success: true };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: 'Failed to submit feedback' };
  }
}
