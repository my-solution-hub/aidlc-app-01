package com.awsome.shop.ui.navigation

import kotlinx.serialization.Serializable

sealed interface Route {
    @Serializable data object Login : Route
    @Serializable data object Main : Route
    @Serializable data object Home : Route
    @Serializable data object Orders : Route
    @Serializable data object PointsCenter : Route
    @Serializable data object Profile : Route
    @Serializable data class ProductDetail(val productId: String) : Route
    @Serializable data class ConfirmRedemption(val productId: String) : Route
    @Serializable data object DeliveryInfo : Route
    @Serializable data class RedemptionSuccess(val orderId: String) : Route
    @Serializable data class OrderDetail(val orderId: String) : Route
    @Serializable data object PointsHistory : Route
}
