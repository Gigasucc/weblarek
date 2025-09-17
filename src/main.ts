import './scss/styles.scss';

console.log('main.ts работает!');

import { Api } from './components/base/Api';
import { ShopApi } from './components/models/ShopApi';
import { Products } from './components/models/Products';
import { apiProducts } from './utils/data';
import { Cart } from './components/models/Cart';
import { Buyer } from './components/models/Buyer';

// Каталог
const productsModel = new Products();
productsModel.setProducts(apiProducts.items);
console.log('Массив товаров из каталога:', productsModel.getProducts());
console.log('Первый товар по ID:', productsModel.getProductById(apiProducts.items[0].id));

// Корзина
const cart = new Cart();
cart.addItem(apiProducts.items[0]);
cart.addItem(apiProducts.items[1]);
console.log('Товары в корзине:', cart.getItems());
console.log('Общая сумма:', cart.getTotalPrice());
console.log('Количество товаров:', cart.getItemCount());
console.log('Есть ли первый товар в корзине?', cart.hasItem(apiProducts.items[0].id));
cart.removeItem(apiProducts.items[0]);
console.log('После удаления первого товара:', cart.getItems());

// Покупатель
const buyer = new Buyer({
  payment: 'card',
  email: 'test@',
  phone: '+799999999999',
  address: 'Москва',
});
console.log('Данные покупателя:', buyer.getData());
console.log('Валидация данных покупателя:', buyer.validate());
buyer.clear();
console.log('После очистки:', buyer.getData());

const apiBaseUrl = 'https://larek-api.nomoreparties.co/api/weblarek';
const api = new Api(apiBaseUrl);
const shopApi = new ShopApi(api);
const productsModelFromServer = new Products();

// Тестирование методов модели данных
console.log('Тестирование методов модели данных:');

// Проверка начального состояния
console.log('Начальное состояние модели:', productsModelFromServer.getProducts());

// Добавление тестовых данных вручную
const testProducts = [
  {
    id: 'test-id-1',
    title: 'Тестовый товар 1',
    price: 1000,
    description: 'Описание тестового товара 1',
    image: 'test-image-1.jpg',
    category: 'тестовая категория'
  },
  {
    id: 'test-id-2', 
    title: 'Тестовый товар 2',
    price: 2000,
    description: 'Описание тестового товара 2',
    image: 'test-image-2.jpg',
    category: 'тестовая категория'
  }
];

productsModelFromServer.setProducts(testProducts);
console.log('После добавления тестовых данных:', productsModelFromServer.getProducts());

// Поиск товара по ID
const foundProduct = productsModelFromServer.getProductById('test-id-1');
console.log('Найденный товар по ID "test-id-1":', foundProduct);

// Работа с выбранным товаром
productsModelFromServer.setSelectedProduct(testProducts[0]);
console.log('Выбранный товар:', productsModelFromServer.getSelectedProduct());

// Запрос к серверу за массивом товаров
console.log('Запрос к серверу за каталогом товаров...');

shopApi.getProducts()
  .then((items) => {
    console.log('Товары пришли с сервера:', items);
    
    // Сохранение массива в модели данных
    productsModelFromServer.setProducts(items);
    
    // Вывод массива в консоль
    console.log('Каталог товаров в модели:', productsModelFromServer.getProducts());
    
    // Дополнительное тестирование с реальными данными
    if (items.length > 0) {
      const firstProductId = items[0].id;
      const realFoundProduct = productsModelFromServer.getProductById(firstProductId);
      console.log(`Найденный товар по ID "${firstProductId}":`, realFoundProduct);
    }
  })
  .catch((error) => {
    console.error('Ошибка при получении товаров с сервера:', error);
  });