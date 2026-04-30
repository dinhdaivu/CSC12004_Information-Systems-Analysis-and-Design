import { of, Subject, throwError } from 'rxjs';
import { handleRequest } from './request-handler.util';

describe('handleRequest', () => {
  it('should call onSuccess with the emitted value', () => {
    const onSuccess = jest.fn();
    handleRequest({ request$: of('result'), fallbackValue: '', onSuccess }).subscribe();
    expect(onSuccess).toHaveBeenCalledWith('result');
  });

  it('should call setLoading(true) before emit and setLoading(false) after finalize', () => {
    const calls: boolean[] = [];
    const setLoading = jest.fn((v: boolean) => calls.push(v));

    // finalize runs after complete, so check after subscribe() returns (synchronous with of())
    handleRequest({ request$: of(1), fallbackValue: 0, setLoading }).subscribe();

    expect(calls[0]).toBe(true);
    expect(calls[calls.length - 1]).toBe(false);
  });

  it('should call onError and return fallbackValue on error', () => {
    const onError = jest.fn();
    const err = new Error('fail');
    let received: string | undefined;

    handleRequest({
      request$: throwError(() => err),
      fallbackValue: 'fallback',
      onError,
    }).subscribe((v) => { received = v; });

    expect(received).toBe('fallback');
    expect(onError).toHaveBeenCalledWith(err);
  });

  it('should complete without callbacks when they are not provided', () => {
    let received: number | undefined;
    handleRequest({ request$: of(42), fallbackValue: 0 }).subscribe((v) => { received = v; });
    expect(received).toBe(42);
  });

  it('should stop when until$ emits', () => {
    const stop$ = new Subject<void>();
    const subject = new Subject<number>();
    const results: number[] = [];

    handleRequest({ request$: subject.asObservable(), fallbackValue: -1, until$: stop$ })
      .subscribe((v) => results.push(v));

    subject.next(1);
    stop$.next();
    subject.next(2);

    expect(results).toEqual([1]);
  });

  it('should set loading false via finalize even on error', () => {
    const setLoading = jest.fn();

    handleRequest({
      request$: throwError(() => new Error('err')),
      fallbackValue: null,
      setLoading,
    }).subscribe();

    expect(setLoading).toHaveBeenLastCalledWith(false);
  });
});
