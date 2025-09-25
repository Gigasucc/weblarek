import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

export class HeaderView extends Component<{}> {
  private counterEl: HTMLElement;
  private basketBtn: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    
    this.counterEl = container.querySelector('.header__basket-counter')!;
    this.basketBtn = container.querySelector('.header__basket')!;

    this.basketBtn.addEventListener('click', () => {
      events.emit('basket:open');
    });
  }

  setCounter(value: number) {
    this.counterEl.textContent = String(value);
  }
}