package com.caovinh.noxh.service.lottery;

import com.caovinh.noxh.constant.lottery.LotteryAuditEventType;
import com.caovinh.noxh.entity.LotteryAuditLog;
import com.caovinh.noxh.entity.LotteryEvent;
import com.caovinh.noxh.repository.LotteryAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LotteryAuditService {

    LotteryAuditLogRepository lotteryAuditLogRepository;
    LotteryHashService lotteryHashService;

    public void log(LotteryEvent event, LotteryAuditEventType eventType, String payload) {
        String previousHash = lotteryAuditLogRepository.findTopByEventIdOrderByCreatedAtDesc(event.getId())
                .map(LotteryAuditLog::getCurrentHash)
                .orElse("");
        LocalDateTime createdAt = LocalDateTime.now();
        String currentHash = lotteryHashService.sha256(previousHash
                + "|" + eventType.name()
                + "|" + (payload == null ? "" : payload)
                + "|" + createdAt);

        lotteryAuditLogRepository.save(LotteryAuditLog.builder()
                .event(event)
                .eventType(eventType)
                .payload(payload)
                .previousHash(previousHash.isBlank() ? null : previousHash)
                .currentHash(currentHash)
                .createdAt(createdAt)
                .build());
    }
}
