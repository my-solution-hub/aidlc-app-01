package com.awsome.shop.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val name: String,
    val employeeId: String,
    val department: String,
    val title: String,
    val availablePoints: Int,
    val totalEarned: Int,
    val totalUsed: Int,
    val redemptionCount: Int,
)
