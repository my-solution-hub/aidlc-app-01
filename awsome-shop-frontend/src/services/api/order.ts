import request from "../request";
import type {
  PageResult,
  ExchangeRecordDTO,
  ExchangeRequest,
  ListOrderRequest,
} from "../../types/api";

const ORDER_BASE = "/api/orders";

export function redeemProduct(
  data: ExchangeRequest,
): Promise<ExchangeRecordDTO> {
  return request.post<ExchangeRecordDTO>(ORDER_BASE, data);
}

export function listMyOrders(
  data: ListOrderRequest,
): Promise<PageResult<ExchangeRecordDTO>> {
  return request.get<PageResult<ExchangeRecordDTO>>(ORDER_BASE, {
    params: data,
  });
}

export function getMyOrder(id: number): Promise<ExchangeRecordDTO> {
  return request.get<ExchangeRecordDTO>(`${ORDER_BASE}/${id}`);
}
