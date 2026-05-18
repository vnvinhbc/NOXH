package com.caovinh.noxh.controller;

import com.caovinh.noxh.dto.response.ApiResponse;
import com.caovinh.noxh.dto.response.ProjectResponse;
import com.caovinh.noxh.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProjectController {

    ProjectService projectService;

    @GetMapping
    ApiResponse<List<ProjectResponse>> getAllProjects() {
        return ApiResponse.<List<ProjectResponse>>builder()
                .result(projectService.getAllProjects())
                .build();
    }

    @GetMapping("/{id}")
    ApiResponse<ProjectResponse> getProjectById(@PathVariable UUID id) {
        return ApiResponse.<ProjectResponse>builder()
                .result(projectService.getProjectById(id))
                .build();
    }
}
