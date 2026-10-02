package thedev.it.todo_app.dto;

import java.time.LocalDateTime;
import thedev.it.todo_app.entity.Priority;
import thedev.it.todo_app.entity.Status;
import thedev.it.todo_app.entity.Task;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Status status,
        Priority priority,
        LocalDateTime createdAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getCreatedAt()
        );
    }
}