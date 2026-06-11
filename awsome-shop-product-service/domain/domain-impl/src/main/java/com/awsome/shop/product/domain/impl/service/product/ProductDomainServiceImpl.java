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
        // BR-PROD-007: 悲观锁（SELECT ... FOR UPDATE）在同一事务中锁定行，串行化并发扣减
        ProductEntity entity = productRepository.getByIdForUpdate(productId);
        if (entity == null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_NOT_FOUND);
        }
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
                                String promotion, String colors, List<Map<String, String>> specs, List<String> images) {
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
        entity.setImages(images);

        productRepository.save(entity);
        return productRepository.getById(entity.getId());
    }

    @Override
    @Transactional
    public ProductEntity update(Long id, String name, String sku, String category, String brand,
                                Integer pointsPrice, BigDecimal marketPrice, Integer stock,
                                Integer status, String description, String imageUrl,
                                String subtitle, String deliveryMethod, String serviceGuarantee,
                                String promotion, String colors, List<Map<String, String>> specs, List<String> images) {
        ProductEntity entity = getById(id);

        // SKU 唯一性校验（排除自身）
        ProductEntity existing = productRepository.getBySku(sku);
        if (existing != null && !existing.getId().equals(id)) {
            throw new BusinessException(SampleErrorCode.RESOURCE_ALREADY_EXISTS, sku);
        }

        entity.updateInfo(name, sku, category, brand, pointsPrice, marketPrice, stock,
                status, description, imageUrl, subtitle, deliveryMethod, serviceGuarantee,
                promotion, colors, specs, images);
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

    @Override
    public long[] countStats() {
        return productRepository.countStats();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public ProductEntity adminAdjustStock(Long productId, String changeType, int quantity, String reason) {
        ProductEntity p = productRepository.getByIdForUpdate(productId);
        if (p == null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_NOT_FOUND);
        }
        int before = p.getStock() == null ? 0 : p.getStock();
        int after = "IN".equalsIgnoreCase(changeType) ? before + quantity : before - quantity;
        if (after < 0) {
            throw new BusinessException(ProductErrorCode.INSUFFICIENT_STOCK, String.valueOf(before));
        }
        p.setStock(after);
        productRepository.update(p);
        productRepository.addStockLog(productId, changeType.toUpperCase(), quantity, before, after, reason);
        return p;
    }
}
