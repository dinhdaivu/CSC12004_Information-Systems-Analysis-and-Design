package vn.edu.hcmus.homestay.adapter.out.persistence.tenancy;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface HandoverJpaRepository extends JpaRepository<HandoverEntity, UUID> {}
