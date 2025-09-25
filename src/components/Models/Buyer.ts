import { IBuyer } from '../../types'; 
import { IEvents } from '../base/Events'; 

export class Buyer { 
  private payment: IBuyer['payment'] | null = null; 
  private address: string = ''; 
  private phone: string = ''; 
  private email: string = ''; 
  private events: IEvents; 

  constructor(events: IEvents, data: Partial<IBuyer> | null = null) { 
    this.events = events; 
    if (data) { 
      this.setData(data); 
    } 
  } 

  setData(data: Partial<IBuyer>): void { 
    if (data.payment !== undefined) this.payment = data.payment; 
    if (data.address !== undefined) this.address = data.address; 
    if (data.phone !== undefined) this.phone = data.phone; 
    if (data.email !== undefined) this.email = data.email; 

    this.events.emit('buyer:change', this.getData()); 
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

    this.events.emit('buyer:clear'); 
  } 

  validate(): Partial<Record<keyof IBuyer, string>> { 
    const errors: Partial<Record<keyof IBuyer, string>> = {}; 

    // Проверка на пустоту для каждого поля
    if (!this.payment) { 
      errors.payment = 'Не выбран способ оплаты'; 
    } 

    if (!this.address.trim()) { 
      errors.address = 'Не указан адрес'; 
    } 

    if (!this.email.trim()) { 
      errors.email = 'Email не указан'; 
    } 

    if (!this.phone.trim()) { 
      errors.phone = 'Телефон не указан'; 
    } 

    return errors; 
  } 

  isValid(): boolean { 
    return Object.keys(this.validate()).length === 0; 
  } 
}