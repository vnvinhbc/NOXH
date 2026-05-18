package com.caovinh.noxh.mapper;

import com.caovinh.noxh.dto.response.ProjectResponse;
import com.caovinh.noxh.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ProjectMapper {

    @Mapping(target = "id", expression = "java(project.getId().toString())")
    @Mapping(target = "status", expression = "java(project.getStatus().name())")
    @Mapping(target = "daysRemaining", ignore = true)
    ProjectResponse toProjectResponse(Project project);

    List<ProjectResponse> toProjectResponseList(List<Project> projects);
}
