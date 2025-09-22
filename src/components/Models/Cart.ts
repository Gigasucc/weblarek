import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Cart {
  private items: IProduct[] = [];
  private events: IEvents;

  constructor(events: IEvents, items: IProduct[] = []) {
    this.events = events;
    this.items = items;
  }

  getItems(): IProduct[] {
    return this.items;
  }

  // Cart.ts
  addItem(product: IProduct): void {
  // Добавляем более строгую проверку
  if (product.price === 0 || product.price === null || product.price === undefined) {
    console.warn(`Попытка добавить бесценный товар «${product.title}»`);
    return;
  }
  this.items.push(product);
  this.events.emit('cart:add', product);
}

  removeItem(product: IProduct): void {
    this.items = this.items.filter((item) => item.id !== product.id);
    this.events.emit('cart:remove', product);
  }

  clear(): void {
    this.items = [];
    this.events.emit('cart:clear');
  }

  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  getItemCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some((item) => item.id === id);
  }
}
