package com.awsome.shop.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Address(
    val id: String,
    val name: String,
    val phone: String,
    val region: String,
    val detail: String,
    val isDefault: Boolean = false,
)
