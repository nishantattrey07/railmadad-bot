'use server';
import { db } from '@/lib/db';
import { Complaint } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

type ComplaintStatus = 'to-do' | 'in-progress' | 'resolved';

export async function updateComplaintStatus(
  uuid: string,
  newStatus: ComplaintStatus
): Promise<typeof Complaint.$inferSelect> {
  console.log(`Attempting to update complaint ${uuid} to status ${newStatus}`);

  // Validate the newStatus
  const validStatuses: ComplaintStatus[] = ['to-do', 'in-progress', 'resolved'];
  if (!validStatuses.includes(newStatus)) {
    console.error(`Invalid status: ${newStatus}`);
    throw new Error(`Invalid status: ${newStatus}`);
  }

  try {
    console.log('Executing database update...');
    const updatedComplaints = await db
      .update(Complaint)
      .set({
        status: newStatus,
        updated_at: new Date()
      })
      .where(eq(Complaint.uuid, uuid))
      .returning();

    console.log('Database update complete. Result:', updatedComplaints);

    if (updatedComplaints.length === 0) {
      console.error(`No complaint found with uuid ${uuid}`);
      throw new Error(`No complaint found with uuid ${uuid}`);
    }

    const updatedComplaint = updatedComplaints[0];
    console.log('Updated complaint:', updatedComplaint);

    // Verify that the status was updated correctly
    if (updatedComplaint.status !== newStatus) {
      console.error(
        `Status was not updated correctly. Expected ${newStatus}, got ${updatedComplaint.status}`
      );

      // Try a direct SQL query if the ORM update didn't work
      console.log('Attempting direct SQL update...');
      const result = await db.execute(
        sql`UPDATE my_schema_new.complaint SET status = ${newStatus}, updated_at = NOW() WHERE uuid = ${uuid} RETURNING *`
      );
      console.log('Direct SQL update result:', result);

      if (result.length > 0) {
        return result[0] as typeof Complaint.$inferSelect;
      } else {
        throw new Error(`Failed to update status via direct SQL query`);
      }
    }

    return updatedComplaint;
  } catch (error) {
    console.error('Error updating complaint status:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update complaint status: ${error.message}`);
    } else {
      throw new Error(
        'An unknown error occurred while updating complaint status'
      );
    }
  }
}
