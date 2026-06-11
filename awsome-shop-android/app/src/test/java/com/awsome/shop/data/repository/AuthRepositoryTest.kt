package com.awsome.shop.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import com.awsome.shop.data.remote.*
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder

/**
 * AuthRepository 单元测试
 * 验证: 登录/注册流程、Token 持久化、登出清除
 */
class AuthRepositoryTest {

    @get:Rule
    val tmpFolder = TemporaryFolder()

    private lateinit var apiService: ApiService
    private lateinit var dataStore: DataStore<Preferences>
    private lateinit var repository: AuthRepository

    @Before
    fun setUp() {
        apiService = mockk()
        dataStore = PreferenceDataStoreFactory.create {
            tmpFolder.newFile("test_prefs.preferences_pb")
        }
        repository = AuthRepository(apiService, dataStore)
    }

    @Test
    fun `login success - stores token and userId`() = runTest {
        coEvery { apiService.login(any()) } returns ApiResult(
            code = "SUCCESS",
            data = LoginResponseDto(token = "jwt-token-123", userId = 42, username = "testuser", role = "EMPLOYEE"),
        )

        val result = repository.login("testuser", "password")

        assertTrue(result.isSuccess)
        assertTrue(repository.isLoggedIn.first())
        assertEquals(42L, repository.userId.first())
    }

    @Test
    fun `login failure - returns error and does not store token`() = runTest {
        coEvery { apiService.login(any()) } returns ApiResult(
            code = "AUTH_001",
            message = "用户名或密码错误",
        )

        val result = repository.login("wrong", "pass")

        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()!!.message!!.contains("用户名或密码错误"))
        assertFalse(repository.isLoggedIn.first())
    }

    @Test
    fun `register success`() = runTest {
        coEvery { apiService.register(any()) } returns ApiResult(
            code = "SUCCESS",
            data = UserDto(id = 1, username = "newuser", role = "EMPLOYEE"),
        )

        val result = repository.register("newuser", "Pass1234!", "测试", "EMP001")
        assertTrue(result.isSuccess)
    }

    @Test
    fun `register duplicate username - returns error`() = runTest {
        coEvery { apiService.register(any()) } returns ApiResult(
            code = "CONFLICT_001",
            message = "用户名已存在",
        )

        val result = repository.register("existing", "Pass1234!", null, null)
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()!!.message!!.contains("用户名已存在"))
    }

    @Test
    fun `logout clears token`() = runTest {
        // First login
        coEvery { apiService.login(any()) } returns ApiResult(
            code = "SUCCESS",
            data = LoginResponseDto(token = "token", userId = 1, username = "u", role = "EMPLOYEE"),
        )
        repository.login("u", "p")
        assertTrue(repository.isLoggedIn.first())

        // Logout
        repository.logout()
        assertFalse(repository.isLoggedIn.first())
    }
}
