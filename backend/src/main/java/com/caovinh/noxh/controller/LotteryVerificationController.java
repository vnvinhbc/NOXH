package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.lottery.ApartmentUnitResponse;
import com.caovinh.noxh.dto.response.lottery.LotteryParticipantResponse;
import com.caovinh.noxh.dto.response.lottery.LotteryResultResponse;
import com.caovinh.noxh.dto.response.lottery.LotteryVerificationResponse;
import com.caovinh.noxh.service.lottery.LotteryEventService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/lottery-events")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LotteryVerificationController {

    LotteryEventService lotteryEventService;

    @GetMapping("/{eventId}/verification")
    ApiResponse<LotteryVerificationResponse> getVerification(@PathVariable UUID eventId) {
        return ApiResponse.<LotteryVerificationResponse>builder()
                .result(lotteryEventService.getVerification(eventId))
                .build();
    }

    @GetMapping("/{eventId}/participants.json")
    List<LotteryParticipantResponse> getParticipants(@PathVariable UUID eventId) {
        return lotteryEventService.getParticipants(eventId);
    }

    @GetMapping("/{eventId}/apartments.json")
    List<ApartmentUnitResponse> getApartments(@PathVariable UUID eventId) {
        return lotteryEventService.getApartments(eventId);
    }

    @GetMapping("/{eventId}/results.json")
    List<LotteryResultResponse> getResults(@PathVariable UUID eventId) {
        return lotteryEventService.getResults(eventId);
    }

    @GetMapping("/{eventId}/verification.json")
    LotteryVerificationResponse getVerificationJson(@PathVariable UUID eventId) {
        return lotteryEventService.getVerification(eventId);
    }
}
