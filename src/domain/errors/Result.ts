import { DomainError } from './DomainError';

export type Result<T, E = DomainError> = Ok<T, E> | Err<T, E>;

export class Ok<T, E = DomainError> {
  readonly _tag = 'Ok' as const;
  readonly value: T;

  constructor(value: T) {
    this.value = value;
  }

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  map<U>(fn: (val: T) => U): Result<U, E> {
    return new Ok<U, E>(fn(this.value));
  }

  flatMap<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultVal: T): T {
    return this.value;
  }
}

export class Err<T, E = DomainError> {
  readonly _tag = 'Err' as const;
  readonly error: E;

  constructor(error: E) {
    this.error = error;
  }

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  map<U>(_fn: (val: T) => U): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  flatMap<U>(_fn: (val: T) => Result<U, E>): Result<U, E> {
    return new Err<U, E>(this.error);
  }

  unwrap(): never {
    throw this.error instanceof Error ? this.error : new Error(String(this.error));
  }

  unwrapOr(defaultVal: T): T {
    return defaultVal;
  }
}

export const ok = <T, E = DomainError>(value: T): Result<T, E> => new Ok<T, E>(value);
export const err = <T, E = DomainError>(error: E): Result<T, E> => new Err<T, E>(error);
