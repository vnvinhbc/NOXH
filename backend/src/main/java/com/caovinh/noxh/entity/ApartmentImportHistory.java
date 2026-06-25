package com.caovinh.noxh.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "apartment_import_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApartmentImportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    Project project;

    @Column(name = "original_file_name", nullable = false)
    String originalFileName;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    String fileUrl;

    @Column(name = "imported_count", nullable = false)
    Integer importedCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
