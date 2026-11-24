'use client';
import { useId, useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, ImagePlus } from 'lucide-react';
import MediaPicker from './MediaPicker';
import ui from './AdminUI.module.css';
import styles from './StructuredFields.module.css';

export function MediaField({ label, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const errorId = useId();
  return (
    <div className={styles.mediaField}>
      <span>{label}</span>
      <div>
        <button
          type="button"
          className={ui.secondary}
          onClick={() => setOpen(true)}
          aria-describedby={error ? errorId : undefined}
        >
          <ImagePlus size={16} />
          {value ? 'Thay ảnh' : 'Chọn ảnh'}
        </button>
        {value && (
          <button type="button" className={ui.secondary} onClick={() => onChange(null)}>
            Bỏ ảnh
          </button>
        )}
      </div>
      <small>
        {value ? `Media ID: ${value}` : 'Chưa chọn ảnh. Website sẽ dùng minh họa tạm phù hợp.'}
      </small>
      {error && (
        <small id={errorId} className={styles.fieldError}>
          {error}
        </small>
      )}
      {open && <MediaPicker value={value} onSelect={onChange} onClose={() => setOpen(false)} />}
    </div>
  );
}
function blank(fields) {
  if (!fields) return '';
  if (fields.length === 1 && fields[0].key === '$value') return null;
  return Object.fromEntries(
    fields.map((field) => [
      field.key,
      field.kind === 'number'
        ? 0
        : field.kind === 'select'
          ? field.options[0][0]
          : field.kind === 'image'
            ? null
            : '',
    ]),
  );
}
function Field({ field, value, onChange, path, errors }) {
  const errorId = useId();
  const error = errors[path];
  const accessibility = {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  };
  if (field.kind === 'image')
    return <MediaField label={field.label} value={value} onChange={onChange} error={error} />;
  if (field.kind === 'object')
    return (
      <fieldset className={styles.object}>
        <legend>{field.label}</legend>
        <StructuredFields
          fields={field.fields}
          value={value || {}}
          onChange={onChange}
          path={path}
          errors={errors}
        />
        <button type="button" className={ui.secondary} onClick={() => onChange(null)}>
          Bỏ nút liên kết
        </button>
      </fieldset>
    );
  if (field.kind === 'array') {
    const items = value || [];
    const update = (index, next) =>
      onChange(items.map((item, itemIndex) => (itemIndex === index ? next : item)));
    const move = (from, to) => {
      const copy = [...items];
      copy.splice(to, 0, copy.splice(from, 1)[0]);
      onChange(copy);
    };
    return (
      <fieldset className={styles.array}>
        <legend>{field.label}</legend>
        {items.map((item, index) => (
          <div className={styles.item} key={`${path}-${index}`}>
            <div className={styles.itemActions}>
              <span>Mục {index + 1}</span>
              <div>
                <button
                  type="button"
                  className={ui.iconButton}
                  disabled={!index}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Đưa mục ${index + 1} lên`}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className={ui.iconButton}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Đưa mục ${index + 1} xuống`}
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className={ui.iconButton}
                  onClick={() => {
                    if (window.confirm('Xóa mục này?'))
                      onChange(items.filter((_, itemIndex) => itemIndex !== index));
                  }}
                  aria-label={`Xóa mục ${index + 1}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            {!field.fields ? (
              <label className={ui.field}>
                Nội dung
                <textarea
                  rows={3}
                  value={item}
                  aria-invalid={errors[`${path}.${index}`] ? true : undefined}
                  aria-describedby={errors[`${path}.${index}`] ? `${errorId}-${index}` : undefined}
                  onChange={(event) => update(index, event.target.value)}
                />
                {errors[`${path}.${index}`] && (
                  <small id={`${errorId}-${index}`} className={styles.fieldError}>
                    {errors[`${path}.${index}`]}
                  </small>
                )}
              </label>
            ) : field.fields[0]?.key === '$value' ? (
              <MediaField
                label="Hình ảnh"
                value={item}
                onChange={(next) => update(index, next)}
                error={errors[`${path}.${index}`]}
              />
            ) : (
              <StructuredFields
                fields={field.fields}
                value={item}
                onChange={(next) => update(index, next)}
                path={`${path}.${index}`}
                errors={errors}
              />
            )}
          </div>
        ))}
        <button
          type="button"
          className={ui.secondary}
          onClick={() => onChange([...items, blank(field.fields)])}
        >
          <Plus size={16} />
          Thêm mục
        </button>
      </fieldset>
    );
  }
  return (
    <label className={ui.field}>
      {field.label}
      {field.kind === 'textarea' ? (
        <textarea
          {...accessibility}
          value={value || ''}
          rows={4}
          maxLength={6000}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : field.kind === 'select' ? (
        <select
          {...accessibility}
          value={value || field.options[0][0]}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...accessibility}
          type={field.kind === 'number' ? 'number' : 'text'}
          value={value ?? ''}
          min={field.kind === 'number' ? 0 : undefined}
          maxLength={1000}
          onChange={(event) =>
            onChange(field.kind === 'number' ? Number(event.target.value) : event.target.value)
          }
        />
      )}
      {error && (
        <small id={errorId} className={styles.fieldError}>
          {error}
        </small>
      )}
    </label>
  );
}
export default function StructuredFields({ fields, value, onChange, path = 'field', errors = {} }) {
  return fields.map((field) => (
    <Field
      key={field.key}
      field={field}
      path={`${path}.${field.key}`}
      errors={errors}
      value={value?.[field.key]}
      onChange={(next) => onChange({ ...value, [field.key]: next })}
    />
  ));
}
