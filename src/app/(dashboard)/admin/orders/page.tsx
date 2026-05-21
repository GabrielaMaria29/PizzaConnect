"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
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
import { Search, Edit, Trash2, Download } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrdersPage() {
  const { orders, loading, editOrder, deleteOrder } = useOrders();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterSabor, setFilterSabor] = useState("all");
  const [filterPagamento, setFilterPagamento] = useState("all");
  const [filterEntregue, setFilterEntregue] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.numeroCanhoto?.includes(searchTerm) ||
      o.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.telefone.includes(searchTerm) ||
      o.vendedorNome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSabor =
      filterSabor === "all" ||
      o.sabores?.some((s) => s.nome === filterSabor && s.quantidade > 0);

    const matchesPagamento =
      filterPagamento === "all" || o.pagamento.includes(filterPagamento);

    const matchesEntregue =
      filterEntregue === "all" || o.entregue === filterEntregue;

    return (
      matchesSearch &&
      matchesSabor &&
      matchesPagamento &&
      matchesEntregue
    );
  });
  const totalPedidosFiltrados = filteredOrders.length;

    const totalPizzasFiltradas = filteredOrders.reduce((acc, order) => {
      return (
        acc +
        (order.sabores?.reduce((sum, sabor) => {
          return sum + Number(sabor.quantidade || 0);
        }, 0) || 0)
      );
    }, 0);

  const handleEdit = async (values: any) => {
    if (!selectedOrder?.id) return;

    await editOrder(selectedOrder.id, values);
    setIsEditDialogOpen(false);

    toast({
      title: "Pedido atualizado",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDelete = async () => {
    if (!selectedOrder?.id) return;

    await deleteOrder(selectedOrder.id);
    setIsDeleteDialogOpen(false);

    toast({
      title: "Excluído",
      description: "Pedido removido com sucesso.",
    });
  };

  const handleExport = () => {
    if (!filteredOrders.length) {
      toast({
        title: "Nada para exportar",
        description: "Não há pedidos na listagem atual.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Data",
      "Canhoto",
      "Cliente",
      "Telefone",
      "Vendedor",
      "Sabores",
      "Pagamento",
      "Data pagamento",
      "Entregue",
      "Observação",
    ];

    const rows = filteredOrders.map((order) => [
      formatDate(order.createdAt),
      order.numeroCanhoto ?? "",
      order.nome ?? "",
      order.telefone ?? "",
      order.vendedorNome ?? "",
      Array.isArray(order.sabores)
        ? order.sabores.map((s) => `${s.nome} (${s.quantidade})`).join(" | ")
        : "",
      order.pagamento ?? "",
      order.dataPagamento ?? "",
      order.entregue ?? "",
      order.observacao ?? "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute("download", `pedidos_pizzas_${today}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl text-primary font-headline">
          Listagem Completa
        </h1>

        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleExport}
        >
          <Download className="w-4 h-4" />
          Exportar
        </Button>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="space-y-6">
          <CardTitle className="font-headline text-2xl text-primary">
            Gerenciamento de Pedidos
          </CardTitle>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Nome, telefone ou vendedor..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterSabor} onValueChange={setFilterSabor}>
              <SelectTrigger>
                <SelectValue placeholder="Sabor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os sabores</SelectItem>
                <SelectItem value="Muçarela">Muçarela</SelectItem>
                <SelectItem value="Calabresa">Calabresa</SelectItem>
                <SelectItem value="Meia muçarela e meia calabresa">
                  Meia/Meia
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPagamento} onValueChange={setFilterPagamento}>
              <SelectTrigger>
                <SelectValue placeholder="Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pagamentos</SelectItem>
                <SelectItem value="Pix">Pix</SelectItem>
                <SelectItem value="Cartão">Cartão</SelectItem>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="Ainda vai pagar">Ainda vai pagar</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEntregue} onValueChange={setFilterEntregue}>
              <SelectTrigger>
                <SelectValue placeholder="Entregue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Status de entrega</SelectItem>
                <SelectItem value="NÃO">NÃO</SelectItem>
                <SelectItem value="SIM">SIM</SelectItem>
                <SelectItem value="DOAÇÃO">DOAÇÃO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">Pedidos filtrados</p>
          <p className="text-2xl font-bold text-primary">
            {totalPedidosFiltrados}
          </p>
        </div>

        <div className="rounded-lg border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">Pizzas filtradas</p>
          <p className="text-2xl font-bold text-primary">
            {totalPizzasFiltradas}
          </p>
        </div>
      </div>
          {loading ? (
            <div className="text-center p-12">
              <div className="animate-spin inline-block h-8 w-8 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Canhoto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Vendedor</TableHead>
                    <TableHead>Sabores</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Data pagamento</TableHead>
                    <TableHead>Entregue</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="text-xs">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell>{order.numeroCanhoto}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{order.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            {order.telefone}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="font-medium text-sm">
                        {order.vendedorNome}
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {order.sabores?.map((s) => (
                              <Badge key={s.nome}>
                                {s.nome} ({s.quantidade})
                              </Badge>
                            ))
                          }
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {order.pagamento}
                        </Badge>
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
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 text-primary" />
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

                  {!loading && filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum pedido encontrado com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Editar Pedido</DialogTitle>
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
            <DialogTitle className="text-destructive">
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir o pedido de{" "}
              <strong>{selectedOrder?.nome}</strong>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}