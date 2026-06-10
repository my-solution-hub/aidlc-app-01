package com.awsome.shop.product.facade.http.controller;

import com.awsome.shop.product.common.enums.FileErrorCode;
import com.awsome.shop.product.common.exception.BusinessException;
import com.awsome.shop.product.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

/**
 * 文件上传 / 访问 Controller
 *
 * <p>实现 BR-PROD-008 / FR-PROD-002：图片上传与访问。</p>
 */
@Slf4j
@Tag(name = "File", description = "文件上传与访问")
@RestController
@RequestMapping("/api/files")
public class FileController {

    /** 5MB */
    private static final long MAX_FILE_SIZE = 5L * 1024 * 1024;

    /** 允许的图片扩展名 (FILE_003) */
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp");

    private final String uploadDir;

    public FileController(@Value("${file.upload.dir:./uploads}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    @Operation(summary = "上传文件（仅图片）")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<FileUploadResponse> upload(@RequestParam("file") MultipartFile file) {
        // FILE_001: 文件非空
        if (file == null || file.isEmpty()) {
            throw new BusinessException(FileErrorCode.FILE_EMPTY);
        }
        // FILE_002: 文件大小 <= 5MB
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(FileErrorCode.FILE_TOO_LARGE);
        }
        // FILE_003: 文件类型校验（基于扩展名）
        String extension = extractExtension(file.getOriginalFilename());
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException(FileErrorCode.FILE_TYPE_NOT_SUPPORTED);
        }

        // BR-PROD-008: UUID + 原始扩展名重命名
        String filename = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        try {
            Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target);
            log.info("[文件上传] 已保存文件: {}", target);
        } catch (IOException e) {
            log.error("[文件上传] 保存文件失败: filename={}", filename, e);
            throw new RuntimeException("文件保存失败", e);
        }

        FileUploadResponse response = new FileUploadResponse();
        response.setFilename(filename);
        response.setUrl("/api/files/" + filename);
        return Result.success(response);
    }

    @Operation(summary = "获取文件")
    @GetMapping("/{filename}")
    public ResponseEntity<byte[]> get(@PathVariable("filename") String filename) {
        // 防止路径穿越
        String safeName = Paths.get(filename).getFileName().toString();
        Path dir = Paths.get(uploadDir).toAbsolutePath().normalize();
        Path target = dir.resolve(safeName);

        if (!Files.exists(target) || !target.startsWith(dir)) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] bytes = Files.readAllBytes(target);
            MediaType mediaType = MediaTypeFactory.getMediaType(safeName)
                    .orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(bytes);
        } catch (IOException e) {
            log.error("[文件访问] 读取文件失败: filename={}", safeName, e);
            return ResponseEntity.notFound().build();
        }
    }

    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return null;
        }
        int dot = originalFilename.lastIndexOf('.');
        if (dot < 0 || dot == originalFilename.length() - 1) {
            return null;
        }
        return originalFilename.substring(dot + 1).toLowerCase();
    }

    /**
     * 文件上传响应
     */
    @Data
    public static class FileUploadResponse {
        /** 存储后的文件名（UUID + 扩展名） */
        private String filename;
        /** 可访问的相对 URL */
        private String url;
    }
}
