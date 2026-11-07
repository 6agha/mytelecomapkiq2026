import { useApp } from './store';
import { X } from './i18nExtra';
const D = {
  ar: {
    newsletterTitle: 'اشترك في نشرتنا الإخبارية', newsletterDesc: 'أدخل بريدك الإلكتروني لتصلك أحدث الأخبار والعروض', subscribe: 'اشتراك', subscribed: 'تم الاشتراك بنجاح', invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح', cancel: 'إلغاء',
    home: 'الرئيسية', categories: 'الأقسام', cart: 'السلة', account: 'حسابي', seeMore: 'عرض المزيد', retry: 'إعادة المحاولة', error: 'تعذر تحميل البيانات', settings: 'الإعدادات', darkMode: 'الوضع الليلي', language: 'اللغة', about: 'حول', contact: 'تواصل معنا', contactNote: 'الرقم 6668 يعمل داخل العراق فقط', version: 'إصدار التطبيق', soon: 'قريباً',
    emptyCart: 'السلة فارغة', total: 'الإجمالي', checkout: 'إتمام الطلب', addToCart: 'أضف إلى السلة', addedToCart: 'تمت إضافة المنتج إلى السلة', continueShopping: 'متابعة التسوق', goToCart: 'الذهاب للسلة',
    login: 'تسجيل الدخول', register: 'إنشاء حساب جديد', forgot: 'نسيت كلمة المرور', email: 'البريد الإلكتروني', password: 'كلمة المرور', firstName: 'الاسم الأول', lastName: 'اسم العائلة', logout: 'تسجيل الخروج',
    myOrders: 'طلباتي', order: 'طلب', noOrders: 'لا توجد طلبات سابقة', orderDetails: 'تفاصيل طلب', deliveryAddress: 'عنوان التوصيل', phone: 'رقم الهاتف', products: 'المنتجات', qty: 'الكمية',
    invoiceSummary: 'ملخص الفاتورة', productsTotal: 'مجموع المنتجات', subtotal: 'المجموع الفرعي', shipping: 'تكلفة الشحن', grandTotal: 'الإجمالي الكلي',
    shippingInfo: 'معلومات الشحن والتوصيل', governorate: 'المحافظة', city: 'المدينة / القضاء', address: 'العنوان بالتفصيل', placeOrder: 'تأكيد وإرسال الطلب',
    fillRequired: 'يرجى إدخال الحقول المطلوبة (الاسم، البريد، المدينة، العنوان، الهاتف)', orderFailed: 'حدثت مشكلة أثناء إتمام الطلب', orderReceived: 'تم استلام طلبك! رقم الطلب:',
    ok: 'موافق', success: 'تم بنجاح', errorTitle: 'خطأ', notice: 'تنبيه', genericError: 'حدث خطأ ما', accountCreated: 'تم إنشاء الحساب بنجاح', cannotCall: 'لا يمكن إجراء المكالمة',
    resetTitle: 'استعادة كلمة المرور', signIn: 'دخول', signUp: 'تسجيل', sendReset: 'إرسال رابط الاستعادة', registerQ: 'إنشاء حساب جديد؟', forgotQ: 'نسيت كلمة المرور؟', backToLogin: 'العودة لتسجيل الدخول',
    noProductsCat: 'لا توجد منتجات في هذا القسم', noProductsBrand: 'لا توجد منتجات لهذا البرند',
    selectOptions: 'يرجى تحديد الخيارات المطلوبة (اللون، السعة، إلخ) قبل الإضافة إلى السلة', options: 'الخيارات المتاحة', productDetails: 'تفاصيل المنتج'
  },
  en: {
    newsletterTitle: 'Subscribe to our newsletter', newsletterDesc: 'Enter your email to get the latest news and offers', subscribe: 'Subscribe', subscribed: 'Subscribed successfully', invalidEmail: 'Please enter a valid email', cancel: 'Cancel',
    home: 'Home', categories: 'Categories', cart: 'Cart', account: 'Account', seeMore: 'See more', retry: 'Retry', error: 'Could not load data', settings: 'Settings', darkMode: 'Dark mode', language: 'Language', about: 'About', contact: 'Contact us', contactNote: '6668 works inside Iraq only', version: 'App version', soon: 'Coming soon',
    emptyCart: 'Cart is empty', total: 'Total', checkout: 'Checkout', addToCart: 'Add to Cart', addedToCart: 'Product added to cart', continueShopping: 'Continue Shopping', goToCart: 'Go to Cart',
    login: 'Login', register: 'Register', forgot: 'Forgot Password', email: 'Email', password: 'Password', firstName: 'First Name', lastName: 'Last Name', logout: 'Logout',
    myOrders: 'My Orders', order: 'Order', noOrders: 'No previous orders', orderDetails: 'Order details', deliveryAddress: 'Delivery address', phone: 'Phone', products: 'Products', qty: 'Quantity',
    invoiceSummary: 'Order summary', productsTotal: 'Products total', subtotal: 'Subtotal', shipping: 'Shipping', grandTotal: 'Grand total',
    shippingInfo: 'Shipping & delivery info', governorate: 'Governorate', city: 'City / District', address: 'Full address', placeOrder: 'Confirm & place order',
    fillRequired: 'Please fill in the required fields (name, email, city, address, phone)', orderFailed: 'A problem occurred while placing the order', orderReceived: 'Your order was received! Order number:',
    ok: 'OK', success: 'Success', errorTitle: 'Error', notice: 'Notice', genericError: 'Something went wrong', accountCreated: 'Account created successfully', cannotCall: 'Cannot place the call',
    resetTitle: 'Reset Password', signIn: 'Sign in', signUp: 'Sign up', sendReset: 'Send reset link', registerQ: 'Create a new account?', forgotQ: 'Forgot password?', backToLogin: 'Back to login',
    noProductsCat: 'No products in this category', noProductsBrand: 'No products for this brand',
    selectOptions: 'Please select the required options (color, capacity, etc.) before adding to cart', options: 'Available options', productDetails: 'Product details'
  },
  ku: {
    newsletterTitle: 'بەشداربوون لە بوللتەنی هەواڵەکانمان', newsletterDesc: 'ئیمەیڵەکەت بنووسە بۆ وەرگرتنی نوێترین هەواڵ و ئۆفەرەکان', subscribe: 'بەشداربوون', subscribed: 'بە سەرکەوتوویی بەشداربوویت', invalidEmail: 'تکایە ئیمەیڵێکی دروست بنووسە', cancel: 'پاشگەزبوونەوە',
    home: 'سەرەکی', categories: 'بەشەکان', cart: 'سەبەتە', account: 'هەژمار', seeMore: 'زیاتر', retry: 'دووبارە', error: 'نەتوانرا زانیاری بار بکرێت', settings: 'ڕێکخستنەکان', darkMode: 'دۆخی شەو', language: 'زمان', about: 'دەربارە', contact: 'پەیوەندیمان پێوە بکە', contactNote: '6668 تەنها لە عێراق کار دەکات', version: 'وەشانی ئەپ', soon: 'بەم زووانە',
    emptyCart: 'سەبەتەکەت بەتاڵە', total: 'کۆی گشتی', checkout: 'تەواوکردنی داواکاری', addToCart: 'زیادکردن بۆ سەبەتە', addedToCart: 'بەرکەکە بۆ سەبەتە زیادکرا', continueShopping: 'بەردەوامبوون لە کڕین', goToCart: 'چوون بۆ سەبەتە',
    login: 'چوونەژوورەوە', register: 'دروستکردنی هەژمار', forgot: 'لەبیرچوونی وشەی تێپەڕ', email: 'ئیمەیڵ', password: 'وشەی تێپەڕ', firstName: 'ناوی یەکەم', lastName: 'ناوی خێزان', logout: 'دەرچوون',
    myOrders: 'داواکارییەکانم', order: 'داواکاری', noOrders: 'هیچ داواکارییەکی پێشوو نییە', orderDetails: 'وردەکاری داواکاری', deliveryAddress: 'ناونیشانی گەیاندن', phone: 'ژمارەی تەلەفۆن', products: 'بەرهەمەکان', qty: 'بڕ',
    invoiceSummary: 'پوختەی فاتورە', productsTotal: 'کۆی بەرهەمەکان', subtotal: 'کۆی لاوەکی', shipping: 'نرخی گەیاندن', grandTotal: 'کۆی گشتی کۆتایی',
    shippingInfo: 'زانیاری گەیاندن', governorate: 'پارێزگا', city: 'شار / قەزا', address: 'ناونیشانی ورد', placeOrder: 'دڵنیاکردنەوە و ناردنی داواکاری',
    fillRequired: 'تکایە خانە پێویستەکان پڕبکەرەوە (ناو، ئیمەیڵ، شار، ناونیشان، تەلەفۆن)', orderFailed: 'کێشەیەک ڕوویدا لە کاتی تەواوکردنی داواکاری', orderReceived: 'داواکارییەکەت وەرگیرا! ژمارەی داواکاری:',
    ok: 'باشە', success: 'سەرکەوتوو بوو', errorTitle: 'هەڵە', notice: 'ئاگاداری', genericError: 'هەڵەیەک ڕوویدا', accountCreated: 'هەژمارەکە بە سەرکەوتوویی دروستکرا', cannotCall: 'نەتوانرا پەیوەندی بکرێت',
    resetTitle: 'گەڕاندنەوەی وشەی تێپەڕ', signIn: 'چوونەژوورەوە', signUp: 'تۆمارکردن', sendReset: 'ناردنی بەستەری گەڕاندنەوە', registerQ: 'هەژمارێکی نوێ دروست بکە؟', forgotQ: 'وشەی تێپەڕت لەبیرچووە؟', backToLogin: 'گەڕانەوە بۆ چوونەژوورەوە',
    noProductsCat: 'هیچ بەرهەمێک لەم بەشەدا نییە', noProductsBrand: 'هیچ بەرهەمێک بۆ ئەم براندە نییە',
    selectOptions: 'تکایە هەڵبژاردنە پێویستەکان دیاری بکە (ڕەنگ، گنجایش، هتد) پێش زیادکردن بۆ سەبەتە', options: 'هەڵبژاردە بەردەستەکان', productDetails: 'وردەکاری بەرهەم'
  },
};
export const useT = () => { const l = useApp((s) => s.lang); return (k) => D[l]?.[k] ?? X[l]?.[k] ?? D.en[k] ?? X.en[k] ?? k; };
