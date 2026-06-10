package com.awsome.shop.ui.screens.points

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.awsome.shop.data.model.PointsTransaction
import com.awsome.shop.data.repository.AuthRepository
import com.awsome.shop.data.repository.ShopRepository
import com.awsome.shop.data.repository.ensureUserId
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PointsHistoryUiState(
    val isLoading: Boolean = true,
    val transactions: List<PointsTransaction> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class PointsHistoryViewModel @Inject constructor(
    private val shopRepository: ShopRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PointsHistoryUiState())
    val uiState: StateFlow<PointsHistoryUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            shopRepository.ensureUserId(authRepository)
            shopRepository.getPointsTransactions().fold(
                onSuccess = { list ->
                    _uiState.value = PointsHistoryUiState(isLoading = false, transactions = list)
                },
                onFailure = { e ->
                    _uiState.value = PointsHistoryUiState(
                        isLoading = false,
                        error = e.message ?: "加载积分明细失败",
                    )
                },
            )
        }
    }
}
