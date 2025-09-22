// CardView.ts
import { Component } from '../base/Component';
import { categoryMap } from '../../utils/utils';

export interface CardProps {
  title: string;
  price: string;
  category: string;
  image?: string;
  alt?: string;
}

export abstract class CardView<T extends CardProps> extends Component<T> {
  protected titleEl: HTMLElement;
  protected priceEl: HTMLElement;
  protected categoryEl: HTMLElement;
  protected imageEl?: HTMLImageElement;

  constructor(container: HTMLElement) {
    super(container);

    this.titleEl = container.querySelector('.card__title')!;
    this.priceEl = container.querySelector('.card__price')!;
    this.categoryEl = container.querySelector('.card__category')!;
    this.imageEl = container.querySelector('.card__image') as HTMLImageElement;
  }

  render(data?: Partial<T>): HTMLElement {
    if (data?.title) this.titleEl.textContent = data.title;
    if (data?.price) this.priceEl.textContent = data.price;

    if (data?.category) {
      this.categoryEl.textContent = data.category;
      this.categoryEl.className = 'card__category';
      if (categoryMap[data.category]) {
        this.categoryEl.classList.add(categoryMap[data.category]);
      }
    }

    if (data?.image && this.imageEl) {
      this.setImage(this.imageEl, data.image, data.alt);
    }

    return super.render(data);
  }

  // Добавляем метод setImage, если его нет
  protected setImage(element: HTMLImageElement, src: string, alt?: string) {
    element.src = src;
    if (alt) element.alt = alt;
  }
}