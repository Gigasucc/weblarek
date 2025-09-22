import { CardView, CardProps } from './CardView';

interface ProductPreviewProps extends CardProps {
  inCart: boolean;
  disabled?: boolean;
}

export class ProductPreviewView extends CardView<ProductPreviewProps> {
  private buttonEl: HTMLButtonElement;

  constructor(template: HTMLTemplateElement) {
    const container = template.content.firstElementChild!
      .cloneNode(true) as HTMLElement;
    super(container);
    this.buttonEl = container.querySelector('.card__button')!;
  }

render(data?: Partial<ProductPreviewProps>): HTMLElement {
  super.render(data);

  if (data?.disabled) {
    this.buttonEl.disabled = true;
    this.buttonEl.textContent = 'Недоступно';
    this.buttonEl.classList.add('button_disabled'); 
  } else {
    this.buttonEl.disabled = false;
    this.buttonEl.classList.remove('button_disabled');
    this.buttonEl.textContent = data?.inCart
      ? 'Удалить из корзины'
      : 'В корзину';
  }

  return this.container;
}

setInCart(inCart: boolean) {
  // Не обновляем состояние для бесценных товаров
  if (this.buttonEl.disabled) return;
  
  this.buttonEl.textContent = inCart ? 'Удалить из корзины' : 'В корзину';
}

  onToggleCart(callback: () => void) {
    if (this.buttonEl.disabled) return;
    this.buttonEl.addEventListener('click', e => {
      e.stopPropagation();
      callback();
    });
  }

  
}
