package com.awsome.shop.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Order(
    val id: String,
    val productName: String,
    val productImageUrl: String? = null,
    val points: Int,
    val status: OrderStatus,
    val createdAt: String,
    val trackingNumber: String? = null,
)

@Serializable
enum class OrderStatus {
    PENDING,
    SHIPPED,
    COMPLETED,
    CANCELLED;

    val displayName: String
        get() = when (this) {
            PENDING -> "待发货"
            SHIPPED -> "已发货"
            COMPLETED -> "已完成"
            CANCELLED -> "已取消"
        }
}
