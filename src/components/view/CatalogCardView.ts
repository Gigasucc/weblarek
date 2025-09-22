import { CardView, CardProps } from './CardView';

interface CatalogCardProps extends CardProps {
  inCart: boolean;
  disabled?: boolean;
}

export class CatalogCardView extends CardView<CatalogCardProps> {
  private btn: HTMLButtonElement;

  constructor(template: HTMLTemplateElement) {
    const button = template
      .content
      .firstElementChild!
      .cloneNode(true) as HTMLButtonElement;

    super(button);
    this.btn = button;
  }

  render(data?: Partial<CatalogCardProps>): HTMLElement {
    super.render(data);

    this.btn.classList.toggle('card_in-cart', !!data?.inCart);

    return this.btn;
  }

  onClick(callback: () => void) {
    this.btn.addEventListener('click', callback);
  }
}
