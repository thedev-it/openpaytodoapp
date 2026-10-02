package thedev.it.todo_app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import thedev.it.todo_app.entity.Priority;
import thedev.it.todo_app.entity.Status;

public record TaskRequest(
        @NotBlank(message = "Le titre est obligatoire")
        @Size(max = 150, message = "Le titre ne doit pas dépasser 150 caractères")
        String title,

        @Size(max = 1000, message = "La description ne doit pas dépasser 1000 caractères")
        String description,

        @NotNull(message = "Le statut est obligatoire")
        Status status,

        @NotNull(message = "La priorité est obligatoire")
        Priority priority
) {}