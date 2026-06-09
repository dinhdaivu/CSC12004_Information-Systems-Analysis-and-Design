package vn.edu.hcmus.homestay.adapter.out.persistence;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.hcmus.homestay.domain.model.user.AppRole;
import vn.edu.hcmus.homestay.domain.model.user.UserStatus;

interface UserJpaRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            SELECT u FROM UserEntity u
            WHERE (:search IS NULL OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:role IS NULL OR u.role = :role)
            AND (:status IS NULL OR u.status = :status)
            ORDER BY u.createdAt DESC
            """)
    Page<UserEntity> findWithFilters(
            @Param("search") String search,
            @Param("role") AppRole role,
            @Param("status") UserStatus status,
            Pageable pageable);
}
