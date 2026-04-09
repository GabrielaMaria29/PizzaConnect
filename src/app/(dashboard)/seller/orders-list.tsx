"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { auth } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Edit, Pizza, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/order-utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { OrderForm } from "@/components/orders/order-form";
import { useToast } from "@/hooks/use-toast";

export default function SellerOrdersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const { orders, loading, editOrder, deleteOrder } = useOrders(
    auth.currentUser?.uid
  );

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  const filteredOrders = orders.filter(
    (o) =>
      o.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.telefone.includes(searchTerm)
  );

  const handleEdit = async (values: any) => {
    if (!selectedOrder?.id) return;

    try {
      await editOrder(selectedOrder.id, values);
      setIsEditDialogOpen(false);

      toast({
        title: "Pedido atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder?.id) return;

    try {
      await deleteOrder(selectedOrder.id);
      setIsDeleteDialogOpen(false);

      toast({
        title: "Pedido excluído",
        description: "O pedido foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o pedido.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p>Carregando seus pedidos...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="font-headline text-2xl text-primary">
          Meus Pedidos
        </CardTitle>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-lg">
            <Pizza className="mx-auto h-12 w-12 text-muted/50 mb-4" />
            <h3 className="text-lg font-headline text-muted-foreground">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Você ainda não cadastrou nenhum pedido ou o filtro não retornou
              resultados.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-headline">Data/Hora</TableHead>
                  <TableHead className="font-headline">Cliente</TableHead>
                  <TableHead className="font-headline">Sabores</TableHead>
                  <TableHead className="font-headline">Pagamento</TableHead>
                  <TableHead className="font-headline">Data pagamento</TableHead>
                  <TableHead className="font-headline">Entregue</TableHead>
                  <TableHead className="text-right font-headline">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-xs whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">{order.nome}</span>
                        <span className="text-xs text-muted-foreground">
                          {order.telefone}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {order.sabores?.map((s: any) => (
                          <Badge
                            key={s.nome}
                            variant="secondary"
                            className="text-[10px]"
                          >
                            {s.nome} ({s.quantidade})
                          </Badge>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {order.pagamento}
                      </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm whitespace-nowrap">
                      {order.dataPagamento || "-"}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          order.entregue === "SIM"
                            ? "default"
                            : order.entregue === "DOAÇÃO"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-[10px]"
                      >
                        {order.entregue}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-primary"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum pedido encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">
              Editar Pedido
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <OrderForm
              initialData={selectedOrder}
              sellerName={selectedOrder.vendedorNome}
              onSubmit={handleEdit}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl font-headline text-destructive">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o pedido de{" "}
              <strong>{selectedOrder?.nome}</strong>? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}