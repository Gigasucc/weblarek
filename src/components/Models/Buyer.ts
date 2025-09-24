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

    // Валидация способа оплаты
    if (!this.payment) {
      errors.payment = 'Не выбран способ оплаты';
    }

    // Валидация адреса
    if (!this.address.trim()) {
      errors.address = 'Не указан адрес';
    }

    // Валидация email
    if (!this.email.trim()) {
      errors.email = 'Email не указан';
    } else if (!this.isValidEmail(this.email)) {
      errors.email = 'Некорректный формат email';
    }

    // Валидация телефона
    if (!this.phone.trim()) {
      errors.phone = 'Телефон не указан';
    } else if (!this.isValidPhone(this.phone)) {
      errors.phone = 'Номер телефона не должен содержать букв';
    }

    return errors;
  }

  isValid(): boolean {
    return Object.keys(this.validate()).length === 0;
  }

  private isValidEmail(email: string): boolean {
    // Простая проверка наличия @ и точки после нее
    const atIndex = email.indexOf('@');
    return atIndex > 0 && email.indexOf('.', atIndex) > atIndex + 1;
  }

   private isValidPhone(phone: string): boolean {

        for (let i = 0; i < phone.length; i++) {
            const char = phone[i];
            
            // Если символ является буквой (латинской или кириллической) - возвращаем false
            if (
                (char >= 'a' && char <= 'z') || // латинские маленькие
                (char >= 'A' && char <= 'Z') || // латинские большие
                (char >= 'а' && char <= 'я') || // кириллические маленькие
                (char >= 'А' && char <= 'Я')    // кириллические большие
            ) {
                return false;
            }
        }

        return true;
    }
}