package com.caovinh.noxh.dto.response.admin;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminApplicationPageResponse {
    List<AdminApplicationResponse> items;
    int page;
    int limit;
    long totalElements;
    int totalPages;
    boolean first;
    boolean last;
}
