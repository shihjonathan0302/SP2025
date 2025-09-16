// src/components/CropperModal.web.js
import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

export default function CropperModal({ visible, imageUri, onClose, onSave }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  if (!visible) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={{ position: 'relative', width: 300, height: 300 }}>
          <Cropper
            image={imageUri}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
          />
        </div>
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.btn}>
            Cancel
          </button>
          <button
            onClick={() => {
              // Web: 直接把原始 uri 傳回去，先不做複雜裁切運算
              onSave(imageUri);
            }}
            style={{ ...styles.btn, background: '#111', color: '#fff' }}
          >
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
    width: 340,
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