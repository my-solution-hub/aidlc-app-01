import request from "../request";
import type { AddressDTO, SaveAddressRequest } from "../../types/api";

const BASE = "/order/api/addresses";

/** C1: list the current user's saved shipping addresses (default first). */
export function listAddresses(userId: number): Promise<AddressDTO[]> {
  return request.get<AddressDTO[]>(BASE, { params: { userId } });
}

/** C1: create a new shipping address. */
export function createAddress(data: SaveAddressRequest): Promise<AddressDTO> {
  return request.post<AddressDTO>(BASE, data);
}

/** C1: update an existing shipping address. */
export function updateAddress(
  id: number,
  data: SaveAddressRequest,
): Promise<AddressDTO> {
  return request.put<AddressDTO>(`${BASE}/${id}`, data);
}

/** C1: delete a shipping address. */
export function deleteAddress(id: number): Promise<void> {
  return request.delete<void>(`${BASE}/${id}`);
}
