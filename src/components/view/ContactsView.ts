import { FormView, FormProps } from './FormView';
import { IEvents } from '../base/Events';

interface ContactsProps extends FormProps {
  email: string;
  phone: string;
}

export class ContactsView extends FormView<ContactsProps> {
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);

    this.emailInput = container.querySelector('input[name="email"]')!;
    this.phoneInput = container.querySelector('input[name="phone"]')!;

    this.emailInput.addEventListener('input', () => {
      this.events.emit('contacts:emailChanged', { value: this.emailInput.value });
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit('contacts:phoneChanged', { value: this.phoneInput.value });
    });

    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit('contacts:submit');
    });
  }

  set email(value: string) {
    this.emailInput.value = value;
  }

  set phone(value: string) {
    this.phoneInput.value = value;
  }
}
