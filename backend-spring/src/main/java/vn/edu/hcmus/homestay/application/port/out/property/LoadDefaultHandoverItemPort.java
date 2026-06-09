package vn.edu.hcmus.homestay.application.port.out.property;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

public interface LoadDefaultHandoverItemPort {

    List<DefaultHandoverItem> loadAll();

    List<DefaultHandoverItem> resolve(String roomType);

    Optional<DefaultHandoverItem> loadById(UUID id);
}
