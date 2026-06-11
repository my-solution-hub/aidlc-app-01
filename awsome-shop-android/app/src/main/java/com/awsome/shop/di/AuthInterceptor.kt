package com.awsome.shop.di

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

/**
 * OkHttp 拦截器 — 为需要认证的请求自动注入 Authorization: Bearer {token}
 *
 * PUBLIC 路径（login/register/products GET/categories/files）不注入。
 */
@Singleton
class AuthInterceptor @Inject constructor(
    private val dataStore: DataStore<Preferences>,
) : Interceptor {

    private val tokenKey = stringPreferencesKey("auth_token")

    private val publicPaths = listOf(
        "/api/auth/login",
        "/api/auth/register",
        "/api/products",
        "/api/categories",
        "/api/files/",
    )

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val path = request.url.encodedPath

        // PUBLIC 路径不需要 token
        if (publicPaths.any { path.contains(it) } && request.method == "GET") {
            return chain.proceed(request)
        }
        // login/register 是 POST 但也是 public
        if (path.contains("/api/auth/login") || path.contains("/api/auth/register")) {
            return chain.proceed(request)
        }

        // 从 DataStore 读取 token（同步阻塞，拦截器在 IO 线程执行）
        val token = runBlocking {
            dataStore.data.map { it[tokenKey] }.first()
        }

        if (token.isNullOrBlank()) {
            return chain.proceed(request)
        }

        val authenticatedRequest = request.newBuilder()
            .addHeader("Authorization", "Bearer $token")
            .build()

        return chain.proceed(authenticatedRequest)
    }
}
