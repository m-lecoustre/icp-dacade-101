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

# cezarion of 2  suppiers