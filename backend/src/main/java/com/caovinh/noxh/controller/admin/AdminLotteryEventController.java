package com.caovinh.noxh.controller.admin;

import com.caovinh.noxh.dto.request.lottery.CreateLotteryEventRequest;
import com.caovinh.noxh.dto.request.lottery.StartLotteryRequest;
import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.lottery.ApartmentUnitResponse;
import com.caovinh.noxh.dto.response.lottery.LotteryEventResponse;
import com.caovinh.noxh.service.lottery.LotteryEventService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/lottery-events")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AdminLotteryEventController {

    LotteryEventService lotteryEventService;

    @GetMapping
    ApiResponse<List<LotteryEventResponse>> getEvents() {
        return ApiResponse.<List<LotteryEventResponse>>builder()
                .result(lotteryEventService.getEvents())
                .build();
    }

    @PostMapping
    ApiResponse<LotteryEventResponse> createEvent(@Valid @RequestBody CreateLotteryEventRequest request) {
        return ApiResponse.<LotteryEventResponse>builder()
                .result(lotteryEventService.createEvent(request))
                .build();
    }

    @PostMapping("/{eventId}/lock")
    ApiResponse<LotteryEventResponse> lockEvent(@PathVariable UUID eventId) {
        return ApiResponse.<LotteryEventResponse>builder()
                .result(lotteryEventService.lockEvent(eventId))
                .build();
    }

    @PostMapping("/{eventId}/start")
    ApiResponse<LotteryEventResponse> startEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody StartLotteryRequest request
    ) {
        return ApiResponse.<LotteryEventResponse>builder()
                .result(lotteryEventService.startEvent(eventId, request))
                .build();
    }

    @DeleteMapping("/{eventId}")
    ApiResponse<LotteryEventResponse> cancelEvent(@PathVariable UUID eventId) {
        return ApiResponse.<LotteryEventResponse>builder()
                .result(lotteryEventService.cancelEvent(eventId))
                .build();
    }

    @GetMapping("/apartment-units")
    ApiResponse<List<ApartmentUnitResponse>> getAvailableApartments(@RequestParam UUID projectId) {
        return ApiResponse.<List<ApartmentUnitResponse>>builder()
                .result(lotteryEventService.getAvailableApartments(projectId))
                .build();
    }
}
