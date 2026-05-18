import { useEffect, useMemo, useState } from 'react';

type Product = {
  id: number;
  name: string;
  price: number;
  unit: string;
  img: string;
  category: string;
};

type Recipe = {
  id: number;
  name: string;
  matchIngredients: string[];
  desc: string;
  time: string;
  servings: string;
  difficulty: string;
  ingredients: string[];
  steps: string;
};

type MealItem = {
  name: string;
  qty: number;
  price: number;
};

const products: Product[] = [
  { id: 1, name: 'Помидоры черри', price: 12, unit: 'кг', img: 'https://picsum.photos/id/292/300/200', category: 'овощи' },
  { id: 2, name: 'Огурцы длинные', price: 8, unit: 'кг', img: 'https://picsum.photos/id/1080/300/200', category: 'овощи' },
  { id: 3, name: 'Авокадо', price: 25, unit: 'шт', img: 'https://picsum.photos/id/201/300/200', category: 'овощи' },
  { id: 4, name: 'Бананы', price: 10, unit: 'кг', img: 'https://picsum.photos/id/160/300/200', category: 'фрукты' },
  { id: 5, name: 'Шпинат свежий', price: 15, unit: 'пучок', img: 'https://picsum.photos/id/251/300/200', category: 'овощи' },
  { id: 6, name: 'Лимоны', price: 9, unit: 'кг', img: 'https://picsum.photos/id/312/300/200', category: 'фрукты' },
  { id: 7, name: 'Морковь', price: 7, unit: 'кг', img: 'https://picsum.photos/id/431/300/200', category: 'овощи' },
  { id: 8, name: 'Яблоки красные', price: 14, unit: 'кг', img: 'https://picsum.photos/id/106/300/200', category: 'фрукты' },
  { id: 9, name: 'Клубника', price: 30, unit: 'кг', img: 'https://picsum.photos/id/107/300/200', category: 'фрукты' },
  { id: 10, name: 'Брокколи', price: 18, unit: 'кг', img: 'https://picsum.photos/id/108/300/200', category: 'овощи' }
];

const recipeDatabase: Recipe[] = [
  {
    id: 1,
    name: 'Греческий салат с лимонным дрессингом',
    matchIngredients: ['Помидоры черри', 'Огурцы длинные', 'Лимоны'],
    desc: 'Классика. Идеально сбалансирован по текстуре и кислотности. Отлично подходит для вашего выбора.',
    time: '8 мин',
    servings: '2',
    difficulty: 'Легко',
    ingredients: ['Помидоры черри', 'Огурцы длинные', 'Лимоны', 'Оливковое масло', 'Фета (опц.)'],
    steps: '1. Нарежьте помидоры и огурцы. 2. Смешайте сок лимона с маслом. 3. Заправьте и подавайте сразу.'
  },
  {
    id: 2,
    name: 'Зелёный энерджайзер-смузи',
    matchIngredients: ['Бананы', 'Шпинат свежий', 'Авокадо', 'Лимоны'],
    desc: 'Мощный заряд витаминов и клетчатки. Grok рекомендует именно этот вариант для вашего набора.',
    time: '5 мин',
    servings: '1',
    difficulty: 'Легко',
    ingredients: ['Бананы', 'Шпинат свежий', 'Авокадо', 'Лимоны', 'Миндальное молоко'],
    steps: '1. Положите все ингредиенты в блендер. 2. Добавьте 150 мл жидкости. 3. Взбейте 40 секунд.'
  },
  {
    id: 3,
    name: 'Овощной стир-фрай с брокколи',
    matchIngredients: ['Морковь', 'Брокколи', 'Лимоны'],
    desc: 'Быстрый ужин с максимальной пользой. Сохраняет все витамины благодаря высокой температуре.',
    time: '12 мин',
    servings: '3',
    difficulty: 'Средне',
    ingredients: ['Морковь', 'Брокколи', 'Лимоны', 'Чеснок', 'Соевый соус'],
    steps: '1. Обжарьте морковь 4 мин. 2. Добавьте брокколи. 3. Заправьте лимоном и соусом.'
  },
  {
    id: 4,
    name: 'Фруктовый салат с мятой',
    matchIngredients: ['Яблоки красные', 'Бананы', 'Клубника', 'Лимоны'],
    desc: 'Лёгкий десерт или перекус. Идеально для жаркого дня в Дубае.',
    time: '7 мин',
    servings: '4',
    difficulty: 'Легко',
    ingredients: ['Яблоки красные', 'Бананы', 'Клубника', 'Лимоны', 'Мята'],
    steps: '1. Нарежьте фрукты кубиками. 2. Полейте лимонным соком. 3. Украсьте мятой.'
  },
  {
    id: 5,
    name: 'Капрезе с авокадо',
    matchIngredients: ['Помидоры черри', 'Авокадо', 'Лимоны'],
    desc: 'Итальянская классика с современным твистом. Отличный вариант для ужина.',
    time: '6 мин',
    servings: '2',
    difficulty: 'Легко',
    ingredients: ['Помидоры черри', 'Авокадо', 'Лимоны', 'Базилик', 'Моцарелла'],
    steps: '1. Нарежьте авокадо и помидоры. 2. Выложите слоями. 3. Полейте лимоном.'
  }
];

const initialMealPrompt = 'Пример: хочу приготовить ужин на 4 человек — греческий салат, стир-фрай с брокколи и фруктовый салат';

export default function App() {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [isAiSectionVisible, setAiSectionVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [recipeActionMessage, setRecipeActionMessage] = useState('');
  const [mealInput, setMealInput] = useState('');
  const [mealModal, setMealModal] = useState<MealItem[] | null>(null);
  const [toastMessages, setToastMessages] = useState<string[]>([]);
  const [mealSummary, setMealSummary] = useState<{ total: number; numPeople: number; dishNames: string[] } | null>(null);

  useEffect(() => {
    const demoIds = [1, 2, 5];
    const demoProducts = products.filter(product => demoIds.includes(product.id));
    setSelectedProducts(demoProducts);
  }, []);

  const selectedNames = useMemo(() => selectedProducts.map(product => product.name), [selectedProducts]);

  const recipeCards = useMemo(() => {
    const scored = recipeDatabase
      .map(recipe => {
        const score = recipe.matchIngredients.reduce((sum, ingredient) => sum + (selectedNames.includes(ingredient) ? 2 : 0), 0) + (selectedNames.length > 3 ? 1 : 0);
        return { recipe, score };
      })
      .sort((a, b) => b.score - a.score);

    const topRecipes = scored.slice(0, 3).map(item => item.recipe);
    if (topRecipes.length < 3) {
      const remaining = recipeDatabase.filter(recipe => !topRecipes.some(top => top.id === recipe.id)).slice(0, 3 - topRecipes.length);
      return [...topRecipes, ...remaining];
    }
    return topRecipes;
  }, [selectedNames]);

  const cartSummary = useMemo(() => {
    const grouped = cart.reduce<Record<string, { count: number; price: number; unit: string }>>((acc, item) => {
      acc[item.name] = acc[item.name] || { count: 0, price: item.price, unit: item.unit };
      acc[item.name].count += 1;
      return acc;
    }, {});
    return grouped;
  }, [cart]);

  const totalCart = cart.reduce((sum, item) => sum + item.price, 0);

  const toggleSelect = (productId: number) => {
    setSelectedProducts(prev => {
      const exists = prev.some(product => product.id === productId);
      if (exists) {
        return prev.filter(product => product.id !== productId);
      }
      if (prev.length >= 10) {
        showToast('Максимум 10 продуктов для одного запроса к Grok');
        return prev;
      }
      const product = products.find(product => product.id === productId);
      return product ? [...prev, product] : prev;
    });
  };

  const addToCart = (productId: number) => {
    const product = products.find(item => item.id === productId);
    if (!product) return;
    setCart(prev => [...prev, product]);
    showToast(`${product.name} добавлен в корзину`);
  };

  const showToast = (message: string) => {
    setToastMessages(prev => [...prev, message]);
    window.setTimeout(() => {
      setToastMessages(prev => prev.slice(1));
    }, 2500);
  };

  const generateRecipes = () => {
    if (selectedProducts.length === 0) {
      showToast('Выберите хотя бы один продукт для Grok AI');
      return;
    }
    setIsGenerating(true);
    window.setTimeout(() => {
      setIsGenerating(false);
      setAiSectionVisible(true);
      showToast('Grok AI готовил ваши рекомендации');
      document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 1350);
  };

  const regenerateRecipes = () => {
    setRecipeActionMessage('Обновляем рекомендации...');
    window.setTimeout(() => {
      setRecipeActionMessage('');
      showToast('Рекомендации Grok обновлены');
    }, 650);
  };

  const addRecipeToCart = (recipeId: number) => {
    const recipe = recipeDatabase.find(item => item.id === recipeId);
    if (!recipe) return;
    const updatedCart = [...cart];
    recipe.ingredients.forEach(ingName => {
      const product = products.find(item => item.name.toLowerCase().includes(ingName.toLowerCase().split(' ')[0]));
      if (product) updatedCart.push(product);
    });
    setCart(updatedCart);
    showToast(`Добавлено ингредиентов из рецепта «${recipe.name}»`);
    window.setTimeout(() => {
      setAiSectionVisible(true);
      regenerateRecipes();
    }, 1800);
  };

  const processMealRequest = () => {
    const input = mealInput.trim();
    if (!input) {
      showToast('Пожалуйста, опишите желаемое меню');
      return;
    }
    let numPeople = 4;
    const peopleMatch = input.match(/(\d+)\s*(человек|персон|гостей|порций)/i);
    if (peopleMatch) numPeople = Number(peopleMatch[1]);
    const lowerInput = input.toLowerCase();
    const chosenRecipes: Recipe[] = [];
    if (lowerInput.includes('греческ') || lowerInput.includes('салат')) chosenRecipes.push(recipeDatabase[0]);
    if (lowerInput.includes('стир') || lowerInput.includes('брокколи') || lowerInput.includes('овощ')) chosenRecipes.push(recipeDatabase[2]);
    if (lowerInput.includes('фрукт') || lowerInput.includes('клубник') || lowerInput.includes('десерт')) chosenRecipes.push(recipeDatabase[3]);
    if (chosenRecipes.length === 0) chosenRecipes.push(recipeDatabase[0], recipeDatabase[2], recipeDatabase[3]);
    const scale = numPeople / 2;
    const ingredientMap = new Map<string, MealItem>();
    chosenRecipes.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        if (!ingredientMap.has(ing)) {
          const product = products.find(item => item.name.toLowerCase().includes(ing.toLowerCase().split(' ')[0]));
          const price = product ? product.price : 12;
          ingredientMap.set(ing, { name: ing, qty: Math.ceil(scale * 1.3), price });
        }
      });
    });
    const mealItems = Array.from(ingredientMap.values());
    setMealModal(mealItems);
    setMealSummary({ total: mealItems.reduce((sum, item) => sum + item.qty * item.price, 0), numPeople, dishNames: chosenRecipes.map(recipe => recipe.name) });
    setMealInput('');
  };

  const confirmMealOrder = () => {
    setMealModal(null);
    setCart(prev => [...prev, products[0], products[1], products[4], products[6]]);
    setMealSummary(null);
    setCartOpen(true);
    showToast('Заказ на ужин оформлен!');
  };

  const openRecipeModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="flex items-center justify-between py-5">
            <div className="flex items-center gap-x-3">
              <div className="w-11 h-11 bg-emerald-600 rounded-2xl flex items-center justify-center">
                <i className="fa-solid fa-leaf text-white text-3xl" />
              </div>
              <div>
                <span className="logo-font text-3xl font-bold tracking-tighter">FreshAI</span>
                <span className="text-emerald-500 text-xs font-mono tracking-[3px] block -mt-1">DUBAI</span>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-x-9 text-sm font-medium">
              {['Магазин', 'Рецепты', 'Доставка', 'Фермеры'].map(label => (
                <a key={label} href="#" className="hover:text-emerald-400 transition-colors">
                  {label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-x-4">
              <div className="hidden sm:flex items-center gap-x-2 bg-zinc-900 px-3 py-1.5 rounded-2xl text-xs">
                <i className="fa-solid fa-location-dot text-emerald-500" />
                <span className="font-medium">Дубай, ОАЭ</span>
              </div>
              <button onClick={() => setAccountOpen(true)} className="flex items-center gap-x-2 px-4 py-2 text-sm font-medium hover:bg-zinc-900 rounded-2xl transition-colors">
                <i className="fa-solid fa-user text-lg" />
                <span className="hidden md:inline">Алексей</span>
              </button>
              <button onClick={() => setCartOpen(true)} className="relative flex items-center justify-center w-10 h-10 hover:bg-zinc-900 rounded-2xl transition-colors">
                <i className="fa-solid fa-shopping-bag text-xl" />
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-mono w-5 h-5 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <section className="hero-bg h-[620px] flex items-center relative">
        <div className="max-w-screen-2xl mx-auto px-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-x-2 bg-white/10 backdrop-blur-md px-4 py-1 rounded-full mb-6">
              <div className="ai-badge flex items-center gap-x-1.5">
                <i className="fa-solid fa-robot" />
                <span>GROK 2026</span>
              </div>
              <span className="text-xs text-white/70">Powered by xAI</span>
            </div>
            <h1 className="text-7xl font-bold tracking-tighter leading-none mb-4">
              Свежие овощи<br />и фрукты.<br />
              <span className="text-emerald-400">Умный выбор.</span>
            </h1>
            <p className="max-w-md text-xl text-white/80 mb-8">
              Доставка по Дубаю за 25 минут.<br />
              Grok AI мгновенно подбирает идеальные рецепты под ваш выбор.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => document.getElementById('shop-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 bg-white text-zinc-950 font-semibold rounded-3xl flex items-center gap-x-3 hover:bg-zinc-100 transition-all active:scale-[0.985]">
                <span>Начать покупки</span>
                <i className="fa-solid fa-arrow-right" />
              </button>
              <button onClick={() => document.getElementById('ai-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 border border-white/40 hover:bg-white/10 text-white font-semibold rounded-3xl flex items-center gap-x-3 transition-all">
                <i className="fa-solid fa-magic" />
                <span>Попробовать AI</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-8 mt-10 text-sm">
              <div className="flex items-center gap-x-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 bg-zinc-300 rounded-full border border-zinc-950" />
                  <div className="w-6 h-6 bg-zinc-400 rounded-full border border-zinc-950" />
                  <div className="w-6 h-6 bg-emerald-400 rounded-full border border-zinc-950" />
                </div>
                <span className="text-white/70 text-xs">12 480 заказов сегодня</span>
              </div>
              <div className="text-emerald-400 text-xs font-medium flex items-center gap-x-1">
                <i className="fa-solid fa-check-circle" />
                <span>4.98/5 • 87k отзывов</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/70 backdrop-blur py-3 border-t border-white/10">
          <div className="max-w-screen-2xl mx-auto px-8 flex flex-col md:flex-row justify-between text-xs text-white/60 gap-y-2">
            <div>✓ Партнёрство с 47 фермами ОАЭ</div>
            <div>✓ Сертификат качества от Dubai Municipality</div>
            <div>✓ Углеродно-нейтральная доставка</div>
          </div>
        </div>
      </section>
      <section className="max-w-screen-2xl mx-auto px-8 pt-16 pb-12">
        <div className="text-center mb-10">
          <div className="ai-badge inline-block mb-3">УТП 2026</div>
          <h2 className="section-header">Почему FreshAI — №1 в Дубае</h2>
          <p className="text-zinc-400 max-w-md mx-auto mt-3">Единственный маркет, где Grok AI решает, что приготовить из вашего выбора</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: 'fa-robot',
              title: 'Grok AI Recipe Engine',
              text: 'Мгновенная генерация 3+ персонализированных рецептов на базе самых свежих моделей xAI (2026). Учитывает аллергии, диету, время приготовления и даже настроение.',
              badge: 'РЕАЛЬНОЕ ВРЕМЯ • 0.4 СЕК'
            },
            {
              icon: 'fa-truck-fast',
              title: 'Гипер-локальная доставка',
              text: 'Среднее время доставки 23 минуты по всему Дубаю. AI оптимизирует маршрут в реальном времени с учётом пробок и температуры.',
              badge: 'Downtown • 18 мин, Marina • 27 мин'
            },
            {
              icon: 'fa-seedling',
              title: 'AI-контроль свежести',
              text: 'Каждый продукт проходит 3D-сканирование и анализ Grok Vision перед упаковкой. Вы видите точный срок годности и качество в реальном времени.',
              badge: '98.7% продуктов с рейтингом свежести 9.8+'
            }
          ].map(item => (
            <div key={item.title} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="w-12 h-12 bg-emerald-900/50 rounded-2xl flex items-center justify-center mb-6">
                <i className={`fa-solid ${item.icon} text-emerald-400 text-3xl`} />
              </div>
              <h3 className="font-semibold text-2xl mb-3">{item.title}</h3>
              <p className="text-zinc-400">{item.text}</p>
              <div className="mt-6 text-xs text-emerald-400 font-mono">{item.badge}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="max-w-screen-2xl mx-auto px-8 py-16 bg-zinc-900 border-y border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="ai-badge inline-block mb-4">НОВЫЙ ФУНКЦИОНАЛ • GROK 2026</div>
          <h2 className="section-header mb-4">AI Планировщик ужина</h2>
          <p className="text-zinc-400 max-w-md mx-auto">Напишите текстом, что хотите приготовить — Grok сформирует точный список продуктов, масштабирует на нужное количество человек, добавит в корзину и оформит доставку за 23 минуты.</p>
          <div className="mt-8">
            <textarea value={mealInput} onChange={event => setMealInput(event.target.value)} rows={3} className="w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-600 rounded-3xl p-5 text-sm placeholder:text-zinc-500" placeholder={initialMealPrompt} />
            <button onClick={processMealRequest} className="mt-4 w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 transition-all text-white font-semibold rounded-3xl flex items-center justify-center gap-x-3">
              <i className="fa-solid fa-magic" />
              <span>СФОРМИРОВАТЬ КОРЗИНУ И ЗАКАЗАТЬ ДОСТАВКУ</span>
            </button>
            <div className="text-[10px] text-zinc-500 mt-3">Grok анализирует запрос, подбирает рецепты и рассчитывает точное количество ингредиентов</div>
          </div>
        </div>
      </section>
      <section id="shop-section" className="max-w-screen-2xl mx-auto px-8 pb-16">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-y-4">
          <div>
            <h2 className="section-header">Выберите продукты</h2>
            <p className="text-zinc-400">Добавьте в «Выбор для AI» — Grok подберёт рецепты автоматически</p>
          </div>
          <div className="text-right text-xs text-zinc-500">Цены за кг / шт • AED</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-5" id="products-grid">
          {products.map(product => {
            const isSelected = selectedProducts.some(item => item.id === product.id);
            return (
              <div key={product.id} className="product-card bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden group">
                <div className="relative">
                  <img src={product.img} alt={product.name} className="product-img w-full" />
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-0.5 text-[10px] bg-black/70 text-white rounded-full font-mono">{product.price} AED</span>
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                      <div className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-x-1">
                        <i className="fa-solid fa-check" />
                        <span className="font-medium">ВЫБРАНО</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-xs text-zinc-500">{product.unit}</div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => toggleSelect(product.id)} className={`flex-1 py-2 text-xs font-medium transition-all rounded-2xl ${isSelected ? 'bg-emerald-600 text-white' : 'border border-zinc-700 hover:bg-zinc-800'}`}>
                      {isSelected ? 'Убрать из AI' : 'Выбрать для AI'}
                    </button>
                    <button onClick={() => addToCart(product.id)} className="px-4 py-2 text-xs font-medium border border-zinc-700 hover:bg-zinc-800 rounded-2xl transition-all">
                      <i className="fa-solid fa-cart-plus" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-10 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-5 gap-y-4">
            <div className="flex items-center gap-x-3">
              <i className="fa-solid fa-magic text-emerald-400 text-xl" />
              <div>
                <span className="font-semibold text-lg">Ваш выбор для Grok AI</span>
                <span id="selected-count" className="ml-2 text-xs bg-emerald-900 text-emerald-400 px-2.5 py-0.5 rounded-full font-mono">{selectedProducts.length} / 10</span>
              </div>
            </div>
            <button onClick={generateRecipes} className="flex items-center gap-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 transition-colors text-white font-semibold rounded-2xl text-sm disabled:opacity-40" disabled={selectedProducts.length === 0 || isGenerating}>
              {isGenerating ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-wand-magic-sparkles" />}
              <span>{isGenerating ? 'GROK АНАЛИЗИРУЕТ...' : 'СГЕНЕРИРОВАТЬ РЕЦЕПТЫ С GROK AI'}</span>
            </button>
          </div>
          <div id="selected-list" className="flex flex-wrap gap-2 min-h-[52px]">
            {selectedProducts.length === 0 ? (
              <div className="text-zinc-500 text-sm py-2">Выберите продукты выше, чтобы Grok мог предложить рецепты</div>
            ) : (
              selectedProducts.map((product, index) => (
                <div key={`${product.id}-${index}`} className="flex items-center gap-x-2 bg-zinc-800 text-sm px-3 py-1 rounded-2xl border border-zinc-700">
                  <span>{product.name}</span>
                  <button onClick={() => setSelectedProducts(prev => prev.filter((_, idx) => idx !== index))} className="text-zinc-400 hover:text-white ml-1">
                    <i className="fa-solid fa-times text-xs" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="text-[10px] text-zinc-500 mt-3">Grok анализирует сочетания, нутриенты, сезонность и ваши предпочтения из профиля</div>
        </div>
      </section>
      <section id="ai-section" className={`${isAiSectionVisible ? 'block' : 'hidden'} max-w-screen-2xl mx-auto px-8 pb-20`}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-x-3">
              <div className="ai-badge">GROK 2026</div>
              <h2 className="section-header">Рекомендации от Grok AI</h2>
            </div>
            <p className="text-zinc-400">На основе вашего текущего выбора • Персонализировано под вас</p>
          </div>
          <button onClick={regenerateRecipes} className="text-sm flex items-center gap-x-2 text-emerald-400 hover:text-emerald-300">
            <i className="fa-solid fa-sync" />
            <span>Обновить</span>
          </button>
        </div>
        <div id="recipes-container" className="grid md:grid-cols-3 gap-6">
          {recipeCards.map(recipe => {
            const matchCount = recipe.matchIngredients.filter(ing => selectedNames.includes(ing)).length;
            return (
              <div key={recipe.id} className="recipe-card bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between gap-x-4">
                    <div>
                      <div className="font-semibold text-xl leading-tight">{recipe.name}</div>
                      <div className="flex flex-wrap items-center gap-x-2 mt-2">
                        <span className="text-xs px-2 py-0.5 bg-emerald-900/60 text-emerald-300 rounded">{recipe.time}</span>
                        <span className="text-xs px-2 py-0.5 bg-zinc-800 rounded">{recipe.servings} порц.</span>
                      </div>
                    </div>
                    {matchCount > 0 && (
                      <div className="text-right">
                        <div className="text-[10px] text-emerald-400">Совпадение</div>
                        <div className="text-emerald-400 font-mono text-lg leading-none">{matchCount}/{recipe.matchIngredients.length}</div>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-zinc-400 mt-4 line-clamp-3">{recipe.desc}</div>
                  <div className="mt-5">
                    <div className="text-xs text-zinc-500 mb-1.5">Ключевые ингредиенты из вашего выбора:</div>
                    <div className="flex flex-wrap gap-1">
                      {recipe.matchIngredients.map(ing => {
                        const isSelected = selectedNames.includes(ing);
                        return (
                          <span key={ing} className={`text-xs px-2 py-px rounded ${isSelected ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                            {ing}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="border-t border-zinc-800 p-4 bg-zinc-950/50 flex items-center justify-between text-sm">
                  <button onClick={() => addRecipeToCart(recipe.id)} className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-x-2 text-xs">
                    <i className="fa-solid fa-cart-plus" />
                    <span>Добавить все в корзину</span>
                  </button>
                  <button onClick={() => openRecipeModal(recipe)} className="text-xs px-4 py-1.5 border border-zinc-700 hover:bg-zinc-800 rounded-2xl transition-colors">
                    Подробно
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {recipeActionMessage && <div className="mt-5 text-sm text-emerald-400">{recipeActionMessage}</div>}
      </section>
      <section className="bg-zinc-900 border-y border-zinc-800 py-12">
        <div className="max-w-screen-2xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-y-10">
          {[
            { value: '98.4k', label: 'рецептов сгенерировано сегодня' },
            { value: '4.2m', label: 'ингредиентов подобрано AI' },
            { value: '23', label: 'минуты средняя доставка' },
            { value: '94%', label: 'повторных заказов' }
          ].map(item => (
            <div key={item.label} className="text-center">
              <div className="text-5xl font-semibold text-emerald-400 stat-number">{item.value}</div>
              <div className="text-sm text-zinc-400 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </section>
      <footer className="max-w-screen-2xl mx-auto px-8 py-12 text-xs text-zinc-500 border-t border-zinc-800">
        <div className="flex flex-col md:flex-row justify-between gap-y-4">
          <div>© 2026 FreshAI Dubai. Концепт-дизайн на базе xAI Grok. Все права защищены.</div>
          <div className="flex flex-wrap gap-x-6">
            {['Политика конфиденциальности', 'Условия', 'API для ресторанов'].map(link => (
              <a key={link} href="#" className="hover:text-zinc-300">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
      {accountOpen && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center px-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-xl">Алексей Морозов</h3>
                <p className="text-emerald-400 text-sm">Premium • с 2024</p>
              </div>
              <button onClick={() => setAccountOpen(false)} className="text-zinc-400 hover:text-white">
                <i className="fa-solid fa-times text-xl" />
              </button>
            </div>
            <div className="my-8 space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-zinc-800"><span>Диета</span><span className="font-medium">Средиземноморская</span></div>
              <div className="flex justify-between py-2 border-b border-zinc-800"><span>Аллергии</span><span className="font-medium text-rose-400">Орехи, глютен</span></div>
              <div className="flex justify-between py-2 border-b border-zinc-800"><span>Любимые ингредиенты</span><span className="font-medium">Авокадо, лимон, шпинат</span></div>
            </div>
            <div className="text-[10px] text-center text-zinc-500">Grok запомнил ваши предпочтения и использует их при генерации рецептов</div>
          </div>
        </div>
      )}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-end md:items-center justify-center px-4 pb-4 pt-8">
          <div className="absolute inset-0" onClick={() => setCartOpen(false)} />
          <div className="relative bg-zinc-900 border-t md:border border-zinc-700 rounded-t-3xl md:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <div className="font-semibold text-xl">Корзина <span className="text-emerald-400">({cart.length})</span></div>
              <button onClick={() => setCartOpen(false)} className="text-zinc-400 hover:text-white"><i className="fa-solid fa-times text-xl" /></button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">Корзина пуста</div>
              ) : (
                Object.entries(cartSummary).map(([name, item]) => (
                  <div key={name} className="flex justify-between items-center py-1">
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-xs text-zinc-500">{item.count} × {item.price} AED</div>
                    </div>
                    <div className="font-mono text-emerald-400">{item.count * item.price} AED</div>
                  </div>
                ))
              )}
            </div>
            <div className="p-6 border-t border-zinc-800 bg-zinc-950">
              <div className="flex justify-between text-lg mb-4"><span>Итого</span><span className="font-semibold">{totalCart} AED</span></div>
              <button onClick={() => { setCartOpen(false); showToast('Заказ оформлен! Ожидаемое время 23 минуты'); }} className="w-full py-4 bg-white text-zinc-950 font-semibold rounded-2xl hover:bg-zinc-100 transition-colors">
                Оформить заказ • Доставка 23 мин
              </button>
              <div className="text-center text-[10px] text-zinc-500 mt-3">Grok проверил наличие и оптимальный маршрут</div>
            </div>
          </div>
        </div>
      )}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={closeRecipeModal} />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-lg overflow-hidden">
            <div className="p-8">
              <button onClick={closeRecipeModal} className="absolute top-6 right-6 text-zinc-400 hover:text-white"><i className="fa-solid fa-times text-2xl" /></button>
              <div className="ai-badge inline-block mb-4">GROK AI</div>
              <h3 className="text-3xl font-semibold leading-none tracking-tight">{selectedRecipe.name}</h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-4 text-sm text-zinc-400">
                <div className="flex items-center gap-x-1 text-emerald-400"><i className="fa-solid fa-clock" />{selectedRecipe.time}</div>
                <div>•</div>
                <div>{selectedRecipe.servings} порции</div>
                <div>•</div>
                <div className="text-emerald-400">{selectedRecipe.difficulty}</div>
              </div>
              <div className="mt-8">
                <div className="uppercase text-xs tracking-widest text-zinc-500 mb-3">ИНГРЕДИЕНТЫ</div>
                <div className="grid grid-cols-2 gap-x-4 text-sm">
                  {selectedRecipe.ingredients.map(ingredient => (
                    <div key={ingredient} className="py-1 border-b border-zinc-800">{ingredient}</div>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <div className="uppercase text-xs tracking-widest text-zinc-500 mb-3">ПОШАГОВО</div>
                <div className="text-sm leading-relaxed text-zinc-300">{selectedRecipe.steps}</div>
              </div>
            </div>
            <div className="border-t border-zinc-800 p-5 flex gap-3">
              <button onClick={() => { addRecipeToCart(selectedRecipe.id); closeRecipeModal(); }} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl text-sm">
                Добавить все ингредиенты в корзину
              </button>
            </div>
          </div>
        </div>
      )}
      {mealModal && mealSummary && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setMealModal(null)} />
          <div className="relative bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between">
                <div>
                  <div className="ai-badge">GROK AI</div>
                  <h3 className="text-2xl font-semibold mt-3">Корзина на ужин</h3>
                  <p className="text-sm text-zinc-400">Для {mealSummary.numPeople} человек • {mealSummary.dishNames.join(', ')}</p>
                </div>
                <button onClick={() => setMealModal(null)} className="text-zinc-400 hover:text-white"><i className="fa-solid fa-times text-2xl" /></button>
              </div>
              <div className="mt-6 max-h-[280px] overflow-auto pr-2">
                {mealModal.map(item => (
                  <div key={item.name} className="flex justify-between items-center py-3 border-b border-zinc-800">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-zinc-500"> ×{item.qty}</span>
                    </div>
                    <div className="font-mono text-emerald-400">{item.qty * item.price} AED</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-between text-xl font-semibold">
                <span>Итого</span>
                <span className="text-emerald-400">{mealSummary.total} AED</span>
              </div>
            </div>
            <div className="bg-zinc-950 p-5 flex gap-3">
              <button onClick={() => { confirmMealOrder(); setMealModal(null); }} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl text-sm">
                ОПЛАТИТЬ И ЗАКАЗАТЬ ДОСТАВКУ
              </button>
            </div>
          </div>
        </div>
      )}
      {toastMessages.length > 0 && (
        <div className="fixed bottom-6 left-1/2 z-[300] transform -translate-x-1/2">
          {toastMessages.map((message, index) => (
            <div key={`${message}-${index}`} className="mb-2 bg-zinc-800 border border-zinc-700 text-sm px-6 py-3 rounded-2xl flex items-center gap-x-3 shadow-xl">
              <span>{message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
