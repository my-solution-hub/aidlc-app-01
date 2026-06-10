import request from "../request";
import type {
  PageResult,
  ExchangeRecordDTO,
  ExchangeRecordStatsDTO,
  ListExchangeRecordRequest,
  UpdateExchangeRecordStatusRequest,
} from "../../types/api";

const BASE = "/order/api/v1/admin/exchange-record";

export function listExchangeRecords(
  data: ListExchangeRecordRequest,
): Promise<PageResult<ExchangeRecordDTO>> {
  return request.post<PageResult<ExchangeRecordDTO>>(`${BASE}/list`, data);
}

export function getExchangeRecordStats(): Promise<ExchangeRecordStatsDTO> {
  return request.post<ExchangeRecordStatsDTO>(`${BASE}/stats`);
}

export function getExchangeRecord(id: number): Promise<ExchangeRecordDTO> {
  return request.post<ExchangeRecordDTO>(`${BASE}/get`, { id });
}

export function updateExchangeRecordStatus(
  data: UpdateExchangeRecordStatusRequest,
): Promise<ExchangeRecordDTO> {
  return request.post<ExchangeRecordDTO>(`${BASE}/update-status`, data);
}
