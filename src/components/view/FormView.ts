import { Component } from '../base/Component';

export interface FormProps {
  valid: boolean;
  error?: string;
}

export abstract class FormView<T extends FormProps> extends Component<T> {
  protected formEl: HTMLFormElement;
  protected errorEl: HTMLElement;
  protected submitBtn: HTMLButtonElement;

  constructor(container: HTMLElement) {
    super(container);

    this.formEl = container as HTMLFormElement;
    this.errorEl = container.querySelector('.form__errors')!;
    this.submitBtn = container.querySelector('button[type="submit"], .order__button') as HTMLButtonElement;
  }

  render(data?: Partial<T>): HTMLElement {
    if (data?.error !== undefined) {
      this.errorEl.textContent = data.error;
    }
    if (data?.valid !== undefined) {
      this.submitBtn.disabled = !data.valid;
    }
    return super.render(data);
  }

  onSubmit(callback: (formData: Record<string, string>) => void) {
    this.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = Object.fromEntries(new FormData(this.formEl).entries()) as Record<string, string>;
      callback(formData);
    });
  }
}
