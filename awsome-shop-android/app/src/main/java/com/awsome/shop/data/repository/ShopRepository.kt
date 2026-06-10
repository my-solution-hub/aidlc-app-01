package com.awsome.shop.data.repository

import com.awsome.shop.data.model.Order
import com.awsome.shop.data.model.OrderStatus
import com.awsome.shop.data.model.PointsTransaction
import com.awsome.shop.data.model.Product
import com.awsome.shop.data.model.TransactionType
import com.awsome.shop.data.model.User
import com.awsome.shop.data.remote.ApiResult
import com.awsome.shop.data.remote.ApiService
import com.awsome.shop.data.remote.CreateExchangeRequest
import com.awsome.shop.data.remote.ExchangeRecordDto
import com.awsome.shop.data.remote.IdRequest
import com.awsome.shop.data.remote.ListMyExchangeRequest
import com.awsome.shop.data.remote.ListPointTransactionRequest
import com.awsome.shop.data.remote.ListProductRequest
import com.awsome.shop.data.remote.PointTransactionDto
import com.awsome.shop.data.remote.ProductDto
import com.awsome.shop.data.remote.UserIdRequest
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 商城数据仓库。对接真实网关契约（POST + Result<T> 信封），
 * 并把网络 DTO 映射为 UI 层使用的领域模型，保持 11 个 Compose 页面签名不变。
 *
 * 注：当前登录用户 id 由调用方/会话提供，这里用占位 currentUserId，
 * 实际接入时应从 AuthRepository 的会话中取。
 */
@Singleton
class ShopRepository @Inject constructor(
    private val apiService: ApiService,
) {
    // TODO: 接入会话后从 AuthRepository 读取真实登录用户 id
    var currentUserId: Long = 0

    suspend fun getProducts(category: String? = null): Result<List<Product>> = runCatching {
        val page = apiService.listProducts(ListProductRequest(category = category)).unwrap()
        page.records.map { it.toDomain() }
    }

    suspend fun getProductDetail(id: String): Result<Product> = runCatching {
        apiService.getProduct(IdRequest(id.toLong())).unwrap().toDomain()
    }

    suspend fun getProfile(): Result<User> = runCatching {
        // 用户基础信息 + 积分余额组合
        val balance = apiService.getPointBalance(UserIdRequest(currentUserId)).unwrap()
        User(
            id = currentUserId.toString(),
            name = "",
            employeeId = "",
            department = "",
            title = "",
            availablePoints = balance.balance,
            totalEarned = balance.totalEarned,
            totalUsed = balance.totalUsed,
            redemptionCount = 0,
        )
    }

    suspend fun createOrder(productId: String, addressId: String): Result<Order> = runCatching {
        // addressId 参数保留以兼容页面签名；当前后端兑换按 userId + productId 处理
        val dto = apiService.createExchange(
            CreateExchangeRequest(
                productId = productId.toLong(),
                quantity = 1,
                userId = currentUserId,
            ),
        ).unwrap()
        dto.toDomain()
    }

    suspend fun getOrders(status: String? = null): Result<List<Order>> = runCatching {
        val page = apiService.listExchanges(
            ListMyExchangeRequest(userId = currentUserId, status = status),
        ).unwrap()
        page.records.map { it.toDomain() }
    }

    suspend fun getOrderDetail(id: String): Result<Order> = runCatching {
        apiService.getExchange(IdRequest(id.toLong())).unwrap().toDomain()
    }

    suspend fun getPointsTransactions(type: String? = null): Result<List<PointsTransaction>> = runCatching {
        val page = apiService.listPointTransactions(
            ListPointTransactionRequest(userId = currentUserId, type = type),
        ).unwrap()
        page.records.map { it.toDomain() }
    }
}

// ==================== Result 解信封 ====================

private fun <T> ApiResult<T>.unwrap(): T {
    if (!isSuccess || data == null) {
        throw IllegalStateException(message ?: "请求失败: $code")
    }
    return data
}

// ==================== DTO → 领域模型映射 ====================

private fun ProductDto.toDomain(): Product = Product(
    id = id.toString(),
    name = name,
    description = description ?: "",
    points = pointsPrice,
    category = category ?: "",
    imageUrl = imageUrl,
    inStock = stock > 0,
    specs = emptyMap(),
    tags = listOfNotNull(brand),
)

private fun ExchangeRecordDto.toDomain(): Order = Order(
    id = id.toString(),
    productName = productName ?: "",
    productImageUrl = productImageUrl,
    points = pointsCost,
    status = status.toOrderStatus(),
    createdAt = createdAt ?: exchangeTime ?: "",
    trackingNumber = null,
)

private fun String.toOrderStatus(): OrderStatus = when (uppercase()) {
    "DELIVERING", "SHIPPED" -> OrderStatus.SHIPPED
    "COMPLETED" -> OrderStatus.COMPLETED
    "CANCELLED", "CANCELED" -> OrderStatus.CANCELLED
    else -> OrderStatus.PENDING  // PENDING_DELIVERY 等映射为待发货
}

private fun PointTransactionDto.toDomain(): PointsTransaction = PointsTransaction(
    id = id.toString(),
    description = description ?: "",
    type = type.toTransactionType(),
    amount = amount,
    balance = balance,
    createdAt = createdAt ?: "",
)

private fun String.toTransactionType(): TransactionType = when (uppercase()) {
    "REDEMPTION", "EXCHANGE" -> TransactionType.REDEMPTION
    "PERFORMANCE" -> TransactionType.PERFORMANCE
    "SENIORITY" -> TransactionType.SENIORITY
    "HOLIDAY" -> TransactionType.HOLIDAY
    else -> TransactionType.SPECIAL
}
