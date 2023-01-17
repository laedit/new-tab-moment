class LocalStorage {
    public static set<T>(key: string, data: T, timeToLive?: number): void {
        if (timeToLive) {
            const dataWithExpiry = {
                value: data,
                expiry: Date.now() + timeToLive
            };
            localStorage.setItem(key, JSON.stringify(dataWithExpiry));
        }
        else {
            localStorage.setItem(key, JSON.stringify(data));
        }
    }

    public static async get<T>(key: string): Promise<T | null>;
    public static async get<T>(key: string, populate: () => T, timeToLive: number): Promise<T>;
    public static async get<T>(key: string, populate?: () => T, timeToLive?: number): Promise<T | null> {
        const itemStr = localStorage.getItem(key);

        if (!itemStr) {
            if (populate) {
                return await this.populateAndSet(key, populate, timeToLive);
            }
            else {
                return null;
            }
        }
        const item = JSON.parse(itemStr);

        if (!item.expiry) {
            return item as T;
        }

        if (Date.now() > item.expiry) {
            if(populate){
                return await this.populateAndSet(key, populate, timeToLive);
            }
            else {
                return null;
            }
        }
        return item.value as T;
    }

    private static async populateAndSet<T>(key: string, populate: () => T, timeToLive?: number): Promise<T> {
        const populatedItem: T = await populate();
        this.set(key, populatedItem, timeToLive);
        return populatedItem;
    }
}
