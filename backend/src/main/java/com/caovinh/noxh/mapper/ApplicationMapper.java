package com.caovinh.noxh.mapper;

import com.caovinh.noxh.dto.response.ApplicationDocumentResponse;
import com.caovinh.noxh.dto.response.ApplicationResponse;
import com.caovinh.noxh.entity.Application;
import com.caovinh.noxh.entity.ApplicationDocument;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    @Mapping(target = "id", expression = "java(application.getId().toString())")
    @Mapping(target = "userId", expression = "java(application.getUser().getId().toString())")
    @Mapping(target = "projectId", expression = "java(application.getProject().getId().toString())")
    @Mapping(target = "projectName", expression = "java(application.getProject().getName())")
    @Mapping(target = "status", expression = "java(application.getStatus().name())")
    ApplicationResponse toApplicationResponse(Application application);

    List<ApplicationResponse> toApplicationResponseList(List<Application> applications);

    @Mapping(target = "id", expression = "java(doc.getId().toString())")
    @Mapping(target = "documentType", expression = "java(doc.getDocumentType().name())")
    ApplicationDocumentResponse toDocumentResponse(ApplicationDocument doc);
}
