package com.awsome.shop.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ErrorOutline
import androidx.compose.material.icons.rounded.WifiOff
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.awsome.shop.ui.theme.Error
import com.awsome.shop.ui.theme.TextSecondary

/**
 * 统一错误+重试组件 (Step 6)
 *
 * 用于网络失败、业务错误等场景。
 */
@Composable
fun ErrorRetryView(
    message: String,
    onRetry: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
    isNetworkError: Boolean = false,
) {
    Column(
        modifier = modifier.fillMaxWidth().padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Icon(
            imageVector = if (isNetworkError) Icons.Rounded.WifiOff else Icons.Rounded.ErrorOutline,
            contentDescription = null,
            modifier = Modifier.size(48.dp),
            tint = if (isNetworkError) TextSecondary else Error,
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = message,
            fontSize = 14.sp,
            color = TextSecondary,
            textAlign = TextAlign.Center,
        )
        if (onRetry != null) {
            Spacer(Modifier.height(16.dp))
            OutlinedButton(onClick = onRetry) {
                Text("重试")
            }
        }
    }
}
