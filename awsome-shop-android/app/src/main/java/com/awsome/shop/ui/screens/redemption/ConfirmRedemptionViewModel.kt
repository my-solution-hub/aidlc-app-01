package com.awsome.shop.ui.screens.redemption

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

data class ConfirmRedemptionUiState(
    val isLoading: Boolean = true,
    val product: Product? = null,
    val isSubmitting: Boolean = false,
    val createdOrderId: String? = null,
    val error: String? = null,
)

@HiltViewModel
class ConfirmRedemptionViewModel @Inject constructor(
    private val shopRepository: ShopRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ConfirmRedemptionUiState())
    val uiState: StateFlow<ConfirmRedemptionUiState> = _uiState.asStateFlow()

    private var loadedId: String? = null

    fun load(productId: String) {
        if (loadedId == productId) return
        loadedId = productId
        _uiState.value = ConfirmRedemptionUiState(isLoading = true)
        viewModelScope.launch {
            shopRepository.getProductDetail(productId).fold(
                onSuccess = { product ->
                    _uiState.value = _uiState.value.copy(isLoading = false, product = product)
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

    fun confirm(productId: String) {
        if (_uiState.value.isSubmitting) return
        _uiState.value = _uiState.value.copy(isSubmitting = true, error = null)
        viewModelScope.launch {
            shopRepository.ensureUserId(authRepository)
            // addressId 由后端按 userId + productId 处理，这里传占位值，保持仓库签名不变。
            shopRepository.createOrder(productId = productId, addressId = "0").fold(
                onSuccess = { order ->
                    _uiState.value = _uiState.value.copy(isSubmitting = false, createdOrderId = order.id)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        isSubmitting = false,
                        error = e.message ?: "兑换失败",
                    )
                },
            )
        }
    }
}
