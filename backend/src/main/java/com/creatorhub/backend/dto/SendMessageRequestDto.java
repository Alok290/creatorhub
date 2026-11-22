package com.creatorhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequestDto {

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 3000, message = "Message must not exceed 3000 characters")
    private String content;
}
