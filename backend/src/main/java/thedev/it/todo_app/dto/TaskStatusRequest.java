package thedev.it.todo_app.dto;

import jakarta.validation.constraints.NotNull;
import thedev.it.todo_app.entity.Status;

public record TaskStatusRequest(
        @NotNull(message = "Le statut est obligatoire")
        Status status
) {}