import './scss/styles.scss';

import { Api } from './components/base/Api';
import { ShopApi } from './components/models/ShopApi';
import { Products } from './components/models/Products';
import { Cart } from './components/models/Cart';
import { Buyer } from './components/models/Buyer';
import { EventEmitter } from './components/base/Events';

import { CatalogView } from './components/view/CatalogView';
import { CatalogCardView } from './components/view/CatalogCardView';
import { ProductPreviewView } from './components/view/ProductPreviewView';
import { BasketView } from './components/view/BasketView';
import { OrderView } from './components/view/OrderView';
import { ContactsView } from './components/view/ContactsView';
import { SuccessView } from './components/view/SuccessView';
import { ModalView } from './components/view/ModalView';
import { BasketItemView } from './components/view/BasketItemView';

import { API_URL, CDN_URL } from './utils/constants';
import { IProduct } from './types';

// --- EventEmitter ---
const events = new EventEmitter();

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
const catalogView = new CatalogView(document.querySelector('.gallery')!);
const modalView = new ModalView(document.querySelector('.modal')!);
const basketView = new BasketView(basketTemplate);

// --- Хелперы ---
function updateHeaderCounter(count: number) {
  const counterEl = document.querySelector('.header__basket-counter');
  if (counterEl) counterEl.textContent = String(count);
}

function isPriceless(product: IProduct): boolean {
  return !product.price; // 0, null или undefined
}

function updatePreviewCartState(productId: string, inCart: boolean) {
  if (controller.currentPreviewProductId === productId && controller.currentPreviewView) {
    controller.currentPreviewView.setInCart(inCart);
  }
}

// --- Controller ---
class AppController {
  currentPreviewView: ProductPreviewView | null = null;
  currentPreviewProductId: string | null = null;

  constructor() {
    this.initHeader();
    this.initBasket();
    this.initEvents();
  }

  private initHeader() {
    const basketButton = document.querySelector('.header__basket');
    basketButton?.addEventListener('click', () => {
      modalView.open(basketView.render());
    });
  }

  private initBasket() {
    basketView.onCheckout(() => events.emit('checkout'));
  }

  private initEvents() {
    events.on<IProduct[]>('products:set', this.handleProductsSet.bind(this));
    events.on<IProduct>('product:selected', this.handleProductSelected.bind(this));
    events.on('cart:add', this.updateCart.bind(this));
    events.on('cart:remove', this.updateCart.bind(this));
    events.on('cart:clear', this.updateCart.bind(this));

    events.on<IProduct>('cart:add', (p) => updatePreviewCartState(p.id, true));
    events.on<IProduct>('cart:remove', (p) => updatePreviewCartState(p.id, false));
    events.on('cart:clear', () => this.currentPreviewView?.setInCart(false));

    events.on('openPreview', (id) => {
      const product = products.getProductById(id as string);
      if (product) products.setSelectedProduct(product);
    });

    events.on('deleteItem', (id) => {
      const product = cart.getItems().find(p => p.id === id);
      if (product) cart.removeItem(product);
    });

    events.on('checkout', this.handleCheckout.bind(this));
    events.on('submitOrder', this.handleSubmitOrder.bind(this));
    events.on('submitContacts', this.handleSubmitContacts.bind(this));
  }

  // --- Обработчики ---
  private handleProductsSet(items: IProduct[]) {
    const cards = items.map(product => {
      const cardView = new CatalogCardView(cardCatalogTemplate);
      const el = cardView.render({
        title: product.title,
        price: isPriceless(product) ? 'Бесценно' : `${product.price} синапсов`,
        category: product.category,
        image: `${CDN_URL}/${product.image}`,
        inCart: cart.hasItem(product.id),
        disabled: isPriceless(product),
      });

      cardView.onClick(() => events.emit('openPreview', product.id));
      return el;
    });

    catalogView.renderCards(cards);
  }

  private handleProductSelected(product: IProduct) {
    const preview = new ProductPreviewView(cardPreviewTemplate);
    this.currentPreviewView = preview;
    this.currentPreviewProductId = product.id;

    const previewEl = preview.render({
      title: product.title,
      description: product.description,
      image: `${CDN_URL}/${product.image}`,
      price: isPriceless(product) ? 'Бесценно' : `${product.price} синапсов`,
      inCart: cart.hasItem(product.id),
      disabled: isPriceless(product),
    });

    if (!isPriceless(product)) {
      preview.onToggleCart(() => {
        cart.hasItem(product.id) ? cart.removeItem(product) : cart.addItem(product);
        preview.setInCart(cart.hasItem(product.id));
      });
    } else {
      preview.setInCart(false);
    }

    modalView.open(previewEl);
  }

  private updateCart() {
    const items = cart.getItems();
    const basketItems = items.map((item, index) => {
      const basketItem = new BasketItemView(cardBasketTemplate);
      basketItem.render({
        index: index + 1,
        title: item.title,
        price: `${item.price} синапсов`,
      });
      basketItem.onDelete(() => events.emit('deleteItem', item.id));
      return basketItem.render();
    });

    basketView.renderItems(basketItems);
    basketView.setTotal(`${cart.getTotalPrice()} синапсов`);
    updateHeaderCounter(items.length);
  }

  private handleCheckout() {
    const orderForm = new OrderView(orderTemplate);
    const current = buyer.getData();

    orderForm.onSubmit((formData) => {
      buyer.setData(formData);
      const validation = buyer.validate();

      if (validation.address && validation.payment) {
        events.emit('submitOrder', formData);
      } else {
        const error = !validation.address ? 'Введите адрес' : 'Выберите способ оплаты';
        orderForm.render({ error, valid: false });
      }
    });

    orderForm.render({ address: current.address, valid: false });
    modalView.open(orderForm.render());
  }

  private handleSubmitOrder() {
    const contactsForm = new ContactsView(contactsTemplate);
    const current = buyer.getData();

    contactsForm.render({ email: current.email, phone: current.phone, valid: false });
    contactsForm.onSubmit((formData) => {
      buyer.setData(formData);
      const validation = buyer.validate();

      if (validation.email && validation.phone) {
        events.emit('submitContacts', formData);
      } else {
        contactsForm.render({ error: 'Введите корректный Email и телефон', valid: false });
      }
    });

    modalView.open(contactsForm.render());
  }

  private async handleSubmitContacts() {
    try {
      const buyerData = buyer.getData();
      const cartItems = cart.getItems();

      const validation = buyer.validate();
      if (!validation.email || !validation.phone) throw new Error('Проверьте email и телефон');
      if (cartItems.length === 0) throw new Error('Корзина пуста');
      if (!buyerData.payment) throw new Error('Не указан способ оплаты');

      const order = await api.createOrder({
        payment: buyerData.payment,
        address: buyerData.address,
        email: buyerData.email,
        phone: buyerData.phone,
        items: cartItems.map(p => p.id),
        total: cart.getTotalPrice(),
      });

      cart.clear();
      buyer.clear();

      const success = new SuccessView(successTemplate);
      const successEl = success.render({ total: `${order.total} синапсов` });
      success.onClose(() => modalView.close());
      modalView.open(successEl);

    } catch (err: any) {
      const current = buyer.getData();
      const contactsForm = new ContactsView(contactsTemplate);

      let errorMessage = 'Ошибка оформления заказа';
      if (err.message.includes('email')) errorMessage = 'Проверьте email и телефон';
      if (err.message.includes('payment')) errorMessage = 'Не выбран способ оплаты';
      if (err.message.includes('адрес')) errorMessage = 'Не указан адрес доставки';
      if (err.message.includes('корзина')) errorMessage = 'Корзина пуста';

      contactsForm.render({
        email: current.email,
        phone: current.phone,
        error: errorMessage,
        valid: false,
      });

      modalView.open(contactsForm.render());
    }
  }
}

// --- Инициализация ---
const controller = new AppController();

(async () => {
  try {
    const items = await api.getProducts();
    products.setProducts(items);
    controller['updateCart'](); // инициализируем корзину
  } catch (error) {
    console.error('Ошибка при загрузке товаров:', error);
  }
})();
