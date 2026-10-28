import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VideoCallModalProps {
  appointmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoCallModal({ appointmentId, isOpen, onClose }: VideoCallModalProps) {
  const roomId = crypto.randomUUID();
  const jitsiUrl = `https://meet.jit.si/${roomId}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Consulta por vídeo</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
          <iframe
            src={jitsiUrl}
            title="Video consultation"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={onClose} variant="outline">
            Encerrar chamada
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}