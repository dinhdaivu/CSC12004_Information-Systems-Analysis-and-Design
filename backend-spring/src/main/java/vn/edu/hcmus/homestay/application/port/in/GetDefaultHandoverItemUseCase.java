package vn.edu.hcmus.homestay.application.port.in;

import java.util.List;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

public interface GetDefaultHandoverItemUseCase {

    List<DefaultHandoverItem> listAll();

    List<DefaultHandoverItem> resolve(String roomType);
}
