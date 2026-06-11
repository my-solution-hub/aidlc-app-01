package com.awsome.shop.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.*

/**
 * Retrofit 接口 — 对齐 AWSomeShop RESTful API 规范 v1.2
 *
 * 网关统一前缀（baseUrl = http://host:8080/）：
 *   auth    → /auth/api/...
 *   product → /product/api/...
 *   point   → /point/api/...
 *   order   → /order/api/...
 *
 * 响应统一为 Result<T> 信封：{ code, message, data }。code == "SUCCESS" 为成功。
 * HTTP 方法：GET 查询 / POST 创建+动作 / PUT 更新 / DELETE 删除
 */
interface ApiService {

    // ==================== Auth ====================

    @POST("auth/api/auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResult<LoginResponseDto>

    @POST("auth/api/auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResult<UserDto>

    @POST("auth/api/auth/logout")
    suspend fun logout(): ApiResult<Unit>

    @GET("auth/api/users/me")
    suspend fun getCurrentUser(): ApiResult<UserDto>

    // ==================== Product ====================

    @GET("product/api/products")
    suspend fun listProducts(
        @Query("page") page: Int = 1,
        @Query("size") size: Int = 20,
        @Query("name") name: String? = null,
        @Query("category") category: String? = null,
    ): ApiResult<PageResultDto<ProductDto>>

    @GET("product/api/products/{id}")
    suspend fun getProduct(@Path("id") id: Long): ApiResult<ProductDto>

    @GET("product/api/categories/tree")
    suspend fun getCategoryTree(): ApiResult<List<CategoryDto>>

    // ==================== Points ====================

    @GET("point/api/points/balance")
    suspend fun getPointBalance(@Query("userId") userId: Long): ApiResult<PointBalanceDto>

    @GET("point/api/points/transactions")
    suspend fun listPointTransactions(
        @Query("userId") userId: Long,
        @Query("page") page: Int = 1,
        @Query("size") size: Int = 20,
        @Query("type") type: String? = null,
    ): ApiResult<PageResultDto<PointTransactionDto>>

    // ==================== Order (兑换) ====================

    @POST("order/api/orders")
    suspend fun createExchange(@Body request: CreateExchangeRequest): ApiResult<ExchangeRecordDto>

    @GET("order/api/orders")
    suspend fun listExchanges(
        @Query("userId") userId: Long,
        @Query("page") page: Int = 1,
        @Query("size") size: Int = 20,
        @Query("status") status: String? = null,
        @Query("keyword") keyword: String? = null,
    ): ApiResult<PageResultDto<ExchangeRecordDto>>

    @GET("order/api/orders/{id}")
    suspend fun getExchange(@Path("id") id: Long): ApiResult<ExchangeRecordDto>

    @POST("order/api/orders/{id}/confirm-receipt")
    suspend fun confirmReceipt(
        @Path("id") id: Long,
        @Query("userId") userId: Long,
    ): ApiResult<ExchangeRecordDto>
}

// ==================== 通用信封 ====================

@Serializable
data class ApiResult<T>(
    val code: String,
    val message: String? = null,
    val data: T? = null,
) {
    val isSuccess: Boolean get() = code == "SUCCESS"
}

@Serializable
data class PageResultDto<T>(
    val current: Long = 1,
    val size: Long = 20,
    val total: Long = 0,
    val pages: Long = 0,
    val records: List<T> = emptyList(),
)

// ==================== Auth DTOs ====================

@Serializable
data class LoginRequest(val username: String, val password: String)

@Serializable
data class RegisterRequest(
    val username: String,
    val password: String,
    val nickname: String? = null,
    val employeeId: String? = null,
)

@Serializable
data class LoginResponseDto(
    val token: String,
    val userId: Long,
    val username: String,
    val nickname: String? = null,
    val role: String,
)

@Serializable
data class UserDto(
    val id: Long = 0,
    val username: String = "",
    val nickname: String? = null,
    val employeeId: String? = null,
    val department: String? = null,
    val role: String = "EMPLOYEE",
    val status: String = "ACTIVE",
    val lastLoginAt: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)

// ==================== Product DTOs ====================

@Serializable
data class ProductDto(
    val id: Long,
    val name: String,
    val sku: String? = null,
    val category: String? = null,
    val brand: String? = null,
    val pointsPrice: Int = 0,
    val marketPrice: Double = 0.0,
    val stock: Int = 0,
    val soldCount: Int = 0,
    val status: Int = 1,
    val description: String? = null,
    val imageUrl: String? = null,
    val images: List<String> = emptyList(),
    val subtitle: String? = null,
    val deliveryMethod: String? = null,
    val serviceGuarantee: String? = null,
    val promotion: String? = null,
    val colors: kotlinx.serialization.json.JsonElement? = null,
    val specs: kotlinx.serialization.json.JsonElement? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)

@Serializable
data class CategoryDto(
    val id: Long,
    val name: String,
    val parentId: Long? = null,
    val icon: String? = null,
    val sortOrder: Int = 0,
    val status: Int = 1,
    val description: String? = null,
    val productCount: Int = 0,
    val children: List<CategoryDto> = emptyList(),
)

// ==================== Points DTOs ====================

@Serializable
data class PointBalanceDto(
    val userId: Long = 0,
    val balance: Int = 0,
    val totalEarned: Int = 0,
    val totalUsed: Int = 0,
)

@Serializable
data class PointTransactionDto(
    val id: Long,
    val userId: Long = 0,
    val type: String,
    val amount: Int = 0,
    val balance: Int = 0,
    val description: String? = null,
    val operator: String? = null,
    val createdAt: String? = null,
)

// ==================== Order DTOs ====================

@Serializable
data class CreateExchangeRequest(
    val productId: Long,
    val quantity: Int = 1,
    val userId: Long,
    val employeeName: String? = null,
    val addressId: Long? = null,
    val idempotencyKey: String? = null,
)

@Serializable
data class ExchangeRecordDto(
    val id: Long,
    val orderNo: String? = null,
    val productId: Long = 0,
    val productName: String? = null,
    val productDesc: String? = null,
    val productImageUrl: String? = null,
    val userId: Long = 0,
    val employeeName: String? = null,
    val quantity: Int = 1,
    val pointsCost: Int = 0,
    val freightPoints: Int = 0,
    val balanceAfter: Int? = null,
    val status: String = "PENDING_DELIVERY",
    val carrier: String? = null,
    val trackingNumber: String? = null,
    val receiver: String? = null,
    val receiverPhone: String? = null,
    val receiverAddress: String? = null,
    val exchangeTime: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)
