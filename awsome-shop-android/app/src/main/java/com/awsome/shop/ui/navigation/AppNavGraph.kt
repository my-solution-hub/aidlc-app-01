package com.awsome.shop.ui.navigation

import androidx.compose.runtime.Composable
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import com.awsome.shop.ui.screens.home.HomeScreen
import com.awsome.shop.ui.screens.login.LoginScreen
import com.awsome.shop.ui.screens.order.OrderDetailScreen
import com.awsome.shop.ui.screens.order.OrdersScreen
import com.awsome.shop.ui.screens.points.PointsCenterScreen
import com.awsome.shop.ui.screens.points.PointsHistoryScreen
import com.awsome.shop.ui.screens.product.ProductDetailScreen
import com.awsome.shop.ui.screens.profile.ProfileScreen
import com.awsome.shop.ui.screens.redemption.ConfirmRedemptionScreen
import com.awsome.shop.ui.screens.redemption.DeliveryInfoScreen
import com.awsome.shop.ui.screens.redemption.RedemptionSuccessScreen

@Composable
fun AppNavGraph(
    navController: NavHostController,
    startDestination: Route = Route.Login,
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
    ) {
        composable<Route.Login> {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Route.Home) {
                        popUpTo(Route.Login) { inclusive = true }
                    }
                },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.Home> {
            HomeScreen(
                onProductClick = { productId ->
                    navController.navigate(Route.ProductDetail(productId))
                },
                onPointsClick = {
                    navController.navigate(Route.PointsCenter)
                },
                onNavigateToOrders = {
                    navController.navigate(Route.Orders)
                },
                onNavigateToProfile = {
                    navController.navigate(Route.Profile)
                },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.ProductDetail> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.ProductDetail>()
            ProductDetailScreen(
                productId = route.productId,
                onBack = { navController.popBackStack() },
                onRedeem = { productId -> navController.navigate(Route.ConfirmRedemption(productId)) },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.ConfirmRedemption> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.ConfirmRedemption>()
            ConfirmRedemptionScreen(
                productId = route.productId,
                onBack = { navController.popBackStack() },
                onConfirm = { orderId ->
                    navController.navigate(Route.RedemptionSuccess(orderId)) {
                        // 兑换成功后清掉确认页与详情页，返回时直接回到首页/订单。
                        popUpTo(Route.Home)
                    }
                },
                onEditAddress = { navController.navigate(Route.DeliveryInfo) },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.DeliveryInfo> {
            DeliveryInfoScreen(
                onBack = { navController.popBackStack() },
                onSave = { navController.popBackStack() },
            )
        }

        composable<Route.RedemptionSuccess> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.RedemptionSuccess>()
            RedemptionSuccessScreen(
                orderId = route.orderId,
                onViewOrder = { orderId ->
                    navController.navigate(Route.OrderDetail(orderId)) {
                        popUpTo(Route.Home)
                    }
                },
                onContinueShopping = {
                    navController.navigate(Route.Home) {
                        popUpTo(Route.Home) { inclusive = true }
                    }
                },
            )
        }

        composable<Route.Orders> {
            OrdersScreen(
                onBack = { navController.popBackStack() },
                onOrderClick = { orderId ->
                    navController.navigate(Route.OrderDetail(orderId))
                },
                onNavigateToHome = {
                    navController.navigate(Route.Home) {
                        popUpTo(Route.Home) { inclusive = true }
                    }
                },
                onNavigateToProfile = {
                    navController.navigate(Route.Profile)
                },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.OrderDetail> { backStackEntry ->
            val route = backStackEntry.toRoute<Route.OrderDetail>()
            OrderDetailScreen(
                orderId = route.orderId,
                onBack = { navController.popBackStack() },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.PointsCenter> {
            PointsCenterScreen(
                onBack = { navController.popBackStack() },
                onPointsHistoryClick = {
                    navController.navigate(Route.PointsHistory)
                },
                onNavigateToHome = {
                    navController.navigate(Route.Home) {
                        popUpTo(Route.Home) { inclusive = true }
                    }
                },
                onNavigateToOrders = {
                    navController.navigate(Route.Orders)
                },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.PointsHistory> {
            PointsHistoryScreen(
                onBack = { navController.popBackStack() },
                viewModel = hiltViewModel(),
            )
        }

        composable<Route.Profile> {
            ProfileScreen(
                onBack = { navController.popBackStack() },
                onNavigateToOrders = {
                    navController.navigate(Route.Orders)
                },
                onNavigateToPointsCenter = {
                    navController.navigate(Route.PointsCenter)
                },
                onNavigateToPointsHistory = {
                    navController.navigate(Route.PointsHistory)
                },
                onNavigateToDeliveryInfo = {
                    navController.navigate(Route.DeliveryInfo)
                },
                onLogout = {
                    navController.navigate(Route.Login) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onNavigateToHome = {
                    navController.navigate(Route.Home) {
                        popUpTo(Route.Home) { inclusive = true }
                    }
                },
                viewModel = hiltViewModel(),
            )
        }
    }
}
