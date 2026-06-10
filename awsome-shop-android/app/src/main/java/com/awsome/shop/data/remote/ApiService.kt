package com.awsome.shop.data.remote

import kotlinx.serialization.Serializable
import retrofit2.http.Body
import retrofit2.http.POST

/**
 * Retrofit 接口 —— 对齐 AWSomeShop 真实网关契约。
 *
 * 网关统一前缀（baseUrl 已含 host:8080）：
 *   auth   → /auth/api/v1/...
 *   product→ /product/api/v1/...
 *   point  → /point/api/v1/...
 *   order  → /order/api/v1/...
 *
 * 所有响应统一为 Result<T> 信封：{ code, message, data }。code == "SUCCESS" 为成功。
 * 全部为 POST + JSON Body（与 Web 前端、后端 Controller 完全一致）。
 */
interface ApiService {

    // ---- Auth ----
    @POST("auth/api/v1/public/auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResult<LoginResponseDto>

    @POST("auth/api/v1/public/auth/logout")
    suspend fun logout(): ApiResult<Unit>

    // ---- Product ----
    @POST("product/api/v1/public/product/list")
    suspend fun listProducts(@Body request: ListProductRequest): ApiResult<PageResultDto<ProductDto>>

    @POST("product/api/v1/public/product/get")
    suspend fun getProduct(@Body request: IdRequest): ApiResult<ProductDto>

    @POST("product/api/v1/public/category/list")
    suspend fun listCategories(@Body request: ListCategoryRequest): ApiResult<List<CategoryDto>>

    // ---- Point ----
    @POST("point/api/v1/public/point/balance")
    suspend fun getPointBalance(@Body request: UserIdRequest): ApiResult<PointBalanceDto>

    @POST("point/api/v1/public/point/transaction/list")
    suspend fun listPointTransactions(@Body request: ListPointTransactionRequest): ApiResult<PageResultDto<PointTransactionDto>>

    // ---- Order (兑换) ----
    @POST("order/api/v1/public/order/exchange")
    suspend fun createExchange(@Body request: CreateExchangeRequest): ApiResult<ExchangeRecordDto>

    @POST("order/api/v1/public/order/list")
    suspend fun listExchanges(@Body request: ListMyExchangeRequest): ApiResult<PageResultDto<ExchangeRecordDto>>

    @POST("order/api/v1/public/order/get")
    suspend fun getExchange(@Body request: IdRequest): ApiResult<ExchangeRecordDto>
}

// ==================== 通用信封 / 请求 ====================

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

@Serializable
data class IdRequest(val id: Long)

@Serializable
data class UserIdRequest(val userId: Long)

// ==================== Auth ====================

@Serializable
data class LoginRequest(val username: String, val password: String)

@Serializable
data class LoginResponseDto(
    val token: String,
    val userId: Long,
    val username: String,
    val nickname: String? = null,
    val role: String,
)

// ==================== Product ====================

@Serializable
data class ListProductRequest(
    val page: Int = 1,
    val size: Int = 20,
    val name: String? = null,
    val category: String? = null,
)

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
    val description: String? = null,
    val imageUrl: String? = null,
)

@Serializable
data class ListCategoryRequest(val parentId: Long? = null)

@Serializable
data class CategoryDto(
    val id: Long,
    val name: String,
    val parentId: Long? = null,
    val children: List<CategoryDto> = emptyList(),
)

// ==================== Point ====================

@Serializable
data class PointBalanceDto(
    val userId: Long,
    val balance: Int = 0,
    val totalEarned: Int = 0,
    val totalUsed: Int = 0,
)

@Serializable
data class ListPointTransactionRequest(
    val userId: Long,
    val page: Int = 1,
    val size: Int = 20,
    val type: String? = null,
)

@Serializable
data class PointTransactionDto(
    val id: Long,
    val description: String? = null,
    val type: String,
    val amount: Int = 0,
    val balance: Int = 0,
    val createdAt: String? = null,
)

// ==================== Order (兑换) ====================

@Serializable
data class CreateExchangeRequest(
    val productId: Long,
    val quantity: Int = 1,
    val userId: Long,
    val employeeName: String? = null,
)

@Serializable
data class ListMyExchangeRequest(
    val userId: Long,
    val page: Int = 1,
    val size: Int = 20,
    val status: String? = null,
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
    val status: String = "PENDING_DELIVERY",
    val exchangeTime: String? = null,
    val createdAt: String? = null,
    val updatedAt: String? = null,
)
