import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'error' | 'warning' | 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts$ = new BehaviorSubject<Toast[]>([]);
  readonly toasts$ = this._toasts$.asObservable();
  private nextId = 0;

  show(message: string, type: ToastType = 'error', duration = 4000): void {
    const toast: Toast = { id: this.nextId++, message, type };
    this._toasts$.next([...this._toasts$.value, toast]);
    window.setTimeout(() => this.dismiss(toast.id), duration);
  }

  dismiss(id: number): void {
    this._toasts$.next(this._toasts$.value.filter(t => t.id !== id));
  }
}
