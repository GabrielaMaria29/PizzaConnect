"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Pizza } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Autenticação no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Busca o perfil no Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Se autenticou no Auth mas não tem perfil no Firestore
        await signOut(auth);
        throw new Error("PERFIL_NAO_ENCONTRADO");
      }

      const userData = userDoc.data();

      // 3. Valida se o usuário está ativo
      if (userData.status === "inativo") {
        await signOut(auth);
        throw new Error("USUARIO_INATIVO");
      }

      toast({
        title: "Bem-vindo!",
        description: `Olá, ${userData.nome}. Redirecionando...`,
      });

      // 4. Redirecionamento baseado no perfil
      if (userData.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/seller");
      }
    } catch (error: any) {
      console.error("Erro no login:", error.code, error.message);
      
      let title = "Erro de autenticação";
      let description = "Ocorreu um erro ao tentar entrar.";

      // Tratamento de códigos de erro do Firebase Auth
      switch (error.code) {
        case "auth/operation-not-allowed":
          description = "O login por e-mail e senha não está habilitado. Por favor, contate o administrador.";
          break;
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          description = "E-mail ou senha inválidos.";
          break;
        case "auth/user-disabled":
          description = "Esta conta foi desativada no sistema de autenticação.";
          break;
        case "auth/too-many-requests":
          description = "Muitas tentativas malsucedidas. Tente novamente mais tarde.";
          break;
        default:
          // Erros customizados do nosso fluxo
          if (error.message === "PERFIL_NAO_ENCONTRADO") {
            description = "Seu usuário existe, mas não encontramos seu perfil de acesso. Contate o administrador.";
          } else if (error.message === "USUARIO_INATIVO") {
            description = "Sua conta está inativa. Entre em contato com o administrador para reativá-la.";
          } else {
            description = "Erro inesperado. Tente novamente em alguns instantes.";
          }
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Pizza className="text-primary w-10 h-10" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary">PizzaConnect</CardTitle>
          <CardDescription className="text-lg">Instituto Alma Mater</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@almamater.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full font-headline h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
