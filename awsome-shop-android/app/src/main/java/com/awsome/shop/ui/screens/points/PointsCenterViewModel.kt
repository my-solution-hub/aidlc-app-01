package com.awsome.shop.ui.screens.points

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.awsome.shop.data.model.User
import com.awsome.shop.data.repository.AuthRepository
import com.awsome.shop.data.repository.ShopRepository
import com.awsome.shop.data.repository.ensureUserId
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PointsCenterUiState(
    val isLoading: Boolean = true,
    val user: User? = null,
    val error: String? = null,
)

@HiltViewModel
class PointsCenterViewModel @Inject constructor(
    private val shopRepository: ShopRepository,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PointsCenterUiState())
    val uiState: StateFlow<PointsCenterUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.value = _uiState.value.copy(isLoading = true, error = null)
        viewModelScope.launch {
            shopRepository.ensureUserId(authRepository)
            shopRepository.getProfile().fold(
                onSuccess = { user ->
                    _uiState.value = PointsCenterUiState(isLoading = false, user = user)
                },
                onFailure = { e ->
                    _uiState.value = PointsCenterUiState(
                        isLoading = false,
                        error = e.message ?: "加载积分信息失败",
                    )
                },
            )
        }
    }
}
