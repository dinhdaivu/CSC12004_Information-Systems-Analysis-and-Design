# Mermaid Sequence Diagrams For System Use Cases

This folder contains the Mermaid `sequenceDiagram` source files for all 21 system use cases from `report/content/2_System Analyze.tex`.

Each diagram follows the same layered style:

- Actor
- `HomeStay Dorm Web`
- `HomeStay Dorm API`
- `HomeStay Dorm DB`
- External services where needed, such as `Supabase Auth` and `VietQR`

The API routes used in these diagrams are documented in `docs/architecture/api-endpoints.md`.

Note: SUC diagrams use `{id}` as a generic placeholder for path parameters (for example, `/api/rooms/{id}`), while `docs/architecture/api-endpoints.md` may use the Express-style `:id` syntax (for example, `/api/rooms/:id`) for the same dynamic route segment.

| SUC | Diagram |
| --- | --- |
| SUC1: Đăng nhập | [SUC01-dang-nhap.mmd](SUC01-dang-nhap.mmd) |
| SUC2: Đăng ký thuê phòng | [SUC02-dang-ky-thue-phong.mmd](SUC02-dang-ky-thue-phong.mmd) |
| SUC3: Quản lý đăng ký thuê phòng | [SUC03-quan-ly-dang-ky-thue-phong.mmd](SUC03-quan-ly-dang-ky-thue-phong.mmd) |
| SUC4: Quản lý đặt cọc | [SUC04-quan-ly-dat-coc.mmd](SUC04-quan-ly-dat-coc.mmd) |
| SUC5: Thanh toán | [SUC05-thanh-toan.mmd](SUC05-thanh-toan.mmd) |
| SUC6: Quản lý thanh toán | [SUC06-quan-ly-thanh-toan.mmd](SUC06-quan-ly-thanh-toan.mmd) |
| SUC7: Quản lý hợp đồng | [SUC07-quan-ly-hop-dong.mmd](SUC07-quan-ly-hop-dong.mmd) |
| SUC8: Đối soát chi phí | [SUC08-doi-soat-chi-phi.mmd](SUC08-doi-soat-chi-phi.mmd) |
| SUC9: Tính toán chi phí | [SUC09-tinh-toan-chi-phi.mmd](SUC09-tinh-toan-chi-phi.mmd) |
| SUC10: Đăng ký trả phòng | [SUC10-dang-ky-tra-phong.mmd](SUC10-dang-ky-tra-phong.mmd) |
| SUC11: Quản lý đăng ký trả phòng | [SUC11-quan-ly-dang-ky-tra-phong.mmd](SUC11-quan-ly-dang-ky-tra-phong.mmd) |
| SUC12: Quản lý giường phòng | [SUC12-quan-ly-giuong-phong.mmd](SUC12-quan-ly-giuong-phong.mmd) |
| SUC13: Xem/tra cứu giường/phòng | [SUC13-xem-tra-cuu-giuong-phong.mmd](SUC13-xem-tra-cuu-giuong-phong.mmd) |
| SUC14: Sắp xếp lịch xem phòng | [SUC14-sap-xep-lich-xem-phong.mmd](SUC14-sap-xep-lich-xem-phong.mmd) |
| SUC15: Ghi nhận kết quả xem phòng | [SUC15-ghi-nhan-ket-qua-xem-phong.mmd](SUC15-ghi-nhan-ket-qua-xem-phong.mmd) |
| SUC16: Kiểm tra điều kiện lưu trú | [SUC16-kiem-tra-dieu-kien-luu-tru.mmd](SUC16-kiem-tra-dieu-kien-luu-tru.mmd) |
| SUC17: Nhận phòng và bàn giao | [SUC17-nhan-phong-va-ban-giao.mmd](SUC17-nhan-phong-va-ban-giao.mmd) |
| SUC18: Đăng ký tài khoản khách hàng | [SUC18-dang-ky-tai-khoan-khach-hang.mmd](SUC18-dang-ky-tai-khoan-khach-hang.mmd) |
| SUC19: Quản lý người dùng | [SUC19-quan-ly-nguoi-dung.mmd](SUC19-quan-ly-nguoi-dung.mmd) |
| SUC20: Xem trạng thái yêu cầu thuê/đặt phòng | [SUC20-xem-trang-thai-yeu-cau-thue-dat-phong.mmd](SUC20-xem-trang-thai-yeu-cau-thue-dat-phong.mmd) |
| SUC21: Tổng quan quản trị | [SUC21-tong-quan-quan-tri.mmd](SUC21-tong-quan-quan-tri.mmd) |
