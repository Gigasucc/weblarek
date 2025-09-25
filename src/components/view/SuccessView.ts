import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface SuccessProps {
  total: string;
}

export class SuccessView extends Component<SuccessProps> {
  private totalEl: HTMLElement;

  constructor(container: HTMLElement, private onCloseCallback: () => void) {
    super(container);

    this.totalEl = ensureElement<HTMLElement>('.order-success__description', container);
    const closeBtn = ensureElement<HTMLButtonElement>('.button', container);
    
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.onCloseCallback();
    });
  }

  set total(value: string) {
    this.totalEl.textContent = `Списано ${value}`;
  }
}