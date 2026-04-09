'use server';
/**
 * @fileOverview A Genkit flow for generating AI-powered sales insights for administrators.
 *
 * - getAdminSalesInsights - A function that generates sales insights based on provided data.
 * - AdminSalesInsightsInput - The input type for the getAdminSalesInsights function.
 * - AdminSalesInsightsOutput - The return type for the getAdminSalesInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AdminSalesInsightsInputSchema = z.object({
  totalOrders: z
    .number()
    .describe('O número total de pedidos registrados no período.'),
  salesByFlavor: z
    .array(
      z.object({
        flavor: z.string().describe('O nome do sabor da pizza.'),
        count: z.number().describe('A quantidade de pizzas vendidas deste sabor.'),
      })
    )
    .describe('Uma lista de vendas agregadas por sabor de pizza.'),
  salesByPaymentMethod: z
    .array(
      z.object({
        method: z.string().describe('O método de pagamento (Ex: Pix, Cartão, Dinheiro).'),
        count: z.number().describe('A quantidade de vendas realizadas com este método.'),
      })
    )
    .describe('Uma lista de vendas agregadas por método de pagamento.'),
  salesBySeller: z
    .array(
      z.object({
        sellerName: z.string().describe('O nome do vendedor.'),
        count: z.number().describe('A quantidade de pedidos feitos por este vendedor.'),
      })
    )
    .describe('Uma lista de vendas agregadas por vendedor.'),
  periodDescription: z
    .string()
    .optional()
    .describe('Uma descrição do período dos dados (Ex: "última semana", "este mês").'),
});
export type AdminSalesInsightsInput = z.infer<typeof AdminSalesInsightsInputSchema>;

const AdminSalesInsightsOutputSchema = z.object({
  insights: z
    .string()
    .describe('Insights e recomendações gerados por IA com base nos dados de vendas.'),
});
export type AdminSalesInsightsOutput = z.infer<typeof AdminSalesInsightsOutputSchema>;

export async function getAdminSalesInsights(
  input: AdminSalesInsightsInput
): Promise<AdminSalesInsightsOutput> {
  return adminSalesInsightsFlow(input);
}

const adminSalesInsightsPrompt = ai.definePrompt({
  name: 'adminSalesInsightsPrompt',
  input: { schema: AdminSalesInsightsInputSchema },
  output: { schema: AdminSalesInsightsOutputSchema },
  prompt: `Você é um analista de negócios experiente e está revisando os dados de vendas de pizzas pré-assadas.
Seu objetivo é fornecer insights acionáveis e estratégicos para o administrador, ajudando-o a tomar decisões informadas.

Analise os seguintes dados de vendas ${
    '{{#if periodDescription}}' + 'para o período: {{{periodDescription}}}' + '{{/if}}'}

Total de Pedidos: {{{totalOrders}}}

Vendas por Sabor:
{{#each salesByFlavor}}- {{this.flavor}}: {{this.count}} pedidos
{{/each}}

Vendas por Método de Pagamento:
{{#each salesByPaymentMethod}}- {{this.method}}: {{this.count}} vendas
{{/each}}

Vendas por Vendedor:
{{#each salesBySeller}}- {{this.sellerName}}: {{this.count}} pedidos
{{/each}}

Com base nos dados acima, gere insights estratégicos e recomendações para o administrador. Foque em:
1. Desempenho geral e tendências.
2. Sabores de pizza mais populares e menos populares. Sugestões de marketing ou estoque.
3. Preferências de métodos de pagamento. Implicações para a gestão financeira ou promoções.
4. Desempenho dos vendedores. Identifique os melhores desempenhos e possíveis áreas de treinamento ou incentivo.
5. Quaisquer outras observações relevantes que possam levar a decisões de negócios mais informadas.

A resposta deve ser clara, concisa e formatada em português, pronta para ser apresentada ao administrador.`,
});

const adminSalesInsightsFlow = ai.defineFlow(
  {
    name: 'adminSalesInsightsFlow',
    inputSchema: AdminSalesInsightsInputSchema,
    outputSchema: AdminSalesInsightsOutputSchema,
  },
  async (input) => {
    const { output } = await adminSalesInsightsPrompt(input);
    return output!;
  }
);
