import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Products {
  private products: IProduct[] = [];
  private selectedProduct: IProduct | null = null;
  private events: IEvents;

  constructor(events: IEvents, products: IProduct[] = []) {
    this.events = events;
    this.products = products;
  }

  setProducts(products: IProduct[]): void {
    this.products = products;
    this.events.emit('products:set', products);
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find((product) => product.id === id);
  }

  setSelectedProduct(product: IProduct): void {
    this.selectedProduct = product;
    this.events.emit('product:selected', product);
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }
}
