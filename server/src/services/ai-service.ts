import { collection } from '../lib/firestore.js';
import { nowIso, generateId } from '../lib/utils.js';
import type { MarketProduct, Product } from '../types/models.js';

const defaultWarnings = [
  'Final availability, exact weight, and final price will be confirmed at the market.'
];

export class AiService {
  async textToBasket(userId: string, payload: { text: string; marketId: string; servings?: number }) {
    const lower = payload.text.toLowerCase();
    const matches: string[] = [];
    const dishes: string[] = [];
    const ingredients: string[] = [];

    if (lower.includes('греческ') || lower.includes('салат')) {
      dishes.push('Греческий салат');
      matches.push('Помидоры черри', 'Огурцы длинные', 'Лимоны');
    }
    if (lower.includes('стир') || lower.includes('брокколи')) {
      dishes.push('Овощной стир-фрай');
      matches.push('Морковь', 'Брокколи');
    }
    if (lower.includes('смузи') || lower.includes('зелёный')) {
      dishes.push('Зелёный смузи');
      matches.push('Шпинат свежий', 'Авокадо', 'Бананы');
    }
    if (lower.includes('фрукт') || lower.includes('клубник')) {
      dishes.push('Фруктовый салат');
      matches.push('Клубника', 'Яблоки красные');
    }

    if (dishes.length === 0) {
      dishes.push('Сезонный микс из овощей и фруктов');
      matches.push('Помидоры черри', 'Брокколи', 'Лимоны');
    }

    const marketProductSnapshot = await collection<MarketProduct>('market_products')
      .where('marketId', '==', payload.marketId)
      .get();

    const candidateNames = new Set(matches);
    const selectedItems = [] as Array<{ marketProductId: string; productId: string; requestedQty: number; requestedUnit: string; name: string }>;

    const productsSnapshot = await collection<Product>('products').get();
    const productMap = new Map<string, Product>();
    productsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      productMap.set(data.name.toLowerCase(), data);
    });

    marketProductSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const normalized = data.productId.toLowerCase();
      if (candidateNames.has(data.productId) || candidateNames.has(normalized)) {
        selectedItems.push({
          marketProductId: data.marketProductId,
          productId: data.productId,
          requestedQty: payload.servings ?? 2,
          requestedUnit: data.estimatedUnit,
          name: data.productId
        });
      }
    });

    if (selectedItems.length === 0) {
      marketProductSnapshot.docs.slice(0, 4).forEach(doc => {
        const data = doc.data();
        selectedItems.push({
          marketProductId: data.marketProductId,
          productId: data.productId,
          requestedQty: 1,
          requestedUnit: data.estimatedUnit,
          name: data.productId
        });
      });
    }

    selectedItems.forEach(item => {
      ingredients.push(item.name);
    });

    const response = {
      requestId: generateId('ai'),
      userId,
      dishes,
      ingredients: Array.from(new Set(ingredients)),
      warnings: defaultWarnings,
      substitutionAllowed: true,
      marketWarnings: [
        'Final availability, exact weight, and final price will be confirmed at the market.',
        'Items marked CONFIRM_REQUIRED need manual verification before purchase.'
      ],
      createdAt: nowIso()
    };

    await collection('ai_requests').doc(response.requestId).set(response);
    return response;
  }
}
