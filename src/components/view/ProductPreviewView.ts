import { CategoryCardView, CategoryCardProps } from './CardView';

interface ProductPreviewProps extends CategoryCardProps {
  inCart: boolean;
  disabled?: boolean;
}

export class ProductPreviewView extends CategoryCardView<ProductPreviewProps> {
  private buttonEl: HTMLButtonElement;

  constructor(container: HTMLElement, onToggleCart: () => void) {
    super(container);
    this.buttonEl = container.querySelector('.card__button')!;
    this.buttonEl.addEventListener('click', e => {
      e.stopPropagation();
      if (!this.buttonEl.disabled) {
        onToggleCart();
      }
    });
  }

  set inCart(value: boolean) {
    if (this.buttonEl.disabled) return;
    this.buttonEl.textContent = value ? 'Удалить из корзины' : 'В корзину';
  }

  set disabled(value: boolean) {
    this.buttonEl.disabled = value;
    if (value) {
      this.buttonEl.textContent = 'Недоступно';
      this.buttonEl.classList.add('button_disabled');
    } else {
      this.buttonEl.classList.remove('button_disabled');
    }
  }
}
