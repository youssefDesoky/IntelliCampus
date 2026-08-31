import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QRCode } from 'react-qrcode-logo';

function calcSize() {
  if (typeof window === 'undefined') return 240;
  return Math.min(240, window.innerWidth - 64);
}

const BrandedQRCode = ({ token }) => {
  const [size, setSize] = useState(calcSize);
  const { t } = useTranslation('common');

  useEffect(() => {
    const onResize = () => setSize(calcSize());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!token) return <p>{t('labels.loadingQRCode', 'Loading QR Code...')}</p>;

  return (
    <div style={styles.qrContainer}>
      <QRCode
        value={token}
        size={size}
        logoImage="/static/images/IntelliCampusLogo.png"
        logoWidth={Math.floor(size * 0.16)}
        logoHeight={Math.floor(size * 0.16)}
        removeQrCodeBehindLogo={true}
        logoPadding={Math.floor(size * 0.04)}
        logoPaddingStyle="circle"
        qrStyle="fluid"
        eyeRadius={Math.floor(size * 0.03)}
        fgColor="#313d52"
        bgColor="#FFFFFF"
        ecLevel="M"
      />
    </div>
  );
};

const styles = {
  qrContainer: {
    padding: '12px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
};

export default BrandedQRCode;
