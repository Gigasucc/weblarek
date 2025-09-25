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
import { HeaderView } from './components/view/HeaderView';

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

// --- Представления ---
const galleryEl = ensureElement<HTMLElement>('.gallery', document);
const modalEl = ensureElement<HTMLElement>('.modal', document);
const headerContainer = ensureElement<HTMLElement>('.header', document);

const catalogView = new CatalogView(galleryEl);
const modalView = new ModalView(modalEl);
const headerView = new HeaderView(headerContainer, events);

const basketContainer = cloneTemplate(basketTemplate);
const basketView = new BasketView(basketContainer);

const orderContainer = cloneTemplate(orderTemplate);
const orderView = new OrderView(orderContainer, events);

const contactsContainer = cloneTemplate(contactsTemplate);
const contactsView = new ContactsView(contactsContainer, events);

const successContainer = cloneTemplate(successTemplate);
const successView = new SuccessView(successContainer, () => modalView.close());

// --- Вспомогательные функции ---
function formatPrice(price?: number | null): string {
  if (price === 0 || price === null || price === undefined) return 'Бесценно';
  return `${price} синапсов`;
}

// Создание карточки каталога
function createCatalogCard(product: IProduct) {
  const el = cloneTemplate(cardCatalogTemplate);
  const inCart = cart.hasItem(product.id);
  const disabled = !product.price;
  
  const cardView = new CatalogCardView(el, () => {
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

// Создание превью продукта
function createProductPreview(product: IProduct) {
  const el = cloneTemplate(cardPreviewTemplate);
  const preview = new ProductPreviewView(el, () => {
    if (cart.hasItem(product.id)) {
      cart.removeItem(product);
    } else {
      cart.addItem(product);
    }
    preview.inCart = cart.hasItem(product.id);
  });

  preview.render({
    title: product.title,
    description: (product as any).description,
    image: product.image ? `${CDN_URL}/${product.image}` : undefined,
    price: formatPrice(product.price),
    inCart: cart.hasItem(product.id),
    disabled: !product.price,
  });

  return preview;
}

// Создание элемента корзины
function createBasketItemView(item: IProduct, index: number) {
  const el = cloneTemplate(cardBasketTemplate);
  const basketItem = new BasketItemView(el, () => {
    events.emit('deleteItem', item.id);
  });

  basketItem.render({
    index: index + 1,
    title: item.title,
    price: `${item.price} синапсов`,
  });

  return basketItem.render();
}

// Обновление отображения корзины
function renderCart() {
  const items = cart.getItems();
  const basketItems = items.map((it, idx) => createBasketItemView(it, idx));
  
  basketView.items = basketItems;
  basketView.total = `${cart.getTotalPrice()} синапсов`;
  basketView.valid = items.length > 0;
  headerView.setCounter(items.length);
}

// Обновление формы заказа при изменении данных покупателя
function updateOrderForm() {
  const errors = buyer.validate();
  const addressError = errors.address;
  const paymentError = errors.payment;
  
  orderView.errors = {
    ...(addressError ? { address: addressError } : {}),
    ...(paymentError ? { payment: paymentError } : {}),
  };
  orderView.valid = !addressError && !paymentError;
}

// Обновление формы контактов при изменении данных покупателя
function updateContactsForm() {
  const errors = buyer.validate();
  const emailError = errors.email;
  const phoneError = errors.phone;
  
  contactsView.errors = {
    ...(emailError ? { email: emailError } : {}),
    ...(phoneError ? { phone: phoneError } : {}),
  };
  contactsView.valid = !emailError && !phoneError;
}

// --- Wiring событий ---

// Продукты
events.on<IProduct[]>('products:set', (items) => {
  const cards = items.map(createCatalogCard);
  catalogView.renderCards(cards);
});

events.on<string>('openPreview', (id) => {
  const product = products.getProductById(id);
  if (product) products.setSelectedProduct(product);
});

events.on<IProduct>('product:selected', (product) => {
  const preview = createProductPreview(product);
  modalView.open(preview.render());
});

// Корзина
events.on('basket:open', () => {
  modalView.open(basketView.render());
});

basketView.setCheckoutHandler(() => {
  updateOrderForm();
  modalView.open(orderView.render());
});

events.on('cart:add', renderCart);
events.on('cart:remove', renderCart);
events.on('cart:clear', renderCart);

events.on<string>('deleteItem', (id) => {
  const found = cart.getItems().find(p => p.id === id);
  if (found) cart.removeItem(found);
});

// Данные покупателя
events.on('buyer:change', () => {
  updateOrderForm();
  updateContactsForm();
});

// Форма заказа
events.on<{ value: string }>('order:addressChanged', (payload) => {
  buyer.setData({ address: payload.value });
});

events.on<{ value: 'card' | 'cash' }>('order:paymentChanged', (payload) => {
  buyer.setData({ payment: payload.value });
});

events.on('order:submit', () => {
  const current = buyer.getData();
  contactsView.render({ 
    email: current.email, 
    phone: current.phone 
  });
  modalView.open(contactsView.render());
});

// Форма контактов
events.on<{ value: string }>('contacts:emailChanged', (payload) => {
  buyer.setData({ email: payload.value });
});

events.on<{ value: string }>('contacts:phoneChanged', (payload) => {
  buyer.setData({ phone: payload.value });
});

events.on('contacts:submit', async () => {
  try {
    if (!buyer.isValid()) {
      return;
    }

    const buyerData = buyer.getData();
    const cartItems = cart.getItems();

    const order = await api.createOrder({
      payment: buyerData.payment!,
      address: buyerData.address,
      email: buyerData.email,
      phone: buyerData.phone,
      items: cartItems.map(p => p.id),
      total: cart.getTotalPrice(),
    });

    cart.clear();
    buyer.clear();

    modalView.open(successView.render({ total: `${order.total} синапсов` }));
  } catch (err: any) {
    const message = err?.message || 'Ошибка оформления заказа';
    contactsView.errors = { form: message };
    modalView.open(contactsView.render());
  }
});

// --- Инициализация приложения ---
renderCart();

// Загрузка продуктов
(async () => {
  try {
    const items = await api.getProducts();
    products.setProducts(items);
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
  }
})();