// يحوّل وجهة الـ API إلى شاشة داخل التطبيق
export function go(router, t) {
  if (!t) return;
  switch (t.type) {
    case 'product': return router.push(`/product/${t.slug}`);
    case 'category': return router.push(`/category/${t.slug}`);
    case 'brand': return router.push(`/brand/${t.slug}`);
    case 'all': return router.push('/category/all');
    case 'about': return router.push('/about');
    case 'contact': return router.push('/about');
    default: return; // home / unknown: لا شيء
  }
}
