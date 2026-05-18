package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.NotificationResponse;
import com.caovinh.noxh.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    @GetMapping
    ApiResponse<List<NotificationResponse>> getMyNotifications() {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getMyNotifications())
                .build();
    }

    @PutMapping("/read-all")
    ApiResponse<Void> markAllRead() {
        notificationService.markAllRead();
        return ApiResponse.<Void>builder()
                .message("Đã đánh dấu tất cả là đã đọc")
                .build();
    }
}
