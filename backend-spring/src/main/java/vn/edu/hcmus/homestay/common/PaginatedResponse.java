package vn.edu.hcmus.homestay.common;

import java.util.List;

public class PaginatedResponse<T> {

    private final boolean success = true;
    private final List<T> data;
    private final Pagination pagination;

    public PaginatedResponse(List<T> data, Pagination pagination) {
        this.data = data;
        this.pagination = pagination;
    }

    public boolean isSuccess() {
        return success;
    }

    public List<T> getData() {
        return data;
    }

    public Pagination getPagination() {
        return pagination;
    }

    public record Pagination(int page, int limit, long total, int pages) {}
}
