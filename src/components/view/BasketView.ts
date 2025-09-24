// BasketView.ts
import { Component } from '../base/Component';

interface BasketData {
  items: HTMLElement[];
  total: string;
  valid: boolean;
}

export class BasketView extends Component<BasketData> {
  private listEl: HTMLElement;
  private totalEl: HTMLElement;
  private checkoutBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);

    this.listEl = container.querySelector('.basket__list')!;
    this.totalEl = container.querySelector('.basket__price')!;
    this.checkoutBtn = container.querySelector('.basket__button')!;
  }

  set items(value: HTMLElement[]) {
    if (value.length) {
      this.listEl.replaceChildren(...value);
    } else {
      this.listEl.replaceChildren(document.createTextNode('Корзина пуста'));
    }
  }

  set total(value: string) {
    this.totalEl.textContent = value;
  }

  set valid(value: boolean) {
    this.checkoutBtn.disabled = !value;
  }

  // Добавляем метод для обработки нажатия на кнопку оформления
  setCheckoutHandler(callback: () => void) {
    this.checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      callback();
    });
  }
}