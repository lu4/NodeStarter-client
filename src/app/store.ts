export class Store {
    public constructor(private base: string, private storage: Storage) {
    }

    public getItem<T>(key: string): T {
        return JSON.parse(<string> this.storage.getItem(`${ this.base }/${ key }`));
    }

    public setItem(key: string, value: any): void {
        this.storage.setItem(`${ this.base }/${ key }`, JSON.stringify(value));
    }

    public clear(): void {
        return this.storage.clear();
    }

    public get length(): number {
        return this.storage.length;
    }

    public key(index: number): string | null {
        return this.storage.key(index);
    }

    public removeItem(key: string): void {
        this.storage.removeItem(`${ this.base }/${ key }`);
    }
}
