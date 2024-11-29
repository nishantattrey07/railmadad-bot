'use server';
import { db } from '@/lib/db';
import { Complaint } from '@/lib/schema';

export default async function getAllComplaints(department?: string) {
  try {
    let query = db.select().from(Complaint);

    if (department && department !== 'all') {
      // @ts-ignore
      query = query.where('department', '=', department);
    }

    const AllComplaints = await query;
    console.log(
      `Fetched complaints for department: ${department || 'all'}`,
      AllComplaints
    );
    return AllComplaints;
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error; // It's often better to throw the error than return it
  }
}
