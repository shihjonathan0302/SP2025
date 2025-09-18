// src/components/CropperModal.web.js
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function CropperModal({ visible, imageUri, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // ✅ hooks 一律在頂層宣告，不能放在條件 return 之後
  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const createCroppedObjectURL = async (src, area) => {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.crossOrigin = 'anonymous';
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = area.width;
    canvas.height = area.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      img,
      area.x, area.y, area.width, area.height,
      0, 0, area.width, area.height
    );

    const blob = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95)
    );
    return URL.createObjectURL(blob);
  };

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels) {
        onSave?.(imageUri);
        return;
      }
      const objUrl = await createCroppedObjectURL(imageUri, croppedAreaPixels);
      onSave?.(objUrl);
    } catch (e) {
      console.error('[web crop save]', e);
      onSave?.(imageUri);
    }
  };

  // 你可以保留條件 return（現在 hooks 都已宣告在上面，不會再違規）
  if (!visible) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'relative', width: 320, height: 320 }}>
          <Cropper
            image={imageUri}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.btn}>Cancel</button>
          <button onClick={handleSave} style={{ ...styles.btn, background: '#111', color: '#fff' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 360,
    maxWidth: '90%',
  },
  actions: {
    marginTop: 12,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
  },
  btn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #ddd',
    background: '#f9f9f9',
    cursor: 'pointer',
  },
};