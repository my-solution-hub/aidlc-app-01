package com.awsome.shop.ui.screens.product

import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Headphones
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import com.awsome.shop.data.model.Product
import com.awsome.shop.ui.theme.Primary
import com.awsome.shop.ui.theme.PrimaryBg
import com.awsome.shop.ui.theme.TextSecondary
import com.awsome.shop.ui.theme.TextWhite

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    productId: String,
    onBack: () -> Unit,
    onRedeem: (String) -> Unit,
    viewModel: ProductDetailViewModel,
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(productId) {
        viewModel.load(productId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("商品详情") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "返回")
                    }
                },
            )
        },
        bottomBar = {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shadowElevation = 8.dp,
            ) {
                Box(modifier = Modifier.padding(16.dp)) {
                    Button(
                        onClick = { onRedeem(productId) },
                        modifier = Modifier.fillMaxWidth().height(48.dp),
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Primary),
                        enabled = state.product?.inStock == true,
                    ) {
                        val label = if (state.product?.inStock == false) "暂无库存" else "立即兑换"
                        Text(label, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = TextWhite)
                    }
                }
            }
        }
    ) { padding ->
        when {
            state.isLoading -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Primary)
                }
            }
            state.product == null -> {
                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                    Text(state.error ?: "商品不存在", color = TextSecondary, fontSize = 14.sp)
                }
            }
            else -> {
                ProductDetailContent(
                    product = state.product!!,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding)
                        .verticalScroll(rememberScrollState()),
                )
            }
        }
    }
}

@Composable
private fun ProductDetailContent(product: Product, modifier: Modifier = Modifier) {
    Column(modifier = modifier) {
        // Product Image
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(260.dp)
                .background(PrimaryBg),
            contentAlignment = Alignment.Center,
        ) {
            if (product.imageUrl != null) {
                AsyncImage(
                    model = product.imageUrl,
                    contentDescription = product.name,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit,
                )
            } else {
                Icon(Icons.Rounded.Headphones, contentDescription = null, modifier = Modifier.size(100.dp), tint = Primary)
            }
        }

        // Product Info
        Surface(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(product.name, style = MaterialTheme.typography.titleLarge)
                if (product.description.isNotBlank()) {
                    Text(product.description, style = MaterialTheme.typography.bodySmall)
                }
                Row(verticalAlignment = Alignment.Bottom) {
                    Text("%,d".format(product.points), fontSize = 28.sp, fontWeight = FontWeight.Bold, color = Primary)
                    Spacer(Modifier.padding(start = 4.dp))
                    Text("积分", fontSize = 14.sp, color = Primary)
                }
            }
        }

        // Specs / tags
        if (product.specs.isNotEmpty() || product.tags.isNotEmpty()) {
            Spacer(Modifier.height(12.dp))
            Surface(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("商品规格", style = MaterialTheme.typography.titleSmall)
                    product.specs.forEach { (label, value) ->
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(label, style = MaterialTheme.typography.bodySmall)
                            Text(value, style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                    if (product.tags.isNotEmpty()) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("品牌", style = MaterialTheme.typography.bodySmall)
                            Text(product.tags.joinToString("、"), style = MaterialTheme.typography.bodyMedium)
                        }
                    }
                }
            }
        }
    }
}
