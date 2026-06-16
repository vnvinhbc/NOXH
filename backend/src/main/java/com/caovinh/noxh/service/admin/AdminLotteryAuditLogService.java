package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.dto.response.admin.AdminLotteryAuditLogResponse;
import com.caovinh.noxh.entity.LotteryAuditLog;
import com.caovinh.noxh.repository.LotteryAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminLotteryAuditLogService {

    LotteryAuditLogRepository lotteryAuditLogRepository;

    @Transactional(readOnly = true)
    public List<AdminLotteryAuditLogResponse> getLogs(UUID eventId) {
        List<LotteryAuditLog> logs = eventId == null
                ? lotteryAuditLogRepository.findAllByOrderByCreatedAtDesc()
                : lotteryAuditLogRepository.findByEventIdOrderByCreatedAtAsc(eventId);
        return logs.stream().map(this::toResponse).toList();
    }

    private AdminLotteryAuditLogResponse toResponse(LotteryAuditLog log) {
        return AdminLotteryAuditLogResponse.builder()
                .id(log.getId().toString())
                .eventId(log.getEvent().getId().toString())
                .eventName(log.getEvent().getName())
                .projectName(log.getEvent().getProject().getName())
                .eventType(log.getEventType().name())
                .payload(log.getPayload())
                .previousHash(log.getPreviousHash())
                .currentHash(log.getCurrentHash())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
