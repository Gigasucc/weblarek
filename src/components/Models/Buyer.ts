
import { IBuyer } from '../../types';

export class Buyer {
  private payment: IBuyer['payment'] | null = null;
  private address: string = '';
  private phone: string = '';
  private email: string = '';

  constructor(data: IBuyer | null = null) {
    if (data) {
      this.setData(data);
    }
  }

  setData(data: IBuyer): void {
    this.payment = data.payment;
    this.address = data.address;
    this.phone = data.phone;
    this.email = data.email;
  }

  getData(): IBuyer {
    return {
      payment: this.payment!,
      address: this.address,
      phone: this.phone,
      email: this.email,
    };
  }

  clear(): void {
    this.payment = null;
    this.address = '';
    this.phone = '';
    this.email = '';
  }

  validate(): boolean {
    return (
      !!this.payment &&
      !!this.address.trim() &&
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.email) &&
      /^\+?\d{10,15}$/.test(this.phone)
    );
  }
}

