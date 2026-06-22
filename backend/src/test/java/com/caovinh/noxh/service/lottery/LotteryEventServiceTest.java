package com.caovinh.noxh.service.lottery;

import com.caovinh.noxh.constant.lottery.LotteryAuditEventType;
import com.caovinh.noxh.constant.lottery.LotteryEventStatus;
import com.caovinh.noxh.entity.LotteryEvent;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.repository.*;
import com.caovinh.noxh.service.PriorityScoringService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LotteryEventServiceTest {

    @Mock
    LotteryEventRepository lotteryEventRepository;
    @Mock
    ProjectRepository projectRepository;
    @Mock
    ApplicationRepository applicationRepository;
    @Mock
    ApartmentUnitRepository apartmentUnitRepository;
    @Mock
    LotteryParticipantRepository lotteryParticipantRepository;
    @Mock
    LotteryJobRepository lotteryJobRepository;
    @Mock
    LotteryResultRepository lotteryResultRepository;
    @Mock
    LotteryHashService lotteryHashService;
    @Mock
    LotteryDrawService lotteryDrawService;
    @Mock
    LotteryAuditService lotteryAuditService;
    @Mock
    LotteryRealtimeService lotteryRealtimeService;
    @Mock
    PriorityScoringService priorityScoringService;

    @InjectMocks
    LotteryEventService lotteryEventService;

    @Test
    void cancelEvent_usesBulkReleaseOperations() {
        UUID eventId = UUID.randomUUID();
        LotteryEvent event = LotteryEvent.builder()
                .id(eventId)
                .name("Dot quay test")
                .project(Project.builder().id(UUID.randomUUID()).name("NOXH Test").build())
                .status(LotteryEventStatus.LOCKED)
                .build();

        when(lotteryEventRepository.findByIdForUpdate(eventId)).thenReturn(Optional.of(event));
        when(lotteryResultRepository.existsByEventId(eventId)).thenReturn(false);
        when(apartmentUnitRepository.countByLockedEventId(eventId)).thenReturn(80L, 0L);
        when(lotteryParticipantRepository.countByEventId(eventId)).thenReturn(200L, 0L);
        when(apartmentUnitRepository.releaseLockedApartments(eventId)).thenReturn(80);
        when(applicationRepository.clearLotteryFieldsForEvent(eventId)).thenReturn(200);
        when(lotteryParticipantRepository.deleteByEventId(eventId)).thenReturn(200);
        when(lotteryJobRepository.deleteByLotteryEventId(eventId)).thenReturn(1);
        when(lotteryEventRepository.save(event)).thenReturn(event);

        var result = lotteryEventService.cancelEvent(eventId);

        assertThat(result.getStatus()).isEqualTo("CANCELLED");
        verify(apartmentUnitRepository).releaseLockedApartments(eventId);
        verify(applicationRepository).clearLotteryFieldsForEvent(eventId);
        verify(lotteryParticipantRepository).deleteByEventId(eventId);
        verify(lotteryJobRepository).deleteByLotteryEventId(eventId);
        verify(lotteryAuditService).log(event, LotteryAuditEventType.LOTTERY_CANCELLED,
                "releasedParticipants=200,releasedApartments=80");
        verify(lotteryParticipantRepository, never()).findByEventIdOrderByLotteryCodeAsc(eventId);
    }
}
