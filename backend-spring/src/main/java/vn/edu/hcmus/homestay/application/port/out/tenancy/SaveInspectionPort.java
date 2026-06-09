package vn.edu.hcmus.homestay.application.port.out.tenancy;

import vn.edu.hcmus.homestay.domain.model.inspection.CheckoutInspection;

public interface SaveInspectionPort {

    CheckoutInspection save(CheckoutInspection i);
}
