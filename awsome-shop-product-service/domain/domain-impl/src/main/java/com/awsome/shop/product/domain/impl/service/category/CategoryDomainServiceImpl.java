package com.awsome.shop.product.domain.impl.service.category;

import com.awsome.shop.product.common.enums.SampleErrorCode;
import com.awsome.shop.product.common.exception.BusinessException;
import com.awsome.shop.product.domain.model.category.CategoryEntity;
import com.awsome.shop.product.domain.service.category.CategoryDomainService;
import com.awsome.shop.product.repository.category.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Category 领域服务实现
 */
@Service
@RequiredArgsConstructor
public class CategoryDomainServiceImpl implements CategoryDomainService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<CategoryEntity> list(String name, Integer status) {
        return categoryRepository.listAll(name, status);
    }

    @Override
    public CategoryEntity getById(Long id) {
        CategoryEntity entity = categoryRepository.getById(id);
        if (entity == null) {
            throw new BusinessException(SampleErrorCode.RESOURCE_NOT_FOUND);
        }
        return entity;
    }

    @Override
    @Transactional
    public CategoryEntity create(String name, Long parentId, String icon,
                                 Integer sortOrder, Integer status, String description) {
        CategoryEntity entity = new CategoryEntity();
        entity.setName(name);
        entity.setParentId(parentId);
        entity.setIcon(icon);
        entity.setSortOrder(sortOrder != null ? sortOrder : 0);
        entity.setStatus(status != null ? status : 0);
        entity.setDescription(description);
        categoryRepository.save(entity);
        return categoryRepository.getById(entity.getId());
    }

    @Override
    @Transactional
    public CategoryEntity update(Long id, String name, Long parentId, String icon,
                                 Integer sortOrder, Integer status, String description) {
        CategoryEntity entity = getById(id);
        entity.updateInfo(name, parentId, icon, sortOrder, status, description);
        categoryRepository.update(entity);
        return categoryRepository.getById(id);
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        getById(id);
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    public CategoryEntity updateStatus(Long id, Integer status) {
        CategoryEntity entity = getById(id);
        entity.setStatus(status);
        categoryRepository.update(entity);
        return categoryRepository.getById(id);
    }
}
