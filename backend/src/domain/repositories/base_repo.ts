export interface BaseRepo<T> {

    create(entity: T): Promise<T>;
    findById(id: string): Promise<T>;
    update(entity: T): Promise<T>;
    delete(id: string): Promise<T>;

}