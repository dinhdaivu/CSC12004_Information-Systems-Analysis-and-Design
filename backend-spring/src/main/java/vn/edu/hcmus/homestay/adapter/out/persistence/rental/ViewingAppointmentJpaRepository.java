package vn.edu.hcmus.homestay.adapter.out.persistence.rental;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface ViewingAppointmentJpaRepository extends JpaRepository<ViewingAppointmentEntity, UUID> {}
