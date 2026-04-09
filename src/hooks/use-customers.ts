"use client";

import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Customer = {
  id: string;
  nome: string;
  telefone: string;
};

function normalizePhone(value: string) {
  return String(value || "").replace(/\D/g, "");
}

export function useCustomers() {
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  const findCustomerByPhone = async (telefone: string) => {
    const telefoneNormalizado = normalizePhone(telefone);

    if (!telefoneNormalizado) return null;

    setLoadingCustomer(true);

    try {
      const q = query(
        collection(db, "customers"),
        where("telefone", "==", telefoneNormalizado),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;

      const docSnap = snapshot.docs[0];

      return {
        id: docSnap.id,
        ...(docSnap.data() as Omit<Customer, "id">),
      };
    } catch (error) {
      console.error("Erro ao buscar cliente:", error);
      return null;
    } finally {
      setLoadingCustomer(false);
    }
  };

  const findCustomersByPrefix = async (telefone: string) => {
    const telefoneNormalizado = normalizePhone(telefone);

    if (telefoneNormalizado.length < 3) return [];

    setLoadingCustomer(true);

    try {
      const q = query(
        collection(db, "customers"),
        where("telefone", ">=", telefoneNormalizado),
        where("telefone", "<=", telefoneNormalizado + "\uf8ff"),
        limit(5)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) return [];

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Customer, "id">),
      }));
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      return [];
    } finally {
      setLoadingCustomer(false);
    }
  };

  return {
    loadingCustomer,
    findCustomerByPhone,
    findCustomersByPrefix,
  };
}