"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserProfile = {
  id: string;
  nome: string;
  email: string;
  role: "admin" | "vendedor";
  status: "ativo" | "inativo";
  createdAt?: any;
};

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setUsers([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const usersRef = collection(db, "users");
      const q = query(usersRef, orderBy("nome", "asc"));

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const usersData: UserProfile[] = snapshot.docs.map((docSnap) => {
            const data = docSnap.data() as Omit<UserProfile, "id">;

            return {
              ...data,
              id: docSnap.id,
            };
          });

          setUsers(usersData);
          setLoading(false);
        },
        (error) => {
          if (!auth.currentUser && error?.code === "permission-denied") {
            setUsers([]);
            setLoading(false);
            return;
          }

          console.error("Erro ao carregar usuários:", error);
          setUsers([]);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  const updateUser = async (id: string, data: Partial<UserProfile>) => {
    const userRef = doc(db, "users", id);
    return await updateDoc(userRef, data);
  };

  return { users, loading, updateUser };
}