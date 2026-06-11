import request from "../request";
import type { ProductDTO } from "../../types/api";

const BASE = "/product/api/wishlist";

/** C6: list the current user's wishlist products. */
export function listWishlist(userId: number): Promise<ProductDTO[]> {
  return request.get<ProductDTO[]>(BASE, { params: { userId } });
}

/** C6: add a product to the wishlist. */
export function addWishlist(userId: number, productId: number): Promise<void> {
  return request.post<void>(BASE, undefined, { params: { userId, productId } });
}

/** C6: remove a product from the wishlist. */
export function removeWishlist(
  userId: number,
  productId: number,
): Promise<void> {
  return request.delete<void>(BASE, { params: { userId, productId } });
}
