'use server';
import { newComplaint, Complaint } from '@/lib/schema';
import { db } from '@/lib/db';
import { botComplaint } from '@/lib/types';

function determineSeverity(
  department: string,
  subtype: string
): 'low' | 'medium' | 'high' {
  const highSeverityIssues = [
    'Medical Assistance',
    'Sexual Harassment/Misbehaviour',
    'Suspicious or Unclaimed Items',
    'Violence/Disorder',
    'Passenger Accident'
  ];

  const mediumSeverityIssues = [
    'Divyangjan Facilities',
    'Facilities For women With special needs',
    'Water Availability',
    'Overcrowding in Coaches',
    'Chain Pulling',
    'Harassment/Extortion by Authorities',
    'Missing or Unresponsive Passenger',
    'Substance Abuse'
  ];

  if (highSeverityIssues.includes(subtype)) {
    return 'high';
  } else if (mediumSeverityIssues.includes(subtype)) {
    return 'medium';
  } else {
    return 'low';
  }
}

export async function NewComplaint(naya_complaint: botComplaint) {
  console.log(naya_complaint);

  const severity = determineSeverity(
    naya_complaint.optionSelected,
    naya_complaint.departmentType
  );

  const new_complaint: newComplaint = {
    PNR: naya_complaint.pnr,
    uuid: naya_complaint.uuid,
    oneLineAI: naya_complaint.oneLinerExplanation_of_UserQuery_in_english,
    originalQuery: naya_complaint.userQuery,
    department: naya_complaint.optionSelected,
    subtype: naya_complaint.departmentType,
    image: naya_complaint.image,
    status: 'to-do',
    severity: severity,
    created_at: new Date(),
    updated_at: new Date()
  };

  await db.insert(Complaint).values(new_complaint);
}
