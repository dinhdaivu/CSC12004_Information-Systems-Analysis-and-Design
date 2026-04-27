import { Observable, of } from "rxjs";
import { catchError, map, startWith } from "rxjs/operators";

export interface ViewState<T> {
  loading: boolean;
  error: string | null;
  data: T;
}

type LoadingResult<T> = {
  data: T;
  error?: string | null;
};

export function createLoadingState<T>(
  source$: Observable<LoadingResult<T>>,
  fallbackData: T,
  fallbackError = "Unable to load data.",
): Observable<ViewState<T>> {
  return source$.pipe(
    map((result) => ({
      loading: false,
      error: result.error ?? null,
      data: result.data,
    })),
    startWith({
      loading: true,
      error: null,
      data: fallbackData,
    }),
    catchError(() =>
      of({
        loading: false,
        error: fallbackError,
        data: fallbackData,
      }),
    ),
  );
}
