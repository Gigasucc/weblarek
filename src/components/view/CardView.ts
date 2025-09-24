// CardView.ts
import { Component } from '../base/Component';
import { categoryMap } from '../../utils/utils';

export interface CardProps {
  title: string;
  price: string;
}

export class CardView<T extends CardProps> extends Component<T> {
  protected titleEl: HTMLElement;
  protected priceEl: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);
    this.titleEl = container.querySelector('.card__title')!;
    this.priceEl = container.querySelector('.card__price')!;
  }

  set title(value: string) {
    this.titleEl.textContent = value;
  }

  set price(value: string) {
    this.priceEl.textContent = value;
  }

  render(data?: Partial<T>): HTMLElement {
    if (data) {
      Object.assign(this, data);
    }
    return this.container;
  }
}

// Для карточек с категорией и изображением
export interface CategoryCardProps extends CardProps {
  category: string;
  image?: string;
  alt?: string;
}

export class CategoryCardView<T extends CategoryCardProps> extends CardView<T> {
  protected categoryEl: HTMLElement;
  protected imageEl?: HTMLImageElement;

  constructor(container: HTMLElement) {
    super(container);
    this.categoryEl = container.querySelector('.card__category')!;
    this.imageEl = container.querySelector('.card__image') as HTMLImageElement;
  }

  set category(value: string) {
    this.categoryEl.textContent = value;
    this.categoryEl.className = 'card__category';
    if (categoryMap[value]) {
      this.categoryEl.classList.add(categoryMap[value]);
    }
  }

  set image(value: string) {
    if (this.imageEl) {
      this.setImage(this.imageEl, value);
    }
  }

  set alt(value: string) {
    if (this.imageEl && value) {
      this.imageEl.alt = value;
    }
  }
}