package com.awsome.shop.ui.screens.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.awsome.shop.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class RegisterUiState(
    val username: String = "",
    val password: String = "",
    val nickname: String = "",
    val employeeId: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val registerSuccess: Boolean = false,
)

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(RegisterUiState())
    val uiState: StateFlow<RegisterUiState> = _uiState.asStateFlow()

    fun onUsernameChange(value: String) { _uiState.value = _uiState.value.copy(username = value, error = null) }
    fun onPasswordChange(value: String) { _uiState.value = _uiState.value.copy(password = value, error = null) }
    fun onNicknameChange(value: String) { _uiState.value = _uiState.value.copy(nickname = value, error = null) }
    fun onEmployeeIdChange(value: String) { _uiState.value = _uiState.value.copy(employeeId = value, error = null) }

    fun register() {
        val state = _uiState.value
        if (state.isLoading) return
        if (state.username.isBlank() || state.password.isBlank()) {
            _uiState.value = state.copy(error = "请填写用户名和密码")
            return
        }
        if (state.password.length < 8) {
            _uiState.value = state.copy(error = "密码长度至少8位")
            return
        }
        _uiState.value = state.copy(isLoading = true, error = null)
        viewModelScope.launch {
            val result = authRepository.register(
                username = state.username,
                password = state.password,
                nickname = state.nickname.ifBlank { null },
                employeeId = state.employeeId.ifBlank { null },
            )
            result.fold(
                onSuccess = {
                    _uiState.value = _uiState.value.copy(isLoading = false, registerSuccess = true)
                },
                onFailure = { e ->
                    _uiState.value = _uiState.value.copy(isLoading = false, error = e.message ?: "注册失败")
                },
            )
        }
    }
}
