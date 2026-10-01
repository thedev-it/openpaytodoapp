package thedev.it.todo_app.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import thedev.it.todo_app.dto.TaskRequest;
import thedev.it.todo_app.dto.TaskResponse;
import thedev.it.todo_app.entity.Priority;
import thedev.it.todo_app.entity.Status;
import thedev.it.todo_app.entity.Task;
import thedev.it.todo_app.exception.TaskNotFoundException;
import thedev.it.todo_app.repository.TaskRepository;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository repository;

    @InjectMocks
    private TaskService service;

    private Task task;

    @BeforeEach
    void setUp() {
        task = new Task();
        org.springframework.test.util.ReflectionTestUtils.setField(task, "id", 1L);
        task.setTitle("Test Title");
        task.setDescription("Test Description");
        task.setStatus(Status.TODO);
        task.setPriority(Priority.HIGH);
    }

    @Test
    void findById_ShouldReturnTask_WhenTaskExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(task));

        TaskResponse response = service.findById(1L);

        assertNotNull(response);
        assertEquals("Test Title", response.title());
        verify(repository).findById(1L);
    }

    @Test
    void findById_ShouldThrowException_WhenTaskNotFound() {
        when(repository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(TaskNotFoundException.class, () -> service.findById(1L));
        verify(repository).findById(1L);
    }

    @Test
    void create_ShouldReturnCreatedTask() {
        TaskRequest request = new TaskRequest("Test Title", "Test Description", Status.TODO, Priority.HIGH);
        when(repository.save(any(Task.class))).thenReturn(task);

        TaskResponse response = service.create(request);

        assertNotNull(response);
        assertEquals("Test Title", response.title());
        verify(repository).save(any(Task.class));
    }

    @Test
    void update_ShouldUpdateAndReturnTask() {
        TaskRequest request = new TaskRequest("Updated Title", "Updated Description", Status.IN_PROGRESS, Priority.MEDIUM);
        when(repository.findById(1L)).thenReturn(Optional.of(task));
        when(repository.save(any(Task.class))).thenReturn(task);

        TaskResponse response = service.update(1L, request);

        assertNotNull(response);
        verify(repository).findById(1L);
        verify(repository).save(task);
    }

    @Test
    void delete_ShouldDeleteTask_WhenTaskExists() {
        when(repository.findById(1L)).thenReturn(Optional.of(task));

        service.delete(1L);

        verify(repository).findById(1L);
        verify(repository).delete(task);
    }
}
