package vn.edu.hcmus.homestay.application.model;

import java.util.List;

/** Framework-agnostic paginated result for the application layer.
 *  Web adapters map this to {@link vn.edu.hcmus.homestay.adapter.in.web.PaginatedResponse}. */
public record PageResult<T>(List<T> items, long total, int page, int limit) {
    public int totalPages() {
        return limit > 0 ? (int) Math.ceil((double) total / limit) : 0;
    }
}
