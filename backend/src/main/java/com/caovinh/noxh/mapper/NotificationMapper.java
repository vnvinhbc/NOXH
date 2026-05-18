package com.caovinh.noxh.mapper;

import com.caovinh.noxh.dto.response.NotificationResponse;
import com.caovinh.noxh.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "id", expression = "java(notification.getId().toString())")
    NotificationResponse toNotificationResponse(Notification notification);

    List<NotificationResponse> toNotificationResponseList(List<Notification> notifications);
}
