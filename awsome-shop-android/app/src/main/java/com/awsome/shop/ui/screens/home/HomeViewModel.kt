package com.awsome.shop.ui.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.awsome.shop.data.model.Product
import com.awsome.shop.data.repository.AuthRepository
import com.awsome.shop.data.repository.ShopRepository
import com.awsome.shop.data.repository.ensureUserId
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = false,
    val products: List<Product> = emptyList(),
    val points: Int = 0,
    val selectedCategoryIndex: Int = 0,
    val error: String? = null,
    // 搜索：是否展开搜索框 + 关键词（对已加载商品做实时过滤）
    val searchActive: Boolean = false,
    val searchQuery: String = "",
    // 通知：基于真实积分数据生成的提示文案，null 表示不展示
    val notice: String? = null,
) {
    /** 经搜索关键词过滤后的商品列表（按名称） */
    val visibleProducts: List<Product>
        get() = if (searchQuery.isBlank()) products
        else products.filter { it.name.contains(searchQuery, ignoreCase = true) }
}

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val shopRepository: ShopRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    // 首项为"全部"（category = null），其余对应后端分类名。
    val categories: List<String> = listOf("全部", "数码电子", "生活日用", "办公文具")

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        load(0)
        loadPoints()
    }

    fun onCategorySelected(index: Int) {
        if (index == _uiState.value.selectedCategoryIndex) return
        _uiState.value = _uiState.value.copy(selectedCategoryIndex = index)
        load(index)
    }

    /** 搜索按钮：展开/收起搜索框；收起时清空关键词 */
    fun toggleSearch() {
        val active = !_uiState.value.searchActive
        _uiState.value = _uiState.value.copy(
            searchActive = active,
            searchQuery = if (active) _uiState.value.searchQuery else "",
        )
    }

    fun onSearchQueryChange(q: String) {
        _uiState.value = _uiState.value.copy(searchQuery = q)
    }

    /** 通知按钮：基于真实积分余额 + 商品数生成提示，再次点击关闭 */
    fun onNotificationsClick() {
        if (_uiState.value.notice != null) {
            _uiState.value = _uiState.value.copy(notice = null)
            return
        }
        val s = _uiState.value
        _uiState.value = s.copy(
            notice = "您当前有 ${"%,d".format(s.points)} 积分，${s.products.size} 件商品可兑换",
        )
    }

    fun dismissNotice() {
        _uiState.value = _uiState.value.copy(notice = null)
    }

    private fun load(categoryIndex: Int) {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            shopRepository.ensureUserId(authRepository)
            val category = if (categoryIndex == 0) null else categories[categoryIndex]
            shopRepository.getProducts(category).fold(
                onSuccess = { list ->
                    _uiState.value = _uiState.value.copy(isLoading = false, products = list)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = e.message ?: "加载商品失败",
                    )
                },
            )
        }
    }

    private fun loadPoints() {
        viewModelScope.launch {
            shopRepository.ensureUserId(authRepository)
            shopRepository.getProfile().onSuccess { user ->
                _uiState.value = _uiState.value.copy(points = user.availablePoints)
            }
        }
    }
}
