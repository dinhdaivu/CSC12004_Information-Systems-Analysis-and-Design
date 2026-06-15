import { Component, inject } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { ToastService } from '@core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe, NgClass],
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      @for (toast of toasts$ | async; track toast.id) {
        <div
          class="flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg text-sm max-w-sm pointer-events-auto animate-fade-in"
          [ngClass]="{
            'bg-red-600':    toast.type === 'error',
            'bg-yellow-500': toast.type === 'warning',
            'bg-green-600':  toast.type === 'success',
            'bg-blue-600':   toast.type === 'info'
          }"
        >
          <span class="flex-1">{{ toast.message }}</span>
          <button
            type="button"
            (click)="dismiss(toast.id)"
            class="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >✕</button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts$ = this.toastService.toasts$;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
