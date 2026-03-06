# UC2 — Đặt cọc & Xác nhận thuê (Deposit & Rental Confirmation)

## Overview

| | |
| --- | --- |
| Actor | Khách hàng (Customer) |
| Goal | Confirm room availability, collect documents, receive deposit |
| Triggers | UC1-3 (customer confirms intent to deposit) |
| Outcome | Room reserved in system → leads to UC3 |

## UC2-1: Xác nhận tình trạng phòng (Include)

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales
    participant M as Quản lý
    participant Sys as System

    S->>Sys: Rà soát thông tin khách + phòng đã chọn
    S->>M: Yêu cầu kiểm tra tình trạng phòng thực tế
    M->>M: Kiểm tra phòng (trống, vệ sinh, tài sản)
    M->>S: Gửi kết quả kiểm tra
    alt Phòng đạt yêu cầu
        S->>C: Thông báo phòng sẵn sàng
    else Phòng không đạt
        S->>C: Đề xuất phòng khác
    end
```

## UC2-2: Xác nhận nhu cầu thuê (Extends UC2)

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales
    participant K as Kế toán

    C->>S: Xác nhận quyết định thuê
    S->>C: Yêu cầu bổ sung thông tin (giấy tờ, thời gian, số người)
    C->>S: Cung cấp thông tin bổ sung
    alt Thông tin đầy đủ
        S->>S: Xác nhận thông tin
        S->>K: Chuyển thông tin thuê
        Note over S,K: Thực hiện UC2-3
    else Thông tin không đầy đủ
        S->>C: Yêu cầu bổ sung, tạm dừng
    end
```

## UC2-3: Xác nhận đặt cọc (Extends UC2)

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales
    participant M as Quản lý
    participant K as Kế toán
    participant Sys as System

    K->>K: Tính toán số tiền cọc theo quy định
    K->>S: Gửi thông tin tiền cọc
    S->>C: Thông báo số tiền cọc
    S->>C: Yêu cầu đặt cọc
    C->>S: Thanh toán tiền cọc
    S->>M: Gửi chứng từ đặt cọc để xác nhận
    M->>S: Xác nhận tình trạng đặt cọc
    alt Đặt cọc thành công
        S->>C: Thông báo đặt cọc thành công
        S->>Sys: Cập nhật trạng thái phòng = reserved
    else Không đặt cọc đúng hạn
        Note over Sys: Phòng không được giữ chỗ
    end
```
