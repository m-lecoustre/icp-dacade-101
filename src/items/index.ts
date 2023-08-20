import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt} from 'azle';
import { v4 as uuidv4 } from 'uuid';

/**
 * This type represents an Item that is
 *  standardizen object orderable and suppliable by many suppliers
 */

type Item = Record<{
    id: string;
    title:  string;
    description:    string;
    illustrationURL:    string;
    createdAt:  nat64;
    updatedAt:  Opt<nat64>;
}>

type ItemPayload = Record<{
    title:  string;
    description:    string;
    illustrationURL:    string;
}>
const items = new StableBTreeMap<string, Item>(0, 44, 1024);

$query;
export function getItems(): Result<Vec<Item>, string> {
    return Result.Ok(items.values());
}
$query;
export function getItem(id: string): Result<Item, string> {
    return match(items.get(id), {
        Some: (item) => Result.Ok<Item, string>(item),
        None: () => Result.Err<Item, string>(`No item found with id=${id}`)
    });
}

$update;
export function addItem(payload: ItemPayload): Result<Item, string> {
    const item: Item = { id: uuidv4(), createdAt: ic.time(), updatedAt: Opt.None, ...payload};
    items.insert(item.id, item);
    return Result.Ok<Item, string>(item);
}

$update;
export function updateItem(id: string, payload: ItemPayload): Result<Item, string> {
    return match(items.get(id), {
        Some: (item) => {
            const updatedItem: Item = {...item, ...payload, updatedAt: Opt.Some(ic.time())};
            items.insert(item.id, updatedItem);
            return Result.Ok<Item, string>(updatedItem);
        },
        None: () => Result.Err<Item, string>("can't update item cause there is no item with id=${id} found")
    });
}

$update;
export function deleteItem(id: string): Result<Item, string> {
    return match(items.remove(id), {
        Some: (item) => Result.Ok<Item, string>(item),
        None: () => Result.Err<Item, string>(`can't delete item cause no item with id=${id} found`)
    });
}

// a workaround to make uuid package work with Azle
globalThis.crypto = {
    "getRandomValues": () => {
        let array = new Uint8Array(32);
        for (let i  = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256);
        }
        return array;
    }
};