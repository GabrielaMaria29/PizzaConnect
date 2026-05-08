"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type SaborQuantidade = {
  nome: "Muçarela" | "Calabresa" | "Meia muçarela e meia calabresa";
  quantidade: number;
};

export type Order = {
  id?: string;
  numeroCanhoto: string;
  nome: string;
  telefone: string;
  vendedorId: string;
  vendedorNome: string;
  sabores: SaborQuantidade[];
  pagamento: "Pix" | "Cartão" | "Dinheiro" | "Ainda vai pagar";
  dataPagamento?: string;
  observacao: string;
  entregue: "SIM" | "NÃO" | "DOAÇÃO";
  createdAt: any;
  updatedAt: any;
};

export function useOrders(vendedorId?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const ordersRef = collection(db, "orders");
      let q = query(ordersRef, orderBy("createdAt", "desc"));

      if (vendedorId) {
        q = query(
          ordersRef,
          where("vendedorId", "==", vendedorId),
          orderBy("createdAt", "desc")
        );
      }

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const ordersData = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })) as Order[];

          setOrders(ordersData);
          setLoading(false);
        },
        (error: any) => {
          if (!auth.currentUser && error?.code === "permission-denied") {
            setOrders([]);
            setLoading(false);
            return;
          }

          console.error("Erro ao carregar pedidos:", error);
          setOrders([]);
          setLoading(false);
        }
      );
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, [vendedorId]);

  const addOrder = async (
    order: Omit<Order, "id" | "createdAt" | "updatedAt">
  ) => {
    return await addDoc(collection(db, "orders"), {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  const editOrder = async (id: string, order: Partial<Order>) => {
    const orderRef = doc(db, "orders", id);
    return await updateDoc(orderRef, {
      ...order,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteOrder = async (id: string) => {
    const orderRef = doc(db, "orders", id);
    return await deleteDoc(orderRef);
  };

  return { orders, loading, addOrder, editOrder, deleteOrder };
}