package com.awsome.shop.ui.screens.points

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.ArrowForwardIos
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.awsome.shop.ui.components.BottomNavBar
import com.awsome.shop.ui.theme.Primary
import com.awsome.shop.ui.theme.PrimaryLight
import com.awsome.shop.ui.theme.TextSecondary
import com.awsome.shop.ui.theme.TextWhite

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PointsCenterScreen(
    onBack: () -> Unit,
    onPointsHistoryClick: () -> Unit,
    onNavigateToHome: () -> Unit,
    onNavigateToOrders: () -> Unit,
    viewModel: PointsCenterViewModel,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("积分中心") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        bottomBar = {
            BottomNavBar(
                selectedIndex = -1,
                onItemSelected = { index ->
                    when (index) {
                        0, 1 -> onNavigateToHome()
                        2 -> onNavigateToOrders()
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
            state.user == null -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Text(state.error ?: "加载失败", color = TextSecondary, fontSize = 14.sp)
                }
            }
            else -> {
                val user = state.user!!
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    // 余额卡
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Brush.horizontalGradient(listOf(Primary, PrimaryLight)))
                            .padding(24.dp),
                    ) {
                        Column {
                            Text("当前可用积分", fontSize = 13.sp, color = TextWhite.copy(alpha = 0.85f))
                            Spacer(Modifier.size(8.dp))
                            Text(
                                "%,d".format(user.availablePoints),
                                fontSize = 36.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextWhite,
                            )
                        }
                    }

                    // 累计统计
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(16.dp),
                    ) {
                        SummaryCard(modifier = Modifier.weight(1f), label = "累计获得", value = user.totalEarned)
                        SummaryCard(modifier = Modifier.weight(1f), label = "累计使用", value = user.totalUsed)
                    }

                    // 积分明细入口
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable(onClick = onPointsHistoryClick),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text("积分明细", style = MaterialTheme.typography.titleSmall)
                            Icon(
                                Icons.Rounded.ArrowForwardIos,
                                contentDescription = null,
                                tint = TextSecondary,
                                modifier = Modifier.size(16.dp),
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SummaryCard(modifier: Modifier = Modifier, label: String, value: Int) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(label, fontSize = 12.sp, color = TextSecondary)
            Spacer(Modifier.size(6.dp))
            Text("%,d".format(value), fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Primary)
        }
    }
}
