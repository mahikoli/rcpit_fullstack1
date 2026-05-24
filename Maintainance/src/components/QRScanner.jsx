import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import './QRScanner.css';

const QR_ELEMENT_ID = "html5qr-code-full-region";

const QRScanner = ({ onScanSuccess, onScanFailure, onClose }) => {
    const scannerRef = useRef(null);
    const [isScannerStarted, setIsScannerStarted] = useState(false);
    const [error, setError] = useState(null);

    const onScanSuccessRef = useRef(onScanSuccess);
    const onScanFailureRef = useRef(onScanFailure);

    useEffect(() => {
        onScanSuccessRef.current = onScanSuccess;
        onScanFailureRef.current = onScanFailure;
    }, [onScanSuccess, onScanFailure]);

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(QR_ELEMENT_ID);
        scannerRef.current = html5QrCode;

        const startScanner = async () => {
            try {
                const config = {
                    fps: 30, // Increased for faster detection
                    qrbox: (viewfinderWidth, viewfinderHeight) => {
                        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
                        const qrboxSize = Math.floor(minEdge * 0.7);
                        return {
                            width: qrboxSize,
                            height: qrboxSize
                        };
                    },
                    aspectRatio: 1.0,
                    disableFlip: false,
                };

                // Try to start with back camera by default
                await html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    (decodedText, decodedResult) => {
                        if (onScanSuccessRef.current) {
                            onScanSuccessRef.current(decodedText, decodedResult);
                        }
                    },
                    (errorMessage) => {
                        // Suppress "No QR code detected" errors as they are frequent
                        if (onScanFailureRef.current && !errorMessage?.includes("No MultiFormat Readers")) {
                            // onScanFailureRef.current(errorMessage);
                        }
                    }
                );
                setIsScannerStarted(true);
            } catch (err) {
                console.error("Failed to start scanner:", err);
                setError("Could not access camera. Please ensure permissions are granted.");
                if (onScanFailureRef.current) {
                    onScanFailureRef.current(err);
                }
            }
        };

        startScanner();

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(err => console.error("Error stopping scanner:", err));
            }
        };
    }, []);

    return (
        <div className="qr-scanner-overlay">
            <div className="qr-scanner-modal">
                <div className="qr-scanner-header">
                    <h3>Scan QR Code</h3>
                    <button className="qr-close-btn" onClick={onClose}>×</button>
                </div>
                
                <div className="qr-video-container">
                    <div id={QR_ELEMENT_ID} />
                    {isScannerStarted && (
                        <div className="qr-scan-guide">
                            <div className="qr-corner qr-corner-tl" />
                            <div className="qr-corner qr-corner-tr" />
                            <div className="qr-corner qr-corner-bl" />
                            <div className="qr-corner qr-corner-br" />
                        </div>
                    )}
                    {!isScannerStarted && !error && (
                        <div className="qr-loading">
                            <div className="loader"></div>
                            <p>Starting camera...</p>
                        </div>
                    )}
                    {error && (
                        <div className="qr-error">
                            <p>{error}</p>
                            <button onClick={() => window.location.reload()}>Retry</button>
                        </div>
                    )}
                </div>

                <div className="qr-scanner-footer">
                    <p>Point your camera at the equipment's QR code</p>
                    <p style={{ fontSize: '10px', marginTop: '4px', opacity: 0.7 }}>Ensure the code is well-lit and centered</p>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;

