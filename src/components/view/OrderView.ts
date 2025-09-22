// OrderView.ts
import { FormView, FormProps } from '../view/FormView';

interface OrderProps extends FormProps {
  address: string;
  payment: 'card' | 'cash' | null;
}

export class OrderView extends FormView<OrderProps> {
  private addressInput: HTMLInputElement;
  private cardBtn: HTMLButtonElement;
  private cashBtn: HTMLButtonElement;
  private selectedPayment: 'card' | 'cash' | null = null;

  constructor(template: HTMLTemplateElement) {
    const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    super(container);

    this.addressInput = container.querySelector('input[name="address"]')!;
    this.cardBtn = container.querySelector('button[name="card"]')!;
    this.cashBtn = container.querySelector('button[name="cash"]')!;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.cardBtn.addEventListener('click', () => this.selectPayment('card'));
    this.cashBtn.addEventListener('click', () => this.selectPayment('cash'));
    this.addressInput.addEventListener('input', () => this.validateForm());
  }

  private selectPayment(method: 'card' | 'cash') {
    this.selectedPayment = method;
    [this.cardBtn, this.cashBtn].forEach(btn => btn.classList.remove('button_alt-active'));

    if (method === 'card') {
      this.cardBtn.classList.add('button_alt-active');
    } else {
      this.cashBtn.classList.add('button_alt-active');
    }

    this.validateForm();
  }

  private validateForm() {
    const isAddressValid = this.addressInput.value.trim().length > 0;
    const isPaymentValid = this.selectedPayment !== null;
    const isValid = isAddressValid && isPaymentValid;

    // Формируем сообщение об ошибке
    let errorMessage = '';
    if (!isAddressValid && !isPaymentValid) {
      errorMessage = 'Необходимо указать адрес и выбрать способ оплаты';
    } else if (!isAddressValid) {
      errorMessage = 'Необходимо указать адрес';
    } else if (!isPaymentValid) {
      errorMessage = 'Необходимо выбрать способ оплаты';
    }

    this.render({ valid: isValid, error: errorMessage });
  }

  render(data?: Partial<OrderProps>): HTMLElement {
    super.render(data);
    
    if (data?.address !== undefined) {
      this.addressInput.value = data.address;
      this.validateForm();
    }
    
    return this.container;
  }

  onSubmit(callback: (formData: { payment: 'card' | 'cash'; address: string }) => void) {
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      // Перед отправкой еще раз проверяем валидность
      this.validateForm();
      
      if ((this.submitBtn && this.submitBtn.disabled) || !this.selectedPayment) return;

      const formData = {
        payment: this.selectedPayment,
        address: this.addressInput.value.trim(),
      };

      callback(formData);
    });
  }
}