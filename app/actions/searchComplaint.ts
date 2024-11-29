'use server';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { Complaint } from '@/lib/schema';

export default async function searchUUID(uuid: string) {
  console.log('Searching for UUID:', uuid);
  try {
    const data = await db
      .select()
      .from(Complaint)
      .where(eq(Complaint.uuid, uuid));

    if (data.length > 0) {
      console.log('Data found:', data);
      return data;
    } else {
      console.log('No data found for UUID:', uuid);
      return 'no data found';
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    return 'error occurred while fetching data';
  }
}
