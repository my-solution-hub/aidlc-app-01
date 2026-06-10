package com.awsome.shop.point.application.api.service.pointrule;

import com.awsome.shop.point.application.api.dto.pointrule.PointRuleDTO;
import com.awsome.shop.point.application.api.dto.pointrule.request.CreatePointRuleRequest;
import com.awsome.shop.point.application.api.dto.pointrule.request.ListPointRuleRequest;
import com.awsome.shop.point.application.api.dto.pointrule.request.UpdatePointRuleRequest;
import com.awsome.shop.point.application.api.dto.pointrule.request.UpdatePointRuleStatusRequest;
import com.awsome.shop.point.common.dto.PageResult;

/**
 * 积分规则应用服务接口
 */
public interface PointRuleApplicationService {

    PageResult<PointRuleDTO> list(ListPointRuleRequest request);

    PointRuleDTO create(CreatePointRuleRequest request);

    PointRuleDTO update(UpdatePointRuleRequest request);

    PointRuleDTO updateStatus(UpdatePointRuleStatusRequest request);
}
