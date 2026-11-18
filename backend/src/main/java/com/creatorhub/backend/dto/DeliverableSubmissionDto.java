package com.creatorhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliverableSubmissionDto {

    @NotBlank(message = "Deliverable URL or post link is required")
    private String deliverableUrl;

    private String deliverableNotes;
}

