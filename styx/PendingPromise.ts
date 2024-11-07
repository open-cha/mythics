import { EndlessPromise } from "./EndlessPromise";

export class PendingPromise<T> implements Promise<T> {
  private resolveFn?: (value: T | PromiseLike<T>) => void;
  private rejectFn?: (reason?: any) => void;

  private promise: Promise<T> = new (this.useEndlessPromise ? EndlessPromise<T> :  Promise<T>)((resolve, reject) => {
    this.resolveFn = resolve;
    this.rejectFn = reject;
  });

  readonly [Symbol.toStringTag]: string = 'PendingPromise';

  constructor(private useEndlessPromise: boolean = false) {}

  resolve(value: T): void {
    this.resolveFn?.(value);
  }

  reject(reason?: any): void {
    this.rejectFn?.(reason);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): Promise<T | TResult> {
    return this.promise.catch(onrejected);
  }

  finally(
    onfinally?: (() => void) | null | undefined
  ): Promise<T> {
    return this.promise.finally(onfinally);
  }
}