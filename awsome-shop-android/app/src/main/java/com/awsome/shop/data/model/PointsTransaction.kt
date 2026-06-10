package com.awsome.shop.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PointsTransaction(
    val id: String,
    val description: String,
    val type: TransactionType,
    val amount: Int,
    val balance: Int,
    val createdAt: String,
)

@Serializable
enum class TransactionType {
    REDEMPTION,
    PERFORMANCE,
    SENIORITY,
    HOLIDAY,
    SPECIAL;

    val displayName: String
        get() = when (this) {
            REDEMPTION -> "兑换"
            PERFORMANCE -> "绩效"
            SENIORITY -> "工龄"
            HOLIDAY -> "福利"
            SPECIAL -> "奖励"
        }
}
