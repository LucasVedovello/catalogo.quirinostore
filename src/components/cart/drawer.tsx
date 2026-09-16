"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImageOff, MessageCircle, ShoppingBag, Trash2, X } from "lucide-react";
import type { CartItem } from "@/types";
import { cn, formatPhone, formatPrice, onlyDigits } from "@/lib/utils";
import { buildOrderMessage, buildWhatsAppLink, WHATSAPP_NUMBER } from "@/lib/whatsapp";
import { selectTotalValue, useCart } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";
import { QuantityStepper } from "@/components/ui/quantity-stepper";

const CUSTOMER_KEY = "quirino-store-cliente";

export function CartDrawer() {
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const clear = useCart((s) => s.clear);
  const total = useCart(selectTotalValue);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<{ nome?: string; telefone?: string }>({});
  const [sent, setSent] = useState(false);

  // Lembra nome/telefone do cliente para o próximo pedido
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOMER_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { nome?: string; telefone?: string };
        if (saved.nome) setNome(saved.nome);
        if (saved.telefone) setTelefone(saved.telefone);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Esc fecha + trava o scroll da página
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (items.length === 0) setSent(false);
  }, [items.length]);

  const validate = () => {
    const next: typeof errors = {};
    if (nome.trim().length < 2) next.nome = "Informe seu nome.";
    const digits = onlyDigits(telefone);
    if (digits.length < 10 || digits.length > 11) next.telefone = "Informe um telefone válido com DDD.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const finalizar = () => {
    if (items.length === 0 || !validate()) return;

    try {
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ nome: nome.trim(), telefone }));
    } catch {
      /* ignore */
    }

    const message = buildOrderMessage({ nome, telefone, itens: items, observacoes });
    const link = buildWhatsAppLink(message);
    // Chamado de forma síncrona dentro do clique → não é bloqueado como pop-up
    window.open(link, "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const count = items.reduce((a, i) => a + i.quantidade, 0);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/70 transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={close}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-background transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho"
        aria-hidden={!isOpen}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-5">
          <h2 className="font-display text-base font-black uppercase tracking-tight">
            Seu carrinho{" "}
            <span className="text-muted">
              ({count} {count === 1 ? "item" : "itens"})
            </span>
          </h2>
          <button
            type="button"
            onClick={close}
            className="-mr-2 grid h-10 w-10 place-items-center hover:bg-surface-2"
            aria-label="Fechar carrinho"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="grid h-16 w-16 place-items-center border border-border bg-surface">
              <ShoppingBag className="h-7 w-7 text-muted" />
            </div>
            <div>
              <p className="font-display text-lg font-black uppercase">Carrinho vazio</p>
              <p className="mt-1 text-sm text-muted">Adicione peças para montar seu pedido.</p>
            </div>
            <Button variant="outline" size="sm" onClick={close}>
              Continuar comprando
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <CartRow key={item.id} item={item} />
                ))}
              </ul>

              <div className="space-y-4 border-t border-border p-5">
                <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
                  Seus dados
                </p>
                <Field label="Nome" htmlFor="cart-nome" error={errors.nome}>
                  <Input
                    id="cart-nome"
                    autoComplete="name"
                    placeholder="Como podemos te chamar?"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    aria-invalid={!!errors.nome}
                  />
                </Field>
                <Field label="Telefone / WhatsApp" htmlFor="cart-telefone" error={errors.telefone}>
                  <Input
                    id="cart-telefone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    placeholder="(11) 99999-9999"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    aria-invalid={!!errors.telefone}
                  />
                </Field>
                <Field label="Observações (opcional)" htmlFor="cart-obs">
                  <Textarea
                    id="cart-obs"
                    placeholder="Ex.: prefiro retirar na loja, entregar depois das 18h..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    className="min-h-20"
                  />
                </Field>
              </div>
            </div>

            <footer className="shrink-0 space-y-3 border-t border-border bg-surface p-5">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-[0.2em] text-muted">
                  Total
                </span>
                <span className="font-display text-2xl font-black tabular-nums">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted">
                Frete e forma de pagamento são combinados no WhatsApp após o envio do pedido.
              </p>

              {sent ? (
                <div className="space-y-2 border border-success/40 bg-success/10 p-3 text-sm">
                  <p className="font-semibold text-success">Pedido aberto no WhatsApp!</p>
                  <p className="text-muted">
                    Se a conversa não abriu, toque no botão de novo. Depois de enviar, você pode
                    limpar o carrinho.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button variant="whatsapp" size="sm" onClick={finalizar} className="flex-1">
                      <MessageCircle className="h-4 w-4" /> Abrir de novo
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clear}>
                      Limpar carrinho
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="whatsapp" size="lg" block onClick={finalizar}>
                  <MessageCircle className="h-5 w-5" /> Finalizar pedido no WhatsApp
                </Button>
              )}

              {!WHATSAPP_NUMBER && (
                <p className="text-[11px] text-promo">
                  NEXT_PUBLIC_WHATSAPP_NUMBER não configurado — o WhatsApp abrirá sem destinatário.
                </p>
              )}
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function CartRow({ item }: { item: CartItem }) {
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const close = useCart((s) => s.close);

  return (
    <li className="flex gap-3 p-4">
      <Link
        href={`/produtos/${item.slug}`}
        onClick={close}
        className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden border border-border bg-surface"
      >
        {item.imagem ? (
          <Image src={item.imagem} alt={item.nome} fill sizes="80px" className="object-cover" />
        ) : (
          <div className="grid h-full place-items-center text-muted">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/produtos/${item.slug}`}
            onClick={close}
            className="line-clamp-2 font-display text-sm font-bold uppercase leading-tight hover:text-primary"
          >
            {item.nome}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center text-muted hover:text-danger"
            aria-label={`Remover ${item.nome}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-0.5 text-xs text-muted">
          Tam. <span className="text-foreground">{item.tamanho}</span> · Cor{" "}
          <span className="text-foreground">{item.cor}</span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <QuantityStepper
            size="sm"
            value={item.quantidade}
            min={1}
            max={Math.max(1, item.estoque)}
            onChange={(q) => updateQuantity(item.id, q)}
          />
          <div className="text-right">
            <p className="font-display text-sm font-black tabular-nums">
              {formatPrice(item.preco * item.quantidade)}
            </p>
            {item.quantidade > 1 && (
              <p className="text-[11px] text-muted tabular-nums">{formatPrice(item.preco)} cada</p>
            )}
          </div>
        </div>
        {item.quantidade >= item.estoque && item.estoque > 0 && (
          <p className="mt-1 text-[11px] text-muted">Máximo disponível: {item.estoque}</p>
        )}
      </div>
    </li>
  );
}
