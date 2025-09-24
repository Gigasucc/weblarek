import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

export class ModalView extends Component<{}> {
  private closeBtn: HTMLElement;
  private contentEl: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    
    this.closeBtn = ensureElement<HTMLElement>('.modal__close', container);
    this.contentEl = ensureElement<HTMLElement>('.modal__content', container);

    this.closeBtn.addEventListener('click', () => this.close());
    container.addEventListener('click', (e) => {
      if (e.target === container) this.close();
    });
  }

  open(content: HTMLElement) {
    this.contentEl.innerHTML = '';
    this.contentEl.appendChild(content);
    this.container.classList.add('modal_active');
  }

  close() {
    this.container.classList.remove('modal_active');
    this.contentEl.innerHTML = '';
  }
}
