import { SITE } from './config';
import { useApp } from './store';
import { useQuery } from '@tanstack/react-query';

export const customBase = (lang) => `${SITE}/${lang}/wp-json/mytelecom/v1`;
export const wooBase = (lang) => `${SITE}/${lang}/wp-json/wc/store/v1`;

export async function getCustom(path, lang, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${customBase(lang)}${path}`, { headers });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.message || String(r.status));
  }
  return r.json();
}

export async function getWoo(path, lang, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${wooBase(lang)}${path}`, { headers });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export const useHome = () => {
  const lang = useApp((s) => s.lang);
  return useQuery({ queryKey: ['home', lang], queryFn: () => getCustom(`/home?lang=${lang}`, lang), staleTime: 60000 });
};

export const useCategories = () => {
  const lang = useApp((s) => s.lang);
  return useQuery({ queryKey: ['cats', lang], queryFn: () => getWoo('/products/categories?per_page=100', lang), staleTime: 60000 });
};

const emptyCart = () => ({ items: [], totals: { total_items: '0', total_price: '0' } });

// طابور: طلب سلة واحد في كل مرة حتى لا تتصادم الجلسات
let cartQueue = Promise.resolve();
const enqueue = (fn) => {
  const run = cartQueue.then(fn, fn);
  cartQueue = run.catch(() => {});
  return run;
};

async function cartRequest(method, endpoint, body = null) {
  const state = useApp.getState();
  const headers = { 'Content-Type': 'application/json' };
  if (state.cartToken) headers['Cart-Token'] = state.cartToken;
  if (state.authToken) headers['Authorization'] = `Bearer ${state.authToken}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const r = await fetch(`${wooBase(state.lang)}${endpoint}`, options);

  const newToken = r.headers.get('cart-token') || r.headers.get('Cart-Token');
  if (newToken && newToken !== state.cartToken && state.setCartToken) {
    await state.setCartToken(newToken);
  }

  const text = await r.text();
  let json = null;
  try { json = text && text.trim() ? JSON.parse(text) : null; } catch (e) {}

  if (!r.ok) {
    // رمز سلة منتهي أو غير صالح: نبدأ سلة جديدة
    if (method === 'GET' && (r.status === 401 || r.status === 403)) {
      if (state.cartToken && state.setCartToken) await state.setCartToken(null);
      return emptyCart();
    }
    throw new Error((json && json.message) || ({ ar: 'تعذر إتمام العملية', en: 'Could not complete the request', ku: 'نەتوانرا کارەکە تەواو بکرێت' }[state.lang] || 'Could not complete the request'));
  }
  return json || emptyCart();
}

const fetchCartAPI = (method, endpoint, body = null) => enqueue(() => cartRequest(method, endpoint, body));

export const useCart = () => {
  const lang = useApp((s) => s.lang);
  return useQuery({
    queryKey: ['cart', lang],
    queryFn: () => fetchCartAPI('GET', '/cart'),
    staleTime: 10000,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
    retry: 2,
    placeholderData: (prev) => prev,
  });
};

export const addToCart = (id, quantity = 1, variation = []) => fetchCartAPI('POST', '/cart/items', { id, quantity, variation });
export const updateCartItem = (key, quantity) => fetchCartAPI('PUT', `/cart/items/${key}`, { quantity });
export const removeCartItem = (key) => fetchCartAPI('DELETE', `/cart/items/${key}`);

export const useProduct = (slug) => {
  const lang = useApp((s) => s.lang);
  return useQuery({ queryKey: ['product', slug, lang], queryFn: async () => { const res = await getWoo(`/products?slug=${slug}`, lang); return res[0]; }, enabled: !!slug });
};

export const useCategoryProducts = (slug) => {
  const lang = useApp((s) => s.lang);
  return useQuery({ queryKey: ['category-products', slug, lang], queryFn: async () => { const cats = await getWoo('/products/categories?per_page=100', lang); const cat = cats.find(c => c.slug === slug); if (!cat) throw new Error('Category not found'); return getWoo(`/products?category=${cat.id}&per_page=100`, lang); }, enabled: !!slug });
};

export const useBrandProducts = (slug) => {
  const lang = useApp((s) => s.lang);
  return useQuery({ queryKey: ['brand-products', slug, lang], queryFn: async () => getWoo(`/products?search=${slug}&per_page=100`, lang), enabled: !!slug });
};

export const useAbout = () => {
  const lang = useApp((s) => s.lang);
  return useQuery({ queryKey: ['about', lang], queryFn: () => getCustom('/about', lang), staleTime: 300000 });
};

export const useOrders = (page = 1) => {
  const lang = useApp((s) => s.lang);
  const token = useApp((s) => s.authToken);
  return useQuery({
    queryKey: ['orders', lang, page, token],
    queryFn: () => getCustom(`/account/orders?page=${page}`, lang, token),
    enabled: !!token
  });
};

export const useOrder = (id) => {
  const lang = useApp((s) => s.lang);
  const token = useApp((s) => s.authToken);
  return useQuery({
    queryKey: ['order', id, lang, token],
    queryFn: () => getCustom(`/account/orders/${id}`, lang, token),
    enabled: !!id && !!token
  });
};

export const applyCoupon = (code) => fetchCartAPI('POST', '/cart/apply-coupon', { code });
export const removeCoupon = (code) => fetchCartAPI('POST', '/cart/remove-coupon', { code });
