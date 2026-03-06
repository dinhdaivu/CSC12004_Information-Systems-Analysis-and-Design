# UC1 — Tư vấn & Tiếp nhận yêu cầu (Inquiry & Consultation)

## Overview

| | |
| --- | --- |
| Actor | Khách hàng (Customer) |
| Goal | Receive rental inquiry, advise customer, schedule room visit |
| Triggers | Customer contacts Sales |
| Outcome | Room visit scheduled → leads to UC2 |

## UC1-1: Tiếp nhận yêu cầu

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales

    C->>S: Liên hệ yêu cầu thuê phòng
    S->>C: Tiếp nhận thông tin nhu cầu
    S->>C: Tư vấn các loại phòng/dịch vụ
    alt Có phòng phù hợp
        S->>C: Xác nhận nhu cầu thuê
    else Không có phòng phù hợp
        S->>C: Gợi ý dịch vụ khác
    end
```

## UC1-2: Ghi nhận đăng ký & sắp xếp lịch xem phòng

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales
    participant Sys as System

    S->>Sys: Kiểm tra tình trạng phòng
    alt Phòng có sẵn
        S->>C: Đối chiếu yêu cầu với quy định
        S->>Sys: Ghi nhận thông tin đăng ký
        S->>C: Sắp xếp lịch xem phòng
    else Phòng không có sẵn
        S->>C: Đề xuất loại phòng/dịch vụ khác
    end
```

## UC1-3: Xem phòng

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales

    S->>C: Dẫn khách đến xem phòng thực tế
    S->>C: Giới thiệu thông tin phòng
    alt Khách hàng hài lòng
        S->>C: Xác nhận nhu cầu đặt cọc
        Note over S,C: Chuyển sang UC2-1
    else Khách hàng không hài lòng
        S->>C: Gợi ý các lựa chọn phòng khác
    end
```
