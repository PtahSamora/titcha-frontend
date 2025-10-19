import { promises as fs } from 'fs';
import { join } from 'path';
import type { Database } from './types';

const DB_PATH = join(process.cwd(), 'dev_db', 'dev_db.json');
const SEED_PATH = join(process.cwd(), 'dev_db', 'seed.json');

// Simple mutex for file operations
let writeQueue = Promise.resolve();

function acquireWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const task = writeQueue.then(fn);
  writeQueue = task.then(() => {}, () => {});
  return task;
}

export async function ensureDB(): Promise<void> {
  try {
    await fs.access(DB_PATH);
  } catch {
    // File doesn't exist, create it with seed data
    console.log('[DevDB] Initializing dev_db.json with seed data...');

    let seedData: any = {
      schools: [],
      teachers: [],
      classes: []
    };

    try {
      const seedContent = await fs.readFile(SEED_PATH, 'utf-8');
      seedData = JSON.parse(seedContent);
    } catch (err) {
      console.log('[DevDB] No seed data found, using empty seed');
    }

    const initialDB: Database = {
      users: [],
      schools: seedData.schools || [],
      classes: seedData.classes || [],
      teachers: seedData.teachers || [],
      students: [],
      parents: [],
      sessions: [],
      contactMessages: [],
      pendingLinks: [],
      // Student Portal
      subjects: seedData.subjects || [
        { id: 'math', name: 'Mathematics', icon: '📐', color: '#9333EA', progress: 65 },
        { id: 'science', name: 'Science', icon: '🔬', color: '#3B82F6', progress: 42 },
        { id: 'english', name: 'English', icon: '📚', color: '#10B981', progress: 78 },
      ],
      homework: [],
      friendships: [],
      dms: [],
      studyRooms: [],
      roomMessages: [],
      roomSnapshots: [],
      roomPermissions: [],
      roomControls: [],
      continueActivities: [],
      groupChats: [],
      groupMessages: [],
    };

    await fs.mkdir(join(process.cwd(), 'dev_db'), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(initialDB, null, 2), 'utf-8');
    console.log('[DevDB] Database initialized successfully');
  }
}

export async function readDB(): Promise<Database> {
  await ensureDB();

  const content = await fs.readFile(DB_PATH, 'utf-8');
  const db = JSON.parse(content) as Database;

  // Ensure roomControls array exists (migration for existing databases)
  if (!db.roomControls) {
    db.roomControls = [];
  }

  return db;
}

export async function writeDB(data: Database): Promise<void> {
  return acquireWriteLock(async () => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  });
}

// Helper functions
export async function findUserByEmail(email: string) {
  const db = await readDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string) {
  const db = await readDB();
  return db.users.find(u => u.id === id);
}

export async function findSchoolById(id: string) {
  const db = await readDB();
  return db.schools.find(s => s.id === id);
}

// Friendship helpers
export async function addFriendship(aUserId: string, bUserId: string) {
  const db = await readDB();
  const roomKey = [aUserId, bUserId].sort().join('|');
  const existing = db.friendships.find(f =>
    (f.aUserId === aUserId && f.bUserId === bUserId) ||
    (f.aUserId === bUserId && f.bUserId === aUserId)
  );
  if (existing) return existing;

  const friendship = {
    id: `friend-${Date.now()}`,
    aUserId,
    bUserId,
    createdAt: new Date().toISOString(),
  };
  db.friendships.push(friendship);
  await writeDB(db);
  return friendship;
}

export async function listFriends(userId: string) {
  const db = await readDB();
  const friendships = db.friendships.filter(
    f => f.aUserId === userId || f.bUserId === userId
  );
  const friendUserIds = friendships.map(f =>
    f.aUserId === userId ? f.bUserId : f.aUserId
  );
  const friends = db.users.filter(u => friendUserIds.includes(u.id));
  return friends.map(u => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
  }));
}

// DM helpers
export async function addDM(fromUserId: string, toUserId: string, message: string) {
  const db = await readDB();
  const roomKey = [fromUserId, toUserId].sort().join('|');
  const dm = {
    id: `dm-${Date.now()}`,
    roomKey,
    fromUserId,
    toUserId,
    message,
    createdAt: new Date().toISOString(),
  };
  db.dms.push(dm);
  await writeDB(db);
  return dm;
}

export async function listDMs(userId: string, friendId: string) {
  const db = await readDB();
  const roomKey = [userId, friendId].sort().join('|');
  return db.dms
    .filter(dm => dm.roomKey === roomKey)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// Homework helpers
export async function listHomework(studentUserId: string) {
  const db = await readDB();
  return db.homework
    .filter(hw => hw.studentUserId === studentUserId)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export async function updateHomeworkStatus(id: string, status: 'pending' | 'done' | 'overdue') {
  const db = await readDB();
  const homework = db.homework.find(hw => hw.id === id);
  if (homework) {
    homework.status = status;
    await writeDB(db);
  }
  return homework;
}

// Study Room helpers
export async function createRoom(ownerUserId: string, subject: string, name?: string) {
  const db = await readDB();
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = {
    id: `room-${Date.now()}`,
    name: name || `${subject} Study Room`,
    subject,
    ownerUserId,
    memberUserIds: [ownerUserId],
    inviteCode,
    createdAt: new Date().toISOString(),
  };
  db.studyRooms.push(room);
  await writeDB(db);
  return room;
}

export async function joinRoom(roomId: string, userId: string) {
  const db = await readDB();
  const room = db.studyRooms.find(r => r.id === roomId);
  if (room && !room.memberUserIds.includes(userId)) {
    room.memberUserIds.push(userId);
    await writeDB(db);
  }
  return room;
}

export async function findRoomByInviteCode(inviteCode: string) {
  const db = await readDB();
  return db.studyRooms.find(r => r.inviteCode === inviteCode);
}

export async function listRoomMembers(roomId: string) {
  const db = await readDB();
  const room = db.studyRooms.find(r => r.id === roomId);
  if (!room) return [];
  return db.users.filter(u => room.memberUserIds.includes(u.id)).map(u => ({
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
  }));
}

// Room Message helpers
export async function addRoomMessage(roomId: string, fromUserId: string, message: string) {
  const db = await readDB();
  const roomMessage = {
    id: `msg-${Date.now()}`,
    roomId,
    fromUserId,
    message,
    createdAt: new Date().toISOString(),
  };
  db.roomMessages.push(roomMessage);
  await writeDB(db);
  return roomMessage;
}

export async function listRoomMessages(roomId: string) {
  const db = await readDB();
  return db.roomMessages
    .filter(msg => msg.roomId === roomId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

// Room Snapshot helpers
export async function getRoomSnapshot(roomId: string) {
  const db = await readDB();
  return db.roomSnapshots.find(snap => snap.roomId === roomId);
}

export async function saveRoomSnapshot(roomId: string, snapshot: any) {
  const db = await readDB();
  const existing = db.roomSnapshots.find(snap => snap.roomId === roomId);
  if (existing) {
    existing.snapshot = snapshot;
    existing.updatedAt = new Date().toISOString();
  } else {
    db.roomSnapshots.push({
      roomId,
      snapshot,
      updatedAt: new Date().toISOString(),
    });
  }
  await writeDB(db);
  return snapshot;
}

// Group Chat helpers
export async function createGroupChat({ name, ownerUserId, schoolId }: { name: string; ownerUserId: string; schoolId?: string }) {
  const db = await readDB();
  const groupChat = {
    id: `group-${Date.now()}`,
    name,
    ownerUserId,
    memberUserIds: [ownerUserId],
    schoolId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.groupChats.push(groupChat);
  await writeDB(db);
  return groupChat;
}

export async function listMyGroupChats(userId: string) {
  const db = await readDB();
  return db.groupChats
    .filter(g => g.memberUserIds.includes(userId))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function findGroupByName(userId: string, query: string) {
  const db = await readDB();
  const lowerQuery = query.toLowerCase();
  return db.groupChats.filter(
    g => g.memberUserIds.includes(userId) && g.name.toLowerCase().includes(lowerQuery)
  );
}

export async function addMemberToGroup(groupId: string, userId: string) {
  const db = await readDB();
  const group = db.groupChats.find(g => g.id === groupId);
  if (group && !group.memberUserIds.includes(userId)) {
    group.memberUserIds.push(userId);
    group.updatedAt = new Date().toISOString();
    await writeDB(db);
  }
  return group;
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const db = await readDB();
  const group = db.groupChats.find(g => g.id === groupId);
  if (group) {
    group.memberUserIds = group.memberUserIds.filter(id => id !== userId);
    group.updatedAt = new Date().toISOString();
    await writeDB(db);
  }
  return group;
}

export async function isGroupMember(groupId: string, userId: string): Promise<boolean> {
  const db = await readDB();
  const group = db.groupChats.find(g => g.id === groupId);
  return group ? group.memberUserIds.includes(userId) : false;
}

export async function findGroupById(groupId: string) {
  const db = await readDB();
  return db.groupChats.find(g => g.id === groupId);
}

export async function addGroupMessage(groupId: string, fromUserId: string, message: string) {
  const db = await readDB();
  const groupMessage = {
    id: `gmsg-${Date.now()}`,
    groupId,
    fromUserId,
    message,
    createdAt: new Date().toISOString(),
  };
  db.groupMessages.push(groupMessage);

  // Update group's updatedAt timestamp
  const group = db.groupChats.find(g => g.id === groupId);
  if (group) {
    group.updatedAt = new Date().toISOString();
  }

  await writeDB(db);
  return groupMessage;
}

export async function listGroupMessages(groupId: string, limit: number = 50, beforeISO?: string) {
  const db = await readDB();
  let messages = db.groupMessages.filter(msg => msg.groupId === groupId);

  if (beforeISO) {
    const beforeTime = new Date(beforeISO).getTime();
    messages = messages.filter(msg => new Date(msg.createdAt).getTime() < beforeTime);
  }

  return messages
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .reverse();
}

// Room Permission helpers
export async function getRoomPermissions(roomId: string) {
  const db = await readDB();
  return db.roomPermissions.find(p => p.roomId === roomId);
}

export async function ensureRoomPermissions(roomId: string) {
  const db = await readDB();
  let permissions = db.roomPermissions.find(p => p.roomId === roomId);

  if (!permissions) {
    permissions = {
      roomId,
      askAiEnabled: true, // Default: enabled for all members
      memberAskAi: [],
      updatedAt: new Date().toISOString(),
    };
    db.roomPermissions.push(permissions);
    await writeDB(db);
  }

  return permissions;
}

export async function updateRoomPermissions(
  roomId: string,
  updates: { askAiEnabled?: boolean; grantUserId?: string; revokeUserId?: string }
) {
  const db = await readDB();
  let permissions = db.roomPermissions.find(p => p.roomId === roomId);

  if (!permissions) {
    permissions = {
      roomId,
      askAiEnabled: true,
      memberAskAi: [],
      updatedAt: new Date().toISOString(),
    };
    db.roomPermissions.push(permissions);
  }

  if (updates.askAiEnabled !== undefined) {
    permissions.askAiEnabled = updates.askAiEnabled;
  }

  if (updates.grantUserId && !permissions.memberAskAi.includes(updates.grantUserId)) {
    permissions.memberAskAi.push(updates.grantUserId);
  }

  if (updates.revokeUserId) {
    permissions.memberAskAi = permissions.memberAskAi.filter(id => id !== updates.revokeUserId);
  }

  permissions.updatedAt = new Date().toISOString();
  await writeDB(db);

  return permissions;
}

export async function getStudyRoomById(roomId: string) {
  const db = await readDB();
  return db.studyRooms.find(r => r.id === roomId);
}

export async function isRoomMember(roomId: string, userId: string): Promise<boolean> {
  const room = await getStudyRoomById(roomId);
  return room ? room.memberUserIds.includes(userId) : false;
}

// Room Control helpers (exclusive Ask-AI control)
export async function getRoomControl(roomId: string) {
  const db = await readDB();
  return db.roomControls.find(c => c.roomId === roomId);
}

export async function ensureRoomControl(roomId: string) {
  const db = await readDB();
  let control = db.roomControls.find(c => c.roomId === roomId);

  if (!control) {
    control = {
      roomId,
      controllerUserId: null, // Default: no one has exclusive control
      updatedAt: new Date().toISOString(),
    };
    db.roomControls.push(control);
    await writeDB(db);
  }

  return control;
}

export async function setRoomControl(roomId: string, controllerUserId: string | null) {
  const db = await readDB();
  let control = db.roomControls.find(c => c.roomId === roomId);

  if (!control) {
    control = {
      roomId,
      controllerUserId,
      updatedAt: new Date().toISOString(),
    };
    db.roomControls.push(control);
  } else {
    control.controllerUserId = controllerUserId;
    control.updatedAt = new Date().toISOString();
  }

  await writeDB(db);
  return control;
}
