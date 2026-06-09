package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadDefaultHandoverItemPort;
import vn.edu.hcmus.homestay.application.port.out.SaveDefaultHandoverItemPort;
import vn.edu.hcmus.homestay.domain.model.defaulthandoveritem.DefaultHandoverItem;

@Component
class DefaultHandoverItemPersistenceAdapter
        implements LoadDefaultHandoverItemPort, SaveDefaultHandoverItemPort {

    private final DefaultHandoverItemJpaRepository jpaRepository;
    private final DefaultHandoverItemMapper mapper;

    DefaultHandoverItemPersistenceAdapter(
            DefaultHandoverItemJpaRepository jpaRepository, DefaultHandoverItemMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public List<DefaultHandoverItem> loadAll() {
        return jpaRepository.findAllByOrderBySortOrderAsc().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<DefaultHandoverItem> resolve(String roomType) {
        return jpaRepository.resolve(roomType).stream().map(mapper::toDomain).toList();
    }

    @Override
    public Optional<DefaultHandoverItem> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public DefaultHandoverItem save(DefaultHandoverItem item) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(item)));
    }

    @Override
    public void delete(UUID id) {
        jpaRepository.deleteById(id);
    }
}
