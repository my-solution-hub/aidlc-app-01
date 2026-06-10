import request from "../request";
import type {
  PageResult,
  PointBalanceDTO,
  PointTransactionDTO,
  ListPointTransactionRequest,
} from "../../types/api";

const POINT_BASE = "/api/points";

export function getBalance(userId: number): Promise<PointBalanceDTO> {
  return request.get<PointBalanceDTO>(`${POINT_BASE}/balance`, {
    params: { userId },
  });
}

export function listTransactions(
  data: ListPointTransactionRequest,
): Promise<PageResult<PointTransactionDTO>> {
  return request.get<PageResult<PointTransactionDTO>>(
    `${POINT_BASE}/transactions`,
    { params: data },
  );
}
