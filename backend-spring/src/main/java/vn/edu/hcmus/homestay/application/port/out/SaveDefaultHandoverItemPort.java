package vn.edu.hcmus.homestay.application.port.out;

import java.util.UUID;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

public interface SaveDefaultHandoverItemPort {

    DefaultHandoverItem save(DefaultHandoverItem item);

    void delete(UUID id);
}
