import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from "azle";
import { v4 as uuidv4 } from 'uuid';

/**
 * This type represents supplier
 *   i.e. organization able to supply some registered items
 *     through specified quantities recorded as stocks
 */

type Supplier = Record<{
    id: string;
    name: string;
    createdAt: nat64;
    updatedAt: Opt<nat64>;
}>

type SupplierPayload = Record<{
    name:       string;
}>

const suppliers = new StableBTreeMap<string, Supplier>(0, 44, 1024);


$query;
export function getSuppliers(): Result<Vec<Supplier>, string> {
    return Result.Ok<Vec<Supplier>, string>(suppliers.values());
}

$query;
export function getSupplier(id: string): Result<Supplier, string> {
    return match(suppliers.get(id), {
        Some: (supplier) => Result.Ok<Supplier, string>(supplier),
        None: () => Result.Err<Supplier, string>(`No suupplier found with id=${id}`)
    });
}

$update;
export function addSupplier(payload: SupplierPayload): Result<Supplier, string> {
    const supplier: Supplier = { "id": uuidv4(), "createdAt": ic.time(), "updatedAt": Opt.None, ...payload};
    suppliers.insert(supplier.id, supplier);
    return Result.Ok<Supplier, string>(supplier);
}

$update;
export function updateSupplier(id: string, payload: SupplierPayload): Result<Supplier, string> {
    return match(suppliers.get(id), {
        Some: (supplier) => {
            const updatedSupplier: Supplier = {...supplier, ...payload, updatedAt: Opt.Some(ic.time())};
            suppliers.insert(supplier.id, updatedSupplier);
            return Result.Ok<Supplier, string>(updatedSupplier);
        },
        None: () => Result.Err<Supplier, string>(`can't update supplier cause no supplier with id=${id} found`)
    });
}

$update;
export function deleteSupplier(id: string): Result<Supplier, string> {
    return match(suppliers.remove(id), {
        Some: (supplier) => Result.Ok<Supplier, string>(supplier),
        None: () => Result.Err<Supplier, string>(`can't delete supplier cause no supplier found with id=${id}`)
    });
}

/**
 * This type represents stock about an item suppliable by supplier
 */
type SupplierItemStock = Record<{
    id: string,
    itemId: string,
    quantity: bigint,
    createdAt: nat64,
    updatedAt: Opt<nat64>
}>

type SupplierItemStockPayload = Record<{
    itemId: string,
    quantity: bigint
}>

const suppliersStocks = new StableBTreeMap<string, SupplierItemStock>(0, 44, 1024);

$query;
export function getSupplierItemStocks(): Result<Vec<SupplierItemStock>, string> {
    return Result.Ok<Vec<SupplierItemStock>, string>(suppliersStocks.values());
}

$query;
export function getSupplierItemStock(id: string): Result<SupplierItemStock, string> {
    return match(suppliersStocks.get(id), {
        Some: (supplierStock) => Result.Ok<SupplierItemStock, string>(supplierStock),
        None: () => Result.Err<SupplierItemStock, string>(`can't find supplier stock with id=${id}`)
    });
}

$update;
export function addSupplierItemStock(payload: SupplierItemStockPayload): Result<SupplierItemStock, string> {
    const supplierItemStock: SupplierItemStock = { "id": uuidv4(), "createdAt": ic.time(), "updatedAt": Opt.None, ...payload};
    suppliersStocks.insert(supplierItemStock.id, supplierItemStock);
    return Result.Ok<SupplierItemStock, string>(supplierItemStock);
}

$update;
export function updateItemId(id: string, newItemId: string): Result<SupplierItemStock, string> {
    return match(suppliersStocks.get(id), {
        Some: (stock) => {
            const updatedStock: SupplierItemStock = { ...stock, "itemId": newItemId, "updatedAt": Opt.Some(ic.time()) };
            suppliersStocks.insert(stock.id, updatedStock);
            Result.Ok<SupplierItemStock, string>(updatedStock);
        },
        None: () => Result.Err<SupplierItemStock, string>("can't update stock cause no itemStock with id=${id} found")
    });
}


$update;
export function addStockToSupplierItemStock(id: string, quant: bigint): Result<SupplierItemStock, string> {
    return match(suppliersStocks.get(id), {
        Some: (supplierStock) => {
            const updatedSupplierStock: SupplierItemStock = { ...supplierStock, "quantity": supplierStock.quantity + quant, "updatedAt": Opt.Some(ic.time()) };
            suppliersStocks.insert(supplierStock.id, updatedSupplierStock);
            Result.Ok<SupplierItemStock, string>(updatedSupplierStock);
        },
        None: () => Result.Err<SupplierItemStock, string>("can't update item stock cause no itemstock found with id=${id}")
    });
}

$update;
export function removeStockFromSupplierStorage(id: string, quantity: bigint): Result<SupplierItemStock, string> {
    return match(suppliersStocks.get(id), {
        Some: (supplierStock) => {
            if (supplierStock.quantity < quantity) {
                Result.Err<SupplierItemStock, string>("can't supply quantity of ${quantity} from itemStock id=${id} cause stock being only ${supplierStock.quantity}");
            } else {
                const updatedSupplierStock: SupplierItemStock = {...supplierStock, "updatedAt": Opt.Some(ic.time()), "quantity": supplierStock.quantity - quantity};
                suppliersStocks.insert(supplierStock.id, updatedSupplierStock);
                Result.Ok<SupplierItemStock, string>(updatedSupplierStock);
            }
        },
        None: () => Result.Err<SupplierItemStock, string>("can't supply due no itemStock with id=${id} found")
    });
}

$update;
export function deleteSupplierItemStock(id: string): Result<SupplierItemStock, string> {
    return match(suppliersStocks.remove(id), {
        Some: (supplierItemStock) => Result.Ok<SupplierItemStock, string>(supplierItemStock),
        None: () => Result.Err<SupplierItemStock, string>(`No item stock found with id=${id}`)
    });
}