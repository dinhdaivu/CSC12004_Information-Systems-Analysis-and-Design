package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.SaveUserPort;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.User;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

@Component
class UserPersistenceAdapter implements LoadUserPort, SaveUserPort {

    private final UserJpaRepository jpaRepository;
    private final UserMapper mapper;

    UserPersistenceAdapter(UserJpaRepository jpaRepository, UserMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<User> loadByEmail(String email) {
        return jpaRepository.findByEmail(email).map(mapper::toDomain);
    }

    @Override
    public Optional<User> loadById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public Page<User> loadWithFilters(String search, AppRole role, UserStatus status, int page, int limit) {
        PageRequest pageable = PageRequest.of(page - 1, limit);
        return jpaRepository.findWithFilters(search, role, status, pageable).map(mapper::toDomain);
    }

    @Override
    public long countAll() {
        return jpaRepository.count();
    }

    @Override
    public User save(User user) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(user)));
    }
}
