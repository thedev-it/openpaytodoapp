package thedev.it.todo_app.exception;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Long id) {
        super("Tâche introuvable avec l'identifiant " + id);
    }
}