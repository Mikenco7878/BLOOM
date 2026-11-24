// Seed copy is a project proposal, not a record of completed experiments.
const block = (id, type, data, sortOrder = 0) => ({ id, type, data, sortOrder, enabled: true });
const cta = (label = 'Liên hệ hợp tác', href = '/lien-he') => ({ label, href });
const values = [
  {
    iconKey: 'recycle',
    title: 'Thêm một vòng đời',
    description: 'Tìm hướng ứng dụng mới cho phụ phẩm xơ dừa, bắt đầu từ những điều gần gũi.',
  },
  {
    iconKey: 'package',
    title: 'Gọn gàng, thiết thực',
    description: 'Nghiên cứu dạng viên nén để việc bảo quản, vận chuyển và sử dụng thuận tiện hơn.',
  },
  {
    iconKey: 'leaf',
    title: 'Tư duy tuần hoàn',
    description: 'Đặt việc sử dụng tài nguyên có trách nhiệm vào quá trình phát triển sản phẩm.',
  },
  {
    iconKey: 'shield',
    title: 'Minh bạch từ gốc',
    description: 'Chia sẻ đúng những gì được xác minh, học hỏi từ mỗi bước thử nghiệm.',
  },
];
const esg = [
  {
    iconKey: 'leaf',
    title: 'Môi trường',
    description:
      'Hướng đến tận dụng phụ phẩm xơ dừa và giảm lãng phí tài nguyên trong quá trình phát triển.',
  },
  {
    iconKey: 'users',
    title: 'Cộng đồng',
    description:
      'Mong muốn kết nối người trồng cây, nhà vườn và những người cùng quan tâm đến lối sống xanh.',
  },
  {
    iconKey: 'shield',
    title: 'Minh bạch',
    description:
      'Theo đuổi thông tin rõ ràng về nguyên liệu, quá trình nghiên cứu và quản lý dự án.',
  },
];
const milestones = [
  {
    title: 'Gieo ý tưởng',
    description: 'Tìm hiểu nguồn xơ dừa, khảo sát nhu cầu và xây dựng hướng nghiên cứu.',
    status: 'PLANNED',
  },
  {
    title: 'Phát triển mẫu',
    description: 'Nghiên cứu phối trộn, cấu trúc viên nén và tính tiện dụng của mẫu.',
    status: 'PLANNED',
  },
  {
    title: 'Lắng nghe thị trường',
    description: 'Dự kiến thu thập phản hồi về mẫu, bao bì và hướng dẫn sử dụng.',
    status: 'PLANNED',
  },
  {
    title: 'Phát triển cùng nhau',
    description: 'Xem xét tối ưu quy trình, chi phí và tìm đối tác phù hợp.',
    status: 'PLANNED',
  },
];
const process = [
  {
    title: 'Tìm hiểu nguyên liệu',
    description: 'Khảo sát và lựa chọn nguồn xơ dừa phù hợp cho nghiên cứu.',
  },
  { title: 'Nghiên cứu xử lý', description: 'Tìm hiểu phương pháp xử lý và đặc tính nguyên liệu.' },
  { title: 'Tạo mẫu viên nén', description: 'Dự kiến thử nghiệm phối trộn và cấu trúc viên.' },
  {
    title: 'Đánh giá & hoàn thiện',
    description: 'Dự kiến kiểm tra mẫu, thu thập phản hồi và nghiên cứu bao bì.',
  },
];
const closing = block('closing', 'cta_banner', {
  eyebrow: 'CÙNG BLOOM VIẾT TIẾP',
  heading: 'Một khởi đầu nhỏ.\nMột tương lai xanh.',
  description:
    'Bạn là người trồng cây, nhà vườn hay đối tác cùng chung định hướng? BLOOM mong được lắng nghe bạn.',
  cta: cta(),
  variant: 'forest',
});
const hero = (
  heading,
  description,
  imageId = 'illustration-botanical',
  eyebrow = 'BLOOM · GIEO GIÁ TRỊ XANH',
) => ({
  eyebrow,
  heading,
  description,
  imageId,
  primaryCta: cta('Khám phá sản phẩm', '/san-pham'),
  secondaryCta: cta('Tìm hiểu BLOOM', '/ve-bloom'),
});
const page = (title, slug, navLabel, sections, navOrder, showInNav = true) => ({
  title,
  slug,
  type: slug ? 'STANDARD' : 'HOME',
  status: 'PUBLISHED',
  navLabel,
  showInNav,
  navOrder,
  seoTitle: `${title} | BLOOM`,
  seoDescription:
    sections[0].data.description ||
    'BLOOM — Dự án viên nén từ xơ dừa của EXE101 Group 1, FPT University.',
  ogImageId: null,
  sections: sections.map((section, index) => ({
    ...section,
    id: `${slug || 'home'}-${section.id}`,
    sortOrder: index,
  })),
});

export const seedPages = [
  page(
    'Từ xơ dừa, nảy mầm giá trị mới',
    '',
    'Trang chủ',
    [
      block(
        'hero',
        'hero',
        hero(
          'Từ xơ dừa,\nnảy mầm\ngiá trị mới.',
          'BLOOM phát triển viên nén từ xơ dừa, hướng đến giải pháp trồng cây tiện lợi và khai thác hiệu quả phụ phẩm nông nghiệp.',
        ),
      ),
      block('story', 'image_text', {
        eyebrow: 'CÂU CHUYỆN CỦA BLOOM',
        heading: 'Thiên nhiên không bỏ đi.\nChỉ chờ được tiếp nối.',
        paragraphs: [
          'Một vỏ dừa sau khi được sử dụng vẫn còn những sợi xơ mang theo cơ hội. BLOOM bắt đầu từ câu hỏi: làm thế nào để phụ phẩm quen thuộc ấy có thêm một hành trình?',
          'Từ dự án EXE101 tại FPT University, chúng tôi tìm hiểu hướng phát triển viên nén từ xơ dừa — nhỏ gọn trong hình thức, có trách nhiệm trong cách nghĩ.',
        ],
        imageId: 'illustration-coconut',
        imagePosition: 'left',
        cta: cta('Câu chuyện BLOOM', '/ve-bloom'),
      }),
      block('values', 'feature_grid', {
        eyebrow: 'NHỮNG ĐIỀU CHÚNG TÔI THEO ĐUỔI',
        heading: 'Giá trị từ những điều giản dị.',
        description: 'Mỗi lựa chọn nhỏ là một bước tiến đến cách phát triển có trách nhiệm hơn.',
        items: values,
      }),
      block('product', 'image_text', {
        eyebrow: 'LÀM QUEN VỚI SẢN PHẨM',
        heading: 'Viên nén từ xơ dừa.\nMột ý tưởng đang lớn.',
        paragraphs: [
          'Dạng viên nén là hướng nghiên cứu của BLOOM để tận dụng xơ dừa và mang đến trải nghiệm trồng cây thuận tiện hơn.',
          'Chúng tôi đang xây dựng lộ trình tìm hiểu nguyên liệu, phát triển mẫu và đánh giá tính tiện dụng. Thông số và hướng dẫn sẽ được cập nhật khi có dữ liệu xác minh.',
        ],
        imageId: 'illustration-fiber',
        imagePosition: 'right',
        cta: cta('Khám phá sản phẩm', '/san-pham'),
      }),
      block('process', 'process_steps', {
        eyebrow: 'TỪ Ý TƯỞNG ĐẾN THỰC TẾ',
        heading: 'Từng bước, có trách nhiệm.',
        description:
          'Lộ trình nghiên cứu dự kiến của BLOOM. Tiến độ thực tế sẽ được nhóm cập nhật sau khi xác minh.',
        steps: process,
      }),
      block('esg', 'esg_grid', {
        eyebrow: 'PHÁT TRIỂN BỀN VỮNG',
        heading: 'Lớn lên cùng một hệ sinh thái.',
        description: 'Ba định hướng xuyên suốt quá trình phát triển dự án.',
        items: esg,
      }),
      block('team', 'rich_text', {
        eyebrow: 'NHỮNG NGƯỜI GIEO MẦM',
        heading: 'Một dự án sinh viên.\nMột tinh thần nghiêm túc.',
        paragraphs: [
          'BLOOM là dự án của EXE101 Group 1 — FPT University. Chúng tôi học cách biến một ý tưởng về phụ phẩm nông nghiệp thành một hướng sản phẩm có cơ sở, bằng nghiên cứu, thử nghiệm và sự lắng nghe.',
        ],
      }),
      closing,
    ],
    0,
  ),
  page(
    'Về BLOOM',
    've-bloom',
    'Về BLOOM',
    [
      block('hero', 'hero', {
        ...hero(
          'Từ một câu hỏi,\nmở ra một\nhành trình.',
          'BLOOM tìm cảm hứng từ xơ dừa và những cơ hội còn nằm trong phụ phẩm nông nghiệp.',
          'illustration-coconut',
          'CÂU CHUYỆN THƯƠNG HIỆU',
        ),
        primaryCta: cta('Xem hành trình', '/hanh-trinh'),
      }),
      block('story', 'rich_text', {
        eyebrow: 'ĐIỂM KHỞI ĐẦU',
        heading: 'Nhìn điều quen thuộc bằng một cách mới.',
        paragraphs: [
          'Xơ dừa hiện diện trong đời sống, trong khu vườn và trong hoạt động chế biến dừa. Với BLOOM, đây là điểm khởi đầu để nghiên cứu thêm những cách ứng dụng thiết thực.',
          'Chúng tôi đặt mục tiêu tìm hiểu nguyên liệu và phát triển viên nén từ xơ dừa cho nhu cầu trồng cây thường ngày. Các đặc tính sản phẩm cần được kiểm tra trước khi công bố.',
          'Sứ mệnh của dự án là tăng giá trị cho phụ phẩm nông nghiệp, khuyến khích tư duy tuần hoàn và xây dựng thói quen truyền thông dựa trên dữ liệu.',
        ],
      }),
      block('values', 'feature_grid', { heading: 'Những giá trị dẫn đường.', items: values }),
      block('team', 'team_grid', {
        eyebrow: 'ĐỘI NGŨ DỰ ÁN',
        heading: 'Cùng học, cùng thử, cùng lớn lên.',
        members: [
          {
            name: 'EXE101 — Group 1',
            role: 'Nhóm phát triển dự án BLOOM',
            description:
              'FPT University · Nghiên cứu ý tưởng, phát triển sản phẩm và kết nối đối tác.',
          },
        ],
      }),
      closing,
    ],
    1,
  ),
  page(
    'Viên nén từ xơ dừa BLOOM',
    'san-pham',
    'Sản phẩm',
    [
      block('hero', 'hero', {
        ...hero(
          'Nhỏ gọn hình thức.\nRộng mở tiềm năng.',
          'Viên nén từ xơ dừa BLOOM là hướng sản phẩm đang được nghiên cứu về nguyên liệu, cấu trúc và tính tiện dụng.',
          'illustration-fiber',
          'SẢN PHẨM BLOOM',
        ),
        primaryCta: cta('Liên hệ tìm hiểu'),
        secondaryCta: cta('Quy trình nghiên cứu', '/quy-trinh'),
      }),
      block('about', 'rich_text', {
        heading: 'Xơ dừa, dưới một hình thức mới.',
        paragraphs: [
          'BLOOM nghiên cứu dạng viên nén với kỳ vọng thuận tiện hơn cho bảo quản, vận chuyển và sử dụng. Đây là định hướng phát triển, chưa phải khẳng định hiệu quả đã được đo lường.',
          'Phân loại sản phẩm, thành phần định lượng, kích thước, độ trương nở và hướng dẫn sử dụng sẽ được công bố sau khi nhóm có kết quả xác minh phù hợp.',
        ],
      }),
      block('values', 'feature_grid', {
        heading: 'Điều chúng tôi đang nghiên cứu.',
        items: values.slice(0, 3),
      }),
      block('gallery', 'gallery', {
        eyebrow: 'GÓC NHÌN NGUYÊN LIỆU',
        heading: 'Cảm hứng từ tự nhiên.',
        description:
          'Minh họa ý tưởng về xơ dừa và cây xanh. Ảnh mẫu sản phẩm thật sẽ được nhóm cập nhật.',
        imageIds: ['illustration-coconut', 'illustration-fiber', 'illustration-botanical'],
        captions: [
          'Minh họa nguyên liệu dừa',
          'Minh họa cấu trúc xơ dừa',
          'Minh họa cảm hứng trồng cây',
        ],
      }),
      block('faq', 'faq', {
        heading: 'Bạn có thể đang thắc mắc.',
        items: [
          {
            question: 'BLOOM hiện đang ở giai đoạn nào?',
            answer:
              'Website đang giới thiệu định hướng nghiên cứu của dự án EXE101. Nhóm sẽ cập nhật tiến độ thực tế và dữ liệu sản phẩm sau khi xác minh.',
          },
          {
            question: 'Đã có thông số và hướng dẫn sử dụng chưa?',
            answer:
              'Thông số kỹ thuật và hướng dẫn sử dụng chưa được xác minh trong brief. Vui lòng liên hệ nhóm để nhận thông tin được cập nhật.',
          },
          {
            question: 'Làm thế nào để tìm hiểu hoặc hợp tác?',
            answer:
              'Bạn có thể gửi biểu mẫu ở trang Liên hệ. Nhóm BLOOM sẽ tiếp nhận thông tin để phản hồi nhu cầu tìm hiểu và hợp tác.',
          },
        ],
      }),
      closing,
    ],
    2,
  ),
  page(
    'Quy trình nghiên cứu',
    'quy-trinh',
    'Quy trình',
    [
      block('hero', 'hero', {
        ...hero(
          'Hiểu từ nguyên liệu.\nPhát triển từ gốc.',
          'Lộ trình nghiên cứu dự kiến giúp BLOOM tiếp cận từng câu hỏi về nguyên liệu, mẫu thử và trải nghiệm sử dụng.',
          'illustration-coconut',
          'QUY TRÌNH NGHIÊN CỨU',
        ),
        primaryCta: cta('Xem sản phẩm', '/san-pham'),
      }),
      block('steps', 'process_steps', {
        heading: 'Hành trình dự kiến của nguyên liệu.',
        description:
          'Các bước sau mô tả kế hoạch nghiên cứu. Chưa có dữ liệu xác nhận các bước đã được triển khai hoàn tất.',
        steps: process,
      }),
      block('principle', 'rich_text', {
        heading: 'Đo lường trước, công bố sau.',
        paragraphs: [
          'Mỗi công đoạn cần được nhóm đối chiếu với khả năng thực hiện, kết quả kiểm tra và tài liệu liên quan. BLOOM ưu tiên chia sẻ thông tin có thể xác minh thay vì kỳ vọng chưa được đo.',
          'Kết quả về cấu trúc viên nén, tính tiện dụng, phương pháp xử lý và bao bì sẽ được cập nhật khi có cơ sở phù hợp.',
        ],
      }),
      closing,
    ],
    7,
    false,
  ),
  page(
    'Phát triển bền vững',
    'phat-trien-ben-vung',
    'Bền vững',
    [
      block('hero', 'hero', {
        ...hero(
          'Gieo hôm nay.\nNghĩ cho ngày mai.',
          'Bền vững là cách BLOOM đặt câu hỏi, sử dụng tài nguyên và xây dựng trách nhiệm trong quá trình phát triển.',
          'illustration-botanical',
          'ĐỊNH HƯỚNG BỀN VỮNG',
        ),
        primaryCta: cta('Đồng hành với BLOOM'),
      }),
      block('esg', 'esg_grid', {
        heading: 'Môi trường. Cộng đồng. Minh bạch.',
        description:
          'Đây là các định hướng của dự án, chưa phải chứng nhận hay kết quả tác động đã đo lường.',
        items: esg,
      }),
      block('circular', 'image_text', {
        eyebrow: 'TƯ DUY TUẦN HOÀN',
        heading: 'Một kết thúc có thể là một khởi đầu.',
        paragraphs: [
          'BLOOM hướng tới việc tìm thêm giá trị sử dụng cho phụ phẩm xơ dừa. Chúng tôi xem xét cả nguyên liệu, quá trình phát triển và trải nghiệm của người dùng.',
          'Dự án chưa công bố số liệu giảm phát thải hoặc chứng nhận ESG. Các mục tiêu cần được đánh giá bằng dữ liệu và nguồn phù hợp.',
        ],
        imageId: 'illustration-coconut',
        imagePosition: 'left',
      }),
      closing,
    ],
    3,
  ),
  page(
    'Hành trình phát triển',
    'hanh-trinh',
    'Hành trình',
    [
      block('hero', 'hero', {
        ...hero(
          'Mỗi bước nhỏ,\nmột điều học được.',
          'Lộ trình phát triển BLOOM, từ tìm hiểu ý tưởng đến hoàn thiện mẫu và lắng nghe thị trường.',
          'illustration-botanical',
          'HÀNH TRÌNH BLOOM',
        ),
        primaryCta: cta('Góp lời cho hành trình'),
      }),
      block('milestones', 'timeline', {
        heading: 'Lộ trình phía trước.',
        description:
          'Tất cả giai đoạn đang hiển thị dưới dạng kế hoạch. Nhóm sẽ xác nhận và cập nhật tiến độ thực tế.',
        milestones,
      }),
      closing,
    ],
    4,
  ),
  page(
    'Dự án EXE101',
    'du-an',
    'Dự án',
    [
      block('hero', 'hero', {
        ...hero(
          'Học từ thực tế.\nLớn cùng ý tưởng.',
          'Dự án BLOOM của EXE101 Group 1 — FPT University, nghiên cứu hướng sản phẩm viên nén từ xơ dừa.',
          'illustration-fiber',
          'EXE101 · FPT UNIVERSITY',
        ),
        primaryCta: cta(),
      }),
      block('model', 'feature_grid', {
        heading: 'Mô hình đang được phát triển.',
        items: [
          {
            iconKey: 'users',
            title: 'Người dùng hướng đến',
            description: 'Hộ trồng cây, nhà vườn và cửa hàng vật tư nông nghiệp.',
          },
          {
            iconKey: 'package',
            title: 'Kênh tiếp cận dự kiến',
            description: 'Trực tiếp, trực tuyến và hợp tác phân phối khi sản phẩm phù hợp.',
          },
          {
            iconKey: 'recycle',
            title: 'Đối tác hướng đến',
            description: 'Cơ sở chế biến dừa, nhà cung cấp nguyên liệu và đơn vị phân phối.',
          },
        ],
      }),
      block('budget', 'budget_table', {
        eyebrow: 'KẾ HOẠCH DỰ ÁN',
        heading: 'Bắt đầu với nguồn lực rõ ràng.',
        explanation:
          'Ngân sách ban đầu dự kiến theo brief EXE101, chưa phải chi phí thực chi. Máy móc và dụng cụ hiện có sẵn theo brief.',
        currency: 'VND',
        items: [
          { label: 'Nguyên liệu', amount: 500000 },
          { label: 'Bao bì', amount: 200000 },
          { label: 'Thử nghiệm', amount: 300000 },
          { label: 'Tiếp thị & vận chuyển', amount: 300000 },
        ],
      }),
      block('team', 'team_grid', {
        heading: 'Những người cùng gieo mầm.',
        members: [
          {
            name: 'EXE101 Group 1',
            role: 'FPT University',
            description: 'Thông tin thành viên sẽ được nhóm bổ sung khi có sự đồng ý công bố.',
          },
        ],
      }),
      closing,
    ],
    8,
    false,
  ),
  page(
    'Liên hệ BLOOM',
    'lien-he',
    'Liên hệ',
    [
      block('hero', 'hero', {
        ...hero(
          'Những điều tốt đẹp\nbắt đầu từ kết nối.',
          'Chia sẻ với BLOOM nhu cầu tìm hiểu sản phẩm, câu hỏi nghiên cứu hay ý tưởng hợp tác của bạn.',
          'illustration-botanical',
          'LIÊN HỆ BLOOM',
        ),
        primaryCta: cta('Gửi lời nhắn', '#contact-form'),
        secondaryCta: null,
      }),
      block('form', 'contact_form', {
        heading: 'BLOOM lắng nghe bạn.',
        intro: 'Để lại lời nhắn, nhóm dự án sẽ dùng thông tin này để phản hồi yêu cầu của bạn.',
      }),
    ],
    5,
  ),
];

export const seedSettings = {
  siteName: 'BLOOM',
  tagline: 'Từ xơ dừa, nảy mầm giá trị mới.',
  logoMediaId: null,
  faviconMediaId: null,
  email: '',
  phone: '',
  facebookUrl: '',
  footerText: '© BLOOM · EXE101 Group 1 — FPT University',
  defaultOgImageId: null,
};

export const seedMedia = [
  {
    id: 'illustration-botanical',
    provider: 'seed',
    providerKey: 'botanical',
    url: '/placeholders/botanical.svg',
    width: 1000,
    height: 1100,
    bytes: 0,
    mimeType: 'image/svg+xml',
    filename: 'botanical.svg',
    altText: 'Minh họa cây non vươn lên từ xơ dừa, không phải ảnh sản phẩm thật',
    caption: 'Minh họa ý tưởng · Ảnh sản phẩm thật đang được cập nhật',
  },
  {
    id: 'illustration-coconut',
    provider: 'seed',
    providerKey: 'coconut',
    url: '/placeholders/coconut.svg',
    width: 1000,
    height: 1000,
    bytes: 0,
    mimeType: 'image/svg+xml',
    filename: 'coconut.svg',
    altText: 'Minh họa trái dừa và sợi xơ dừa',
    caption: 'Minh họa nguyên liệu · Không phải ảnh thực nghiệm',
  },
  {
    id: 'illustration-fiber',
    provider: 'seed',
    providerKey: 'fiber',
    url: '/placeholders/fiber.svg',
    width: 1000,
    height: 1000,
    bytes: 0,
    mimeType: 'image/svg+xml',
    filename: 'fiber.svg',
    altText: 'Minh họa vật liệu xơ dừa trong nghiên cứu của BLOOM',
    caption: 'Minh họa vật liệu · Không phải ảnh mẫu sản phẩm',
  },
];
