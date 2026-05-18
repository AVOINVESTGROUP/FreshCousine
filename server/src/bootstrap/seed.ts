import { collection } from '../lib/firestore.js';
import type { Market, Product, MarketProduct, ServiceZone } from '../types/models.js';

export async function seedData() {
  const markets: Market[] = [
    {
      marketId: 'market_marina',
      name: 'Марина Маркет',
      location: 'Дубай Марина',
      lat: 25.0808,
      lng: 55.1305,
      operatingHours: '08:00-22:00',
      isActive: true
    }
  ];

  const serviceZones: ServiceZone[] = [
    {
      zoneId: 'zone_marina',
      name: 'Marina / JLT',
      marketId: 'market_marina',
      polygon: null,
      minOrderMinor: 1500,
      deliveryFeeMinor: 180,
      serviceFeeMinor: 120,
      promisedEtaMin: 18,
      promisedEtaMax: 28,
      isActive: true
    }
  ];

  const products: Product[] = [
    {
      productId: 'product_cherry_tomato',
      name: 'Помидоры черри',
      slug: 'cherry-tomato',
      categoryId: 'category_vegetables',
      description: 'Сочные красные помидоры черри.',
      images: [],
      defaultUnit: 'кг',
      baseUnit: 'kg',
      handlingType: 'ambient',
      allergens: [],
      isOrganic: false,
      isActive: true
    },
    {
      productId: 'product_long_cucumber',
      name: 'Огурцы длинные',
      slug: 'long-cucumber',
      categoryId: 'category_vegetables',
      description: 'Хрустящие длинные огурцы.',
      images: [],
      defaultUnit: 'кг',
      baseUnit: 'kg',
      handlingType: 'ambient',
      allergens: [],
      isOrganic: false,
      isActive: true
    },
    {
      productId: 'product_avocado',
      name: 'Авокадо',
      slug: 'avocado',
      categoryId: 'category_vegetables',
      description: 'Зрелый авокадо для салатов и смузи.',
      images: [],
      defaultUnit: 'шт',
      baseUnit: 'piece',
      handlingType: 'chilled',
      allergens: [],
      isOrganic: true,
      isActive: true
    }
  ];

  const marketProducts: MarketProduct[] = [
    {
      marketProductId: 'mp_cherry_tomato',
      productId: 'product_cherry_tomato',
      marketId: 'market_marina',
      vendorId: 'vendor_local_1',
      estimatedMinPriceMinor: 1200,
      estimatedMaxPriceMinor: 1400,
      estimatedUnit: 'kg',
      priceMode: 'FIXED',
      availabilityStatus: 'LIKELY_AVAILABLE',
      lastObservedAt: new Date().toISOString(),
      isActive: true
    },
    {
      marketProductId: 'mp_long_cucumber',
      productId: 'product_long_cucumber',
      marketId: 'market_marina',
      vendorId: 'vendor_local_1',
      estimatedMinPriceMinor: 800,
      estimatedMaxPriceMinor: 950,
      estimatedUnit: 'kg',
      priceMode: 'FIXED',
      availabilityStatus: 'CONFIRM_REQUIRED',
      lastObservedAt: new Date().toISOString(),
      isActive: true
    },
    {
      marketProductId: 'mp_avocado',
      productId: 'product_avocado',
      marketId: 'market_marina',
      vendorId: 'vendor_local_2',
      estimatedMinPriceMinor: 2200,
      estimatedMaxPriceMinor: 2600,
      estimatedUnit: 'шт',
      priceMode: 'FIXED',
      availabilityStatus: 'LIKELY_AVAILABLE',
      lastObservedAt: new Date().toISOString(),
      isActive: true
    }
  ];

  const user = {
    userId: 'user_demo',
    name: 'Алексей Морозов',
    email: 'alexey@example.com',
    phone: '+971501234567',
    preferredLanguage: 'ru',
    dietPreferences: ['Mediterranean'],
    allergies: ['nuts', 'gluten'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  for (const market of markets) {
    await collection<Market>('markets').doc(market.marketId).set(market);
  }
  for (const zone of serviceZones) {
    await collection<ServiceZone>('service_zones').doc(zone.zoneId).set(zone);
  }
  for (const product of products) {
    await collection<Product>('products').doc(product.productId).set(product);
  }
  for (const marketProduct of marketProducts) {
    await collection<MarketProduct>('market_products').doc(marketProduct.marketProductId).set(marketProduct);
  }
  await collection('users').doc(user.userId).set(user);
}
