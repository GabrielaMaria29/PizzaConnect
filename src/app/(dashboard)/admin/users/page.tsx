"use client";

import { useUsers } from "@/hooks/use-users";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Shield, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { users, loading, updateUser } = useUsers();
  const { toast } = useToast();

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ativo" ? "inativo" : "ativo";
    await updateUser(id, { status: newStatus });
    toast({
      title: "Status Atualizado",
      description: `O vendedor está agora ${newStatus}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl text-primary font-headline">Gerenciamento de Vendedores</h1>
       
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Equipe de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-12">Carregando usuários...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-headline">Vendedor</TableHead>
                  <TableHead className="font-headline">Email</TableHead>
                  <TableHead className="font-headline">Perfil</TableHead>
                  <TableHead className="font-headline">Status</TableHead>
                  <TableHead className="text-right font-headline">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id || user.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <UserCircle className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold">{user.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Mail className="w-3 h-3" /> {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === "ativo" ? "outline" : "destructive"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {user.role !== "admin" && (
                        <div className="flex items-center justify-end gap-2">
                          <Label htmlFor={`status-${user.id}`} className="text-xs hidden sm:inline text-muted-foreground">
                            {user.status === "ativo" ? "Ativo" : "Inativo"}
                          </Label>
                          <Switch
                            id={`status-${user.id}`}
                            checked={user.status === "ativo"}
                            onCheckedChange={() => handleStatusToggle(user.id, user.status)}
                          />
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          <p>Para cadastrar um novo vendedor, o administrador deve criá-lo via Firebase Console ou utilizar uma função de criação dedicada (requer configuração de Admin SDK para maior segurança).</p>
        </CardContent>
      </Card>
    </div>
  );
}