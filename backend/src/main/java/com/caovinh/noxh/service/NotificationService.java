package com.caovinh.noxh.service;

import com.caovinh.noxh.dto.response.NotificationResponse;
import com.caovinh.noxh.entity.Notification;
import com.caovinh.noxh.mapper.NotificationMapper;
import com.caovinh.noxh.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    NotificationRepository notificationRepository;
    NotificationMapper notificationMapper;

    public List<NotificationResponse> getMyNotifications() {
        UUID userId = getCurrentUserId();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notificationMapper.toNotificationResponseList(notifications);
    }

    @Transactional
    public void markAllRead() {
        UUID userId = getCurrentUserId();
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    private UUID getCurrentUserId() {
        return UUID.fromString(SecurityContextHolder.getContext().getAuthentication().getName());
    }
}
