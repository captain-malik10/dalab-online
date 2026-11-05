import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Check, Loader2, Send, ShoppingCart, Sparkles, X } from 'lucide-react';
import { API_BASE } from '~/config/api';
import { useCart } from '~/hooks/useCart';
import { useGuestCart } from '~/hooks/useGuestCart';
import { LogoMark } from './Logo';

// Open the chat from anywhere: window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { message } }))
export const OPEN_CHAT_EVENT = 'dalab:open-chat';

export const openDalabChat = (message?: string) => {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT, { detail: { message } }));
};

interface ChatProduct {
  id: number;
  name: string;
  price: number;
  image_urls: string[];
  vendor_name: string;
  category_name: string;
  stock: number;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  products?: ChatProduct[];
}

const MAX_CHARS = 500;
const STORAGE_KEY = 'dalabChat';
const WELCOME: ChatMessage = {
  role: 'assistant',
  content:
    "Ku soo dhawoow! 👋 I'm Dalab AI. Tell me what you're looking for and your budget — in Somali or English — and I'll find it in our local stores.",
};
const SUGGESTIONS = ['Gifts under $50', 'Telefoon ka yar $200', 'How does delivery work?'];

function ProductMiniCard({
  product,
  onAdd,
}: {
  product: ChatProduct;
  onAdd: (product: ChatProduct) => Promise<void>;
}) {
  const [state, setState] = useState<'idle' | 'adding' | 'added' | 'error'>('idle');

  const handleAdd = async () => {
    setState('adding');
    try {
      await onAdd(product);
      setState('added');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="flex gap-3 rounded-xl border border-[var(--color-border)] bg-white p-2">
      <Link to={`/product/${product.id}`} className="shrink-0">
        <img
          src={product.image_urls[0] || '/favicon.svg'}
          alt={product.name}
          className="h-16 w-16 rounded-lg bg-[var(--color-light)] object-cover"
        />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/product/${product.id}`}
          className="line-clamp-2 text-sm font-semibold leading-snug hover:text-[var(--color-primary)]"
        >
          {product.name}
        </Link>
        <p className="truncate text-xs text-[var(--color-muted)]">{product.vendor_name}</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-bold text-[var(--color-primary)]">${product.price.toFixed(2)}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={state === 'adding' || state === 'added' || product.stock < 1}
            className="flex items-center gap-1 rounded-lg bg-[#FFB020] px-2.5 py-1 text-xs font-bold text-[#0B1F3A] hover:bg-amber-400 disabled:opacity-70"
          >
            {state === 'adding' ? (
              <Loader2 size={14} className="animate-spin" />
            ) : state === 'added' ? (
              <Check size={14} />
            ) : (
              <ShoppingCart size={14} />
            )}
            {product.stock < 1
              ? 'Sold out'
              : state === 'added'
                ? 'Added'
                : state === 'error'
                  ? 'Retry'
                  : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ChatAssistant() {
  const authCart = useCart();
  const guestCart = useGuestCart();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  // Restore the conversation for this browser tab
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {
      // ignore corrupted storage
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, MAX_CHARS);
      if (!content || loading) return;
      setError(null);
      setInput('');
      const history = [...messagesRef.current, { role: 'user' as const, content }];
      setMessages(history);
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history
              .filter((m) => m !== WELCOME)
              .slice(-10)
              .map(({ role, content }) => ({ role, content })),
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || 'Dalab AI is not available right now.');
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.reply, products: data.products || [] },
        ]);
      } catch (err: any) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [loading],
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const message = (event as CustomEvent<{ message?: string }>).detail?.message;
      setOpen(true);
      if (message) send(message);
      else setTimeout(() => inputRef.current?.focus(), 50);
    };
    window.addEventListener(OPEN_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handler);
  }, [send]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    send(input);
  };

  const addToCart = async (product: ChatProduct) => {
    if (localStorage.getItem('token')) {
      await authCart.addItem(product.id, 1);
    } else {
      guestCart.addItem(product.id, 1, {
        name: product.name,
        price: String(product.price),
        image_urls: product.image_urls,
        category_name: product.category_name,
        vendor_name: product.vendor_name,
      });
    }
  };

  const resetChat = () => {
    setMessages([WELCOME]);
    setError(null);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4189DD] to-[#255FA6] px-5 py-3 font-bold text-white shadow-xl ring-4 ring-white/70 transition hover:scale-105 sm:bottom-6 sm:right-6"
          aria-label="Ask Dalab AI"
        >
          <Sparkles size={18} className="text-[#FFB020]" />
          Ask Dalab AI ✨
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[var(--color-background)] shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-3rem)] sm:w-[400px] sm:rounded-2xl sm:border sm:border-[var(--color-border)]"
          role="dialog"
          aria-label="Dalab AI shopping assistant"
        >
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#4189DD] to-[#255FA6] px-4 py-3 text-white sm:rounded-t-2xl">
            <LogoMark className="h-9 w-9 rounded-xl ring-2 ring-white/40" />
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-tight">Dalab AI ✨</p>
              <p className="text-xs text-blue-100">Shopping help · Somali &amp; English</p>
            </div>
            <button
              type="button"
              onClick={resetChat}
              className="rounded-lg px-2 py-1 text-xs text-blue-100 hover:bg-white/15"
            >
              New chat
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/15"
              aria-label="Close chat"
            >
              <X size={22} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex flex-col gap-2 ${message.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-[#4189DD] text-white'
                      : 'rounded-bl-md border border-[var(--color-border)] bg-white text-[var(--color-dark)]'
                  }`}
                >
                  {message.content}
                </div>
                {message.products && message.products.length > 0 && (
                  <div className="w-full space-y-2">
                    {message.products.map((product) => (
                      <ProductMiniCard key={product.id} product={product} onAdd={addToCart} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => send(suggestion)}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-[#255FA6] hover:bg-blue-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
                <Loader2 size={16} className="animate-spin" /> Dalab AI is thinking…
              </div>
            )}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[#DC2626]">{error}</p>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-[var(--color-border)] bg-white p-3 sm:rounded-b-2xl"
          >
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_CHARS))}
                maxLength={MAX_CHARS}
                placeholder="Ask in Somali or English…"
                className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[#4189DD]"
                aria-label="Message Dalab AI"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4189DD] text-white hover:bg-[#2F74C8] disabled:opacity-50"
                aria-label="Send"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="mt-1.5 flex justify-between text-[11px] text-[var(--color-muted)]">
              <span>AI can make mistakes. Never share your PIN.</span>
              <span>
                {input.length}/{MAX_CHARS}
              </span>
            </p>
          </form>
        </div>
      )}
    </>
  );
}
