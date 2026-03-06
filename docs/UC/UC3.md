# UC3 — Nhận phòng, Ký hợp đồng & Bàn giao (Check-in)

## Overview

| | |
| --- | --- |
| Actor | Khách hàng (Customer) |
| Goal | Verify lodging conditions, sign contract, hand over room |
| Triggers | UC2-3 deposit confirmed |
| Outcome | Contract active, room status = occupied |

## UC3-1: Kiểm tra điều kiện lưu trú (Include)

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales
    participant M as Quản lý
    participant Sys as System

    S->>Sys: Kiểm tra thông tin đặt cọc của khách
    S->>C: Đối chiếu giấy tờ tùy thân
    S->>C: Thu thập thông tin lưu trú cần thiết
    S->>M: Chuyển toàn bộ thông tin lưu trú
    M->>M: Kiểm tra điều kiện lưu trú từng khách
    alt Tất cả đủ điều kiện
        M->>S: Thông báo đã đủ điều kiện
        Note over S: Thực hiện UC3-2
    else Khách không hợp lệ (giấy tờ)
        S->>C: Hoàn 80% tiền cọc
        Note over S: Kết thúc UC3-1
    else Một số khách không đủ điều kiện
        M->>S: Thông báo khách không đủ điều kiện
        S->>C: Xác nhận lại nguyện vọng khách đủ điều kiện
        S->>C: Hoàn 80% tiền cọc cho khách không đủ
        Note over S: Kết thúc UC3-1
    end
```

## UC3-2: Lập hợp đồng

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales
    participant M as Quản lý
    participant K as Kế toán
    participant Sys as System

    S->>S: Lập hợp đồng thuê dựa trên thông tin xác nhận
    S->>C: Hướng dẫn nội dung hợp đồng
    C->>S: Ký hợp đồng
    S->>K: Chuyển hợp đồng đã ký
    K->>K: Tính toán các khoản cần thu theo hợp đồng
    K->>C: Thu các khoản phí ban đầu
    K->>K: Xác nhận đã thu đủ
    K->>M: Thông báo hoàn tất thu phí
    Sys->>Sys: Cập nhật trạng thái hợp đồng = active
    Note over M: Thực hiện UC3-3
```

## UC3-3: Nhận phòng

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant M as Quản lý
    participant Sys as System

    M->>M: Kiểm tra và ghi nhận tình trạng phòng trước bàn giao
    M->>C: Hướng dẫn quy định, nội quy lưu trú
    M->>C: Lập và ký biên bản bàn giao tài sản
    C->>M: Ký biên bản bàn giao
    M->>C: Bàn giao phòng và tài sản (chìa khóa, etc.)
    Sys->>Sys: Cập nhật trạng thái phòng = occupied
```
