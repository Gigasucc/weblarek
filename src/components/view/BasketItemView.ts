import { CardView, CardProps } from '../view/CardView';

interface BasketItemProps extends CardProps {
  index: number;
}

export class BasketItemView extends CardView<BasketItemProps> {
  private indexEl: HTMLElement;
  private deleteBtn: HTMLButtonElement;

  constructor(template: HTMLTemplateElement) {
    const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    super(container);

    this.indexEl = container.querySelector('.basket__item-index')!;
    this.deleteBtn = container.querySelector('.basket__item-delete')!;
  }

  render(data?: Partial<BasketItemProps>): HTMLElement {
    if (data?.index !== undefined) {
      this.indexEl.textContent = String(data.index);
    }
    return super.render(data);
  }

  onDelete(callback: () => void) {
    this.deleteBtn.addEventListener('click', callback);
  }
}
