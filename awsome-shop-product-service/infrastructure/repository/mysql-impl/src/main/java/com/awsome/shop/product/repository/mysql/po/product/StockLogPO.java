package com.awsome.shop.product.repository.mysql.po.product;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("stock_log")
public class StockLogPO {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long productId;
    private String changeType;
    private Integer quantity;
    private Integer beforeStock;
    private Integer afterStock;
    private String reason;
    private LocalDateTime createdAt;
}
