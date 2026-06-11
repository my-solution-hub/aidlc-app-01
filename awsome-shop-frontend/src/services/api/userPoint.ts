import request from "../request";
import type {
  PageResult,
  UserPointDTO,
  ListUserPointRequest,
  AdjustPointsRequest,
  PointBalanceDTO,
  DistributionConfigDTO,
  UpdateDistributionConfigRequest,
  PointGrantStatsDTO,
} from "../../types/api";

const ADMIN_POINTS_BASE = "/api/admin/points";

/** Paginated list of users with their aggregated point figures. */
export function listUserPoints(
  data: ListUserPointRequest,
): Promise<PageResult<UserPointDTO>> {
  return request.get<PageResult<UserPointDTO>>(`${ADMIN_POINTS_BASE}/users`, {
    params: data,
  });
}

/** Manually add (amount > 0) or deduct (amount < 0) a user's points. */
export function adjustUserPoints(
  data: AdjustPointsRequest,
): Promise<PointBalanceDTO> {
  return request.post<PointBalanceDTO>(`${ADMIN_POINTS_BASE}/adjust`, data);
}

/** Fetch the scheduled point distribution configuration. */
export function getDistributionConfig(): Promise<DistributionConfigDTO> {
  return request.get<DistributionConfigDTO>(`${ADMIN_POINTS_BASE}/config`);
}

/** Update the scheduled point distribution configuration. */
export function updateDistributionConfig(
  data: UpdateDistributionConfigRequest,
): Promise<DistributionConfigDTO> {
  return request.put<DistributionConfigDTO>(`${ADMIN_POINTS_BASE}/config`, data);
}

/** Monthly grant statistics for the given month (YYYY-MM). */
export function getPointGrantStats(month: string): Promise<PointGrantStatsDTO> {
  return request.get<PointGrantStatsDTO>(`${ADMIN_POINTS_BASE}/config/stats`, {
    params: { month },
  });
}
