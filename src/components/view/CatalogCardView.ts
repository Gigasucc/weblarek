import { CategoryCardView, CategoryCardProps } from './CardView';

interface CatalogCardProps extends CategoryCardProps {
  inCart: boolean;
}

export class CatalogCardView extends CategoryCardView<CatalogCardProps> {
  constructor(container: HTMLElement, onClick: () => void) {
    super(container);
    this.container.addEventListener('click', onClick);
  }

  set inCart(value: boolean) {
    this.container.classList.toggle('card_in-cart', value);
  }
}
