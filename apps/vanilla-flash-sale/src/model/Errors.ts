// eslint-disable-next-line max-classes-per-file
class InSufficientStockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InSufficientStockError';
  }
}

class DataBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataBaseError';
  }
}

export { InSufficientStockError, DataBaseError };
