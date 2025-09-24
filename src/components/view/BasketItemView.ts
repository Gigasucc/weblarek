// BasketItemView.ts
import { CardView, CardProps } from './CardView';

interface BasketItemProps extends CardProps {
  index: number;
}

export class BasketItemView extends CardView<BasketItemProps> {
  private indexEl: HTMLElement;
  private deleteBtn: HTMLButtonElement;

  constructor(container: HTMLElement, onDelete: () => void) {
    super(container);

    this.indexEl = container.querySelector('.basket__item-index')!;
    this.deleteBtn = container.querySelector('.basket__item-delete')!;

    this.deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      onDelete();
    });
  }

  set index(value: number) {
    this.indexEl.textContent = String(value);
  }
}