export interface FirestoreAddressPool {
  address: string;
  used: boolean;
}

export interface FirestoreAccount {
  address: string;
}

export interface AddressPool {
  id: string;
  address: string;
  used: boolean;
}

export interface Account {
  // id = userId
  id: string;
  address: string;
}
