/!/bin/bash
# This script launch new instance of DFX to deploy all canister
#   from src folder.
# It also provides some objects through canister cakk (CRUD Model)

dfx stop;
dfx start --background --clean;

dfx deploy;

# creation of 2 items
dfx canister call addItem '(record {"title"= "first Item"; "description"= "This is first item registered here"; "illusatrationURL"= "" })';

dfx canister call addItem '(record {"title"= "other Item"; "description"= "This is second item registered here"; "illusatrationURL"= "src" })';

dfx canister call getItems '()';

# creation of 4 suppliers

dfx canister call suppliers addSupplier '(record: {"name"= "Supplier 1 })';

dfx canister call suppliers addSupplier '(record {"name" = "Toto" })';

dfx canister call suppliers addSupplier '(record {"name" = "Momo Supply" })';

dfx canister call suppliers addSupplier '(record {"name" = "Titi" })';

# Display all item & suppliers records

dfx canister call items getItems '()';
dfx canister call suppliers getSuppliers '()';
