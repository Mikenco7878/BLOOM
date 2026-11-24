export const sectionLabels = {
  hero: 'Hero / Mở đầu',
  rich_text: 'Nội dung văn bản',
  feature_grid: 'Lưới giá trị',
  image_text: 'Ảnh và nội dung',
  process_steps: 'Các bước quy trình',
  esg_grid: 'Định hướng ESG',
  gallery: 'Thư viện ảnh',
  timeline: 'Hành trình',
  faq: 'Câu hỏi thường gặp',
  cta_banner: 'Lời mời kết nối',
  contact_form: 'Biểu mẫu liên hệ',
  budget_table: 'Bảng ngân sách',
  team_grid: 'Đội nhóm',
};
const text = (key, label, multiline = false) => ({
  key,
  label,
  kind: multiline ? 'textarea' : 'text',
});
const image = (key, label) => ({ key, label, kind: 'image' });
const array = (key, label, fields) => ({ key, label, kind: 'array', fields });
const cta = (key, label) => ({
  key,
  label,
  kind: 'object',
  fields: [text('label', 'Nhãn nút'), text('href', 'Đường dẫn')],
});
const card = [
  text('title', 'Tiêu đề'),
  text('description', 'Mô tả', true),
  {
    key: 'iconKey',
    label: 'Biểu tượng',
    kind: 'select',
    options: [
      ['leaf', 'Lá cây'],
      ['recycle', 'Tuần hoàn'],
      ['package', 'Gọn nhẹ'],
      ['shield', 'Minh bạch'],
      ['users', 'Cộng đồng'],
      ['sprout', 'Mầm xanh'],
    ],
  },
];
export const sectionFields = {
  hero: [
    image('imageId', 'Ảnh hero'),
    cta('primaryCta', 'Nút chính'),
    cta('secondaryCta', 'Nút phụ'),
  ],
  rich_text: [array('paragraphs', 'Đoạn văn', null), image('imageId', 'Ảnh nội dung')],
  feature_grid: [array('items', 'Các giá trị', card)],
  image_text: [
    image('imageId', 'Ảnh minh họa'),
    array('paragraphs', 'Đoạn văn', null),
    {
      key: 'imagePosition',
      label: 'Vị trí ảnh',
      kind: 'select',
      options: [
        ['left', 'Trái'],
        ['right', 'Phải'],
      ],
    },
    cta('cta', 'Nút liên kết'),
  ],
  process_steps: [
    array('steps', 'Các bước', [
      text('title', 'Tên bước'),
      text('description', 'Mô tả', true),
      image('imageId', 'Ảnh bước'),
    ]),
  ],
  esg_grid: [array('items', 'Các trụ cột ESG', card)],
  gallery: [
    array('imageIds', 'Hình ảnh', [image('$value', 'Ảnh')]),
    array('captions', 'Chú thích (cùng thứ tự ảnh)', null),
  ],
  timeline: [
    array('milestones', 'Các cột mốc', [
      text('title', 'Cột mốc'),
      text('description', 'Mô tả', true),
      {
        key: 'status',
        label: 'Trạng thái thực tế',
        kind: 'select',
        options: [
          ['PLANNED', 'Dự kiến'],
          ['IN_PROGRESS', 'Đang thực hiện'],
          ['COMPLETED', 'Hoàn thành'],
        ],
      },
    ]),
  ],
  faq: [array('items', 'Câu hỏi', [text('question', 'Câu hỏi'), text('answer', 'Trả lời', true)])],
  cta_banner: [
    cta('cta', 'Nút liên hệ'),
    {
      key: 'variant',
      label: 'Màu nền',
      kind: 'select',
      options: [
        ['forest', 'Xanh rừng'],
        ['sage', 'Xanh nhẹ'],
        ['cream', 'Kem'],
      ],
    },
  ],
  contact_form: [text('intro', 'Lời giới thiệu', true)],
  budget_table: [
    array('items', 'Hạng mục dự kiến', [
      text('label', 'Hạng mục'),
      { key: 'amount', label: 'Số tiền', kind: 'number' },
      text('explanation', 'Ghi chú', true),
    ]),
    text('currency', 'Đơn vị tiền tệ'),
    text('explanation', 'Thuyết minh ngân sách', true),
  ],
  team_grid: [
    array('members', 'Thành viên', [
      text('name', 'Tên'),
      text('role', 'Vai trò'),
      text('description', 'Giới thiệu thành viên', true),
      image('avatarId', 'Ảnh thành viên'),
    ]),
  ],
};
const defaults = {
  hero: {
    imageId: null,
    primaryCta: { label: 'Tìm hiểu thêm', href: '/san-pham' },
    secondaryCta: null,
  },
  rich_text: { paragraphs: ['Nội dung đang được cập nhật.'] },
  feature_grid: {
    items: [{ title: 'Giá trị mới', description: 'Mô tả định hướng của dự án.', iconKey: 'leaf' }],
  },
  image_text: {
    imageId: null,
    paragraphs: ['Nội dung đang được cập nhật.'],
    imagePosition: 'left',
  },
  process_steps: {
    steps: [{ title: 'Bước nghiên cứu', description: 'Mô tả kế hoạch nghiên cứu.' }],
  },
  esg_grid: {
    items: [
      { title: 'Môi trường', description: 'Định hướng phát triển bền vững.', iconKey: 'leaf' },
    ],
  },
  gallery: { imageIds: [], captions: [] },
  timeline: {
    milestones: [
      {
        title: 'Hình thành ý tưởng',
        description: 'Kế hoạch nghiên cứu của nhóm.',
        status: 'PLANNED',
      },
    ],
  },
  faq: {
    items: [{ question: 'BLOOM là gì?', answer: 'BLOOM là dự án phát triển viên nén từ xơ dừa.' }],
  },
  cta_banner: { cta: { label: 'Liên hệ hợp tác', href: '/lien-he' }, variant: 'forest' },
  contact_form: { intro: 'Để lại thông tin để nhóm BLOOM phản hồi.' },
  budget_table: {
    items: [{ label: 'Hạng mục dự kiến', amount: 0 }],
    currency: 'VND',
    explanation: 'Ngân sách dự kiến, cần được nhóm xác nhận.',
  },
  team_grid: { members: [{ name: 'EXE101 Group 1', role: 'Nhóm dự án' }] },
};
export function createSection(type) {
  return {
    id: crypto.randomUUID(),
    type,
    enabled: true,
    sortOrder: 0,
    data: { heading: sectionLabels[type], ...structuredClone(defaults[type]) },
  };
}
