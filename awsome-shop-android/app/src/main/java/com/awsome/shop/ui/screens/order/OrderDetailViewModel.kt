package com.awsome.shop.ui.screens.order

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.awsome.shop.data.model.Order
import com.awsome.shop.data.repository.ShopRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderDetailUiState(
    val isLoading: Boolean = true,
    val order: Order? = null,
    val error: String? = null,
)

@HiltViewModel
class OrderDetailViewModel @Inject constructor(
    private val shopRepository: ShopRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderDetailUiState())
    val uiState: StateFlow<OrderDetailUiState> = _uiState.asStateFlow()

    private var loadedId: String? = null

    fun load(orderId: String) {
        if (loadedId == orderId) return
        loadedId = orderId
        _uiState.value = OrderDetailUiState(isLoading = true)
        viewModelScope.launch {
            shopRepository.getOrderDetail(orderId).fold(
                onSuccess = { order ->
                    _uiState.value = OrderDetailUiState(isLoading = false, order = order)
                },
                onFailure = { e ->
                    _uiState.value = OrderDetailUiState(
                        isLoading = false,
                        error = e.message ?: "加载订单详情失败",
                    )
                },
            )
        }
    }
}
