package com.caovinh.noxh.service;

import com.caovinh.noxh.dto.response.ProjectResponse;
import com.caovinh.noxh.entity.Project;
import com.caovinh.noxh.exception.AppException;
import com.caovinh.noxh.exception.ErrorCode;
import com.caovinh.noxh.mapper.ProjectMapper;
import com.caovinh.noxh.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProjectService {

    ProjectRepository projectRepository;
    ProjectMapper projectMapper;

    public List<ProjectResponse> getAllProjects() {
        List<Project> projects = projectRepository.findAllByOrderByCreatedAtDesc();
        return projects.stream()
                .map(p -> {
                    ProjectResponse response = projectMapper.toProjectResponse(p);
                    if (p.getRegistrationEnd() != null) {
                        long days = ChronoUnit.DAYS.between(LocalDate.now(), p.getRegistrationEnd());
                        response.setDaysRemaining(days > 0 ? days : 0L);
                    }
                    return response;
                })
                .toList();
    }

    public ProjectResponse getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        ProjectResponse response = projectMapper.toProjectResponse(project);
        if (project.getRegistrationEnd() != null) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), project.getRegistrationEnd());
            response.setDaysRemaining(days > 0 ? days : 0L);
        }
        return response;
    }
}
