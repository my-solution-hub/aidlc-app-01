import request from '../request';
import type {
  PageResult,
  ExchangeRecordDTO,
  ExchangeRequest,
  ListOrderRequest,
} from '../../types/api';

const ORDER_BASE = '/order/api/v1/public/order';

export function redeemProduct(data: ExchangeRequest): Promise<ExchangeRecordDTO> {
  return request.post<ExchangeRecordDTO>(`${ORDER_BASE}/exchange`, data);
}

export function listMyOrders(
  data: ListOrderRequest,
): Promise<PageResult<ExchangeRecordDTO>> {
  return request.post<PageResult<ExchangeRecordDTO>>(`${ORDER_BASE}/list`, data);
}

export function getMyOrder(id: number): Promise<ExchangeRecordDTO> {
  return request.post<ExchangeRecordDTO>(`${ORDER_BASE}/get`, { id });
}
