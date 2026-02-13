---
name: vietnam-house-quote-pro
description: Chuyên gia báo giá xây dựng nhà dân dụng theo m2 tại Việt Nam. Sử dụng khi người dùng cần tính toán chi phí xây dựng dự kiến cho nhà phố, biệt thự, nhà cấp 4 dựa trên diện tích sàn và đơn giá thị trường 2026.
---

# Vietnam House Quote Pro

Skill này cung cấp quy trình và dữ liệu để lập báo giá sơ bộ cho các công trình nhà ở dân dụng tại Việt Nam, giúp chủ nhà và nhà thầu có cái nhìn tổng quan về ngân sách.

## Quy Trình Báo Giá

Để cung cấp một báo giá chính xác, hãy thực hiện theo các bước sau:

| Bước | Hành Động | Chi Tiết |
| :--- | :--- | :--- |
| **1. Thu thập thông tin** | Hỏi người dùng về các thông số cơ bản. | Diện tích đất, số tầng, loại mái, loại móng, phong cách kiến trúc và địa điểm. |
| **2. Tính Tổng DTXD** | Áp dụng hệ số hao phí cho từng hạng mục. | Tham khảo \`references/area_calculation.md\` để tính diện tích móng, sàn, mái, sân. |
| **3. Áp đơn giá** | Lựa chọn đơn giá phù hợp với phân khúc. | Tham khảo \`references/pricing_2026.md\` để lấy đơn giá phần thô hoặc trọn gói. |
| **4. Tổng hợp & Lưu ý** | Tính tổng chi phí và đưa ra các cảnh báo. | Tổng chi phí = Tổng DTXD × Đơn giá. Kèm theo lưu ý về vật tư và chi phí phát sinh. |

## Các Tài Nguyên Tham Khảo

- **Cách tính diện tích**: Xem tại \`references/area_calculation.md\` (Hệ số móng, mái, hầm...).
- **Đơn giá thị trường 2026**: Xem tại \`references/pricing_2026.md\` (Nhà phố, biệt thự, cấp 4).

## Hướng Dẫn Cho Manus

Khi thực hiện báo giá, bạn nên:

1. **Trình bày rõ ràng**: Sử dụng bảng để liệt kê chi tiết diện tích từng tầng và hạng mục.
2. **Phân biệt loại hình**: Làm rõ sự khác biệt giữa "Xây thô" (nhân công hoàn thiện) và "Trọn gói" (chìa khóa trao tay).
3. **Cảnh báo biến động**: Luôn nhắc nhở người dùng rằng đây là báo giá tham khảo, giá thực tế phụ thuộc vào bản vẽ thiết kế và chủng loại vật tư cụ thể.
4. **Hỏi thêm nếu thiếu**: Nếu thiếu thông tin về móng hoặc mái, hãy giả định loại phổ biến nhất (móng băng, mái BTCT) nhưng phải ghi chú rõ.

## Ví Dụ Mẫu

> **Yêu cầu**: Báo giá xây trọn gói nhà phố hiện đại 5x12m, 1 trệt 1 lầu, mái tôn, móng cọc.
> 
> **Kết quả dự kiến**:
> - Tầng trệt: 60m2
> - Lầu 1: 60m2
> - Móng cọc (50%): 30m2
> - Mái tôn (30%): 18m2
> **Tổng diện tích xây dựng**: 168m2
> **Đơn giá dự kiến (Gói khá)**: 6.500.000 VNĐ/m2
> **Tổng chi phí dự kiến**: ~1.092.000.000 VNĐ
