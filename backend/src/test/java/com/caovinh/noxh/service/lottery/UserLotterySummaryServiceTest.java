package com.caovinh.noxh.service.lottery;

import com.caovinh.noxh.constant.ApplicationStatus;
import com.caovinh.noxh.constant.lottery.LotteryEventStatus;
import com.caovinh.noxh.constant.lottery.LotteryPoolType;
import com.caovinh.noxh.constant.lottery.LotteryResultType;
import com.caovinh.noxh.dto.response.lottery.UserLotterySummaryResponse;
import com.caovinh.noxh.entity.*;
import com.caovinh.noxh.repository.ApplicationRepository;
import com.caovinh.noxh.repository.LotteryParticipantRepository;
import com.caovinh.noxh.repository.LotteryResultRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserLotterySummaryServiceTest {

    @Mock
    ApplicationRepository applicationRepository;

    @Mock
    LotteryParticipantRepository lotteryParticipantRepository;

    @Mock
    LotteryResultRepository lotteryResultRepository;

    @InjectMocks
    UserLotterySummaryService userLotterySummaryService;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void getMySummary_returnsLotteryContextForCurrentUserApplication() {
        UUID userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId.toString(), null));

        User user = User.builder().id(userId).fullName("Nguyen Van A").email("a@example.com").build();
        Project project = Project.builder().id(UUID.randomUUID()).name("Evergreen").build();
        Application application = Application.builder()
                .id(UUID.randomUUID())
                .user(user)
                .project(project)
                .status(ApplicationStatus.LOTTERY_QUALIFIED)
                .priorityScore(100)
                .priorityCategory("Nguoi co cong voi cach mang")
                .lotteryNumber("HA-ABC12345")
                .build();
        LotteryEvent event = LotteryEvent.builder()
                .id(UUID.randomUUID())
                .project(project)
                .name("Dot quay thang 6")
                .status(LotteryEventStatus.COMPLETED)
                .participantHash("participant-hash")
                .apartmentHash("apartment-hash")
                .finalSeed("final-seed")
                .resultHash("result-hash")
                .startedAt(LocalDateTime.of(2026, 6, 16, 8, 30))
                .completedAt(LocalDateTime.of(2026, 6, 16, 8, 45))
                .build();
        LotteryParticipant participant = LotteryParticipant.builder()
                .id(UUID.randomUUID())
                .event(event)
                .application(application)
                .lotteryCode("HA-ABC12345")
                .poolType(LotteryPoolType.PRIORITY)
                .priorityTags("Nguoi co cong voi cach mang")
                .build();
        LotteryResult result = LotteryResult.builder()
                .id(UUID.randomUUID())
                .event(event)
                .participant(participant)
                .lotteryCode("HA-ABC12345")
                .poolType(LotteryPoolType.PRIORITY)
                .resultType(LotteryResultType.GUARANTEED)
                .apartmentCode("A-1204")
                .drawOrder(1)
                .winnerUnitHash("winner-hash")
                .unitRandomValue("unit-random")
                .build();

        when(applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(application));
        when(lotteryParticipantRepository.findTopByApplicationIdOrderByCreatedAtDesc(application.getId()))
                .thenReturn(Optional.of(participant));
        when(lotteryResultRepository.findByParticipantId(participant.getId())).thenReturn(Optional.of(result));

        UserLotterySummaryResponse response = userLotterySummaryService.getMySummary();

        assertThat(response.getApplicationId()).isEqualTo(application.getId().toString());
        assertThat(response.getEventId()).isEqualTo(event.getId().toString());
        assertThat(response.getEventName()).isEqualTo("Dot quay thang 6");
        assertThat(response.getEventStatus()).isEqualTo("COMPLETED");
        assertThat(response.getLotteryCode()).isEqualTo("HA-ABC12345");
        assertThat(response.getPoolType()).isEqualTo("PRIORITY");
        assertThat(response.getResultType()).isEqualTo("GUARANTEED");
        assertThat(response.getApartmentCode()).isEqualTo("A-1204");
        assertThat(response.getResultHash()).isEqualTo("result-hash");
    }

    @Test
    void getMySummary_withoutApplication_returnsEmptyState() {
        UUID userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(userId.toString(), null));
        when(applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

        UserLotterySummaryResponse response = userLotterySummaryService.getMySummary();

        assertThat(response.getApplicationId()).isNull();
        assertThat(response.getApplicationStatus()).isNull();
        assertThat(response.getEventId()).isNull();
    }
}
