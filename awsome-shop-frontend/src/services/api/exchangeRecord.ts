import request from "../request";
import type {
  PageResult,
  ExchangeRecordDTO,
  ExchangeRecordStatsDTO,
  ListExchangeRecordRequest,
  UpdateExchangeRecordStatusRequest,
} from "../../types/api";

const BASE = "/api/admin/orders";

export function listExchangeRecords(
  data: ListExchangeRecordRequest,
): Promise<PageResult<ExchangeRecordDTO>> {
  return request.get<PageResult<ExchangeRecordDTO>>(BASE, { params: data });
}

export function getExchangeRecordStats(): Promise<ExchangeRecordStatsDTO> {
  return request.get<ExchangeRecordStatsDTO>(`${BASE}/stats`);
}

export function getExchangeRecord(id: number): Promise<ExchangeRecordDTO> {
  return request.get<ExchangeRecordDTO>(`${BASE}/${id}`);
}

export function updateExchangeRecordStatus(
  data: UpdateExchangeRecordStatusRequest,
): Promise<ExchangeRecordDTO> {
  const { id, ...body } = data;
  return request.put<ExchangeRecordDTO>(`${BASE}/${id}/status`, body);
}
