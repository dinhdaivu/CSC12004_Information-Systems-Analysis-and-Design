package vn.edu.hcmus.homestay.adapter.out.persistence;

import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

@Component
class DefaultHandoverItemMapper {

    DefaultHandoverItem toDomain(DefaultHandoverItemEntity e) {
        return new DefaultHandoverItem(
                e.getId(),
                e.getRoomTypeMatch(),
                e.getItemName(),
                e.getDefaultCondition(),
                e.getSortOrder(),
                e.isActive(),
                e.getCreatedAt(),
                e.getUpdatedAt());
    }

    DefaultHandoverItemEntity toEntity(DefaultHandoverItem d) {
        DefaultHandoverItemEntity e = new DefaultHandoverItemEntity();
        if (d.getId() != null) {
            e.setId(d.getId());
        }
        e.setRoomTypeMatch(d.getRoomTypeMatch());
        e.setItemName(d.getItemName());
        e.setDefaultCondition(d.getDefaultCondition());
        e.setSortOrder(d.getSortOrder());
        e.setActive(d.isActive());
        return e;
    }
}
