package com.awsome.shop.product.application.impl.service.product;

import com.awsome.shop.product.application.api.dto.product.ProductDTO;
import com.awsome.shop.product.application.api.dto.product.request.CreateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.ListProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.UpdateProductRequest;
import com.awsome.shop.product.application.api.dto.product.request.UpdateProductStatusRequest;
import com.awsome.shop.product.application.api.service.product.ProductApplicationService;
import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.domain.model.product.ProductEntity;
import com.awsome.shop.product.domain.service.product.ProductDomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Product 应用服务实现
 *
 * <p>只依赖 Domain Service，不直接依赖 Repository</p>
 */
@Service
@RequiredArgsConstructor
public class ProductApplicationServiceImpl implements ProductApplicationService {

    private final ProductDomainService productDomainService;

    @Override
    public PageResult<ProductDTO> list(ListProductRequest request) {
        PageResult<ProductEntity> page = productDomainService.page(
                request.getPage(), request.getSize(), request.getName(), request.getCategory());
        return page.convert(this::toDTO);
    }

    @Override
    public ProductDTO get(Long id) {
        return toDTO(productDomainService.getById(id));
    }

    @Override
    public ProductDTO deductStock(Long productId, int quantity) {
        return toDTO(productDomainService.deductStock(productId, quantity));
    }

    @Override
    public ProductDTO restoreStock(Long productId, int quantity) {
        return toDTO(productDomainService.restoreStock(productId, quantity));
    }

    @Override
    public ProductDTO adminAdjustStock(Long productId, String changeType, int quantity, String reason) {
        return toDTO(productDomainService.adminAdjustStock(productId, changeType, quantity, reason));
    }

    @Override
    public ProductDTO create(CreateProductRequest request) {
        ProductEntity entity = productDomainService.create(
                request.getName(), request.getSku(), request.getCategory(), request.getBrand(),
                request.getPointsPrice(), request.getMarketPrice(), request.getStock(),
                request.getStatus(), request.getDescription(), request.getImageUrl(),
                request.getSubtitle(), request.getDeliveryMethod(), request.getServiceGuarantee(),
                request.getPromotion(), request.getColors(), request.getSpecs(), request.getImages());
        return toDTO(entity);
    }

    @Override
    public ProductDTO update(UpdateProductRequest request) {
        ProductEntity entity = productDomainService.update(
                request.getId(), request.getName(), request.getSku(), request.getCategory(), request.getBrand(),
                request.getPointsPrice(), request.getMarketPrice(), request.getStock(),
                request.getStatus(), request.getDescription(), request.getImageUrl(),
                request.getSubtitle(), request.getDeliveryMethod(), request.getServiceGuarantee(),
                request.getPromotion(), request.getColors(), request.getSpecs(), request.getImages());
        return toDTO(entity);
    }

    @Override
    public void delete(Long id) {
        productDomainService.deleteById(id);
    }

    @Override
    public ProductDTO updateStatus(UpdateProductStatusRequest request) {
        return toDTO(productDomainService.updateStatus(request.getId(), request.getStatus()));
    }

    private ProductDTO toDTO(ProductEntity entity) {
        ProductDTO dto = new ProductDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setSku(entity.getSku());
        dto.setCategory(entity.getCategory());
        dto.setBrand(entity.getBrand());
        dto.setPointsPrice(entity.getPointsPrice());
        dto.setMarketPrice(entity.getMarketPrice());
        dto.setStock(entity.getStock());
        dto.setSoldCount(entity.getSoldCount());
        dto.setStatus(entity.getStatus());
        dto.setDescription(entity.getDescription());
        dto.setImageUrl(entity.getImageUrl());
        dto.setSubtitle(entity.getSubtitle());
        dto.setDeliveryMethod(entity.getDeliveryMethod());
        dto.setServiceGuarantee(entity.getServiceGuarantee());
        dto.setPromotion(entity.getPromotion());
        dto.setColors(entity.getColors());
        dto.setSpecs(entity.getSpecs());
        dto.setImages(entity.getImages());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Override
    public com.awsome.shop.product.application.api.dto.product.ProductStatsDTO stats() {
        long[] s = productDomainService.countStats();
        com.awsome.shop.product.application.api.dto.product.ProductStatsDTO dto = new com.awsome.shop.product.application.api.dto.product.ProductStatsDTO();
        dto.setTotalProducts(s[0]);
        dto.setOnSaleProducts(s[1]);
        return dto;
    }
}
