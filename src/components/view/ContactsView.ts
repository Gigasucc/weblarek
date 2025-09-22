import { FormView, FormProps } from '../view/FormView';

interface ContactsProps extends FormProps {
  email: string;
  phone: string;
}

export class ContactsView extends FormView<ContactsProps> {
  private emailInput: HTMLInputElement;
  private phoneInput: HTMLInputElement;

  constructor(template: HTMLTemplateElement) {
    const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    super(container);

    this.emailInput = container.querySelector('input[name="email"]')!;
    this.phoneInput = container.querySelector('input[name="phone"]')!;

    this.emailInput.addEventListener('input', () => this.validateForm());
    this.phoneInput.addEventListener('input', () => this.validateForm());
  }

  render(data?: Partial<ContactsProps>): HTMLElement {
    super.render(data);
    if (data?.email !== undefined) this.emailInput.value = data.email;
    if (data?.phone !== undefined) this.phoneInput.value = data.phone;
    return this.container;
  }

  private validateForm() {
    const isEmailNotEmpty = this.emailInput.value.trim().length > 0;
    const isPhoneNotEmpty = this.phoneInput.value.trim().length > 0;
    const isValid = isEmailNotEmpty && isPhoneNotEmpty;
    this.render({ valid: isValid, error: undefined });
  }


  onSubmit(callback: (formData: { email: string; phone: string }) => void) {
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      if ((this.submitBtn && this.submitBtn.disabled)) return;

      const formData = {
        email: this.emailInput.value.trim(),
        phone: this.phoneInput.value.trim(),
      };

      callback(formData);
    });
  }
}
