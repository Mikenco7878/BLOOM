'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionIntro from '@/components/ui/SectionIntro';
import MediaImage from '@/components/ui/MediaImage';
import styles from './GallerySection.module.css';

export default function GallerySection({ data, media = {} }) {
  const assets = (data.imageIds || [])
    .map((id, i) => ({ ...media[id], galleryCaption: data.captions?.[i] }))
    .filter((asset) => asset.url);
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const opener = useRef(null);
  const close = () => {
    dialog.current?.close();
    setSelected(null);
    opener.current?.focus();
  };
  useEffect(() => {
    if (selected === null) return;
    if (!dialog.current?.open) dialog.current?.showModal();
  }, [selected]);
  const move = (direction) =>
    setSelected((current) => (current + direction + assets.length) % assets.length);
  return (
    <section className={`section ${styles.section}`}>
      <div className="container">
        <SectionIntro {...data} />
        {assets.length ? (
          <div className={styles.grid}>
            {assets.map((asset, index) => (
              <figure key={asset.id || index}>
                <button
                  type="button"
                  onClick={(event) => {
                    opener.current = event.currentTarget;
                    setSelected(index);
                  }}
                  aria-label={`Phóng lớn: ${asset.altText || asset.galleryCaption || 'hình ảnh'}`}
                >
                  <MediaImage
                    asset={asset}
                    className={styles.image}
                    sizes="(max-width: 700px) 100vw, 33vw"
                  />
                  <span className={styles.zoom}>
                    <ZoomIn size={20} />
                  </span>
                </button>
                <figcaption>{asset.galleryCaption || asset.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className={styles.empty}>BLOOM đang chuẩn bị hình ảnh để chia sẻ cùng bạn.</p>
        )}
      </div>
      <dialog
        ref={dialog}
        className={styles.dialog}
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') move(1);
          if (event.key === 'ArrowLeft') move(-1);
        }}
        aria-label="Xem ảnh phóng lớn"
      >
        <div className={styles.dialogContent}>
          <button className={styles.close} onClick={close} aria-label="Đóng ảnh">
            <X />
          </button>
          {selected !== null && (
            <>
              <MediaImage asset={assets[selected]} className={styles.fullImage} sizes="90vw" />
              <p>{assets[selected]?.galleryCaption || assets[selected]?.caption}</p>
              {assets.length > 1 && (
                <div className={styles.controls}>
                  <button type="button" onClick={() => move(-1)} aria-label="Ảnh trước">
                    <ChevronLeft />
                  </button>
                  <span>
                    {selected + 1} / {assets.length}
                  </span>
                  <button type="button" onClick={() => move(1)} aria-label="Ảnh tiếp">
                    <ChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </dialog>
    </section>
  );
}
