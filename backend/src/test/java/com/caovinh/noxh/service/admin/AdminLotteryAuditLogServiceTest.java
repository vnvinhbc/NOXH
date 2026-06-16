package com.caovinh.noxh.service.admin;

import com.caovinh.noxh.constant.lottery.LotteryAuditEventType;
import com.caovinh.noxh.dto.response.admin.AdminLotteryAuditLogResponse;
import com.caovinh.noxh.entity.LotteryAuditLog;
import com.caovinh.noxh.entity.LotteryEvent;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.repository.LotteryAuditLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminLotteryAuditLogServiceTest {

    @Mock
    LotteryAuditLogRepository lotteryAuditLogRepository;

    @InjectMocks
    AdminLotteryAuditLogService adminLotteryAuditLogService;

    @Test
    void getLogs_withoutEvent_returnsNewestLogsWithEventContext() {
        UUID eventId = UUID.randomUUID();
        LotteryEvent event = LotteryEvent.builder()
                .id(eventId)
                .name("Dot quay thang 6")
                .project(Project.builder().id(UUID.randomUUID()).name("Green Sky").build())
                .build();
        LotteryAuditLog log = LotteryAuditLog.builder()
                .id(UUID.randomUUID())
                .event(event)
                .eventType(LotteryAuditEventType.RESULT_HASH_CREATED)
                .payload("resultHash=abc")
                .previousHash("prev")
                .currentHash("curr")
                .createdAt(LocalDateTime.of(2026, 6, 16, 8, 30))
                .build();

        when(lotteryAuditLogRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(log));

        List<AdminLotteryAuditLogResponse> result = adminLotteryAuditLogService.getLogs(null);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEventId()).isEqualTo(eventId.toString());
        assertThat(result.get(0).getEventName()).isEqualTo("Dot quay thang 6");
        assertThat(result.get(0).getEventType()).isEqualTo("RESULT_HASH_CREATED");
        assertThat(result.get(0).getCurrentHash()).isEqualTo("curr");
    }

    @Test
    void getLogs_withEvent_returnsChronologicalChainForEvent() {
        UUID eventId = UUID.randomUUID();
        when(lotteryAuditLogRepository.findByEventIdOrderByCreatedAtAsc(eventId)).thenReturn(List.of());

        List<AdminLotteryAuditLogResponse> result = adminLotteryAuditLogService.getLogs(eventId);

        assertThat(result).isEmpty();
    }
}
