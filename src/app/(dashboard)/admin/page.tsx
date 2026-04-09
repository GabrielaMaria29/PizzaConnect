"use client";

import { useOrders } from "@/hooks/use-orders";
import { useUsers } from "@/hooks/use-users";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Pizza,
  Users,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function AdminPage() {
  const { orders, loading: ordersLoading } = useOrders();
  const { users, loading: usersLoading } = useUsers();

  const totalOrders = orders.length;

  const totalPizzas = orders.reduce((acc, order) => {
    return (
      acc +
      (order.sabores?.reduce((sum, s) => sum + s.quantidade, 0) || 0)
    );
  }, 0);

  const naoEntreguesCount = orders.filter(
    (o) => o.entregue === "NÃO"
  ).length;

  const flavorsCount = orders.reduce((acc: any, order) => {
    order.sabores?.forEach((s) => {
      acc[s.nome] = (acc[s.nome] || 0) + s.quantidade;
    });
    return acc;
  }, {});

  const paymentsCount = orders.reduce((acc: any, order) => {
    const pagamento = order.pagamento;
    acc[pagamento] = (acc[pagamento] || 0) + 1;
    return acc;
  }, {});

  const sellerPerformance = orders.reduce((acc: any, order) => {
    acc[order.vendedorNome] = (acc[order.vendedorNome] || 0) + 1;
    return acc;
  }, {});

  if (ordersLoading || usersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl text-primary font-headline">
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o desempenho das vendas e gerencie sua equipe.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total Pedidos
            </CardTitle>
            <ShoppingBag className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline text-primary">
              {totalOrders}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-secondary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Não entregues
            </CardTitle>
            <Users className="w-5 h-5 text-secondary-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">
              {naoEntreguesCount}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Top Sabor
            </CardTitle>
            <Pizza className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold font-headline truncate">
              {Object.entries(flavorsCount).sort(
                (a: any, b: any) => b[1] - a[1]
              )[0]?.[0] || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Total de pizzas
            </CardTitle>
            <CreditCard className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-headline">
              {totalPizzas}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">
              Vendas por Sabor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(flavorsCount).map(([sabor, count]: [string, any]) => (
                <div
                  key={sabor}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <span className="font-medium">{sabor}</span>
                  <Badge variant="secondary" className="font-bold text-sm px-3">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-primary">
              Vendas por Vendedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(sellerPerformance).map(([name, count]: [string, any]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <span className="font-medium">{name}</span>
                  <Badge variant="outline" className="font-bold text-sm px-3">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}