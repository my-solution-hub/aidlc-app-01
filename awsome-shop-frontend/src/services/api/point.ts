import request from '../request';
import type {
  PageResult,
  PointBalanceDTO,
  PointTransactionDTO,
  ListPointTransactionRequest,
} from '../../types/api';

const POINT_BASE = '/point/api/v1/public/point';

export function getBalance(userId: number): Promise<PointBalanceDTO> {
  return request.post<PointBalanceDTO>(`${POINT_BASE}/balance`, { userId });
}

export function listTransactions(
  data: ListPointTransactionRequest,
): Promise<PageResult<PointTransactionDTO>> {
  return request.post<PageResult<PointTransactionDTO>>(
    `${POINT_BASE}/transaction/list`,
    data,
  );
}
