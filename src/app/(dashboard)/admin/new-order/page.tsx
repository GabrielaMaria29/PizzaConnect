"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { useUsers } from "@/hooks/use-users";
import { OrderForm } from "@/components/orders/order-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminNewOrderPage() {
  const { addOrder } = useOrders();
  const { users, loading } = useUsers();
  const { toast } = useToast();

  const [selectedSellerId, setSelectedSellerId] = useState("");

  const sellers = users.filter((user) => {
    const role = String(user.role || "").trim().toLowerCase();
    const status = String(user.status || "").trim().toLowerCase();

    return (role === "vendedor" || role === "admin") && status === "ativo";
  });

  const selectedSeller = sellers.find(
    (seller) => seller.id === selectedSellerId
  );

  const handleSubmit = async (values: any) => {
    if (!selectedSeller) {
      toast({
        title: "Selecione um vendedor",
        description: "Escolha o vendedor responsável pelo pedido.",
        variant: "destructive",
      });
      return;
    }

    await addOrder({
      ...values,
      vendedorId: selectedSeller.id,
      vendedorNome: selectedSeller.nome,
    });

    toast({
      title: "Pedido cadastrado",
      description: `Pedido cadastrado para o vendedor ${selectedSeller.nome}.`,
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl text-primary font-headline">
        Adicionar Pedido
      </h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-primary font-headline">
            Novo pedido pelo administrador
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Vendedor responsável</Label>

            <Select
              value={selectedSellerId}
              onValueChange={setSelectedSellerId}
              disabled={loading || sellers.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loading
                      ? "Carregando vendedores..."
                      : sellers.length === 0
                      ? "Nenhum vendedor ativo encontrado"
                      : "Selecione o vendedor"
                  }
                />
              </SelectTrigger>

              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!loading && sellers.length === 0 && (
            <div className="text-sm text-destructive border border-destructive/30 rounded-lg p-4">
              Nenhum vendedor ativo foi encontrado. Verifique no Firestore se os usuários têm
              role = "vendedor" e status = "ativo".
            </div>
          )}

          {selectedSeller ? (
            <OrderForm
              sellerName={selectedSeller.nome}
              onSubmit={handleSubmit}
            />
          ) : (
            <div className="text-sm text-muted-foreground border rounded-lg p-4">
              Selecione um vendedor para liberar o cadastro do pedido.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}