import { Component } from '../base/Component';

export class BasketView extends Component<{}> {
  private listEl: HTMLElement;
  private totalEl: HTMLElement;
  private checkoutBtn: HTMLButtonElement;

  constructor(template: HTMLTemplateElement) {
    const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    super(container);

    this.listEl = container.querySelector('.basket__list')!;
    this.totalEl = container.querySelector('.basket__price')!;
    this.checkoutBtn = container.querySelector('.basket__button')!;
  }

  renderItems(items: HTMLElement[]) {
    if (items.length) {
      this.listEl.replaceChildren(...items);
      this.checkoutBtn.disabled = false;
    } else {
      this.listEl.replaceChildren(document.createTextNode('Корзина пуста'));
      this.checkoutBtn.disabled = true;
    }
  }

  setTotal(total: string) {
    this.totalEl.textContent = total;
  }

  onCheckout(callback: () => void) {
    this.checkoutBtn.addEventListener('click', callback);
  }
}
