# BLOOM

BLOOM là website giới thiệu **viên nén từ xơ dừa**, được phát triển bởi **EXE101 Group 1 — FPT University**. Dự án hướng tới khai thác giá trị phụ phẩm nông nghiệp và truyền tải câu chuyện phát triển sản phẩm theo định hướng tuần hoàn.

Website đi kèm hệ thống quản trị nội dung để nhóm chủ động cập nhật trang, hình ảnh và tiếp nhận liên hệ hợp tác.

## Chức năng

- Giới thiệu BLOOM, sản phẩm, quy trình, định hướng bền vững và dự án EXE101.
- Quản lý trang và các section, menu, SEO và cấu hình website.
- Lưu nháp, xem trước riêng và xuất bản; bản nháp không thay đổi nội dung công khai.
- Thư viện ảnh với upload, chọn ảnh và kiểm tra ảnh đang được sử dụng.
- Form liên hệ lưu vào database; admin theo dõi trạng thái và ghi chú nội bộ.
- Dashboard từ dữ liệu thực, phân quyền admin và nhật ký hoạt động.

## Công nghệ

Next.js App Router, React, JavaScript/JSX, CSS Modules, PostgreSQL, Prisma, Zod, Argon2id và Cloudinary. Hiệu ứng giao diện sử dụng các bản thích ứng React Bits.

## Chạy local

Yêu cầu Node.js 24, npm và PostgreSQL. Cài dependencies bằng `npm ci`, sao chép `.env.example` thành `.env` và điền cấu hình kết nối cùng `SESSION_SECRET` ngẫu nhiên.

```sh
npm run db:migrate
npm run db:seed
npm run admin:create
npm run dev
```

Nếu chưa có PostgreSQL, chạy `npm run db:local` trước khi tạo `.env`; script tạo database và cấu hình local riêng. Giữ terminal database hoạt động rồi chạy các lệnh trên trong terminal khác.

Website: `http://localhost:3000` · Quản trị: `http://localhost:3000/admin`.

`admin:create` hỏi thông tin và mật khẩu kín; không có tài khoản mặc định. Đăng nhập → upload ảnh → sửa trang → lưu nháp → xem trước → xuất bản. CLI cũng hỗ trợ reset tài khoản đã có sau khi xác nhận `RESET`.

## Deploy Render

Trong Render chọn **New → Blueprint**, kết nối repository và dùng [render.yaml](render.yaml). Blueprint cấu hình Node Web Service, PostgreSQL, domain HTTPS, secret phiên và health check; nhập ba biến `CLOUDINARY_*` khi được hỏi. Khi dùng domain riêng, cập nhật `SITE_URL` theo domain chính thức.

Mẫu dùng Free cho demo. Chọn gói phù hợp và bật backup trước khi vận hành lâu dài; không sao chép database hoặc ảnh local lên Git. Storage production dùng Cloudinary. Xác minh proxy trước khi bật `TRUST_PROXY=true`.

Tạo admin qua `npm run admin:create` với kết nối database production. Render Free không có Shell: dùng CLI local với External Database URL có TLS và tạm cho phép IP của bạn kết nối DB. Giữ thông tin kết nối trong file env được ignore; đặt `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` trống để CLI hỏi thông tin mới. Đóng truy cập DB ngoài sau khi tạo admin và không giữ `ADMIN_PASSWORD` trong env deploy.

## Kiểm tra

```sh
npm run lint
npm run format:check
npm run build
npm run test:security
```

`test:security` cần Chromium (`npx playwright install chromium`); tự tạo và dọn database kiểm thử riêng. `npm test` và `npm run test:e2e` cần database kiểm thử đã migrate/seed. Kiểm tra env deploy bằng `npm run deploy:check -- --database`. Trên PowerShell chặn `npm.ps1`, dùng `npm.cmd`.

Hình ảnh ban đầu là minh họa. Nhóm cần duyệt ảnh thật, thông tin liên hệ và mô tả sản phẩm trước khi công bố. Thông tin bản quyền thư viện được giữ trong [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt).
