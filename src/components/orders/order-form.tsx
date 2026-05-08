"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPhone } from "@/lib/order-utils";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useCustomers, type Customer } from "@/hooks/use-customers";

const SABORES = [
  "Muçarela",
  "Calabresa",
  "Meia muçarela e meia calabresa",
] as const;

const PAGAMENTOS = ["Pix", "Cartão", "Dinheiro", "Ainda vai pagar"];
const ENTREGUE = ["NÃO", "SIM", "DOAÇÃO"] as const;

const orderSchema = z.object({
  numeroCanhoto: z.string().min(1, "Informe o número do canhoto"),
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(10, "Telefone inválido"),
  sabores: z
    .array(
      z.object({
        nome: z.enum(SABORES),
        quantidade: z.number().min(1),
      })
    )
    .min(1, "Informe a quantidade de pelo menos um sabor"),
  pagamento: z.string().min(1, "Selecione a forma de pagamento"),
  dataPagamento: z.string().optional(),
  observacao: z.string().optional(),
  entregue: z.string().min(1, "Selecione o status de entrega"),
});



type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  initialData?: any;
  onSubmit: (data: OrderFormValues) => Promise<void>;
  sellerName: string;
}

export function OrderForm({
  initialData,
  onSubmit,
  sellerName,
}: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Customer[]>([]);
  const { toast } = useToast();
  const { findCustomerByPhone, findCustomersByPrefix } = useCustomers();

  const initialSabores =
    initialData?.sabores?.length
      ? initialData.sabores
      : [];

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      numeroCanhoto: initialData?.numeroCanhoto || "",
      nome: initialData?.nome || "",
      telefone: initialData?.telefone || "",
      sabores: initialSabores,
      pagamento: initialData?.pagamento || "Ainda vai pagar",
      dataPagamento: initialData?.dataPagamento || "",
      observacao: initialData?.observacao || "",
      entregue: initialData?.entregue || "NÃO",
    },
  });

  const watchedSabores = form.watch("sabores") || [];

  const getQuantidade = (nome: string) => {
    const item = watchedSabores.find((s) => s.nome === nome);
    return item?.quantidade ?? 0;
  };

  const setQuantidade = (nome: typeof SABORES[number], quantidade: number) => {
    const saboresAtuais = form.getValues("sabores") || [];
    const filtrados = saboresAtuais.filter((s) => s.nome !== nome);

    if (quantidade > 0) {
      form.setValue("sabores", [...filtrados, { nome, quantidade }], {
        shouldValidate: true,
      });
    } else {
      form.setValue("sabores", filtrados, {
        shouldValidate: true,
      });
    }
  };

  const handleSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);

      form.reset({
        nome: "",
        telefone: "",
        sabores: [],
        pagamento: "Ainda vai pagar",
        dataPagamento: "",
        observacao: "",
        entregue: "NÃO",
      });

      toast({
        title: "Sucesso!",
        description: "Pedido salvo com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="numeroCanhoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Canhoto</FormLabel>

                <FormControl>
                  <Input
                    placeholder="Ex: 152"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Cliente</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome completo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem className="relative">
                <FormLabel>Telefone</FormLabel>

                <FormControl>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={field.value}
                    onChange={async (e) => {

                      const telefoneFormatado =
                        formatPhone(e.target.value);

                      field.onChange(telefoneFormatado);

                      const telefoneNumerico =
                        telefoneFormatado.replace(/\D/g, "");

                      // Buscar sugestões
                      if (telefoneNumerico.length >= 3) {

                        const clientes =
                          await findCustomersByPrefix(
                            telefoneNumerico
                          );

                        setSuggestions(clientes);

                      } else {

                        setSuggestions([]);

                      }

                      // Preencher automático quando completo
                      if (telefoneNumerico.length >= 11) {

                        const customer =
                          await findCustomerByPhone(
                            telefoneNumerico
                          );

                        if (customer) {

                          form.setValue(
                            "nome",
                            customer.nome || ""
                          );

                          setSuggestions([]);

                        }

                      }

                    }}
                  />
                </FormControl>

                {/* Lista de sugestões */}

                {suggestions.length > 0 && (
                  <div className="absolute z-50 w-full bg-white border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">

                    {suggestions.map((c) => (

                      <div
                        key={c.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {

                          form.setValue("telefone", c.telefone);
                          form.setValue("nome", c.nome);

                          setSuggestions([]);

                        }}
                      >
                        <div className="text-sm font-medium">
                          {c.telefone}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {c.nome}
                        </div>

                      </div>

                    ))}

                  </div>
                )}

                <FormMessage />

              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Quem vendeu</FormLabel>
          <Input value={sellerName} disabled className="bg-muted" />
        </div>

        <div className="space-y-3">
          <FormLabel>Quantidade por sabor</FormLabel>
          <div className="space-y-3">
            {SABORES.map((sabor) => (
              <div
                key={sabor}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <span className="font-medium">{sabor}</span>
                <Input
                  type="number"
                  min={0}
                  className="w-24"
                  value={getQuantidade(sabor)}
                  onChange={(e) =>
                    setQuantidade(sabor, Number(e.target.value || 0))
                  }
                />
              </div>
            ))}
          </div>
          {form.formState.errors.sabores && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.sabores.message as string}
            </p>
          )}
        </div>

        <FormField
          control={form.control}
          name="pagamento"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Pagamento</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {PAGAMENTOS.map((item) => (
                    <FormItem
                      key={item}
                      className="flex items-center space-x-2 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={item} />
                      </FormControl>
                      <FormLabel className="font-normal">{item}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormMessage />
       
        <FormField
          control={form.control}
          name="dataPagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de pagamento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Textarea placeholder="Informações adicionais..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entregue"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Entregue</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  {ENTREGUE.map((item) => (
                    <FormItem
                      key={item}
                      className="flex items-center space-x-2 space-y-0"
                    >
                      <FormControl>
                        <RadioGroupItem value={item} />
                      </FormControl>
                      <FormLabel className="font-normal">{item}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1 font-headline">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Pedido
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              form.reset({
                numeroCanhoto: "",
                nome: "",
                telefone: "",
                sabores: [],
                pagamento: "Ainda vai pagar",
                dataPagamento: "",
                observacao: "",
                entregue: "NÃO",
              })
            }
            className="font-headline"
          >
            Limpar
          </Button>
        </div>
      </form>
    </Form>
  );
}