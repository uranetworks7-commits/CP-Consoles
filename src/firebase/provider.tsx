'use client';

import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Database } from 'firebase/database';
import { Auth } from 'firebase/auth';

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  rtdb: Database | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  db: null,
  rtdb: null,
  auth: null,
});

export function FirebaseProvider({
  children,
  app,
  db,
  rtdb,
  auth,
}: {
  children: React.ReactNode;
  app: FirebaseApp;
  db: Firestore;
  rtdb: Database;
  auth: Auth;
}) {
  return (
    <FirebaseContext.Provider value={{ app, db, rtdb, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
export const useFirebaseApp = () => useFirebase().app;
export const useFirestore = () => useFirebase().db;
export const useRTDB = () => useFirebase().rtdb;
export const useAuth = () => useFirebase().auth;
