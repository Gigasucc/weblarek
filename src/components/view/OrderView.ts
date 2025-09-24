import { FormView, FormProps } from './FormView';
import { IEvents } from '../base/Events';

interface OrderProps extends FormProps {
  address: string;
  payment: 'card' | 'cash' | null;
}

export class OrderView extends FormView<OrderProps> {
  private addressInput: HTMLInputElement;
  private cardBtn: HTMLButtonElement;
  private cashBtn: HTMLButtonElement;

  constructor(container: HTMLElement, private events: IEvents) {
    super(container);

    this.addressInput = container.querySelector('input[name="address"]')!;
    this.cardBtn = container.querySelector('button[name="card"]')!;
    this.cashBtn = container.querySelector('button[name="cash"]')!;

    this.cardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.setPayment('card'); 
      this.events.emit('order:paymentChanged', { value: 'card' });
    });
    
    this.cashBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.setPayment('cash'); 
      this.events.emit('order:paymentChanged', { value: 'cash' });
    });
    
    this.addressInput.addEventListener('input', () => {
      this.events.emit('order:addressChanged', { value: this.addressInput.value });
    });
    
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      this.events.emit('order:submit');
    });
  }

 
  private setPayment(value: 'card' | 'cash') {

    this.cardBtn.classList.remove('button_alt-active');
    this.cashBtn.classList.remove('button_alt-active');
    
 
    if (value === 'card') {
      this.cardBtn.classList.add('button_alt-active');
    } else if (value === 'cash') {
      this.cashBtn.classList.add('button_alt-active');
    }
  }

  set address(value: string) {
    this.addressInput.value = value;
  }

  set payment(value: 'card' | 'cash' | null) {

    this.cardBtn.classList.remove('button_alt-active');
    this.cashBtn.classList.remove('button_alt-active');
    
    if (value === 'card') {
      this.cardBtn.classList.add('button_alt-active');
    } else if (value === 'cash') {
      this.cashBtn.classList.add('button_alt-active');
    }
  }
}
