import { Observable, of } from "rxjs";
import { catchError, finalize, takeUntil, tap } from "rxjs/operators";

type HandleRequestOptions<T> = {
  request$: Observable<T>;
  fallbackValue: T;
  onSuccess?: (value: T) => void;
  onError?: (error: unknown) => void;
  setLoading?: (loading: boolean) => void;
  until$?: Observable<unknown>;
};

export function handleRequest<T>({
  request$,
  fallbackValue,
  onSuccess,
  onError,
  setLoading,
  until$,
}: HandleRequestOptions<T>): Observable<T> {
  setLoading?.(true);

  const source$ = until$ ? request$.pipe(takeUntil(until$)) : request$;

  return source$.pipe(
    tap((value) => {
      onSuccess?.(value);
    }),
    catchError((error) => {
      onError?.(error);
      return of(fallbackValue);
    }),
    finalize(() => {
      setLoading?.(false);
    }),
  );
}
