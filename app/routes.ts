import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('admin', 'routes/admin/layout.tsx', [
    index('routes/admin/index.tsx'),
    route('dashboard', 'routes/admin/dashboard.tsx'),
    route('financials', 'routes/admin/financials.tsx'),
    route('products', 'routes/admin/products.tsx'),
    route('orders', 'routes/admin/orders.tsx'),
    route('orders/:orderId', 'routes/admin/order-details.tsx'),
    route('deliveries', 'routes/admin/deliveries.tsx'),
    route('stores', 'routes/admin/stores.tsx'),
    route('settings', 'routes/admin/settings.tsx'),
  ]),
  route('store', 'routes/store/layout.tsx', [
    index('routes/store/index.tsx'),
    route(':storeName/dashboard', 'routes/store/dashboard.tsx'),
    route(':storeName/orders', 'routes/store/orders.tsx'),
    route(':storeName/products', 'routes/store/products.tsx'),
    route(':storeName/settings', 'routes/store/settings.tsx'),
  ]),
  route('login', 'routes/login.tsx'),
  route('register', 'routes/register.tsx'),
  route('users', 'routes/users.tsx'),
  route('shop', 'routes/shop.tsx'),
  route('product/:id', 'routes/product-details.tsx'),
  route('checkout', 'routes/checkout.tsx'),
  route('Cart', 'routes/Cart.tsx'),
  route('wishlist', 'routes/wishlist.tsx'),
  route('store/:id', 'routes/store-details.tsx'),
  route('orders', 'routes/orders.tsx'),
  route('orders/:orderId', 'routes/order-details.tsx'), // New route for order details
  route('profile', 'routes/profile.tsx'),
  route('contact', 'routes/contact.tsx'),
  route('*', 'routes/404.tsx'), // Catch-all route for 404
] satisfies RouteConfig;
