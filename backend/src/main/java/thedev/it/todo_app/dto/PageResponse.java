package thedev.it.todo_app.dto;

import java.util.List;
import org.springframework.data.domain.Page;

public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        String sortBy,
        String sortDir
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        String sortBy = page.getSort().isSorted()
                ? page.getSort().iterator().next().getProperty()
                : "createdAt";
        String sortDir = page.getSort().isSorted()
                ? page.getSort().iterator().next().getDirection().name().toLowerCase()
                : "desc";
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                sortBy,
                sortDir
        );
    }
}
