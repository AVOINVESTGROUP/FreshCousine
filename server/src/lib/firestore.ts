import admin from 'firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

let app: admin.app.App;
try {
  app = admin.app();
} catch {
  app = admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
}

export const db: Firestore = admin.firestore(app);

export function collection<T>(name: string) {
  return db.collection(name) as FirebaseFirestore.CollectionReference<T>;
}

export async function getDocument<T>(collectionName: string, id: string) {
  const snapshot = await collection<T>(collectionName).doc(id).get();
  return snapshot.exists ? snapshot.data() as T : null;
}
