package com.awsome.shop.ui

import androidx.compose.runtime.Composable
import androidx.navigation.compose.rememberNavController
import com.awsome.shop.ui.navigation.AppNavGraph
import com.awsome.shop.ui.navigation.Route

@Composable
fun AwsomeShopRoot() {
    val navController = rememberNavController()
    AppNavGraph(
        navController = navController,
        startDestination = Route.Login,
    )
}
