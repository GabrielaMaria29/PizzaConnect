"use client";

import { useEffect, useState } from "react";
import { OrderForm } from "@/components/orders/order-form";
import { useOrders } from "@/hooks/use-orders";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pizza, ListChecks } from "lucide-react";
import SellerOrdersList from "./orders-list";

export default function SellerPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { addOrder } = useOrders();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null);
        setLoadingUser(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        setUserData(null);
      } finally {
        setLoadingUser(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleOrderSubmit = async (values: any) => {
    if (!auth.currentUser || !userData) return;

    await addOrder({
      ...values,
      vendedorId: auth.currentUser.uid,
      vendedorNome: userData.nome,
    });
  };

  if (loadingUser) {
    return <div className="max-w-4xl mx-auto p-4">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl text-primary font-headline">Painel do Vendedor</h1>
        <p className="text-muted-foreground">
          Olá, {userData?.nome || "Vendedor"}. Cadastre seus pedidos abaixo.
        </p>
      </div>

      <Tabs defaultValue="novo" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="novo" className="font-headline flex items-center gap-2">
            <Pizza className="w-4 h-4" />
            Novo Pedido
          </TabsTrigger>
          <TabsTrigger value="lista" className="font-headline flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Meus Pedidos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="novo" className="space-y-4 pt-4">
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl text-primary">
                Informações do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userData && (
                <OrderForm
                  sellerName={userData.nome}
                  onSubmit={handleOrderSubmit}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lista" className="space-y-4 pt-4">
          <SellerOrdersList />
        </TabsContent>
      </Tabs>
    </div>
  );
}