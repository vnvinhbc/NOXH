package com.caovinh.noxh.service.lottery;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class LotteryRealtimeService {

    SimpMessagingTemplate messagingTemplate;

    public void publish(UUID eventId, String type, Object payload) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", type);
        message.put("payload", payload);
        messagingTemplate.convertAndSend((String) "/topic/lottery-events/" + eventId, (Object) message);
    }
}
