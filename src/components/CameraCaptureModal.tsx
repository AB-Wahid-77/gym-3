import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Check, X, AlertTriangle, Upload, Eye } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (dataUrl: string) => void;
  onFallbackUpload: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
  onFallbackUpload,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    let localStream: MediaStream | null = null;

    const startCamera = async () => {
      setIsLoadingCamera(true);
      setCameraError(null);
      setCapturedImage(null);

      // Verify browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          'In-browser camera access is not supported on this device/browser. Please use the Upload Photo option.'
        );
        setIsLoadingCamera(false);
        return;
      }

      try {
        // Attempt environment facingMode first (mobile back camera), then fallback to any video stream
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        localStream = stream;
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (playErr) {
            console.warn('Video play error:', playErr);
          }
        }
        setIsLoadingCamera(false);
      } catch (err: any) {
        if (!active) return;
        setIsLoadingCamera(false);
        console.error('Camera initialization failed:', err);

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError(
            'Camera permission was denied. Please grant permission in your browser URL bar or use "Upload Photo".'
          );
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError(
            'No camera hardware detected on this device. Please use the "Upload Photo" option.'
          );
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setCameraError(
            'Camera is in use by another application. Please close other camera apps and retry, or use "Upload Photo".'
          );
        } else {
          setCameraError(
            `Unable to access camera: ${err.message || 'Unknown error'}. Please use the "Upload Photo" option.`
          );
        }
      }
    };

    startCamera();

    // Critical: stop all media tracks when unmounted or closed so hardware light turns off promptly
    return () => {
      active = false;
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const handleCaptureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImage(dataUrl);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleConfirmPhoto = () => {
    if (!capturedImage) return;

    // Stop streams before passing data
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onPhotoCaptured(capturedImage);
    onClose();
  };

  const handleClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-surface border border-gold-primary/40 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-primary/10 border border-gold-primary/20 text-gold-primary flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm text-txt uppercase tracking-wider">
                In-Browser Camera Capture
              </h3>
              <p className="text-[11px] text-txt-muted">
                Capture live posture & physique frame for Mode B analysis.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-txt-muted hover:text-txt hover:bg-surface-2 transition-colors cursor-pointer"
            title="Close camera"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport / Snapped Image View */}
        <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] sm:aspect-video flex items-center justify-center border border-border">
          {isLoadingCamera && !cameraError && (
            <div className="text-center space-y-2 p-6">
              <RefreshCw className="w-6 h-6 animate-spin text-gold-primary mx-auto" />
              <p className="text-xs font-semibold text-txt">Requesting Camera Access...</p>
              <p className="text-[11px] text-txt-muted">
                Please allow camera permission in your browser prompt.
              </p>
            </div>
          )}

          {cameraError && (
            <div className="p-6 text-center space-y-3 max-w-md">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-xs font-medium text-amber-200 leading-relaxed">{cameraError}</p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onFallbackUpload();
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gold-primary text-black text-xs font-bold flex items-center gap-1.5 hover:brightness-110 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo Instead</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-xs text-txt hover:border-gold-primary/50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Live Video Stream */}
          {!cameraError && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}
            />
          )}

          {/* Snapped Freeze Frame */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Frame Preview"
              className="w-full h-full object-contain bg-black"
            />
          )}

          {/* Alignment Visual Guide Grid Overlay when streaming */}
          {!isLoadingCamera && !cameraError && !capturedImage && (
            <div className="absolute inset-0 pointer-events-none border border-gold-primary/20 flex flex-col justify-between p-4">
              <div className="flex justify-between text-[10px] text-gold-primary/60 font-mono tracking-wider">
                <span>[PHYSIQUE FRAME]</span>
                <span>LIVE FEED</span>
              </div>
              <div className="self-center w-40 h-40 border border-dashed border-gold-primary/30 rounded-full opacity-40" />
              <div className="text-center text-[10px] text-txt-muted/70 bg-black/40 py-0.5 rounded px-2 self-center">
                Position athlete centered for shoulders & hip alignment
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-txt-muted flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-gold-primary" />
            <span>Hardware light releases immediately upon capture or exit.</span>
          </div>

          <div className="flex items-center gap-2">
            {!capturedImage ? (
              <button
                type="button"
                onClick={handleCaptureFrame}
                disabled={isLoadingCamera || !!cameraError}
                className="px-5 py-2 rounded-xl bg-gold-primary text-black font-heading text-xs flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>CAPTURE PHOTO</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3.5 py-2 rounded-xl bg-surface-2 border border-border text-txt text-xs font-semibold flex items-center gap-1.5 hover:border-gold-primary/50 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="px-5 py-2 rounded-xl bg-gold-primary text-black font-heading text-xs flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-gold-primary/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>USE THIS PHOTO</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
