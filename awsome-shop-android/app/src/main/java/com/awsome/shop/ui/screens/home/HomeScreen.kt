package com.awsome.shop.ui.screens.home

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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowForwardIos
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Headphones
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.awsome.shop.data.model.Product
import com.awsome.shop.ui.components.BottomNavBar
import com.awsome.shop.ui.components.CategoryChip
import com.awsome.shop.ui.theme.Primary
import com.awsome.shop.ui.theme.PrimaryLight
import com.awsome.shop.ui.theme.TextSecondary
import com.awsome.shop.ui.theme.TextWhite

@Composable
fun HomeScreen(
    onProductClick: (String) -> Unit,
    onPointsClick: () -> Unit,
    onNavigateToOrders: () -> Unit,
    onNavigateToProfile: () -> Unit,
    viewModel: HomeViewModel,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        bottomBar = {
            BottomNavBar(
                selectedIndex = 0,
                onItemSelected = { index ->
                    when (index) {
                        2 -> onNavigateToOrders()
                        3 -> onNavigateToProfile()
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // App Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Primary)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "AWSome Shop",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextWhite,
                )
                Row {
                    // 搜索：展开/收起搜索框，对已加载商品实时过滤
                    IconButton(onClick = { viewModel.toggleSearch() }) {
                        Icon(Icons.Rounded.Search, contentDescription = "搜索", tint = TextWhite)
                    }
                    // 通知：基于真实积分/商品数据生成提示
                    IconButton(onClick = { viewModel.onNotificationsClick() }) {
                        Icon(Icons.Rounded.Notifications, contentDescription = "通知", tint = TextWhite)
                    }
                }
            }

            // 搜索框（展开时）
            if (state.searchActive) {
                OutlinedTextField(
                    value = state.searchQuery,
                    onValueChange = { viewModel.onSearchQueryChange(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    placeholder = { Text("搜索商品名称") },
                    singleLine = true,
                    leadingIcon = { Icon(Icons.Rounded.Search, contentDescription = null) },
                )
            }

            // 通知横幅（点击通知后展示，再次点击或点关闭消失）
            if (state.notice != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(PrimaryLight.copy(alpha = 0.15f))
                        .clickable { viewModel.dismissNotice() }
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(state.notice!!, fontSize = 13.sp, color = Primary)
                    Icon(Icons.Rounded.Close, contentDescription = "关闭", tint = Primary, modifier = Modifier.size(18.dp))
                }
            }

            // Points Banner
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Brush.horizontalGradient(listOf(Primary, PrimaryLight)))
                    .clickable(onClick = onPointsClick)
                    .padding(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column {
                        Text("我的积分", fontSize = 12.sp, color = TextWhite.copy(alpha = 0.8f))
                        Text(
                            text = formatPoints(state.points),
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextWhite,
                        )
                    }
                    Icon(Icons.Rounded.ArrowForwardIos, contentDescription = null, tint = TextWhite.copy(alpha = 0.8f), modifier = Modifier.size(20.dp))
                }
            }

            // Category Filter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                viewModel.categories.forEachIndexed { index, cat ->
                    CategoryChip(
                        text = cat,
                        selected = index == state.selectedCategoryIndex,
                        onClick = { viewModel.onCategorySelected(index) },
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            // Product Grid / 状态
            when {
                state.isLoading && state.products.isEmpty() -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = Primary)
                    }
                }
                state.error != null && state.products.isEmpty() -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(state.error!!, color = TextSecondary, fontSize = 14.sp)
                    }
                }
                state.visibleProducts.isEmpty() -> {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text(
                            if (state.searchQuery.isBlank()) "暂无商品" else "未找到匹配商品",
                            color = TextSecondary,
                            fontSize = 14.sp,
                        )
                    }
                }
                else -> {
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        contentPadding = PaddingValues(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        items(state.visibleProducts, key = { it.id }) { product ->
                            ProductCard(
                                product = product,
                                onClick = { onProductClick(product.id) },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ProductCard(product: Product, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center,
            ) {
                if (product.imageUrl != null) {
                    AsyncImage(
                        model = product.imageUrl,
                        contentDescription = product.name,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop,
                    )
                } else {
                    Icon(
                        Icons.Rounded.Headphones,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = Primary,
                    )
                }
            }
            Column(modifier = Modifier.padding(12.dp)) {
                Text(product.name, fontSize = 13.sp, fontWeight = FontWeight.Medium, maxLines = 2)
                Spacer(Modifier.height(8.dp))
                Text("${formatPoints(product.points)} 积分", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Primary)
            }
        }
    }
}

private fun formatPoints(value: Int): String = "%,d".format(value)
