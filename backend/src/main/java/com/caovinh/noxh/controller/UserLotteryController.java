package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.lottery.UserLotterySummaryResponse;
import com.caovinh.noxh.service.lottery.UserLotterySummaryService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/lottery-events")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserLotteryController {

    UserLotterySummaryService userLotterySummaryService;

    @GetMapping("/my-summary")
    ApiResponse<UserLotterySummaryResponse> getMySummary() {
        return ApiResponse.<UserLotterySummaryResponse>builder()
                .result(userLotterySummaryService.getMySummary())
                .build();
    }
}
