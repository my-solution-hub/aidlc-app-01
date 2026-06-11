package com.awsome.shop.data.repository

import com.awsome.shop.data.remote.*
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

/**
 * ShopRepository 单元测试
 * 验证: API 对接正确性、DTO→领域模型映射、错误处理
 */
class ShopRepositoryTest {

    private lateinit var apiService: ApiService
    private lateinit var repository: ShopRepository

    @Before
    fun setUp() {
        apiService = mockk()
        repository = ShopRepository(apiService)
        repository.currentUserId = 1L
    }

    // ==================== 商品列表 ====================

    @Test
    fun `getProducts success - maps DTO to domain correctly`() = runTest {
        val dto = ProductDto(id = 1, name = "测试商品", pointsPrice = 500, stock = 10, category = "电子")
        coEvery { apiService.listProducts(any(), any(), any(), any()) } returns ApiResult(
            code = "SUCCESS",
            data = PageResultDto(records = listOf(dto), total = 1),
        )

        val result = repository.getProducts()

        assertTrue(result.isSuccess)
        val products = result.getOrNull()!!
        assertEquals(1, products.size)
        assertEquals("测试商品", products[0].name)
        assertEquals(500, products[0].points)
        assertEquals("电子", products[0].category)
        assertTrue(products[0].inStock)
    }

    @Test
    fun `getProducts with category filter passes parameter`() = runTest {
        coEvery { apiService.listProducts(any(), any(), any(), eq("数码")) } returns ApiResult(
            code = "SUCCESS",
            data = PageResultDto(records = emptyList()),
        )

        val result = repository.getProducts(category = "数码")
        assertTrue(result.isSuccess)
    }

    @Test
    fun `getProducts failure returns error`() = runTest {
        coEvery { apiService.listProducts(any(), any(), any(), any()) } returns ApiResult(
            code = "SYS_001",
            message = "服务不可用",
        )

        val result = repository.getProducts()
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()!!.message!!.contains("服务不可用"))
    }

    // ==================== 商品详情 ====================

    @Test
    fun `getProductDetail success`() = runTest {
        val dto = ProductDto(id = 5, name = "Sony 耳机", pointsPrice = 800, stock = 0)
        coEvery { apiService.getProduct(5L) } returns ApiResult(code = "SUCCESS", data = dto)

        val result = repository.getProductDetail("5")
        assertTrue(result.isSuccess)
        assertEquals("Sony 耳机", result.getOrNull()!!.name)
        assertFalse(result.getOrNull()!!.inStock) // stock=0 → inStock=false
    }

    // ==================== 兑换下单 ====================

    @Test
    fun `createOrder success`() = runTest {
        val exchangeDto = ExchangeRecordDto(id = 100, orderNo = "EX123", productName = "商品A", pointsCost = 500)
        coEvery { apiService.createExchange(any()) } returns ApiResult(code = "SUCCESS", data = exchangeDto)

        val result = repository.createOrder("1")
        assertTrue(result.isSuccess)
        assertEquals("100", result.getOrNull()!!.id)  // id=100 → "100"
        assertEquals("商品A", result.getOrNull()!!.productName)
    }

    @Test
    fun `createOrder insufficient points returns error`() = runTest {
        coEvery { apiService.createExchange(any()) } returns ApiResult(
            code = "CONFLICT_003",
            message = "积分不足",
        )

        val result = repository.createOrder("1")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()!!.message!!.contains("积分不足"))
    }

    // ==================== 订单列表 + 搜索 ====================

    @Test
    fun `getOrders with keyword passes search parameter`() = runTest {
        coEvery { apiService.listExchanges(any(), any(), any(), any(), eq("耳机")) } returns ApiResult(
            code = "SUCCESS",
            data = PageResultDto(records = emptyList()),
        )

        val result = repository.getOrders(keyword = "耳机")
        assertTrue(result.isSuccess)
    }

    // ==================== 确认收货 ====================

    @Test
    fun `confirmReceipt success`() = runTest {
        val dto = ExchangeRecordDto(id = 10, status = "COMPLETED", productName = "商品B", pointsCost = 300)
        coEvery { apiService.confirmReceipt(10L, 1L) } returns ApiResult(code = "SUCCESS", data = dto)

        val result = repository.confirmReceipt("10")
        assertTrue(result.isSuccess)
        assertEquals(com.awsome.shop.data.model.OrderStatus.COMPLETED, result.getOrNull()!!.status)
    }

    // ==================== 积分 ====================

    @Test
    fun `getPointsTransactions maps type correctly`() = runTest {
        val txn = PointTransactionDto(id = 1, type = "REDEEM", amount = -100, balance = 400, description = "兑换")
        coEvery { apiService.listPointTransactions(any(), any(), any(), any()) } returns ApiResult(
            code = "SUCCESS",
            data = PageResultDto(records = listOf(txn)),
        )

        val result = repository.getPointsTransactions()
        assertTrue(result.isSuccess)
        assertEquals(com.awsome.shop.data.model.TransactionType.REDEMPTION, result.getOrNull()!![0].type)
    }
}
