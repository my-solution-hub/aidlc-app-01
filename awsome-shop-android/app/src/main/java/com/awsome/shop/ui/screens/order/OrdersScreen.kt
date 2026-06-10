package com.awsome.shop.ui.screens.order

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Inventory2
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.awsome.shop.data.model.Order
import com.awsome.shop.data.model.OrderStatus
import com.awsome.shop.ui.components.BottomNavBar
import com.awsome.shop.ui.theme.ChipBlueBg
import com.awsome.shop.ui.theme.ChipBlueText
import com.awsome.shop.ui.theme.ChipGreenBg
import com.awsome.shop.ui.theme.ChipGreenText
import com.awsome.shop.ui.theme.ChipOrangeBg
import com.awsome.shop.ui.theme.ChipOrangeText
import com.awsome.shop.ui.theme.ChipRedBg
import com.awsome.shop.ui.theme.ChipRedText
import com.awsome.shop.ui.theme.Primary
import com.awsome.shop.ui.theme.PrimaryBg
import com.awsome.shop.ui.theme.TextSecondary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    onBack: () -> Unit,
    onOrderClick: (String) -> Unit,
    onNavigateToHome: () -> Unit,
    onNavigateToProfile: () -> Unit,
    viewModel: OrdersViewModel,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("兑换记录") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        bottomBar = {
            BottomNavBar(
                selectedIndex = 2,
                onItemSelected = { index ->
                    when (index) {
                        0, 1 -> onNavigateToHome()
                        3 -> onNavigateToProfile()
                    }
                }
            )
        }
    ) { padding ->
        when {
            state.isLoading -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Primary)
                }
            }
            state.error != null && state.orders.isEmpty() -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Text(state.error!!, color = TextSecondary, fontSize = 14.sp)
                }
            }
            state.orders.isEmpty() -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Text("暂无兑换记录", color = TextSecondary, fontSize = 14.sp)
                }
            }
            else -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(state.orders, key = { it.id }) { order ->
                        OrderCard(order = order, onClick = { onOrderClick(order.id) })
                    }
                }
            }
        }
    }
}

@Composable
private fun OrderCard(order: Order, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Text("订单号 ${order.id}", fontSize = 12.sp, color = TextSecondary)
                OrderStatusChip(order.status)
            }
            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(PrimaryBg),
                    contentAlignment = Alignment.Center,
                ) {
                    if (order.productImageUrl != null) {
                        AsyncImage(
                            model = order.productImageUrl,
                            contentDescription = order.productName,
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop,
                        )
                    } else {
                        Icon(Icons.Rounded.Inventory2, contentDescription = null, tint = Primary, modifier = Modifier.size(28.dp))
                    }
                }
                Spacer(Modifier.size(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(order.productName, fontSize = 14.sp, fontWeight = FontWeight.Medium, maxLines = 2)
                    Spacer(Modifier.height(4.dp))
                    Text("%,d 积分".format(order.points), fontSize = 13.sp, color = Primary, fontWeight = FontWeight.SemiBold)
                }
            }
            if (order.createdAt.isNotBlank()) {
                Spacer(Modifier.height(8.dp))
                Text(order.createdAt, fontSize = 12.sp, color = TextSecondary)
            }
        }
    }
}

@Composable
fun OrderStatusChip(status: OrderStatus) {
    val (bg, fg) = when (status) {
        OrderStatus.PENDING -> ChipOrangeBg to ChipOrangeText
        OrderStatus.SHIPPED -> ChipBlueBg to ChipBlueText
        OrderStatus.COMPLETED -> ChipGreenBg to ChipGreenText
        OrderStatus.CANCELLED -> ChipRedBg to ChipRedText
    }
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(8.dp))
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 4.dp),
    ) {
        Text(status.displayName, fontSize = 12.sp, color = fg, fontWeight = FontWeight.Medium)
    }
}
