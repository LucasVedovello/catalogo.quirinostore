import type { CartItem } from "@/types";
import { formatPricePlain, onlyDigits } from "./utils";

export const STORE_NAME = "Quirino Store";

/** Número do vendedor (só dígitos, com DDI). Vem de NEXT_PUBLIC_WHATSAPP_NUMBER. */
export const WHATSAPP_NUMBER = onlyDigits(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "");

export const INSTAGRAM_HANDLE = (process.env.NEXT_PUBLIC_INSTAGRAM ?? "").replace(/^@/, "");

export interface OrderPayload {
  nome: string;
  telefone: string;
  itens: CartItem[];
  observacoes?: string;
}

export function calcOrderTotal(itens: CartItem[]): number {
  return itens.reduce((acc, i) => acc + i.preco * i.quantidade, 0);
}

/** Monta a mensagem formatada (markdown do WhatsApp) com o resumo do pedido. */
export function buildOrderMessage({ nome, telefone, itens, observacoes }: OrderPayload): string {
  const linhas: string[] = [];

  linhas.push(`*NOVO PEDIDO — ${STORE_NAME.toUpperCase()}*`);
  linhas.push("");
  linhas.push(`*Cliente:* ${nome.trim()}`);
  linhas.push(`*Telefone:* ${telefone.trim()}`);
  linhas.push("");
  linhas.push("*Itens:*");

  itens.forEach((item, i) => {
    const subtotal = item.preco * item.quantidade;
    linhas.push(`${i + 1}. ${item.nome}`);
    linhas.push(`   Tam: ${item.tamanho} | Cor: ${item.cor} | Qtd: ${item.quantidade}`);
    linhas.push(
      `   Unit: ${formatPricePlain(item.preco)} | Subtotal: ${formatPricePlain(subtotal)}`,
    );
  });

  linhas.push("");
  linhas.push(`*Total:* ${formatPricePlain(calcOrderTotal(itens))}`);

  if (observacoes?.trim()) {
    linhas.push("");
    linhas.push(`*Observações:* ${observacoes.trim()}`);
  }

  linhas.push("");
  linhas.push("_Pedido montado pelo catálogo online._");

  return linhas.join("\n");
}

/** Link wa.me com a mensagem pré-preenchida. Sem número configurado, abre o WhatsApp para o cliente escolher o contato. */
export function buildWhatsAppLink(message: string, number: string = WHATSAPP_NUMBER): string {
  const base = number ? `https://wa.me/${number}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}

/** Link rápido usado na página do produto ("Perguntar no WhatsApp"). */
export function buildProductInquiryLink(productName: string, productUrl?: string): string {
  const msg = [`Olá! Tenho interesse no produto *${productName}*.`, productUrl ?? ""]
    .filter(Boolean)
    .join("\n");
  return buildWhatsAppLink(msg);
}

export function buildGenericContactLink(): string {
  return buildWhatsAppLink(`Olá! Vim pelo catálogo da ${STORE_NAME} e queria tirar uma dúvida.`);
}
