// SuccessView.ts
import { Component } from '../base/Component';

interface SuccessProps {
  total: string;
}

export class SuccessView extends Component<SuccessProps> {
  private totalEl: HTMLElement | null; // Может быть null
  private closeBtn: HTMLButtonElement;

  constructor(template: HTMLTemplateElement) {
    const container = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
    super(container);

    // Используем более надежный селектор
    this.totalEl = container.querySelector('.success__description') || 
                   container.querySelector('.success__total') || 
                   container.querySelector('.order-success__description');
    
    this.closeBtn = container.querySelector('.button') as HTMLButtonElement;
    
    // Если элемент не найден, логируем для отладки
    if (!this.totalEl) {
      console.warn('Элемент для отображения суммы не найден в шаблоне успеха');
      console.log('Доступные элементы:', container.innerHTML);
    }
  }

  render(data?: Partial<SuccessProps>): HTMLElement {
    // Безопасная установка текста
    if (data?.total && this.totalEl) {
      this.totalEl.textContent = `Списано ${data.total}`;
    } else if (data?.total) {
      // Если элемента нет, создаем сообщение об ошибке
      console.error('Не могу отобразить сумму: элемент не найден');
    }
    return super.render(data);
  }

  onClose(callback: () => void) {
    this.closeBtn.addEventListener('click', callback);
  }
}