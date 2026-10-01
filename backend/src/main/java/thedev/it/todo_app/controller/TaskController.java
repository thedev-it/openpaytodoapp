package thedev.it.todo_app.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import thedev.it.todo_app.dto.PageResponse;
import thedev.it.todo_app.dto.TaskRequest;
import thedev.it.todo_app.dto.TaskResponse;
import thedev.it.todo_app.dto.TaskStatusRequest;
import thedev.it.todo_app.entity.Priority;
import thedev.it.todo_app.entity.Status;
import thedev.it.todo_app.service.TaskService;

@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Tâches", description = "API de gestion des tâches")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lister les tâches", description = "Retourne une page de tâches. Filtres : status, priority, search. Tri via sortBy (createdAt|title|priority|status) et sortDir (asc|desc).")
    public PageResponse<TaskResponse> list(
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")   int page,
            @RequestParam(defaultValue = "10")  int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return service.search(status, priority, search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une tâche", description = "Renvoie les détails d'une tâche via son ID.")
    public TaskResponse get(@PathVariable Long id) {
        return service.findById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Créer une tâche", description = "Crée une nouvelle tâche.")
    public TaskResponse create(@Valid @RequestBody TaskRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Modifier une tâche", description = "Met à jour l'intégralité d'une tâche existante.")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Mettre à jour le statut", description = "Permet de changer uniquement le statut d'une tâche existante.")
    public TaskResponse updateStatus(@PathVariable Long id,
                                     @Valid @RequestBody TaskStatusRequest request) {
        return service.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Supprimer une tâche", description = "Supprime la tâche correspondante à l'ID.")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}