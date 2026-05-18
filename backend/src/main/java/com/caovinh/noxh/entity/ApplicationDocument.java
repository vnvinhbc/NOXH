package com.caovinh.noxh.entity;

import com.caovinh.noxh.constant.DocumentType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "application_documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApplicationDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    Application application;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    DocumentType documentType;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    String fileUrl;

    @Column(name = "file_name")
    String fileName;

    @Builder.Default
    String status = "UPLOADED";

    @Column(name = "uploaded_at", nullable = false, updatable = false)
    @Builder.Default
    LocalDateTime uploadedAt = LocalDateTime.now();
}
