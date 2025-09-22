import { CardView, CardProps } from './CardView';

interface CatalogCardProps extends CardProps {
  inCart: boolean;
  disabled?: boolean;
}

export class CatalogCardView extends CardView<CatalogCardProps> {
  private btn: HTMLButtonElement;

  constructor(template: HTMLTemplateElement) {
    // корневой элемент в шаблоне – это <button class="gallery__item card">
    const button = template
      .content
      .firstElementChild!
      .cloneNode(true) as HTMLButtonElement;

    super(button);
    this.btn = button;
  }

  render(data?: Partial<CatalogCardProps>): HTMLElement {
    // Заполняем title, image, price (span.card__price) и т.д.
    super.render(data);

    // Нативно блокируем кнопку у бесценных
    //this.btn.disabled = !!data?.disabled;

    // Для обычных товаров просто добавляем/убираем класс "в корзине"
    this.btn.classList.toggle('card_in-cart', !!data?.inCart);

    return this.btn;
  }

  // Вешаем клик на всю карточку-кнопку
  onClick(callback: () => void) {
    this.btn.addEventListener('click', callback);
  }
}
