package com.awsome.shop.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowForwardIos
import androidx.compose.material.icons.rounded.CardGiftcard
import androidx.compose.material.icons.rounded.LocationOn
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.ReceiptLong
import androidx.compose.material.icons.rounded.Stars
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.awsome.shop.data.model.User
import com.awsome.shop.ui.components.BottomNavBar
import com.awsome.shop.ui.theme.Error
import com.awsome.shop.ui.theme.Primary
import com.awsome.shop.ui.theme.PrimaryBg
import com.awsome.shop.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onBack: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToPointsCenter: () -> Unit,
    onNavigateToPointsHistory: () -> Unit,
    onNavigateToDeliveryInfo: () -> Unit,
    onLogout: () -> Unit,
    onNavigateToHome: () -> Unit,
    viewModel: ProfileViewModel,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(state.loggedOut) {
        if (state.loggedOut) {
            onLogout()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("我的") })
        },
        bottomBar = {
            BottomNavBar(
                selectedIndex = 3,
                onItemSelected = { index ->
                    when (index) {
                        0, 1 -> onNavigateToHome()
                        2 -> onNavigateToOrders()
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            // 用户头部
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(PrimaryBg),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(Icons.Rounded.Person, contentDescription = null, tint = Primary, modifier = Modifier.size(32.dp))
                    }
                    Spacer(Modifier.size(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        when {
                            state.isLoading -> {
                                CircularProgressIndicator(color = Primary, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                            }
                            state.user != null -> {
                                ProfileUserInfo(state.user!!)
                            }
                            else -> {
                                Text(state.error ?: "加载失败", color = TextSecondary, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }

            // 功能入口
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            ) {
                Column {
                    MenuRow(Icons.Rounded.ReceiptLong, "我的订单", onNavigateToOrders)
                    MenuRow(Icons.Rounded.Stars, "积分中心", onNavigateToPointsCenter)
                    MenuRow(Icons.Rounded.CardGiftcard, "积分明细", onNavigateToPointsHistory)
                    MenuRow(Icons.Rounded.LocationOn, "收货地址", onNavigateToDeliveryInfo)
                }
            }

            Spacer(Modifier.weight(1f))

            OutlinedButton(
                onClick = viewModel::logout,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(8.dp),
            ) {
                Text("退出登录", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Error)
            }
        }
    }
}

@Composable
private fun ProfileUserInfo(user: User) {
    val displayName = user.name.ifBlank { "员工 #${user.id}" }
    Text(displayName, fontSize = 18.sp, fontWeight = FontWeight.Bold)
    Spacer(Modifier.height(4.dp))
    Text("可用积分 %,d".format(user.availablePoints), fontSize = 13.sp, color = Primary, fontWeight = FontWeight.Medium)
}

@Composable
private fun MenuRow(icon: ImageVector, label: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, contentDescription = null, tint = Primary, modifier = Modifier.size(22.dp))
        Spacer(Modifier.size(16.dp))
        Text(label, modifier = Modifier.weight(1f), fontSize = 15.sp)
        Icon(Icons.Rounded.ArrowForwardIos, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(14.dp))
    }
}
