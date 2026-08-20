# nivo-fe

[![Codecov](https://codecov.io/gh/starci-lab/nivo-fe/graph/badge.svg)](https://app.codecov.io/gh/starci-lab/nivo-fe)
[![SonarQube Quality Gate](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=alert_status&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)
[![SonarQube Coverage](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=coverage&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)
[![SonarQube Bugs](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=bugs&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)
[![SonarQube Vulnerabilities](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=vulnerabilities&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)
[![SonarQube Code Smells](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=code_smells&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)
[![SonarQube Maintainability](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=sqale_rating&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)
[![SonarQube Reliability](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=reliability_rating&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)
[![SonarQube Security](https://sonar.starci.org/api/project_badges/measure?project=nivo-fe&metric=security_rating&token=sqb_00861dd6f09b4a16b455962e3e1e56c59dab8de5)](https://sonar.starci.org/dashboard?id=nivo-fe)

Monorepo giao diện của nivo: ba ứng dụng dựng trên **một** bản canon dùng chung.

```
apps/app        @nivo/app       :3067   bảng điều khiển cấp phát và vận hành (core slot)
apps/expert     @nivo/expert    :4067   học viện của một chuyên gia (academy slot +1000)
apps/landing    @nivo/landing   :5067   trang giới thiệu (landing slot +2000)
packages/ui     @nivo/ui                canon dùng chung
```

## Vì sao có `packages/ui`

Repo trước cũng là monorepo, nhưng mỗi app giữ một cây `components/` riêng. Cái giá không nằm ở
chuyện trùng lặp nói chung: **mười file tự khai lại cùng một kiểu**
`ComponentType<SVGProps<SVGSVGElement>>`, nên nhà cung cấp icon đã rò ra mười chỗ và không một sửa
đổi nào gỡ được nó. Gỡ tay bốn mươi file đã tốn một ngày và để lại 499 lỗi biên dịch.

Một tầng nằm ở đây thì không trôi được, vì không có chỗ nào để trôi tới.

## Cái gì được ở trong `packages/ui`

Mọi thứ **dưới** block: sổ đăng ký contract, leaf, composite, branch, shell.

Một **block** mang nghĩa nghiệp vụ nên thuộc về app sở hữu tính năng đó. Đặt block vào đây là bắt
gói dùng chung phải biết khoá học, hoá đơn hay hero của trang landing là gì — nó không được biết.

Sổ đăng ký là ngoại lệ đáng gọi tên: **máy móc** dùng chung nhưng **các mục** là của riêng sản phẩm,
nên bảng bắt đầu nhỏ và lớn lên từng mục một, mỗi mục có một `why` người đọc đối chiếu được với màn
hình.

## Nhà cung cấp icon

Chỉ `@heroicons/react`, và **chỉ leaf `Icon` được gọi tên glyph của nhà cung cấp**. Người gọi đặt
tên theo *nghĩa*: `refresh` sống sót qua một lần đổi gói icon, `ArrowClockwiseIcon` thì không.

`@phosphor-icons/react` không có mặt trong repo này, có chủ đích.

## Chạy

```bash
npm install
npm run dev:app
```

`npm run build` · `npm run typecheck` · `npm run lint` chạy qua turbo cho cả bốn workspace.

## Trạng thái

Khung đã dựng và đã kiểm chứng: 3/3 app build xanh, 4/4 workspace typecheck xanh, và một leaf từ
`@nivo/ui` render ra đúng đường kính trong trình duyệt — tức là liên kết workspace, bước transpile
của Next và dòng `@source` của Tailwind đều thông. Màn hình thật dựng tiếp trên khung này.
