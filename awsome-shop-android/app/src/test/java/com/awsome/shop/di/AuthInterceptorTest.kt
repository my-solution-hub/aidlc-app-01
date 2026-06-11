package com.awsome.shop.di

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.test.runTest
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

/**
 * AuthInterceptor 单元测试
 * 验证: Token 注入、PUBLIC 路径跳过
 */
class AuthInterceptorTest {

    @get:Rule
    val tmpFolder = TemporaryFolder()

    private lateinit var server: MockWebServer
    private lateinit var dataStore: DataStore<Preferences>
    private lateinit var interceptor: AuthInterceptor
    private lateinit var client: OkHttpClient

    @Before
    fun setUp() {
        server = MockWebServer()
        server.start()
        dataStore = PreferenceDataStoreFactory.create {
            tmpFolder.newFile("test.preferences_pb")
        }
        interceptor = AuthInterceptor(dataStore)
        client = OkHttpClient.Builder().addInterceptor(interceptor).build()
    }

    @After
    fun tearDown() {
        server.shutdown()
    }

    @Test
    fun `authenticated request includes Bearer token`() = runTest {
        dataStore.edit { it[stringPreferencesKey("auth_token")] = "my-jwt-token" }
        server.enqueue(MockResponse().setResponseCode(200))

        val request = Request.Builder()
            .url(server.url("/order/api/orders"))
            .get()
            .build()
        client.newCall(request).execute()

        val recorded = server.takeRequest()
        assertEquals("Bearer my-jwt-token", recorded.getHeader("Authorization"))
    }

    @Test
    fun `login POST skips token injection`() = runTest {
        dataStore.edit { it[stringPreferencesKey("auth_token")] = "should-not-appear" }
        server.enqueue(MockResponse().setResponseCode(200))

        val body = okhttp3.RequestBody.create(
            "application/json".toMediaType(), "{}"
        )
        val request = Request.Builder()
            .url(server.url("/auth/api/auth/login"))
            .post(body)
            .build()
        client.newCall(request).execute()

        val recorded = server.takeRequest()
        assertNull(recorded.getHeader("Authorization"))
    }

    @Test
    fun `public GET products skips token injection`() = runTest {
        dataStore.edit { it[stringPreferencesKey("auth_token")] = "token" }
        server.enqueue(MockResponse().setResponseCode(200))

        val request = Request.Builder()
            .url(server.url("/product/api/products?page=1"))
            .get()
            .build()
        client.newCall(request).execute()

        val recorded = server.takeRequest()
        assertNull(recorded.getHeader("Authorization"))
    }

    @Test
    fun `no token stored - no header added`() = runTest {
        server.enqueue(MockResponse().setResponseCode(200))

        val request = Request.Builder()
            .url(server.url("/order/api/orders"))
            .get()
            .build()
        client.newCall(request).execute()

        val recorded = server.takeRequest()
        assertNull(recorded.getHeader("Authorization"))
    }
}
