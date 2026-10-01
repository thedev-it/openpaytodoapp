package thedev.it.todo_app.service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import thedev.it.todo_app.dto.PageResponse;
import thedev.it.todo_app.dto.TaskRequest;
import thedev.it.todo_app.dto.TaskResponse;
import thedev.it.todo_app.entity.Priority;
import thedev.it.todo_app.entity.Status;
import thedev.it.todo_app.entity.Task;
import thedev.it.todo_app.exception.TaskNotFoundException;
import thedev.it.todo_app.repository.TaskRepository;

@Service
public class TaskService {

    private final TaskRepository repository;

    public TaskService(TaskRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskResponse> search(Status status, Priority priority, String search, Pageable pageable) {
        Specification<Task> spec = buildSpecification(status, priority, search);
        Page<TaskResponse> page = repository.findAll(spec, pageable)
                .map(TaskResponse::from);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public TaskResponse findById(Long id) {
        return TaskResponse.from(getOrThrow(id));
    }

    @Transactional
    public TaskResponse create(TaskRequest request) {
        Task task = new Task();
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    @Transactional
    public TaskResponse update(Long id, TaskRequest request) {
        Task task = getOrThrow(id);
        apply(task, request);
        return TaskResponse.from(repository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(Long id, Status status) {
        Task task = getOrThrow(id);
        task.setStatus(status);
        return TaskResponse.from(repository.save(task));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(getOrThrow(id));
    }

    private Task getOrThrow(Long id) {
        return repository.findById(id).orElseThrow(() -> new TaskNotFoundException(id));
    }

    private void apply(Task task, TaskRequest request) {
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status());
        task.setPriority(request.priority());
    }

    private Specification<Task> buildSpecification(Status status, Priority priority, String search) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + search.trim().toLowerCase() + "%"));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}