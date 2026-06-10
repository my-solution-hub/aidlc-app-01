import request from "../request";
import type {
  PageResult,
  PointRuleDTO,
  ListPointRuleRequest,
  CreatePointRuleRequest,
  UpdatePointRuleRequest,
} from "../../types/api";

const POINT_RULE_BASE = "/point/api/v1/admin/point-rule";

export function listPointRules(
  data: ListPointRuleRequest,
): Promise<PageResult<PointRuleDTO>> {
  return request.post<PageResult<PointRuleDTO>>(
    `${POINT_RULE_BASE}/list`,
    data,
  );
}

export function createPointRule(
  data: CreatePointRuleRequest,
): Promise<PointRuleDTO> {
  return request.post<PointRuleDTO>(`${POINT_RULE_BASE}/create`, data);
}

export function updatePointRule(
  data: UpdatePointRuleRequest,
): Promise<PointRuleDTO> {
  return request.post<PointRuleDTO>(`${POINT_RULE_BASE}/update`, data);
}

export function updatePointRuleStatus(
  id: number,
  status: number,
): Promise<PointRuleDTO> {
  return request.post<PointRuleDTO>(`${POINT_RULE_BASE}/update-status`, {
    id,
    status,
  });
}
