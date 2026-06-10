package com.awsome.shop.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.awsome.shop.data.remote.ApiService
import com.awsome.shop.data.remote.LoginRequest
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val dataStore: DataStore<Preferences>,
) {
    private val tokenKey = stringPreferencesKey("auth_token")
    private val userIdKey = stringPreferencesKey("auth_user_id")

    val isLoggedIn: Flow<Boolean> = dataStore.data.map { prefs ->
        prefs[tokenKey] != null
    }

    val userId: Flow<Long?> = dataStore.data.map { prefs ->
        prefs[userIdKey]?.toLongOrNull()
    }

    suspend fun login(username: String, password: String): Result<Unit> {
        return try {
            val result = apiService.login(LoginRequest(username, password))
            val data = result.data
            if (!result.isSuccess || data == null) {
                return Result.failure(IllegalStateException(result.message ?: "登录失败: ${result.code}"))
            }
            dataStore.edit { prefs ->
                prefs[tokenKey] = data.token
                prefs[userIdKey] = data.userId.toString()
            }
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout() {
        dataStore.edit { prefs ->
            prefs.remove(tokenKey)
        }
    }

    suspend fun getToken(): String? {
        var token: String? = null
        dataStore.data.collect { prefs ->
            token = prefs[tokenKey]
        }
        return token
    }
}
