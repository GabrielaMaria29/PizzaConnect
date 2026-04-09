'use server';
/**
 * @fileOverview This file implements a Genkit flow for administrators to get an AI-generated summary of order observations.
 *
 * - adminObservationSummary - A function that generates a summary of order observations.
 * - AdminObservationSummaryInput - The input type for the adminObservationSummary function.
 * - AdminObservationSummaryOutput - The return type for the adminObservationSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdminObservationSummaryInputSchema = z.object({
  observations: z
    .array(z.string())
    .describe('A list of observations from customer orders.'),
});
export type AdminObservationSummaryInput = z.infer<
  typeof AdminObservationSummaryInputSchema
>;

const AdminObservationSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'An AI-generated summary of the observations, highlighting trends, common complaints, or special requests.'
    ),
});
export type AdminObservationSummaryOutput = z.infer<
  typeof AdminObservationSummaryOutputSchema
>;

export async function adminObservationSummary(
  input: AdminObservationSummaryInput
): Promise<AdminObservationSummaryOutput> {
  return adminObservationSummaryFlow(input);
}

const adminObservationSummaryPrompt = ai.definePrompt({
  name: 'adminObservationSummaryPrompt',
  input: {schema: AdminObservationSummaryInputSchema},
  output: {schema: AdminObservationSummaryOutputSchema},
  prompt: `Você é um assistente de IA especializado em analisar feedback de clientes. Sua tarefa é analisar a lista de observações de pedidos fornecida e gerar um resumo conciso.

No resumo, você deve identificar e destacar:
- Tendências comuns ou padrões de comportamento dos clientes.
- Reclamações frequentes ou pontos de melhoria.
- Pedidos especiais recorrentes ou sugestões valiosas.

As observações são as seguintes:
{{#each observations}}
- {{{this}}}
{{/each}}

Por favor, forneça um resumo claro e objetivo para um administrador que precisa entender rapidamente o panorama geral das observações.`,
});

const adminObservationSummaryFlow = ai.defineFlow(
  {
    name: 'adminObservationSummaryFlow',
    inputSchema: AdminObservationSummaryInputSchema,
    outputSchema: AdminObservationSummaryOutputSchema,
  },
  async (input) => {
    const {output} = await adminObservationSummaryPrompt(input);
    return output!;
  }
);
