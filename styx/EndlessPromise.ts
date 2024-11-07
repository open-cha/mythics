export class EndlessPromise<T> implements Promise<T> {
  private resolveFn?: (value: T | PromiseLike<T>) => void;
  private rejectFn?: (reason?: any) => void;
  private pendingPromise: Promise<T> = new Promise<T>((resolve, reject) => {
    this.resolveFn = resolve;
    this.rejectFn = reject;
  });
  private completedPromise: Promise<T>;

  readonly [Symbol.toStringTag]: string = 'EndlessPromise';

  constructor(executor: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
    const resolve: (value: T | PromiseLike<T>) => void = (value: T | PromiseLike<T>): void => {
      const resolveFn: (value: T | PromiseLike<T>) => void = this.resolveFn!;
      this.renewPromise();
      resolveFn(value);
    };

    const reject: (reason?: any) => void = (reason?: any) => {
      const rejectFn: (reason?: any) => void = this.rejectFn!;
      this.renewPromise();
      rejectFn(reason);
    };

    executor(resolve, reject);
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
  ): EndlessPromise<TResult1 | TResult2> {
    return new EndlessPromise<TResult1 | TResult2>((resolve, reject) => {
      this.completedPromise?.then(
        onfulfilled && ((value: T) => resolve(onfulfilled(value))),
        onrejected && ((reason: any) => reject(onrejected(reason))),
      );
      this.endlessThen(resolve, reject, onfulfilled, onrejected);
    });
  }

  catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ): Promise<T | TResult> {
    return new EndlessPromise<TResult>((_, reject) => {
      this.completedPromise?.catch(
        onrejected && ((reason: any) => reject(onrejected(reason))),
      );
      this.endlessCatch(reject, onrejected);
    });
  }

    finally(
      onfinally?: (() => void) | null | undefined
    ): Promise<T> {
      this.completedPromise?.finally(onfinally);
      return new EndlessPromise<T>(() => this.endlessFinally(onfinally));
    }

    private endlessThen<TResult1 = T, TResult2 = never>(
      resolveFn: (value: TResult1 | TResult2 | PromiseLike<TResult1 | TResult2>) => void,
      rejectFn: (reason?: any) => void,
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    ): void {
      this.pendingPromise
        .then(
          onfulfilled && ((value: T) => resolveFn(onfulfilled(value))),
          onrejected && ((reason: any) => rejectFn(onrejected(reason))),
        )
        .finally(() => this.endlessThen(resolveFn, rejectFn, onfulfilled, onrejected));
    }

    private endlessCatch<TResult = never>(
      reject: (reason?: any) => void,
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): void {
      this.pendingPromise
        .catch(
          onrejected && ((reason: any) => reject(onrejected(reason))),
        )
        .finally(() => this.endlessCatch(reject, onrejected));
    }

    private endlessFinally<T>(
      onfinally?: (() => void) | null | undefined
    ): void {
      this.pendingPromise
        .finally(onfinally)
        .finally(() => this.endlessFinally(onfinally));
    }

    private renewPromise(): void {
      this.completedPromise = this.pendingPromise;
      this.pendingPromise = new Promise<T>((resolve, reject) => {
        this.resolveFn = resolve;
        this.rejectFn = reject;
      });
    }
}
