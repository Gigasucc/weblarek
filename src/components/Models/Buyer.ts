import { IBuyer } from '../../types';

export class Buyer {
  private payment: IBuyer['payment'] | null = null;
  private address: string = '';
  private phone: string = '';
  private email: string = '';

  constructor(data: Partial<IBuyer> | null = null) {
    if (data) {
      this.setData(data);
    }
  }

  setData(data: Partial<IBuyer>): void {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.address !== undefined) this.address = data.address;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.email !== undefined) this.email = data.email;
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

  validate(): Record<keyof IBuyer, boolean> {
    return {
      payment: !!this.payment,
      address: !!this.address.trim(),
      email: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(this.email),
      phone: /^\+?\d{10,15}$/.test(this.phone),
    };
  }
}
