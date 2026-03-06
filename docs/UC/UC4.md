# UC4 — Trả phòng (Check-out)

## Overview

| | |
| --- | --- |
| Actor | Khách hàng (Customer) |
| Goal | Process check-out request, reconcile payments, hand back room |
| Triggers | Customer submits check-out request |
| Outcome | Contract terminated, deposit refunded or charged, room = available |

## UC4-1: Xử lý đơn đăng ký trả phòng

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant S as Nhân viên Sales
    participant M as Quản lý
    participant K as Kế toán
    participant Sys as System

    C->>S: Gửi đơn đăng ký trả phòng
    alt Thông tin không hợp lệ
        S->>C: Yêu cầu gửi lại đơn đăng ký
    else Thông tin hợp lệ
        S->>Sys: Kiểm tra thông tin đăng ký (hợp đồng, đặt cọc)
        S->>Sys: Ghi nhận thông tin phòng cần kiểm tra
        M->>M: Kiểm tra tình trạng thực tế phòng/giường
        M->>Sys: Ghi nhận tình trạng phòng, đối chiếu hợp đồng
        M->>K: Chuyển thông tin (tình trạng phòng, thời gian lưu trú)
        K->>K: Xác định mức hoàn cọc
        Note over K: Đã cọc, chưa ký HĐ → hoàn 80%\nHĐ, < 6 tháng → hoàn 50%\nHĐ, >= 6 tháng → hoàn 70%\nHết hạn HĐ → hoàn 100%
        K->>K: Khấu trừ chi phí phát sinh
        K->>K: Lập bảng đối soát / phiếu thanh toán
        K->>M: Báo lại thông tin đối soát
        Note over M: Thực hiện UC4-2
    end
```

## UC4-2: Xác nhận đối soát & thanh toán

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant M as Quản lý
    participant K as Kế toán

    M->>C: Thông báo chi tiết khấu trừ và số tiền hoàn cọc
    M->>C: Xác nhận đồng ý trả phòng theo kết quả đối soát
    alt Khách cần thanh toán thêm
        M->>K: Thông báo khách cần thanh toán thêm
        K->>C: Hướng dẫn thanh toán
        C->>K: Thanh toán
        alt Thanh toán thành công
            K->>K: Xác nhận thanh toán
            Note over K: Thực hiện UC4-3
        else Thanh toán thất bại
            K->>C: Yêu cầu thanh toán lại
        end
    else Khách được hoàn cọc
        M->>K: Thông báo hoàn cọc cho khách
        K->>C: Thống nhất phương thức hoàn (tiền mặt / chuyển khoản)
        K->>C: Thực hiện hoàn tiền
        Note over K: Thực hiện UC4-3
    end
```

## UC4-3: Trả phòng

```mermaid
sequenceDiagram
    actor C as Khách hàng
    participant M as Quản lý
    participant Sys as System

    M->>C: Cho khách ký biên bản trả phòng
    M->>C: Thanh lý hợp đồng thuê
    C->>M: Trả chìa khóa và tài sản
    Sys->>Sys: Cập nhật trạng thái hợp đồng = terminated / expired
    Sys->>Sys: Cập nhật trạng thái phòng = available
    Sys->>Sys: Cập nhật trạng thái đặt cọc = refunded / forfeited
```
