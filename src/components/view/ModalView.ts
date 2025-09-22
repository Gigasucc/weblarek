import { Component } from '../base/Component';

export class ModalView extends Component<{}> {
  private closeBtn: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.closeBtn = container.querySelector('.modal__close')!;

    this.closeBtn.addEventListener('click', () => this.close());
    container.addEventListener('click', (e) => {
      if (e.target === container) this.close();
    });
  }

  open(content: HTMLElement) {
    const contentEl = this.container.querySelector('.modal__content')!;
    contentEl.innerHTML = '';
    contentEl.appendChild(content);
    this.container.classList.add('modal_active');
  }

  close() {
    this.container.classList.remove('modal_active');
    const contentEl = this.container.querySelector('.modal__content')!;
    contentEl.innerHTML = '';
  }
}
