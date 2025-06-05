import { AsyncLocalStorage } from 'async_hooks';

export class AsyncStorage {
  private static asyncContainer = new AsyncLocalStorage<Record<string, any>>();

  public static createAsyncLocalStorage = () => {
    this.asyncContainer.enterWith({});
    return this.asyncContainer.getStore() as Record<string, any>;
  };

  public static getFromAsyncStore = (key: string) => {
    const async_store = this.asyncContainer.getStore() || this.createAsyncLocalStorage();
    return async_store[key];
  };

  public static setInAsyncStore = (key: string, value: any) => {
    const async_store = this.asyncContainer.getStore() || this.createAsyncLocalStorage();
    async_store[key] = value;
  };
}
