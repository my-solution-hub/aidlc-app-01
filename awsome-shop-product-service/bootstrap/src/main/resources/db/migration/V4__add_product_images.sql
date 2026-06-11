-- 商品多图(JSON 数组,最多10张,第一张为主图)
ALTER TABLE `product`
    ADD COLUMN `images` JSON DEFAULT NULL COMMENT '商品图片URL列表(JSON数组)' AFTER `image_url`;
