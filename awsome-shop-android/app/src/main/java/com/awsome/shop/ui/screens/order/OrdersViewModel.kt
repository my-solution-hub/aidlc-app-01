package com.awsome.shop.ui.screens.order

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.awsome.shop.data.model.Order
import com.awsome.shop.data.repository.AuthRepository
import com.awsome.shop.data.repository.ShopRepository
import com.awsome.shop.data.repository.ensureUserId
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrdersUiState(
    val isLoading: Boolean = true,
    val orders: List<Order> = emptyList(),
    val error: String? = null,
    val keyword: String = "",
)

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val shopRepository: ShopRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrdersUiState())
    val uiState: StateFlow<OrdersUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun onKeywordChange(value: String) {
        _uiState.value = _uiState.value.copy(keyword = value)
    }

    fun search() {
        load(_uiState.value.keyword.ifBlank { null })
    }

    fun load(keyword: String? = null) {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            shopRepository.ensureUserId(authRepository)
            shopRepository.getOrders(keyword = keyword).fold(
                onSuccess = { list ->
                    _uiState.value = _uiState.value.copy(isLoading = false, orders = list)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = e.message ?: "加载订单失败",
                    )
                },
            )
        }
    }
}
