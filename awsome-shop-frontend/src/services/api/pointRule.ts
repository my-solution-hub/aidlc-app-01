import request from "../request";
import type {
  PageResult,
  PointRuleDTO,
  ListPointRuleRequest,
  CreatePointRuleRequest,
  UpdatePointRuleRequest,
} from "../../types/api";

const POINT_RULE_BASE = "/point/api/admin/point-rules";

export function listPointRules(
  data: ListPointRuleRequest,
): Promise<PageResult<PointRuleDTO>> {
  return request.get<PageResult<PointRuleDTO>>(POINT_RULE_BASE, {
    params: data,
  });
}

export function createPointRule(
  data: CreatePointRuleRequest,
): Promise<PointRuleDTO> {
  return request.post<PointRuleDTO>(POINT_RULE_BASE, data);
}

export function updatePointRule(
  data: UpdatePointRuleRequest,
): Promise<PointRuleDTO> {
  const { id, ...body } = data;
  return request.put<PointRuleDTO>(`${POINT_RULE_BASE}/${id}`, body);
}

export function updatePointRuleStatus(
  id: number,
  status: number,
): Promise<PointRuleDTO> {
  return request.patch<PointRuleDTO>(`${POINT_RULE_BASE}/${id}/status`, {
    status,
  });
}
