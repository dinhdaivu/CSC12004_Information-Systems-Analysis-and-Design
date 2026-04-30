import { of, throwError } from 'rxjs';
import { createLoadingState } from './loading-state.util';

describe('createLoadingState', () => {
  it('should emit loading state first', (done) => {
    const source$ = of({ data: [1, 2, 3] });
    const states: unknown[] = [];

    createLoadingState(source$, []).subscribe({
      next: (s) => states.push(s),
      complete: () => {
        expect(states[0]).toEqual({ loading: true, error: null, data: [] });
        done();
      },
    });
  });

  it('should emit resolved state after source emits', (done) => {
    const source$ = of({ data: 'hello', error: null });
    const states: unknown[] = [];

    createLoadingState(source$, '').subscribe({
      next: (s) => states.push(s),
      complete: () => {
        expect(states[1]).toEqual({ loading: false, error: null, data: 'hello' });
        done();
      },
    });
  });

  it('should carry error string from source result', (done) => {
    const source$ = of({ data: null, error: 'Something went wrong' });
    const states: unknown[] = [];

    createLoadingState(source$, null).subscribe({
      next: (s) => states.push(s),
      complete: () => {
        expect(states[1]).toMatchObject({ loading: false, error: 'Something went wrong' });
        done();
      },
    });
  });

  it('should use null for error when result.error is undefined', (done) => {
    const source$ = of({ data: 42 });
    const states: unknown[] = [];

    createLoadingState(source$, 0).subscribe({
      next: (s) => states.push(s),
      complete: () => {
        expect(states[1]).toMatchObject({ error: null, data: 42 });
        done();
      },
    });
  });

  it('should catch observable errors and emit fallback error state', (done) => {
    const source$ = throwError(() => new Error('network error'));

    createLoadingState(source$, [], 'Custom fallback error').subscribe({
      next: (s) => {
        if (!(s as { loading: boolean }).loading) {
          expect(s).toEqual({ loading: false, error: 'Custom fallback error', data: [] });
          done();
        }
      },
    });
  });

  it('should use default fallback error message when not provided', (done) => {
    const source$ = throwError(() => new Error('fail'));

    createLoadingState(source$, null).subscribe({
      next: (s) => {
        if (!(s as { loading: boolean }).loading) {
          expect((s as { error: string }).error).toBe('Unable to load data.');
          done();
        }
      },
    });
  });
});
