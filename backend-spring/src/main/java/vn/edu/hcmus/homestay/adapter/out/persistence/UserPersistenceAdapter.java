package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.edu.hcmus.homestay.application.port.out.LoadUserPort;
import vn.edu.hcmus.homestay.application.port.out.SaveUserPort;
import vn.edu.hcmus.homestay.domain.model.user.User;

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
    public User save(User user) {
        return mapper.toDomain(jpaRepository.save(mapper.toEntity(user)));
    }
}
