"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Pizza, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        router.replace("/login");
        return;
      }

      try {
        setLoading(true);
        setUser(firebaseUser);

        const userRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          setUserData(null);
          setLoading(false);
          return;
        }

        setUserData(userDoc.data());
      } catch (error: any) {
        // ignora erro transitório ao sair
        if (!auth.currentUser && error?.code === "permission-denied") {
          setUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }

        console.error("Erro ao carregar dados do usuário:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      setIsMenuOpen(false);
      await signOut(auth);
      setUser(null);
      setUserData(null);
      router.replace("/login");

      toast({
        title: "Até logo!",
        description: "Você saiu do sistema.",
      });
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar a sessão.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Pizza className="w-12 h-12 text-primary animate-bounce" />
          <p className="font-headline text-primary">Carregando...</p>
        </div>
      </div>
    );
  }

  const isAdmin = userData?.role === "admin";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Pizza className="text-primary w-8 h-8" />
            <span className="font-headline font-bold text-xl text-primary hidden sm:inline-block">
              PizzaConnect
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Painel
                </Link>
                <Link
                  href="/admin/orders"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Todos Pedidos
                </Link>
                <Link
                  href="/admin/users"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Vendedores
                </Link>
                <Link
                  href="/admin/new-order"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Adicionar Pedido
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/seller"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Novo Pedido
                </Link>
                <Link
                  href="/seller/orders"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Meus Pedidos
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold">{userData?.nome}</span>
              <span className="text-xs text-muted-foreground capitalize">
                {userData?.role}
              </span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b p-4 space-y-4 shadow-lg animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-4">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  Painel
                </Link>
                <Link
                  href="/admin/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  Todos Pedidos
                </Link>
                <Link
                  href="/admin/users"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  Vendedores
                </Link>
                <Link
                  href="/admin/new-order"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Adicionar Pedido
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/seller"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  Novo Pedido
                </Link>
                <Link
                  href="/seller/orders"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-medium"
                >
                  Meus Pedidos
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}