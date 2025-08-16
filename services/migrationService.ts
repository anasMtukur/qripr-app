import { db } from '@/lib/firebase';
import { getGuestSessions, clearGuestSessions } from '@/lib/storage';
import { doc, updateDoc } from "firebase/firestore";

export async function migrateGuestSessionsToUser(userId: string, user: any) {
  const sessionIds = await getGuestSessions();

  if (!sessionIds?.length) {
    console.log("No guest sessions to migrate");
    return;
  }

  for (const id of sessionIds) {
    const ref = doc(db, "sessions", id);
    await updateDoc(ref, {
      userId,
      owner: user,
    });
  }

  // Cleanup local storage so they’re not re-migrated
  await clearGuestSessions();

  console.log(`✅ Migrated ${sessionIds.length} sessions to user ${userId}`);
}


