import {
  char,
  date,
  integer,
  pgSchema,
  serial,
  text,
  time,
  varchar,
  timestamp,
  primaryKey,
  boolean
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { string } from 'prop-types';

export const mySchema = pgSchema('my_schema_new');

const PNR = mySchema.table('pnr', {
  PNR: text('PNR').primaryKey(),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  gender: text('gender').notNull(),
  isdisabled: boolean('isdisable').notNull().default(false),
  journeyDate: date('jDate').notNull(),
  passengerName: text('passengerName').notNull(),
  trainNumber: text('trainNumber').notNull(),
  coach: text('coach').notNull(),
  seat: text('seat').notNull(),
  departureStation: text('departureStation').notNull(),
  departureDate: date('departureDate').notNull(),
  arrivalStation: text('arrivalStation').notNull(),
  arrivalDate: date('arrivalDate').notNull(),
  bookingStatus: text('bookingStatus').notNull(),
  bookingDate: date('bookingDate').notNull(),
  created_at: date('created_at'),
  updated_at: date('updated_at')
});

const Complaint = mySchema.table('complaint', {
  PNR: text('PNR').notNull(),
  uuid: text('uuid').primaryKey(),
  created_at: timestamp('created_at').notNull(),
  updated_at: timestamp('updated_at').notNull(),
  status: text('status', {
    enum: ['to-do', 'in-progress', 'resolved']
  }).notNull(),
  department: text('department').notNull(),
  subtype: text('subtype').notNull(),
  oneLineAI: text('oneLineAI').notNull(),
  originalQuery: text('originalQuery').notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high'] }).notNull(),
  feedback: text('feedback'),
  stars: integer('stars'),
  image: text('imageb64')
});

export { PNR, Complaint };
export type PNRread = typeof PNR.$inferSelect;
export type newPNR = typeof PNR.$inferInsert;

export type Complaintread = typeof Complaint.$inferSelect;
export type newComplaint = typeof Complaint.$inferInsert;
