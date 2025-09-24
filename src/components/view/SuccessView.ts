import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface SuccessProps {
  total: string;
}

export class SuccessView extends Component<SuccessProps> {
  private totalEl: HTMLElement;
  private closeBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);

    this.totalEl = ensureElement<HTMLElement>('.order-success__description', container);
    this.closeBtn = ensureElement<HTMLButtonElement>('.button', container);
  }

  set total(value: string) {
    this.totalEl.textContent = `Списано ${value}`;
  }

  onClose(callback: () => void) {
    this.closeBtn.addEventListener('click', callback);
  }
}
