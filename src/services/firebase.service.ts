/**
 * Firebase Service
 * 
 * Provides common Firebase operations used throughout the application.
 * Centralizes Firestore queries and operations for better maintainability.
 */

import {
  collection,
  collectionGroup,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  addDoc,
  writeBatch,
  increment,
  serverTimestamp,
  DocumentData,
  DocumentReference,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Get a single document from Firestore
 * 
 * @param path - Document path (e.g., "users/userId")
 * @returns Document data or null if not found
 */
export async function getDocument(path: string): Promise<DocumentData | null> {
  const docRef = doc(db, path);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

/**
 * Query documents from a collection with filters
 * 
 * @param collectionPath - Collection path
 * @param constraints - Query constraints (where, orderBy, limit, etc.)
 * @returns Array of documents with data and id
 */
export async function queryDocuments(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<DocumentData[]> {
  const q = query(collection(db, collectionPath), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Query documents from a collection group
 * 
 * @param collectionName - Collection name (not path)
 * @param constraints - Query constraints
 * @returns Array of documents with data and id
 */
export async function queryCollectionGroup(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<DocumentData[]> {
  const q = query(collectionGroup(db, collectionName), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Create or update a document
 * 
 * @param path - Document path
 * @param data - Document data
 * @param merge - Whether to merge with existing data (default: true)
 */
export async function saveDocument(
  path: string,
  data: any,
  merge: boolean = true
): Promise<void> {
  const docRef = doc(db, path);
  await setDoc(docRef, data, { merge });
}

/**
 * Update specific fields in a document
 * 
 * @param path - Document path
 * @param data - Fields to update
 */
export async function updateDocument(
  path: string,
  data: any
): Promise<void> {
  const docRef = doc(db, path);
  await updateDoc(docRef, data);
}

/**
 * Add a document to a collection with auto-generated ID
 * 
 * @param collectionPath - Collection path
 * @param data - Document data
 * @returns Document reference
 */
export async function addDocument(
  collectionPath: string,
  data: any
): Promise<DocumentReference> {
  return await addDoc(collection(db, collectionPath), data);
}

/**
 * Batch write multiple operations
 * 
 * @param operations - Array of batch operations
 */
export async function batchWrite(
  operations: Array<{
    type: "set" | "update" | "delete";
    path: string;
    data?: any;
  }>
): Promise<void> {
  const batch = writeBatch(db);

  operations.forEach((op) => {
    const docRef = doc(db, op.path);
    switch (op.type) {
      case "set":
        batch.set(docRef, op.data);
        break;
      case "update":
        batch.update(docRef, op.data);
        break;
      case "delete":
        batch.delete(docRef);
        break;
    }
  });

  await batch.commit();
}

/**
 * Firebase Service API
 */
export const firebaseService = {
  getDocument,
  queryDocuments,
  queryCollectionGroup,
  saveDocument,
  updateDocument,
  addDocument,
  batchWrite,
  serverTimestamp,
  increment,
  // Re-export commonly used Firestore functions
  where,
  orderBy,
  limit,
};
