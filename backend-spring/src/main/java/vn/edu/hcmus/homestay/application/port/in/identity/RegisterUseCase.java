package vn.edu.hcmus.homestay.application.port.in.identity;

public interface RegisterUseCase {

    String register(RegisterCommand command);

    record RegisterCommand(String email, String password, String confirmPassword) {}
}
