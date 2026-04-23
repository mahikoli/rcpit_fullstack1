import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect } from 'react';

const QR_ELEMENT_ID = "html5qr-code-full-region";

const QRScanner = ({ onScanSuccess, onScanFailure, onClose }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner(QR_ELEMENT_ID, {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true,
        }, false);

        scanner.render((decodedText, decodedResult) => {
            onScanSuccess(decodedText, decodedResult);
        }, (error) => {
            if (!error?.includes("No MultiFormat Readers")) {
                onScanFailure(error);
            }
        });

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div className="qr-scanner-overlay">
            <div className="qr-scanner-modal">
                <div className="qr-scanner-header">
                    <h3>Scan QR Code</h3>
                    <button className="qr-close-btn" onClick={onClose}>×</button>
                </div>
                
                <div id={QR_ELEMENT_ID} />

                <div className="qr-scanner-footer">
                    <p>Point your camera at the equipment's QR code</p>
                    <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>Ensure the code is well-lit and centered</p>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
