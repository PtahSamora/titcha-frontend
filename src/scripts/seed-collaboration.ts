/**
 * Seed script for collaboration features
 * Run with: npx tsx src/scripts/seed-collaboration.ts
 */

import { readDB, writeDB } from '../lib/devdb';
import type { Homework } from '../lib/types';

async function seedCollaboration() {
  console.log('[Seed] Starting collaboration data seed...');

  const db = await readDB();

  // Find existing test users (assuming they exist from previous registration)
  const testStudent1 = db.users.find(u => u.email === 'test@student.com');
  const testStudent2 = db.users.find(u => u.email.includes('student') && u.id !== testStudent1?.id);

  if (!testStudent1) {
    console.log('[Seed] No test student found. Please register a student first.');
    console.log('[Seed] Register at: http://localhost:3000/register');
    return;
  }

  console.log(`[Seed] Found test student: ${testStudent1.email}`);

  // Seed homework for the test student
  if (db.homework.length === 0) {
    console.log('[Seed] Seeding homework...');
    const homeworkItems: Homework[] = [
      {
        id: 'hw-1',
        studentUserId: testStudent1.id,
        subject: 'Mathematics',
        title: 'Quadratic Equations Practice',
        description: 'Complete problems 1-20 from Chapter 5',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'hw-2',
        studentUserId: testStudent1.id,
        subject: 'Science',
        title: 'Photosynthesis Lab Report',
        description: 'Write a lab report on the photosynthesis experiment',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'hw-3',
        studentUserId: testStudent1.id,
        subject: 'English',
        title: 'Shakespeare Essay',
        description: 'Analyze the themes in Romeo and Juliet',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago (overdue)
        status: 'overdue',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'hw-4',
        studentUserId: testStudent1.id,
        subject: 'Mathematics',
        title: 'Trigonometry Worksheet',
        description: 'Complete all sine and cosine problems',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
        status: 'pending',
        createdAt: new Date().toISOString(),
      },
    ];

    db.homework.push(...homeworkItems);
    console.log(`[Seed] Created ${homeworkItems.length} homework items`);
  } else {
    console.log('[Seed] Homework already exists, skipping...');
  }

  // Seed friendship if second student exists
  if (testStudent2 && db.friendships.length === 0) {
    console.log('[Seed] Seeding friendship...');
    db.friendships.push({
      id: 'friend-1',
      aUserId: testStudent1.id,
      bUserId: testStudent2.id,
      createdAt: new Date().toISOString(),
    });
    console.log(`[Seed] Created friendship between ${testStudent1.email} and ${testStudent2.email}`);
  } else if (!testStudent2) {
    console.log('[Seed] Only one student found, skipping friendship seed');
    console.log('[Seed] To test DM: register another student at http://localhost:3000/register');
  }

  // Seed some DMs if friendship exists
  if (testStudent2 && db.friendships.length > 0 && db.dms.length === 0) {
    console.log('[Seed] Seeding DMs...');
    const roomKey = [testStudent1.id, testStudent2.id].sort().join('|');
    db.dms.push(
      {
        id: 'dm-1',
        roomKey,
        fromUserId: testStudent1.id,
        toUserId: testStudent2.id,
        message: 'Hey! Want to study together for the math test?',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
      },
      {
        id: 'dm-2',
        roomKey,
        fromUserId: testStudent2.id,
        toUserId: testStudent1.id,
        message: 'Sure! Let me create a study room.',
        createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
      }
    );
    console.log('[Seed] Created 2 DM messages');
  }

  // Seed a study room
  if (db.studyRooms.length === 0) {
    console.log('[Seed] Seeding study room...');
    const memberIds = testStudent2 ? [testStudent1.id, testStudent2.id] : [testStudent1.id];
    db.studyRooms.push({
      id: 'room-1',
      name: 'Math Study Group',
      subject: 'Mathematics',
      ownerUserId: testStudent1.id,
      memberUserIds: memberIds,
      inviteCode: 'MATH123',
      createdAt: new Date().toISOString(),
    });
    console.log(`[Seed] Created study room with invite code: MATH123`);
  } else {
    console.log('[Seed] Study room already exists, skipping...');
  }

  // Seed continue activities
  if (db.continueActivities.length === 0) {
    console.log('[Seed] Seeding continue activities...');
    db.continueActivities.push(
      {
        id: 'act-1',
        studentUserId: testStudent1.id,
        type: 'lesson',
        subject: 'Mathematics',
        title: 'Quadratic Equations',
        progress: 65,
        lastAccessed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
      {
        id: 'act-2',
        studentUserId: testStudent1.id,
        type: 'homework',
        subject: 'Science',
        title: 'Photosynthesis Lab',
        progress: 30,
        lastAccessed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      }
    );
    console.log('[Seed] Created continue activities');
  }

  // Save the database
  await writeDB(db);

  console.log('[Seed] ✓ Collaboration data seeded successfully!');
  console.log('\n[Seed] Test the following:');
  console.log('1. Login as test@student.com');
  console.log('2. View homework at /portal/student/homework');
  if (testStudent2) {
    console.log(`3. Add friend: ${testStudent2.email}`);
    console.log('4. Open DM chat from Friends Bar');
  }
  console.log('5. Join study room with code: MATH123');
  console.log('   URL: http://localhost:3000/portal/student/room/room-1');
}

// Run the seed function
seedCollaboration().catch(console.error);
