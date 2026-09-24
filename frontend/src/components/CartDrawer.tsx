'use client';

import type { CartItem } from '@/types';

interface Props {
  items: CartItem[];
  total: number;
  onClose: () => void;
  onChangeQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

const formatPrice = (amount: number) => `PKR ${amount.toLocaleString('en-PK')}`;

export default function CartDrawer({ items, total, onClose, onChangeQuantity, onRemove, onCheckout }: Props) {
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping bag">
      <button type="button" aria-label="Close shopping bag" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col bg-[#f4f1ea] text-[#25221e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#c5a059]/40 px-6 py-5">
          <div>
            <p className="eyebrow text-[#7c6232]">Your selection</p>
            <h2 className="font-display text-3xl">Shopping bag</h2>
          </div>
          <button type="button" onClick={onClose} className="text-2xl text-[#756b5e] transition hover:text-[#25221e]" aria-label="Close shopping bag">&times;</button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <span className="mb-5 text-5xl text-[#c5a059]">◇</span>
            <h3 className="font-display text-2xl">Your bag is quiet.</h3>
            <p className="mt-2 max-w-xs text-sm leading-6 text-[#756b5e]">Add a considered piece from the collection and it will appear here.</p>
            <button type="button" onClick={onClose} className="mt-7 border border-[#25221e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] transition hover:bg-[#25221e] hover:text-[#f4f1ea]">Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
              {items.map(({ product, category, quantity }) => (
                <article key={product.id} className="flex gap-4 border-b border-[#c5a059]/30 pb-5">
                  <div className={`product-art product-art-${category.toLowerCase().replace(' ', '-')} h-24 w-20 shrink-0`}>
                    {product.image_url && <div className="product-photo" style={{ backgroundImage: `url(${product.image_url})` }} />}
                    <span>{product.title.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="eyebrow text-[#7c6232]">{category}</p>
                    <h3 className="mt-1 font-display text-xl leading-tight">{product.title}</h3>
                    <p className="mt-2 text-sm text-[#756b5e]">{formatPrice(product.price)}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[#c5a059]/50">
                        <button type="button" aria-label={`Decrease ${product.title} quantity`} onClick={() => onChangeQuantity(product.id, quantity - 1)} className="px-2 py-1 text-lg">−</button>
                        <span className="min-w-7 text-center text-sm">{quantity}</span>
                        <button type="button" aria-label={`Increase ${product.title} quantity`} onClick={() => onChangeQuantity(product.id, quantity + 1)} className="px-2 py-1 text-lg">+</button>
                      </div>
                      <button type="button" onClick={() => onRemove(product.id)} className="text-xs uppercase tracking-[0.14em] text-[#756b5e] underline underline-offset-4 hover:text-[#25221e]">Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="border-t border-[#c5a059]/50 px-6 py-6">
              <div className="flex items-center justify-between text-sm uppercase tracking-[0.16em] text-[#756b5e]">
                <span>Total</span>
                <strong className="text-lg tracking-normal text-[#25221e]">{formatPrice(total)}</strong>
              </div>
              <button type="button" onClick={onCheckout} className="mt-5 w-full bg-[#25221e] px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#f4f1ea] transition hover:bg-[#01411c]">Checkout</button>
              <p className="mt-3 text-center text-xs text-[#756b5e]">Complimentary delivery across Pakistan</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}