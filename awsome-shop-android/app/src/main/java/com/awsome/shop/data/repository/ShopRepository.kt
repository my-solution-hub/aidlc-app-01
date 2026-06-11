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
import com.awsome.shop.data.remote.PointTransactionDto
import com.awsome.shop.data.remote.ProductDto
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 商城数据仓库 — 对齐 RESTful API v1.2 规范。
 * GET 请求使用 @Query 参数，POST 请求使用 @Body。
 */
@Singleton
class ShopRepository @Inject constructor(
    private val apiService: ApiService,
) {
    var currentUserId: Long = 0

    suspend fun getProducts(
        page: Int = 1,
        size: Int = 20,
        name: String? = null,
        category: String? = null,
    ): Result<List<Product>> = runCatching {
        val result = apiService.listProducts(page = page, size = size, name = name, category = category).unwrap()
        result.records.map { it.toDomain() }
    }

    suspend fun getProductDetail(id: String): Result<Product> = runCatching {
        apiService.getProduct(id.toLong()).unwrap().toDomain()
    }

    suspend fun getProfile(): Result<User> = runCatching {
        val balance = apiService.getPointBalance(currentUserId).unwrap()
        // 尝试获取用户详情
        val userDto = try {
            apiService.getCurrentUser().unwrap()
        } catch (_: Exception) { null }

        User(
            id = currentUserId.toString(),
            name = userDto?.nickname ?: userDto?.username ?: "",
            employeeId = userDto?.employeeId ?: "",
            department = userDto?.department ?: "",
            title = "",
            availablePoints = balance.balance,
            totalEarned = balance.totalEarned,
            totalUsed = balance.totalUsed,
            redemptionCount = 0,
        )
    }

    suspend fun createOrder(productId: String, addressId: String? = null): Result<Order> = runCatching {
        val dto = apiService.createExchange(
            CreateExchangeRequest(
                productId = productId.toLong(),
                quantity = 1,
                userId = currentUserId,
                addressId = addressId?.toLongOrNull(),
                idempotencyKey = java.util.UUID.randomUUID().toString(),
            ),
        ).unwrap()
        dto.toDomain()
    }

    suspend fun getOrders(
        status: String? = null,
        keyword: String? = null,
    ): Result<List<Order>> = runCatching {
        val result = apiService.listExchanges(
            userId = currentUserId,
            status = status,
            keyword = keyword,
        ).unwrap()
        result.records.map { it.toDomain() }
    }

    suspend fun getOrderDetail(id: String): Result<Order> = runCatching {
        apiService.getExchange(id.toLong()).unwrap().toDomain()
    }

    suspend fun confirmReceipt(orderId: String): Result<Order> = runCatching {
        apiService.confirmReceipt(id = orderId.toLong(), userId = currentUserId).unwrap().toDomain()
    }

    suspend fun getPointsTransactions(type: String? = null): Result<List<PointsTransaction>> = runCatching {
        val result = apiService.listPointTransactions(userId = currentUserId, type = type).unwrap()
        result.records.map { it.toDomain() }
    }

    suspend fun getCategories(): Result<List<com.awsome.shop.data.remote.CategoryDto>> = runCatching {
        apiService.getCategoryTree().unwrap()
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
    imageUrl = imageUrl ?: images.firstOrNull(),
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
    trackingNumber = trackingNumber,
)

private fun String.toOrderStatus(): OrderStatus = when (uppercase()) {
    "DELIVERING", "SHIPPED" -> OrderStatus.SHIPPED
    "COMPLETED" -> OrderStatus.COMPLETED
    "CANCELLED", "CANCELED" -> OrderStatus.CANCELLED
    else -> OrderStatus.PENDING
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
    "REDEEM", "REDEMPTION", "EXCHANGE" -> TransactionType.REDEMPTION
    "PERFORMANCE" -> TransactionType.PERFORMANCE
    "SENIORITY" -> TransactionType.SENIORITY
    "HOLIDAY" -> TransactionType.HOLIDAY
    else -> TransactionType.SPECIAL
}
