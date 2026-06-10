package com.awsome.shop.data.repository

import kotlinx.coroutines.flow.first

/**
 * 会话同步辅助：确保 ShopRepository.currentUserId 已从 AuthRepository 的会话中填充。
 *
 * 设计说明：currentUserId 在登录成功时由 LoginViewModel 写入（见 LoginViewModel.login）。
 * 但进程被系统回收后重建时，登录 VM 不会再次运行，而 DataStore 中的会话仍然有效，
 * 因此各数据页面的 ViewModel 在加载前调用本方法做一次幂等回填，避免 userId 丢失。
 */
suspend fun ShopRepository.ensureUserId(authRepository: AuthRepository) {
    if (currentUserId == 0L) {
        authRepository.userId.first()?.let { currentUserId = it }
    }
}
