package com.awsome.shop.ui.screens.product

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.awsome.shop.data.model.Product
import com.awsome.shop.data.repository.ShopRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProductDetailUiState(
    val isLoading: Boolean = true,
    val product: Product? = null,
    val error: String? = null,
)

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val shopRepository: ShopRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProductDetailUiState())
    val uiState: StateFlow<ProductDetailUiState> = _uiState.asStateFlow()

    private var loadedId: String? = null

    fun load(productId: String) {
        if (loadedId == productId) return
        loadedId = productId
        _uiState.value = ProductDetailUiState(isLoading = true)
        viewModelScope.launch {
            shopRepository.getProductDetail(productId).fold(
                onSuccess = { product ->
                    _uiState.value = ProductDetailUiState(isLoading = false, product = product)
                },
                onFailure = { e ->
                    _uiState.value = ProductDetailUiState(
                        isLoading = false,
                        error = e.message ?: "加载商品详情失败",
                    )
                },
            )
        }
    }
}
