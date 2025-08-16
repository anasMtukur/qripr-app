'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { app } from '../lib/firebase';
import { createAccount, getAccountById } from '@/services/accountService';
import { migrateGuestSessionsToUser } from '@/services/migrationService';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // Check if account exists
      if(firebaseUser){
        let account = await getAccountById(firebaseUser.uid);

        if (!account) {
          // Create account if missing
          account = await createAccount({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'Unnamed User',
            email: firebaseUser.email || '',
            accountType: 'free',
            createdAt: new Date(),
          });
          console.log('New account created for:', firebaseUser.uid);
        }

        await migrateGuestSessionsToUser(firebaseUser.uid, {
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          isAnonymous: firebaseUser.isAnonymous,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
