package com.awsome.shop.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Product(
    val id: String,
    val name: String,
    val description: String,
    val points: Int,
    val category: String,
    val imageUrl: String? = null,
    val inStock: Boolean = true,
    val specs: Map<String, String> = emptyMap(),
    val tags: List<String> = emptyList(),
)
