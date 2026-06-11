import request from "../request";
import type {
  PageResult,
  UserPointDTO,
  ListUserPointRequest,
  AdminAdjustPointRequest,
  PointBalanceDTO,
  DistributionConfigDTO,
  UpdateDistributionConfigRequest,
  PointGrantStatsDTO,
} from "../../types/api";

const BASE = "/point/api/admin/points";

/** US-020: paginated employee points list (search by name/employee no). */
export function listUserPoints(
  data: ListUserPointRequest,
): Promise<PageResult<UserPointDTO>> {
  return request.get<PageResult<UserPointDTO>>(`${BASE}/users`, {
    params: data,
  });
}

/** US-021: manually adjust an employee's points (positive=add, negative=deduct). */
export function adjustUserPoints(
  data: AdminAdjustPointRequest,
): Promise<PointBalanceDTO> {
  return request.post<PointBalanceDTO>(`${BASE}/adjust`, data);
}

/** US-022: get the automatic distribution config. */
export function getDistributionConfig(): Promise<DistributionConfigDTO> {
  return request.get<DistributionConfigDTO>(`${BASE}/config`);
}

/** US-022: update the automatic distribution config. */
export function updateDistributionConfig(
  data: UpdateDistributionConfigRequest,
): Promise<DistributionConfigDTO> {
  return request.put<DistributionConfigDTO>(`${BASE}/config`, data);
}

/** US-022: distribution stats (granted total / covered employees) for a month. */
export function getPointGrantStats(
  month?: string,
): Promise<PointGrantStatsDTO> {
  return request.get<PointGrantStatsDTO>(`${BASE}/config/stats`, {
    params: month ? { month } : undefined,
  });
}
