package com.awsome.shop.product.domain.impl.service.product;

import com.awsome.shop.product.common.dto.PageResult;
import com.awsome.shop.product.common.enums.ProductErrorCode;
import com.awsome.shop.product.common.enums.SampleErrorCode;
import com.awsome.shop.product.common.exception.BusinessException;
import com.awsome.shop.product.domain.model.product.ProductEntity;
import com.awsome.shop.product.domain.service.product.ProductDomainService;
import com.awsome.shop.product.repository.product.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Product 领域服务实现
 */
@Service
@RequiredArgsConstructor
public class ProductDomainServiceImpl implements ProductDomainService {

    private final ProductRepository productRepository;

    @Override
    public ProductEntity getById(Long id) {
        ProductEntity entity = productRepository.getById(id);
        if (entity == null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_NOT_FOUND);
        }
        return entity;
    }

    @Override
    @Transactional
    public ProductEntity deductStock(Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BusinessException(ProductErrorCode.INVALID_QUANTITY);
        }
        ProductEntity entity = getById(productId);
        int current = entity.getStock() == null ? 0 : entity.getStock();
        if (current < quantity) {
            throw new BusinessException(ProductErrorCode.INSUFFICIENT_STOCK,
                    (Object[]) new Object[]{current, quantity});
        }
        entity.setStock(current - quantity);
        productRepository.update(entity);
        return productRepository.getById(productId);
    }

    @Override
    @Transactional
    public ProductEntity restoreStock(Long productId, int quantity) {
        if (quantity <= 0) {
            throw new BusinessException(ProductErrorCode.INVALID_QUANTITY);
        }
        ProductEntity entity = getById(productId);
        int current = entity.getStock() == null ? 0 : entity.getStock();
        entity.setStock(current + quantity);
        productRepository.update(entity);
        return productRepository.getById(productId);
    }

    @Override
    public PageResult<ProductEntity> page(int page, int size, String name, String category) {
        return productRepository.page(page, size, name, category);
    }

    @Override
    public ProductEntity create(String name, String sku, String category, String brand,
                                Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                                Integer status, String description, String imageUrl,
                                String subtitle, String deliveryMethod, String serviceGuarantee,
                                String promotion, String colors, List<Map<String, String>> specs) {
        // SKU 唯一性校验
        ProductEntity existing = productRepository.getBySku(sku);
        if (existing != null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_ALREADY_EXISTS, sku);
        }

        ProductEntity entity = new ProductEntity();
        entity.setName(name);
        entity.setSku(sku);
        entity.setCategory(category);
        entity.setBrand(brand);
        entity.setPointsPrice(pointsPrice);
        entity.setMarketPrice(marketPrice);
        entity.setStock(stock != null ? stock : 0);
        entity.setStatus(status != null ? status : 0);
        entity.setDescription(description);
        entity.setImageUrl(imageUrl);
        entity.setSubtitle(subtitle);
        entity.setDeliveryMethod(deliveryMethod);
        entity.setServiceGuarantee(serviceGuarantee);
        entity.setPromotion(promotion);
        entity.setColors(colors);
        entity.setSpecs(specs);

        productRepository.save(entity);
        return productRepository.getById(entity.getId());
    }

    @Override
    @Transactional
    public ProductEntity update(Long id, String name, String sku, String category, String brand,
                                Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                                Integer status, String description, String imageUrl,
                                String subtitle, String deliveryMethod, String serviceGuarantee,
                                String promotion, String colors, List<Map<String, String>> specs) {
        ProductEntity entity = getById(id);

        // SKU 唯一性校验（排除自身）
        ProductEntity existing = productRepository.getBySku(sku);
        if (existing != null && !existing.getId().equals(id)) {
            throw new BusinessException(SampleErrorCode.RESOURCE_ALREADY_EXISTS, sku);
        }

        entity.updateInfo(name, sku, category, brand, pointsPrice, marketPrice, stock,
                status, description, imageUrl, subtitle, deliveryMethod, serviceGuarantee,
                promotion, colors, specs);
        productRepository.update(entity);
        return productRepository.getById(id);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        getById(id);
        productRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ProductEntity updateStatus(Long id, Integer status) {
        ProductEntity entity = getById(id);
        entity.setStatus(status);
        productRepository.update(entity);
        return productRepository.getById(id);
    }

    @Override
    public Map<String, Long> countGroupByCategory() {
        return productRepository.countGroupByCategory();
    }
}
