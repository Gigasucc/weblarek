// main.ts
import './scss/styles.scss';

import { Api } from './components/base/Api';
import { ShopApi } from './components/models/ShopApi';
import { Products } from './components/models/Products';
import { Cart } from './components/models/Cart';
import { Buyer } from './components/models/Buyer';
import { EventEmitter, IEvents } from './components/base/Events';

import { CatalogView } from './components/view/CatalogView';
import { CatalogCardView } from './components/view/CatalogCardView';
import { ProductPreviewView } from './components/view/ProductPreviewView';
import { BasketView } from './components/view/BasketView';
import { OrderView } from './components/view/OrderView';
import { ContactsView } from './components/view/ContactsView';
import { SuccessView } from './components/view/SuccessView';
import { ModalView } from './components/view/ModalView';
import { BasketItemView } from './components/view/BasketItemView';

import { cloneTemplate, ensureElement } from './utils/utils';
import { API_URL, CDN_URL } from './utils/constants';
import { IProduct } from './types';

// --- EventEmitter ---
const events: IEvents = new EventEmitter();

// --- Модели ---
const apiInstance = new Api(API_URL);
const api = new ShopApi(apiInstance);
const products = new Products(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

// --- Шаблоны ---
const cardCatalogTemplate = document.querySelector('#card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector('#card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector('#card-basket') as HTMLTemplateElement;
const basketTemplate = document.querySelector('#basket') as HTMLTemplateElement;
const orderTemplate = document.querySelector('#order') as HTMLTemplateElement;
const contactsTemplate = document.querySelector('#contacts') as HTMLTemplateElement;
const successTemplate = document.querySelector('#success') as HTMLTemplateElement;

// --- Представления (главные, статичные элементы) ---

const galleryEl = ensureElement<HTMLElement>('.gallery', document);
const modalEl = ensureElement<HTMLElement>('.modal', document);

const catalogView = new CatalogView(galleryEl);
const modalView = new ModalView(modalEl);

const basketContainer = cloneTemplate(basketTemplate);
const basketView = new BasketView(basketContainer);


basketView.setCheckoutHandler(() => {
  // Открываем форму заказа с текущими данными покупателя
  const currentData = buyer.getData();
  orderView.render({
    address: currentData.address || '',
    payment: currentData.payment || null,
    valid: false
  });
  modalView.open(orderView.render());
});

// HeaderView — минимальная обёртка для управления счётчиком в шапке
class HeaderView {
  private counterEl: HTMLElement | null;
  private basketBtn: HTMLElement | null;
  private events: IEvents;

  constructor(events: IEvents) {
    this.events = events;
    this.counterEl = document.querySelector('.header__basket-counter');
    this.basketBtn = document.querySelector('.header__basket');

    this.basketBtn?.addEventListener('click', () => {
      this.events.emit('basket:open');
    });
  }

  setCounter(value: number) {
    if (this.counterEl) {
      this.counterEl.textContent = String(value);
    }
  }
}

const headerView = new HeaderView(events);


// Forms & Success — создаём экземпляры один раз и будем переиспользовать (ререндер)
const orderContainer = cloneTemplate(orderTemplate);
const orderView = new OrderView(orderContainer, events);

const contactsContainer = cloneTemplate(contactsTemplate);
const contactsView = new ContactsView(contactsContainer, events);

const successContainer = cloneTemplate(successTemplate);
const successView = new SuccessView(successContainer);

// --- Вспомогательные функции ---
function formatPrice(price?: number | null): string {
  if (price === 0 || price === null || price === undefined) return 'Бесценно';
  return `${price} синапсов`;
}

// Создание карточки каталога (каждый раз клонируем шаблон и передаём колбэк в конструктор)
function createCatalogCard(product: IProduct) {
  const el = cloneTemplate(cardCatalogTemplate);
  const inCart = cart.hasItem(product.id);
  const disabled = !product.price;
  // передаём в конструктор обработчик клика — чтобы слушатель был один раз
  const cardView = new CatalogCardView(el, () => {
    // открываем превью через событие
    events.emit('openPreview', product.id);
  });

  cardView.render({
    title: product.title,
    price: formatPrice(product.price),
    category: product.category,
    image: product.image ? `${CDN_URL}/${product.image}` : undefined,
    inCart,
    disabled,
  });

  return cardView.render();
}

// Создание превью продукта для модалки (клон шаблона + колбэк в конструктор)
function createProductPreview(product: IProduct) {
  const el = cloneTemplate(cardPreviewTemplate);
  const preview = new ProductPreviewView(el, () => {
    // toggle cart
    if (cart.hasItem(product.id)) {
      cart.removeItem(product);
    } else {
      cart.addItem(product);
    }
    // не меняем отображение здесь напрямую — дождёмся события cart:add/cart:remove,
    // но можно запрашивать актуальное состояние для UI мгновенно:
    preview.inCart = cart.hasItem(product.id);
  });

  preview.render({
    title: product.title,
    description: (product as any).description, // если есть
    image: product.image ? `${CDN_URL}/${product.image}` : undefined,
    price: formatPrice(product.price),
    inCart: cart.hasItem(product.id),
    disabled: !product.price,
  });

  return preview;
}

// Создание элемента корзины (клонируем шаблон, передаём onDelete в конструктор)
function createBasketItemView(item: IProduct, index: number) {
  const el = cloneTemplate(cardBasketTemplate);
  const basketItem = new BasketItemView(el, () => {
    events.emit('deleteItem', item.id);
  });

  // Используем сеттеры / render
  basketItem.render({
    index: index + 1,
    title: item.title,
    price: `${item.price} синапсов`,
  });

  return basketItem.render();
}

// --- Wiring: слушаем события моделей и обновляем view ---
// products:set -> перерисовать каталог
events.on<IProduct[]>('products:set', (items) => {
  const cards = items.map(createCatalogCard);
  catalogView.renderCards(cards);
});

// product:selected -> создать превью и открыть модалку
events.on<IProduct>('product:selected', (product) => {
  const preview = createProductPreview(product);
  // preview — экземпляр view, но modal открывает HTMLElement
  modalView.open(preview.render({
    title: product.title,
    description: (product as any).description,
    image: product.image ? `${CDN_URL}/${product.image}` : undefined,
    price: formatPrice(product.price),
    inCart: cart.hasItem(product.id),
    disabled: !product.price,
  }));
});

// cart events -> обновить корзину UI и шапку
function renderCart() {
  const items = cart.getItems();
  const basketItems = items.map((it, idx) => createBasketItemView(it, idx));
  // BasketView имеет сеттеры: items, total, valid
  basketView.items = basketItems;
  basketView.total = `${cart.getTotalPrice()} синапсов`;
  // валидно если есть товары
  basketView.valid = items.length > 0;
  headerView.setCounter(items.length);
}

events.on('basket:open', () => {
  modalView.open(basketView.render());
});


events.on('cart:add', () => {
  renderCart();
});

events.on('cart:remove', () => {
  renderCart();
});

events.on('cart:clear', () => {
  renderCart();
});

// открыть превью (когда пользователь кликает на карточку)
events.on<string>('openPreview', (id) => {
  const product = products.getProductById(id);
  if (product) products.setSelectedProduct(product);
});

// удаление товара из корзины (событие идёт из view)
events.on<string>('deleteItem', (id) => {
  const found = cart.getItems().find(p => p.id === id);
  if (found) cart.removeItem(found);
});

// --- Forms wiring: связи View <-> Presenter (через events) ---
// OrderView и ContactsView уже эмитят события через events (см. исправлённые классы)

// Когда пользователь меняет поле адреса или способ оплаты в OrderView
events.on<{ value: string }>('order:addressChanged', (payload) => {
  buyer.setData({ address: payload.value });
  // получаем ошибки от модели и отображаем их в форме
  const errors = buyer.validate();
  const addressError = errors.address;
  const paymentError = errors.payment;
  orderView.errors = {
    ...(addressError ? { address: addressError } : {}),
    ...(paymentError ? { payment: paymentError } : {}),
  };
  // валидность формы = нет ошибок для адреса и оплаты
  orderView.valid = !addressError && !paymentError;
});

events.on<{ value: 'card' | 'cash' }>('order:paymentChanged', (payload) => {
  buyer.setData({ payment: payload.value });
  const errors = buyer.validate();
  const addressError = errors.address;
  const paymentError = errors.payment;
  orderView.errors = {
    ...(addressError ? { address: addressError } : {}),
    ...(paymentError ? { payment: paymentError } : {}),
  };
  orderView.valid = !addressError && !paymentError;
});

// Слушаем submit формы заказа (OrderView эмиттит 'order:submit' в своей реализации)
events.on('order:submit', () => {
  // проверим валидность модели по полям адрес+payment
  const errors = buyer.validate();
  const hasAddressError = !!errors.address;
  const hasPaymentError = !!errors.payment;

  if (!hasAddressError && !hasPaymentError) {
    // переходим к следующему шагу — контакты
    // рендерим contactsView с текущими данными
    const current = buyer.getData();
    contactsView.render({ email: current.email, phone: current.phone, valid: false });
    modalView.open(contactsView.render({ email: current.email, phone: current.phone, valid: false }));
  } else {
    // показываем ошибки в форме заказа (берём текст из модели)
    orderView.render({ address: buyer.getData().address, valid: false });
    orderView.errors = {
      ...(errors.address ? { address: errors.address } : {}),
      ...(errors.payment ? { payment: errors.payment } : {}),
    };
    // ensure modal has order form visible
    modalView.open(orderView.render({ address: buyer.getData().address, valid: false }));
  }
});

// Contacts wiring — при изменении полей обновляем buyer
events.on<{ value: string }>('contacts:emailChanged', (payload) => {
  buyer.setData({ email: payload.value });
  const errors = buyer.validate();
  contactsView.errors = {
    ...(errors.email ? { email: errors.email } : {}),
    ...(errors.phone ? { phone: errors.phone } : {}),
  };
  // валидность — нет ошибок по email и phone
  const isValid = !errors.email && !errors.phone;
  contactsView.valid = isValid;
});

events.on<{ value: string }>('contacts:phoneChanged', (payload) => {
  buyer.setData({ phone: payload.value });
  const errors = buyer.validate();
  contactsView.errors = {
    ...(errors.email ? { email: errors.email } : {}),
    ...(errors.phone ? { phone: errors.phone } : {}),
  };
  contactsView.valid = !errors.email && !errors.phone;
});

// Submit контактов — Order creation flow
events.on('contacts:submit', async () => {
  try {
    // перед созданием заказа убедимся, что модель валидна
    const errors = buyer.validate();
    if (errors.email || errors.phone) {
      contactsView.errors = {
        ...(errors.email ? { email: errors.email } : {}),
        ...(errors.phone ? { phone: errors.phone } : {}),
      };
      contactsView.valid = false;
      // не продолжаем
      return;
    }

    const buyerData = buyer.getData();
    const cartItems = cart.getItems();

    if (cartItems.length === 0) {
      // нельзя оформить заказ — корзина пуста
      // открываем корзину в модалке с подсказкой
      modalView.open(basketView.render());
      return;
    }

    if (!buyerData.payment) {
      // отобразить ошибку в форме заказа
      orderView.errors = { payment: 'Не выбран способ оплаты' };
      orderView.valid = false;
      modalView.open(orderView.render());
      return;
    }

    // создаём заказ на сервере
    const order = await api.createOrder({
      payment: buyerData.payment!,
      address: buyerData.address,
      email: buyerData.email,
      phone: buyerData.phone,
      items: cartItems.map(p => p.id),
      total: cart.getTotalPrice(),
    });

    // при успешном создании — очистить модели и показать Success
    cart.clear();
    buyer.clear();

    // ререндер статического successView
    successView.render({ total: `${order.total} синапсов` });
    successView.onClose(() => modalView.close());
    modalView.open(successView.render({ total: `${order.total} синапсов` }));

  } catch (err: any) {
    // Если сервер вернул ошибку — отобразим её в форме контактов (текст из ошибки)
    const message = err?.message || 'Ошибка оформления заказа';
    contactsView.render({ email: buyer.getData().email, phone: buyer.getData().phone, valid: false });
    contactsView.errors = { form: message };
    modalView.open(contactsView.render({ email: buyer.getData().email, phone: buyer.getData().phone, valid: false }));
  }
});

// --- Инициализация приложения ---
// Подписки уже настроены, теперь загружаем продукты и инициализируем UI.
// На старте отрисуем пустую корзину (0)
renderCart();

// Загружаем продукты и устанавливаем их в модель — products.setProducts вызовет событие и отрисует каталог
(async () => {
  try {
    const items = await api.getProducts();
    products.setProducts(items);
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
  }
})();
