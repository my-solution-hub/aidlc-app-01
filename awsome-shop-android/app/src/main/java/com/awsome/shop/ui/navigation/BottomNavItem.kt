package com.awsome.shop.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.Category
import androidx.compose.material.icons.rounded.ReceiptLong
import androidx.compose.material.icons.rounded.Storefront
import androidx.compose.ui.graphics.vector.ImageVector

enum class BottomNavItem(
    val route: Route,
    val icon: ImageVector,
    val label: String,
) {
    Shop(Route.Home, Icons.Rounded.Storefront, "商城"),
    Category(Route.Home, Icons.Rounded.Category, "分类"),
    Orders(Route.Orders, Icons.Rounded.ReceiptLong, "订单"),
    Profile(Route.Profile, Icons.Rounded.AccountCircle, "我的"),
}
