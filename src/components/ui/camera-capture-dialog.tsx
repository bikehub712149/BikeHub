"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Camera,
  Check,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  SwitchCamera,
  X,
} from "lucide-react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { warmUploadImages } from "@/lib/prepare-upload-image";

type CameraCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (files: File[]) => void;
  maxPhotos?: number;
  filePrefix?: string;
  title?: string;
};

export default function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
  maxPhotos = 1,
  filePrefix = "photo",
  title = "Take Photo",
}: CameraCaptureDialogProps) {
  const webcamRef = useRef<Webcam>(null);
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Holds photos taken in the current camera session
  const [capturedFiles, setCapturedFiles] = useState<File[]>([]);
  // True when viewing the last captured photo before confirming or adding another
  const [previewMode, setPreviewMode] = useState(false);

  // Generate object URLs for captured files so the preview is instant
  const previewUrls = useMemo(() => {
    return capturedFiles.map((file) => URL.createObjectURL(file));
  }, [capturedFiles]);

  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrls]);

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setCapturedFiles([]);
        setPreviewMode(false);
        setCameraReady(false);
        setCameraError(null);
        setIsCapturing(false);
      }
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  const videoConstraints = useMemo(
    () => ({
      facingMode,
      width: { ideal: 1280 },
      height: { ideal: 720 },
    }),
    [facingMode]
  );

  const toggleFacingMode = useCallback(() => {
    setCameraReady(false);
    setCameraError(null);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const captureFrame = useCallback(async () => {
    if (!webcamRef.current || isCapturing) return;

    setIsCapturing(true);
    try {
      const canvas = webcamRef.current.getCanvas();
      if (!canvas) {
        throw new Error("Camera frame not ready");
      }

      // Scale down only if larger than 1600px so output is crisp yet lightweight (~180KB)
      let targetCanvas = canvas;
      const maxDim = 1600;
      if (canvas.width > maxDim || canvas.height > maxDim) {
        const scale = Math.min(maxDim / canvas.width, maxDim / canvas.height);
        const scaled = document.createElement("canvas");
        scaled.width = Math.round(canvas.width * scale);
        scaled.height = Math.round(canvas.height * scale);
        const ctx = scaled.getContext("2d");
        if (ctx) {
          ctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
          targetCanvas = scaled;
        }
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        targetCanvas.toBlob(resolve, "image/jpeg", 0.84)
      );

      if (!blob) {
        throw new Error("Could not encode photo");
      }

      const stamp = `${Date.now().toString().slice(-6)}-${capturedFiles.length + 1}`;
      const file = new File([blob], `${filePrefix}-${stamp}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      warmUploadImages([file]);

      setCapturedFiles((prev) => [...prev, file]);
      setPreviewMode(true);
    } catch {
      setCameraError("Unable to capture photo. Please try again.");
    } finally {
      setIsCapturing(false);
    }
  }, [capturedFiles.length, filePrefix, isCapturing]);

  const handleFallbackInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawFiles = Array.from(e.target.files ?? []);
      e.target.value = "";
      if (rawFiles.length === 0) return;

      const stamped = rawFiles.slice(0, maxPhotos - capturedFiles.length).map((f, i) => {
        const ext = f.name.includes(".") ? f.name.slice(f.name.lastIndexOf(".")) : ".jpg";
        const stamp = `${Date.now().toString().slice(-6)}-${capturedFiles.length + i + 1}`;
        return new File([f], `${filePrefix}-${stamp}${ext}`, {
          type: f.type || "image/jpeg",
          lastModified: Date.now(),
        });
      });

      warmUploadImages(stamped);
      const nextFiles = [...capturedFiles, ...stamped];
      onCapture(nextFiles);
      handleDialogOpenChange(false);
    },
    [capturedFiles, filePrefix, handleDialogOpenChange, maxPhotos, onCapture]
  );

  const handleRetake = useCallback(() => {
    setCapturedFiles((prev) => prev.slice(0, -1));
    setPreviewMode(false);
    setCameraReady(false);
  }, []);

  const handleTakeAnother = useCallback(() => {
    setPreviewMode(false);
    setCameraReady(false);
  }, []);

  const handleConfirm = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (capturedFiles.length === 0) return;
      const filesToCommit = [...capturedFiles];
      onCapture(filesToCommit);
      handleDialogOpenChange(false);
    },
    [capturedFiles, handleDialogOpenChange, onCapture]
  );

  const canTakeMore = capturedFiles.length < maxPhotos;
  const currentPreviewUrl =
    previewUrls.length > 0 ? previewUrls[previewUrls.length - 1] : null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleDialogOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-xs" />
        <DialogPrimitive.Popup
          aria-label={title}
          className="fixed inset-0 z-[81] flex flex-col bg-black text-white outline-none"
        >
          <input
            ref={fallbackInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleFallbackInput}
          />

          {/* Top Bar */}
          <div className="flex shrink-0 items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold tracking-tight">
                {title}
              </span>
              {maxPhotos > 1 && (
                <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white/90">
                  {capturedFiles.length}/{maxPhotos}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!previewMode && !cameraError && (
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition active:scale-95 hover:bg-white/20"
                  title="Flip Camera"
                >
                  <SwitchCamera className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDialogOpenChange(false);
                }}
                className="flex size-9 items-center justify-center rounded-lg bg-white/10 text-white transition active:scale-95 hover:bg-white/20"
                title="Close Camera"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Center Viewport: Live Camera OR Captured Photo Preview */}
          <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden bg-black">
            {previewMode && currentPreviewUrl ? (
              <img
                src={currentPreviewUrl}
                alt="Captured preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : cameraError ? (
              <div className="mx-6 max-w-xs rounded-2xl border border-white/15 bg-white/5 p-6 text-center space-y-4">
                <p className="text-xs text-white/80 leading-relaxed">
                  {cameraError}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCameraError(null);
                      setCameraReady(false);
                    }}
                    className="w-full bg-white text-black hover:bg-white/90 text-xs h-9"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Retry Live Camera
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fallbackInputRef.current?.click()}
                    className="w-full border-white/25 bg-white/10 text-white hover:bg-white/20 text-xs h-9"
                  >
                    <Camera className="mr-1.5 h-3.5 w-3.5" />
                    Open System Camera
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {!cameraReady && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black text-white/70">
                    <Loader2 className="h-7 w-7 animate-spin text-white" />
                    <span className="text-xs">Starting camera...</span>
                  </div>
                )}

                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  screenshotQuality={0.85}
                  videoConstraints={videoConstraints}
                  mirrored={facingMode === "user"}
                  onUserMedia={() => {
                    setCameraReady(true);
                    setCameraError(null);
                  }}
                  onUserMediaError={() => {
                    setCameraReady(false);
                    setCameraError(
                      "Live camera stream was blocked by the browser. Allow camera permission or use System Camera below."
                    );
                  }}
                  className="h-full w-full object-cover"
                />
              </>
            )}

            {/* Mini thumbnail strip when multiple photos are captured */}
            {capturedFiles.length > 0 && !previewMode && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-xl bg-black/75 px-3 py-2 backdrop-blur-xs border border-white/15">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {previewUrls.map((url, idx) => (
                    <img
                      key={url}
                      src={url}
                      alt={`Shot ${idx + 1}`}
                      className="size-10 rounded-lg object-cover border border-white/30 shrink-0"
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirm}
                  className="ml-2 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3 text-xs font-semibold rounded-lg"
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Done ({capturedFiles.length})
                </Button>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="shrink-0 bg-black/90 px-5 py-5 border-t border-white/10">
            {previewMode ? (
              <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRetake}
                  className="flex-1 h-11 rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 text-xs font-semibold"
                >
                  <RotateCcw className="mr-1.5 h-4 w-4" />
                  Retake
                </Button>

                {canTakeMore && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTakeAnother}
                    className="flex-1 h-11 rounded-xl border-white/25 bg-white/10 text-white hover:bg-white/20 text-xs font-semibold"
                  >
                    <Plus className="mr-1.5 h-4 w-4" />
                    Add More
                  </Button>
                )}

                <Button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  <Check className="mr-1.5 h-4 w-4" />
                  {capturedFiles.length > 1
                    ? `Use ${capturedFiles.length} Photos`
                    : "Use Photo"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  disabled={!cameraReady || isCapturing}
                  onClick={captureFrame}
                  aria-label="Capture photo"
                  className="group relative flex size-18 items-center justify-center rounded-full border-4 border-white transition active:scale-90 disabled:opacity-40"
                >
                  <span className="size-14 rounded-full bg-white transition group-active:scale-90" />
                </button>
              </div>
            )}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
